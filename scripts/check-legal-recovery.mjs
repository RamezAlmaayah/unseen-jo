// Offline recovery drill only. No network calls or hosted database credentials.
import assert from 'node:assert/strict'
import {readFile,writeFile,mkdtemp,mkdir,copyFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {join,dirname} from 'node:path'
import {tmpdir} from 'node:os'
import {PGlite} from '@electric-sql/pglite'
import {postgis} from '@electric-sql/pglite-postgis'
import {initialLegalContent} from '../src/features/legal/seed.js'
const root='artifacts/legal-activation/20261024',fresh='artifacts/pre-activation/20261024',results=[]
const check=async(name,task)=>{await task();results.push({name,status:'PASS'});console.log('PASS '+name)}
const s=JSON.parse(await readFile(root+'/hosted-preflight.json','utf8')).snapshot,current=JSON.parse(await readFile(fresh+'/hosted-legal-schema.json','utf8'))[0].legal_activation_preflight
const install=await readFile('docs/legal/activation/LEGAL_PAGES_MANAGEMENT_INSTALL.sql','utf8'),original=await readFile('supabase/migrations/20261023213831_legal_pages_management.sql','utf8'),manifest=JSON.parse(await readFile(root+'/manifest.json','utf8'))
const db=new PGlite({extensions:{postgis}}),a='00000000-0000-4000-8000-000000008301',b='00000000-0000-4000-8000-000000008302'
const inventory=async()=>{const out={};for(const table of ['auth.users','auth.sessions','public.user_roles','public.profiles','public.places','public.place_images','public.place_translations','public.place_categories','supabase_migrations.schema_migrations'])out[table]=(await db.query(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) data from ${table} t`)).rows[0].data;return out}
let before
try{
 await check('current hosted legal dependencies, permissions and install fingerprints still match the audited baseline',async()=>{
  for(const key of ['functions','schema_permissions','columns','constraints','policies','admin_permission_dependencies','migration_history'])assert.deepEqual(current[key],s[key],key+' changed; re-audit before execution')
  assert.equal(current.admins.count,2);assert.deepEqual(current.admins,s.admins);assert.equal(current.relations.some(r=>r.name.startsWith('legal')),false)
  assert.equal(createHash('sha256').update(original).digest('hex'),manifest.files.find(f=>f.path.endsWith('_legal_pages_management.sql')).sha256)
  assert.equal(install.split('-- BEGIN UNCHANGED ORIGINAL MIGRATION\n')[1].split('\n-- END UNCHANGED ORIGINAL MIGRATION')[0],original)
  const topLevel=original.replace(/\$([A-Za-z_][A-Za-z_0-9]*|)\$[\s\S]*?\$\1\$/g,"'<routine body>'")
  assert.ok(!/^\s*(drop|truncate|delete|update)\b/im.test(topLevel),'Unexpected top-level destructive operation')
  await db.exec(await readFile('supabase/tests/bootstrap.sql','utf8'));await db.exec('create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz)')
  const history=JSON.parse(await readFile(root+'/hosted-migrations.json','utf8')).migrations
  for(const m of history)for(const sql of m.statements)await db.exec(sql)
  assert.equal((await db.query('select count(*)::int n from auth.users')).rows[0].n,0)
  for(const f of current.functions)await db.exec(f.definition)
  await db.exec('create schema supabase_migrations;create table supabase_migrations.schema_migrations(version text primary key,name text,statements text[])')
  for(const m of history)await db.query('insert into supabase_migrations.schema_migrations values($1,$2,$3)',[m.version,m.name,m.statements])
  await db.exec(await readFile('supabase/content/phase02b-starter.sql','utf8'))
  await db.query("insert into auth.users(id,raw_user_meta_data) values($1,'{}'),($2,'{}')",[a,b]);await db.query("insert into user_roles(user_id,role) values($1,'admin'),($2,'admin')",[a,b]);before=await inventory()
 })
 await check('failure injected after complete initialization rolls back all new legal objects and leaves existing fixture data unchanged',async()=>{
  const broken=install.replace('\nCOMMIT;',"\nDO $recovery_drill$ BEGIN RAISE EXCEPTION 'simulated initialization failure'; END $recovery_drill$;\nCOMMIT;")
  assert.notEqual(broken,install);await assert.rejects(db.exec(broken),/simulated initialization failure/);await db.exec('rollback')
  for(const table of ['legal_documents','legal_revisions','legal_events'])assert.equal((await db.query("select to_regclass('public.'||$1)::text r",[table])).rows[0].r,null)
  assert.equal((await db.query("select to_regprocedure('public.admin_legal_state()')::text r")).rows[0].r,null)
  assert.deepEqual(await inventory(),before)
 })
 await check('exact unchanged install succeeds after rollback, preserves existing data and seeds complete unapproved bilingual version-one drafts',async()=>{
  await db.exec(install);await db.exec(await readFile('supabase/tests/legal_activation_verify.sql','utf8'));assert.deepEqual(await inventory(),before)
  const rows=(await db.query('select * from legal_revisions order by document_key')).rows;assert.equal(rows.length,2)
  for(const r of rows){assert.equal(r.version,1);assert.equal(r.approved_at,null);assert.equal(r.revoked_at,null);assert.deepEqual(r.content,initialLegalContent(r.document_key))}
  assert.equal((await db.query('select count(*)::int n from legal_events')).rows[0].n,0)
 })
 await check('scoped source recovery copies restore byte-for-byte into a disposable local directory',async()=>{
  const restored=await mkdtemp(join(tmpdir(),'unseen-legal-recovery-'))
  for(const item of manifest.files){const source=join(root,'files',item.path),target=join(restored,item.path);await mkdir(dirname(target),{recursive:true});await copyFile(source,target);assert.equal(createHash('sha256').update(await readFile(target)).digest('hex'),item.sha256)}
 })
}finally{await db.close();await writeFile('docs/validation/pre-activation-recovery.json',JSON.stringify({at:new Date().toISOString(),scope:'Offline disposable PostgreSQL/PostGIS and local source restoration; synthetic users only. NOT a full hosted backup/restore drill.',hosted_writes:0,results},null,2)+'\n')}

// Actual migrations/ACL/RLS in disposable PostgreSQL. No hosted reads or writes.
import assert from 'node:assert/strict'
import {readFile,readdir,writeFile} from 'node:fs/promises'
import {dirname,join} from 'node:path'
import {createHash} from 'node:crypto'
import {PGlite} from '@electric-sql/pglite'
import {postgis} from '@electric-sql/pglite-postgis'
import {initialLegalContent} from '../src/features/legal/seed.js'
import {validateLegalContent} from '../src/features/legal/model.js'
// Version-1 migration content is an immutable dated snapshot. Later static
// editorial drafts must not rewrite it or be mistaken for approved revisions.
const originalLegalSql=await readFile('supabase/migrations/20261023213831_legal_pages_management.sql','utf8')
assert.equal(createHash('sha256').update(originalLegalSql).digest('hex'),'f23e8fb24ce0912933db5b0b8c1d6e494f5346b2812164574e888470db9257c3')
const preparedSeeds=new Map([...originalLegalSql.matchAll(/values\('(privacy|terms)',1,\$legal_seed\$([\s\S]*?)\$legal_seed\$::jsonb\);/g)].map(m=>[m[1],JSON.parse(m[2])]))
assert.equal(preparedSeeds.size,2)
const db=new PGlite({extensions:{postgis}}),results=[],a='00000000-0000-4000-8000-000000007001',b='00000000-0000-4000-8000-000000007002',ordinary='00000000-0000-4000-8000-000000007003',sa='00000000-0000-4000-8000-000000007004',sb='00000000-0000-4000-8000-000000007005'
const activationSnapshot=process.env.LEGAL_ACTIVATION_SNAPSHOT?JSON.parse(await readFile(process.env.LEGAL_ACTIVATION_SNAPSHOT,'utf8')).snapshot:null
const hostedMigrations=activationSnapshot?JSON.parse(await readFile(join(dirname(process.env.LEGAL_ACTIVATION_SNAPSHOT),'hosted-migrations.json'),'utf8')).migrations:null
const baseline=activationSnapshot?'hosted-history-plus-prepared-legal':'all-local-migrations'
async function as(user,sql,args=[],commit=false){await db.exec(`begin;set local role ${user?'authenticated':'anon'}`);try{await db.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",[user||'',JSON.stringify({sub:user,session_id:user===b?sb:sa})]);const r=await db.query(sql,args);if(commit)await db.exec('commit');return r.rows}finally{await db.exec('rollback')}}
const check=async(name,fn)=>{await fn();results.push({name,status:'PASS'});console.log('PASS '+name)}
const head=async key=>(await as(a,'select * from legal_documents where document_key=$1',[key]))[0]
const state=async user=>(await as(user,'select admin_legal_state() v'))[0].v
const publicRows=()=>as(null,'select * from legal_revisions order by document_key,version')
const save=async(user,key,content,lock)=>{lock??=(await head(key)).lock_version;return (await as(user,'select admin_save_legal_draft($1,$2,$3) id',[key,lock,JSON.stringify(content)],true))[0].id}
const action=async(user,op,id,key='privacy',lock)=>{lock??=(await head(key)).lock_version;return (await as(user,`select admin_${op}_legal($1,$2,$3) id`,[key,lock,id],true))[0].id}
let seed,v2,v3,v4,unrelated
try{
 await check('selected migrations replay; two exact complete bilingual seeds remain private and unapproved',async()=>{
  await db.exec(await readFile('supabase/tests/bootstrap.sql','utf8'));await db.exec('create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz)')
  if(activationSnapshot){
   assert.deepEqual(hostedMigrations.map(({version,name})=>({version,name})),activationSnapshot.migration_history)
   for(const m of hostedMigrations)for(const sql of m.statements)await db.exec(sql)
   // Signup-trigger definitions legitimately contain role INSERT statements;
   // verify the actual state instead of mistaking function bodies for user data.
   assert.equal((await db.query('select count(*)::int n from auth.users')).rows[0].n,0,'Hosted account rows must never enter fixtures')
   assert.equal((await db.query('select count(*)::int n from public.user_roles')).rows[0].n,0,'Hosted memberships must never enter fixtures')
   for(const f of activationSnapshot.functions.filter(f=>['uid','is_admin','admin_cms_status'].includes(f.name)))await db.exec(f.definition)
   await db.exec('create schema supabase_migrations;create table supabase_migrations.schema_migrations(version text primary key,name text,statements text[])')
   for(const m of hostedMigrations)await db.query('insert into supabase_migrations.schema_migrations(version,name,statements) values($1,$2,$3)',[m.version,m.name,m.statements])
   const install=await readFile('docs/legal/activation/LEGAL_PAGES_MANAGEMENT_INSTALL.sql','utf8');await db.exec(install)
   await db.exec(await readFile('supabase/tests/legal_activation_verify.sql','utf8'))
   await assert.rejects(db.exec(install),/Legal objects already exist/);await db.exec('rollback')
  }else for(const f of(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+f,'utf8'))
  for(const r of(await db.query('select document_key,content,approved_at,revoked_at from legal_revisions')).rows){assert.deepEqual(r.content,preparedSeeds.get(r.document_key));validateLegalContent(r.content,{complete:true});assert.deepEqual(Object.values(r.content.review),[false,false,false,false]);assert.equal(r.approved_at,null);assert.equal(r.revoked_at,null)}
  await db.exec(await readFile('supabase/content/phase02b-starter.sql','utf8'));await db.query("insert into auth.users(id,raw_user_meta_data) values($1,'{}'),($2,'{}'),($3,'{\"role\":\"admin\"}')",[a,b,ordinary]);await db.query('insert into auth.sessions(id,user_id) values($1,$2),($3,$4)',[sa,a,sb,b]);await db.query("insert into user_roles(user_id,role) values($1,'admin'),($2,'admin')",[a,b])
  assert.equal((await publicRows()).length,0);const s=await state(a);assert.equal(s.documents.length,2);assert.equal(s.revisions.length,2);assert.equal(s.events.length,0);seed=s.revisions.find(r=>r.document_key==='privacy').id
  for(const table of ['places','place_images','place_translations','place_categories','user_roles','profiles']){const value=(await db.query(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) v from ${table} t`)).rows[0].v;unrelated={...unrelated,[table]:value}}
 })
 await check('guests and ordinary users cannot read drafts, private editor identities or history',async()=>{
  for(const user of [null,ordinary]){assert.equal((await as(user,'select * from legal_revisions')).length,0);if(user)assert.equal((await as(user,'select * from legal_documents')).length,0);else await assert.rejects(as(user,'select * from legal_documents'));await assert.rejects(state(user));await assert.rejects(as(user,'select admin_publish_legal($1,0,$2)',['privacy',seed]))}
 })
 await check('even Admin direct table mutation fails without the scoped invoker operation',async()=>{
  await assert.rejects(as(a,"update legal_documents set lock_version=lock_version+1 where document_key='privacy'"));await assert.rejects(as(a,'insert into legal_revisions(document_key,version,content) values($1,2,$2)',['privacy',initialLegalContent('privacy')]));await assert.rejects(as(a,"update legal_revisions set approved_at=now() where id=$1",[seed]))
 })
 await check('both trusted Admins can save; old revisions remain immutable; incomplete drafts can be saved',async()=>{
  const c=initialLegalContent('privacy');c.en.title='Privacy Policy updated';v2=await save(a,'privacy',c);assert.equal((await head('privacy')).revision_count,2);const row=(await as(b,'select * from legal_revisions where id=$1',[v2]))[0];assert.equal(row.content.en.title,c.en.title);assert.equal(row.approved_at,null);assert.equal((await state(b)).documents.length,2)
  assert.equal(await save(a,'privacy',c),v2,'identical saved draft is a no-op');assert.equal((await head('privacy')).revision_count,2)
 })
 await check('publication is explicit, server attributed and separate from unresolved legal review',async()=>{
  assert.equal((await publicRows()).length,0);await action(b,'publish',v2);const rows=await publicRows();assert.equal(rows.length,1);assert.equal(rows[0].id,v2);assert.equal(rows[0].content.review.operator,false);assert.equal(rows[0].content.review.legalReview,false);const event=(await state(a)).events.find(e=>e.action==='publish');assert.equal(event.actor_id,b);assert.ok(event.created_at);assert.equal((await head('privacy')).last_editor,a)
 })
 await check('saving a new draft leaves the complete previous public snapshot unchanged',async()=>{
  const before=await publicRows(),c=initialLegalContent('privacy');c.en.title='Private draft three';v3=await save(b,'privacy',c);assert.deepEqual(await publicRows(),before);assert.equal((await head('privacy')).last_editor,b)
 })
 await check('stale Admin edit/publish/revoke requests fail atomically; no lost update',async()=>{
  const h=await head('privacy');await assert.rejects(save(a,'privacy',initialLegalContent('privacy'),h.lock_version-1),e=>e.code==='40001');await assert.rejects(action(a,'publish',v3,'privacy',h.lock_version-1),e=>e.code==='40001');await assert.rejects(action(a,'revoke',v2,'privacy',h.lock_version-1),e=>e.code==='40001');assert.deepEqual(await head('privacy'),h)
 })
 await check('publishing latest revision and revoking it restores the earlier approved version',async()=>{
  await action(a,'publish',v3);assert.equal((await publicRows()).at(-1).id,v3);await action(b,'revoke',v3);assert.deepEqual((await publicRows()).map(r=>r.id),[v2]);const regular=await as(ordinary,'select * from legal_revisions');assert.deepEqual(regular.map(r=>r.id),[v2]);assert.equal((await state(b)).events.find(e=>e.action==='revoke').actor_id,b)
 })
 await check('revoking the last approved version exposes no draft or revoked content',async()=>{
  await action(a,'revoke',v2);assert.deepEqual(await publicRows(),[]);assert.equal((await as(ordinary,'select * from legal_revisions where id=$1',[v3])).length,0)
 })
 await check('restore copies an earlier snapshot into a new unapproved version; republish is separate',async()=>{
  v4=await action(b,'restore',v2);const rows=await as(a,'select * from legal_revisions where id in ($1,$2) order by version',[v2,v4]);assert.deepEqual(rows[0].content,rows[1].content);assert.equal(rows[1].version,4);assert.equal(rows[1].approved_at,null);assert.equal(rows[1].revoked_at,null);assert.deepEqual(await publicRows(),[]);await action(a,'publish',v4);assert.equal((await publicRows())[0].id,v4)
 })
 await check('cross-document revisions, HTML, unsafe links, schema injection and incomplete publishing are rejected',async()=>{
  await assert.rejects(action(a,'revoke',v4,'terms'));for(const mutate of [c=>c.en.sections[0].body='<img src=x onerror=alert(1)>',c=>c.en.introduction='[click](javascript:alert(1))',c=>c.en.introduction='[click](https://user:pass@example.org)',c=>c['ar-JO'].sections.reverse(),c=>c.review.operator='true',c=>c.extra='unsafe']){const c=initialLegalContent('terms');mutate(c);await assert.rejects(save(a,'terms',c),e=>e.code==='23514')}
  const incomplete=initialLegalContent('terms');incomplete['ar-JO'].sections[0].body='';const id=await save(a,'terms',incomplete);await assert.rejects(action(a,'publish',id,'terms'),e=>e.code==='23514');assert.equal((await publicRows()).filter(r=>r.document_key==='terms').length,0)
 })
 await check('revoked/expired Admin session loses read and write access despite role metadata',async()=>{
  await db.query("update auth.sessions set not_after=now()-interval '1 second' where id=$1",[sb]);await assert.rejects(state(b),e=>e.code==='42501');await assert.rejects(save(b,'terms',initialLegalContent('terms')),e=>e.code==='42501');assert.equal((await as(ordinary,'select * from legal_events')).length,0);await db.query('update auth.sessions set not_after=null where id=$1',[sb])
 })
 await check('history cannot be forged, rewritten or deleted; functions are invoker and RLS stays enabled',async()=>{
  await assert.rejects(as(a,"insert into legal_events(document_key,revision_id,action,actor_id) values('privacy',$1,'publish',$2)",[v4,ordinary]));await assert.rejects(as(a,"update legal_events set actor_id=$1",[ordinary]));await assert.rejects(as(a,'delete from legal_revisions'));await assert.rejects(as(a,'truncate legal_events'))
  const funcs=(await db.query("select proname,prosecdef from pg_proc where proname in ('admin_save_legal_draft','admin_publish_legal','admin_revoke_legal','admin_restore_legal','admin_legal_state')")).rows;assert.equal(funcs.length,5);assert.ok(funcs.every(f=>!f.prosecdef));assert.ok((await db.query("select relrowsecurity from pg_class where relname in ('legal_documents','legal_revisions','legal_events')")).rows.every(r=>r.relrowsecurity))
 })
 await check('separately authorized local actor removal clears identifiers without changing legal content or audit facts',async()=>{
  await db.exec('begin');try{const before=(await db.query('select id,content,approved_at,revoked_at from legal_revisions order by id')).rows;await db.query('delete from auth.sessions where user_id=$1',[a]);await db.query('delete from auth.users where id=$1',[a]);assert.equal((await db.query('select count(*)::int n from legal_events where actor_id=$1',[a])).rows[0].n,0);assert.equal((await db.query('select count(*)::int n from legal_documents where last_editor=$1',[a])).rows[0].n,0);assert.deepEqual((await db.query('select id,content,approved_at,revoked_at from legal_revisions order by id')).rows,before)}finally{await db.exec('rollback')}
 })
 await check('existing tourism, profiles, relationships and both Admin memberships preserved',async()=>{
  for(const [table,value]of Object.entries(unrelated))assert.deepEqual((await db.query(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) v from ${table} t`)).rows[0].v,value,table)
 })
}catch(e){console.error('FAIL',e.message);throw e}finally{await db.close();await writeFile(`docs/validation/${activationSnapshot?'legal-activation-hosted-baseline':'legal-management-database'}.json`,JSON.stringify({scope:'Disposable PGlite with actual migrations; synthetic identities, minimal Auth/Storage contracts; no hosted access',baseline,at:new Date().toISOString(),results},null,2)+'\n')}

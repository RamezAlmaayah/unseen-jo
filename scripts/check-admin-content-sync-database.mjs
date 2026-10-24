// Actual migrations/RLS on disposable PGlite. No network, hosted users or writes.
import assert from 'node:assert/strict'
import {readFile,readdir,writeFile} from 'node:fs/promises'
import {PGlite} from '@electric-sql/pglite'
import {postgis} from '@electric-sql/pglite-postgis'
import {manifest,fakeAdmin} from './content-sync-test-fixture.mjs'
import {translationFields,destinationFields} from '../src/features/admin/contentSyncModel.js'
const db=new PGlite({extensions:{postgis}}),results=[],ordinary='00000000-0000-4000-8000-000000000902',admin2='00000000-0000-4000-8000-000000000903',sid='00000000-0000-4000-8000-000000000904'
async function as(user,sql,params=[],commit=false){await db.exec(`begin;set local role ${user?'authenticated':'anon'}`);try{await db.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",[user||'',JSON.stringify({sub:user,session_id:sid})]);const r=await db.query(sql,params);if(commit)await db.exec('commit');return r.rows}finally{await db.exec('rollback')}}
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log('PASS '+name)}
const all=async table=>(await db.query(`select to_jsonb(t) v from public.${table} t order by 1::text`)).rows.map(r=>r.v).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
const stamp=async id=>(await db.query('select updated_at::text stamp from places where id=$1',[id])).rows[0].stamp
const arabic=async id=>(await db.query('select t.*,updated_at::text version from place_translations t where place_id=$1',[id])).rows[0]
let savedPlaces,savedImages,savedCategories,savedAdmins,media
try{
 await check('replay every existing migration with no new grants or schema changes',async()=>{
  await db.exec(await readFile('supabase/tests/bootstrap.sql','utf8'));await db.exec('create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz)')
  for(const f of(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+f,'utf8'))
  await db.query('insert into auth.users(id) values($1),($2),($3)',[fakeAdmin,ordinary,admin2]);await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[sid,fakeAdmin]);await db.query("insert into user_roles(user_id,role) values($1,'admin'),($2,'admin')",[fakeAdmin,admin2]);assert.equal((await as(fakeAdmin,'select admin_cms_status() v'))[0].v.version,4)
 })
 await check('seed 24 isolated Published destinations, 19 proposals and 30 private image mappings',async()=>{
  const baseline=JSON.parse(await readFile('docs/validation/phase14-1-content-baseline.json','utf8'))
  await as(fakeAdmin,'delete from categories',[],true) // Reset disposable seed categories only.
  for(const c of baseline.categories)await as(fakeAdmin,'insert into categories(id,name,slug,is_active) values($1,$2,$3,$4)',[c.id,c.name,c.slug,c.is_active],true)
  const keys=destinationFields.filter(k=>!['updated_at','status','verified_at'].includes(k))
  for(const p of manifest.destinations){await as(fakeAdmin,`insert into places(${keys.join(',')}) select ${keys.join(',')} from jsonb_populate_record(null::places,$1::jsonb)`,[JSON.stringify(p)],true)}
  for(const c of baseline.relationships)await as(fakeAdmin,'insert into place_categories(place_id,category_id) values($1,$2)',[c.place_id,c.category_id],true)
  for(const t of manifest.translations){const vals=[t.id,'ar-JO',...translationFields.map(k=>t.baseline[k]??null),await stamp(t.id)];await as(fakeAdmin,`insert into place_translations(place_id,locale,${translationFields.join(',')},source_updated_at) values(${vals.map((_,i)=>'$'+(i+1)).join(',')})`,vals,true)}
  const keysImage=['id','place_id','storage_path','alt_text','is_cover','sort_order','source_url','attribution','license_basis','license_evidence']
  for(const image of manifest.images){const i=image.baseline;await as(fakeAdmin,"insert into storage.objects(bucket_id,name) values('place-images',$1)",[i.storage_path],true);await as(fakeAdmin,`insert into place_images(${keysImage.join(',')}) select ${keysImage.join(',')} from jsonb_populate_record(null::place_images,$1::jsonb)`,[JSON.stringify(i)],true)}
  for(const p of manifest.destinations)await as(fakeAdmin,"select admin_change_place_status($1,'published',$2,'draft')",[p.id,await stamp(p.id)],true)
  assert.equal((await as(null,'select id from places')).length,24);assert.equal((await as(null,'select * from place_translations')).length,0)
  savedPlaces=await all('places');savedImages=await all('place_images');savedCategories=await all('place_categories');savedAdmins=await all('user_roles');media=(await db.query('select *,updated_at::text version from place_images limit 1')).rows[0]
 })
 await check('guest, ordinary user and revoked sessions cannot update or activate translations',async()=>{
  const id=manifest.translations[0].id
  for(const user of [null,ordinary]){try{const rows=await as(user,"update place_translations set editorial_status='reviewed' where place_id=$1 returning *",[id],true);assert.equal(rows.length,0)}catch(e){assert.ok(/permission|security|administrator/i.test(e.message))}}
  await db.query("update auth.sessions set not_after=now()-interval '1 second'")
  assert.equal((await as(fakeAdmin,"update place_translations set editorial_status='reviewed' where place_id=$1 returning *",[id],true)).length,0);await assert.rejects(as(fakeAdmin,'select admin_cms_status()'))
  await db.query('update auth.sessions set not_after=null')
 })
 await check('all 11 Arabic fields save with CAS; review identity/time are server-derived',async()=>{
  for(const plan of manifest.translations){let row=await arabic(plan.id);const vals=[...translationFields.map(k=>plan.arabic[k]??null),await stamp(plan.id),plan.id,row.version];const n=translationFields.length
   const sql=`update place_translations set ${translationFields.map((k,i)=>k+'=$'+(i+1)).join(',')},source_updated_at=$${n+1},editorial_status='pending' where place_id=$${n+2} and locale='ar-JO' and updated_at=$${n+3} returning *`
   assert.equal((await as(fakeAdmin,sql,vals,true)).length,1);row=await arabic(plan.id);assert.equal(row.editorial_status,'pending');assert.equal(row.reviewed_by,null)
   assert.equal((await as(fakeAdmin,"update place_translations set editorial_status='reviewed',reviewed_by=$1,reviewed_at='2000-01-01' where place_id=$2 and locale='ar-JO' and updated_at=$3 returning *",[ordinary,plan.id,row.version],true)).length,1)
   row=await arabic(plan.id);assert.equal(row.editorial_status,'reviewed');assert.equal(row.reviewed_by,fakeAdmin);assert.ok(new Date(row.reviewed_at).getFullYear()>2000);for(const k of translationFields)assert.deepEqual(row[k],plan.arabic[k]??null)
  }
  assert.equal((await as(null,'select * from place_translations')).length,19)
 })
 await check('stale writes update zero rows and duplicate translations cannot be inserted',async()=>{
  const p=manifest.translations[0];assert.equal((await as(fakeAdmin,"update place_translations set name='Stale overwrite' where place_id=$1 and updated_at=$2 returning *",[p.id,'2000-01-01'],true)).length,0)
  await assert.rejects(as(fakeAdmin,"insert into place_translations(place_id,locale,name,description,source_updated_at) values($1,'ar-JO',$2,$3,$4)",[p.id,p.arabic.name,p.arabic.description,await stamp(p.id)]),/duplicate/i)
 })
 await check('stale-source review rejected; partial text save remains pending and private',async()=>{
  const p=manifest.translations[0],row=await arabic(p.id)
  await as(fakeAdmin,"update place_translations set source_updated_at='2000-01-01',editorial_status='pending' where place_id=$1 and updated_at=$2",[p.id,row.version],true)
  await assert.rejects(as(fakeAdmin,"update place_translations set editorial_status='reviewed' where place_id=$1",[p.id]),/current saved translation/)
  assert.equal((await as(null,'select * from place_translations where place_id=$1',[p.id])).length,0)
 })
 await check('existing Published-image guards reject approval; simple-image payload cannot upgrade existing rows',async()=>{
  await assert.rejects(as(fakeAdmin,'select admin_approve_image($1,$2)',[media.id,media.version]),/publish|Draft|published/i)
  const existing=(await db.query('select * from place_images where place_id=$1',[media.place_id])).rows.map(i=>({...i,rights_confirmed:true}))
  const payload=(await as(fakeAdmin,'select admin_image_eligibility($1,$2) v',[media.place_id,JSON.stringify(existing)]))[0].v
  assert.ok(payload.every(i=>i.rights_confirmed===false));assert.ok(payload.every(i=>i.rights_ready===false))
 })
 await check('all 24 IDs/slugs/statuses/English, images, categories and both Admin memberships unchanged',async()=>{
  assert.deepEqual(await all('places'),savedPlaces);assert.deepEqual(await all('place_images'),savedImages);assert.deepEqual(await all('place_categories'),savedCategories);assert.deepEqual(await all('user_roles'),savedAdmins)
  assert.equal((await db.query('select count(*)::int n from place_translations')).rows[0].n,19)
 })
}finally{await db.close();await writeFile('docs/validation/admin-content-sync-database.json',JSON.stringify({scope:'Disposable PGlite/PostgreSQL with actual migrations; not hosted Supabase Auth/Storage integration',at:new Date().toISOString(),results},null,2)+'\n')}

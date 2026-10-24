// Disposable PostgreSQL/RLS only. No hosted mutations or genuine-user sessions.
import assert from 'node:assert/strict'
import {readFile,readdir,writeFile} from 'node:fs/promises'
import {PGlite} from '@electric-sql/pglite'
import {postgis} from '@electric-sql/pglite-postgis'
import {normalizePlace} from '../src/features/tourism/model.js'
import {rankDestinations,normalizePreferences} from '../src/features/recommendations/engine.js'
const db=new PGlite({extensions:{postgis}}),results=[]
const admin='00000000-0000-4000-8000-000000000091',ordinary='00000000-0000-4000-8000-000000000092',session='00000000-0000-4000-8000-000000000093'
async function as(user,sql,params=[],commit=false){await db.exec(`begin;set local role ${user?'authenticated':'anon'}`);try{await db.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",[user||'',JSON.stringify({sub:user,session_id:session})]);const response=await db.query(sql,params);if(commit)await db.exec('commit');return response.rows}finally{await db.exec('rollback')}}
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
let place,before,translation,images,categories
const change=async status=>{const result=(await as(admin,'select admin_change_place_status($1,$2,$3,$4) value',[place.id,status,place.updated_at,place.status],true))[0].value;place={...place,...result};return result}
try{
 await check('all migrations replay and existing three-state schema is reused',async()=>{
  await db.exec(await readFile('supabase/tests/bootstrap.sql','utf8'));await db.exec('create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz)')
  for(const file of(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+file,'utf8'))
  await db.exec(await readFile('supabase/content/phase02b-starter.sql','utf8'))
  await db.query('insert into auth.users(id) values($1),($2)',[admin,ordinary]);await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[session,admin]);await db.query("insert into user_roles(user_id,role) values($1,'admin')",[admin])
  place=(await as(admin,"select * from places where slug='ajloun-forest'"))[0]
 })
 await check('ordinary content validation fails atomically without introducing an approval workflow',async()=>{
  await assert.rejects(change('published'),/description|category|location/);assert.equal((await as(admin,'select status from places where id=$1',[place.id]))[0].status,'draft')
  await as(admin,"update places set description=repeat('Valid destination content. ',5),latitude=32.38,longitude=35.76,primary_category_id=(select category_id from place_categories where place_id=$1 limit 1) where id=$1",[place.id],true)
  place=(await as(admin,'select * from places where id=$1',[place.id]))[0]
  await change('published');await change('draft')
  assert.equal((await as(admin,'select count(*)::int n from place_images where place_id=$1',[place.id]))[0].n,0)
 })
 await check('unapproved media and absent editorial attestations do not block status changes',async()=>{
  const path=place.id+'/isolated-status-fixture.jpg'
  await as(admin,"insert into storage.objects(bucket_id,name) values('place-images',$1)",[path],true)
  const image=(await as(admin,"insert into place_images(place_id,storage_path,alt_text,source_url,attribution,license_basis,license_evidence,is_cover) values($1,$2,'Disposable test image','https://example.invalid/fixture','Disposable fixture owner','owned','Synthetic owned-image evidence for isolated database test only',true) returning *",[place.id,path],true))[0]
  assert.equal(image.approved_at,null)
  await as(admin,"insert into place_translations(place_id,locale,name,description,source_updated_at) values($1,'ar-JO',$2,$3,$4)",[place.id,'محمية غابات عجلون','نص عربي اختباري مستقل للتحقق من بقاء الترجمة المعتمدة دون تغيير عند تبديل حالة الوجهة، ولا يمثل أي تعديل على قاعدة البيانات المستضافة.',place.updated_at],true)
  await as(admin,"update place_translations set editorial_status='reviewed' where place_id=$1",[place.id],true)
  translation=(await as(admin,'select * from place_translations where place_id=$1',[place.id]))[0]
  images=await as(admin,'select * from place_images where place_id=$1 order by id',[place.id]);categories=await as(admin,'select * from place_categories where place_id=$1 order by category_id',[place.id]);before=(await as(admin,'select * from places where id=$1',[place.id]))[0]
  assert.deepEqual((await as(admin,'select admin_publication_issues($1) value',[place.id]))[0].value,[])
  assert.equal((await as(admin,'select count(*)::int n from place_reviews where place_id=$1',[place.id]))[0].n,0)
 })
 await check('all six directed transitions, repeat no-op, archived restoration and counts are correct',async()=>{
  for(const status of ['published','draft','archived','published','archived','draft','published','published']){
   const next=await change(status);assert.equal(next.status,status);assert.equal(new Date(next.updated_at).getTime(),new Date(before.updated_at).getTime())
   assert.equal(next.quick_version,(await as(admin,'select unseen_private.quick_edit_version($1) value',[place.id]))[0].value)
   const metrics=(await as(admin,'select admin_overview() value'))[0].value;assert.equal(metrics[status],status==='draft'?6:1)
   for(const user of [null,ordinary]){const visible=await as(user,'select id from places where id=$1',[place.id]);assert.equal(visible.length,status==='published'?1:0);const arabic=await as(user,'select * from place_translations where place_id=$1',[place.id]);assert.equal(arabic.length,status==='published'?1:0)}
  }
 })
 await check('content, IDs, slugs, translations, media evidence and review identities are byte-preserved',async()=>{
  const current=(await as(admin,'select * from places where id=$1',[place.id]))[0],strip=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['status','updated_by'].includes(k)))
  assert.deepEqual(strip(current),strip(before));assert.deepEqual((await as(admin,'select * from place_translations where place_id=$1',[place.id]))[0],translation)
  assert.deepEqual(await as(admin,'select * from place_images where place_id=$1 order by id',[place.id]),images);assert.deepEqual(await as(admin,'select * from place_categories where place_id=$1 order by category_id',[place.id]),categories)
  assert.ok((await db.query("select count(*)::int n from admin_audit_logs where entity_table='places' and actor_id=$1 and changed_columns @> array['status']",[admin])).rows[0].n>=7)
 })
 await check('stale status/version, invalid states, guests, ordinary users and revoked sessions are rejected',async()=>{
  await assert.rejects(as(admin,'select admin_change_place_status($1,$2,$3,$4)',[place.id,'draft',place.updated_at,'archived']),/Reload/)
  await assert.rejects(as(admin,'select admin_change_place_status($1,$2,$3,$4)',[place.id,'draft','2000-01-01T00:00:00Z',place.status]),/Reload/)
  for(const state of ['pending','review',null])await assert.rejects(as(admin,'select admin_change_place_status($1,$2,$3,$4)',[place.id,state,place.updated_at,place.status]),/Invalid/)
  for(const user of [null,ordinary])await assert.rejects(as(user,'select admin_change_place_status($1,$2,$3,$4)',[place.id,'draft',place.updated_at,place.status]))
  await db.query('update auth.sessions set not_after=now()-interval \'1 hour\' where id=$1',[session]);await assert.rejects(change('draft'),/Administrator/);await db.query('update auth.sessions set not_after=null where id=$1',[session])
 })
 await check('actual content edits still advance source versions and pending translations remain separate',async()=>{
  await change('draft');await as(admin,"update places set description=description||' Actual source edit.',updated_by=auth.uid() where id=$1",[place.id],true)
  const changed=(await as(admin,'select * from places where id=$1',[place.id]))[0];assert.notEqual(new Date(changed.updated_at).getTime(),new Date(before.updated_at).getTime());place=changed
  await as(admin,"update place_translations set editorial_status='pending' where place_id=$1",[place.id],true);await change('published')
  assert.equal((await as(admin,'select editorial_status from place_translations where place_id=$1',[place.id]))[0].editorial_status,'pending')
  assert.equal((await as(null,'select * from place_translations where place_id=$1',[place.id])).length,0)
 })
 await check('normal public models and recommendations reject private draft overlays as well as archived rows',async()=>{
  for(const status of ['draft','archived']){const row={...before,status,prototype:{visibility:'private',planning:{budgetMax:20,transportModes:['car']}}};assert.throws(()=>normalizePlace(row),/Invalid published/)
   const result=rankDestinations([row],normalizePreferences());assert.equal(result.ranked.length,0)}
 })
}finally{await db.close();await writeFile('docs/validation/destination-status-database.json',JSON.stringify({scope:'Real disposable PostgreSQL/RLS, isolated fixture identities; zero hosted writes',at:new Date().toISOString(),results},null,2)+'\n')}

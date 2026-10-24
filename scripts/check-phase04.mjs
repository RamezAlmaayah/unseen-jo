// Disposable PostgreSQL tests only. No remote users, roles or content are changed.
import assert from 'node:assert/strict'
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { postgis } from '@electric-sql/pglite-postgis'
import { emptyPlace, placePayload, safeAdminReturn, validateImage } from '../src/features/admin/model.js'
const db = new PGlite({ extensions:{postgis} }), results=[]
const uid='00000000-0000-4000-8000-000000000001', ordinary='00000000-0000-4000-8000-000000000002', sid='00000000-0000-4000-8000-000000000003'
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
async function as(user,sql,params=[],session=sid,commit=false){
  await db.exec(`begin;set local role ${user?'authenticated':'anon'}`)
  try{await db.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",[user||'',JSON.stringify({sub:user,session_id:session})]);const r=await db.query(sql,params);if(commit)await db.exec('commit');return r}finally{await db.exec('rollback')}
}
const rejected=(user,sql,params=[],session=sid)=>assert.rejects(as(user,sql,params,session))
let pid,cat,stamp,image
try{
await check('full migration replay preserves drafts and assigns no administrator',async()=>{
  await db.exec(await readFile('supabase/tests/bootstrap.sql','utf8'))
  await db.exec('create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz)')
  const files=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort()
  for(const f of files) await db.exec(await readFile(`supabase/migrations/${f}`,'utf8'))
  await db.exec(await readFile('supabase/content/phase02b-starter.sql','utf8'))
  assert.equal((await db.query("select count(*) n from public.places where status='draft'")).rows[0].n,6)
  assert.equal((await db.query("select count(*) n from public.user_roles where role='admin'")).rows[0].n,0)
  const r=(await db.query('select relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname=\'public\' and c.relkind=\'r\'')).rows
  assert.ok(r.every(t=>t.relrowsecurity))
})
await check('anonymous RPC, draft and media access fail closed',async()=>{
  await rejected(null,'select public.admin_overview()')
  assert.equal((await as(null,'select * from public.places')).rows.length,0)
  assert.equal((await as(null,'select * from public.place_images')).rows.length,0)
  assert.equal((await as(null,'select * from storage.objects')).rows.length,0)
})
await check('ordinary users cannot self-promote, mutate content or inspect audit logs',async()=>{
  await db.query('insert into auth.users(id) values($1),($2)',[uid,ordinary])
  await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[sid,uid])
  await rejected(ordinary,"insert into public.user_roles(user_id,role) values($1,'admin')",[ordinary])
  await rejected(ordinary,"select public.admin_save_place('{}','{}',null)")
  assert.equal((await as(ordinary,'select * from public.admin_audit_logs')).rows.length,0)
  await db.query("insert into public.user_roles(user_id,role) values($1,'admin')",[uid])
})
await check('admin role requires an active matching session and checks expiration',async()=>{
  await rejected(uid,'select public.admin_overview()',[],ordinary)
  await db.query("update auth.sessions set not_after=now()-interval '1 second'")
  await rejected(uid,'select public.admin_overview()')
  await db.query('update auth.sessions set not_after=null')
  assert.equal((await as(uid,'select public.admin_cms_status() v')).rows[0].v.version,4)
})
await check('transactional draft save allowlists fields and rejects stale updates',async()=>{
  cat=(await db.query('select id from public.categories limit 1')).rows[0].id
  const payload=placePayload({...emptyPlace,name:'QA destination',slug:'qa-destination',primary_category_id:cat,source_url:'https://example.org/source'})
  pid=(await as(uid,'select public.admin_save_place($1,$2,null) id',[{...payload,status:'published',verified_at:'2026-01-01'},[cat]],sid,true)).rows[0].id
  const p=(await db.query('select * from public.places where id=$1',[pid])).rows[0];stamp=p.updated_at
  assert.equal(p.status,'draft');assert.equal(p.verified_at,null)
  await rejected(uid,'select public.admin_save_place($1,$2,$3)',[{...payload,id:pid},[cat],'2020-01-01'])
  await rejected(uid,"select public.admin_set_place_status($1,'published',null)",[pid])
})
await check('incomplete publication is rejected via RPC and direct table write',async()=>{
  const issues=(await as(uid,'select public.admin_publication_issues($1) v',[pid])).rows[0].v
  assert.deepEqual(issues,['Useful description needs at least 80 characters','A valid Jordan location is required'])
  await rejected(uid,"select public.admin_set_place_status($1,'published',$2)",[pid,stamp])
  await rejected(uid,"update public.places set status='published' where id=$1",[pid])
})
await check('image approval requires saved evidence and uploaded bytes',async()=>{
  image=(await as(uid,"insert into public.place_images(place_id,storage_path,alt_text,is_cover) values($1,$2,'QA image',true) returning *",[pid,`${pid}/qa.jpg`],sid,true)).rows[0]
  await rejected(uid,'select public.admin_approve_image($1,$2)',[image.id,image.updated_at])
  await db.query("insert into storage.objects(bucket_id,name) values('place-images',$1)",[image.storage_path])
  await rejected(uid,'select public.admin_approve_image($1,$2)',[image.id,image.updated_at])
  assert.equal((await as(null,'select * from storage.objects')).rows.length,0)
})
await check('reviewed complete destination publishes and protects media dependencies',async()=>{
  const payload=placePayload({...emptyPlace,id:pid,name:'QA destination',slug:'qa-destination',description:'Verified synthetic test content. '.repeat(4),primary_category_id:cat,source_url:'https://example.org/source',latitude:31.95,longitude:35.91})
  await as(uid,'select public.admin_save_place($1,$2,$3)',[payload,[cat],stamp],sid,true)
  stamp=(await db.query('select updated_at from public.places where id=$1',[pid])).rows[0].updated_at
  await as(uid,'select public.admin_review_place($1,$2,$3)',[pid,stamp,{location_kind:'entrance',coordinate_source:'https://example.org/map',location_reviewed:true,claims_reviewed:true}],sid,true)
  stamp=(await db.query('select updated_at from public.places where id=$1',[pid])).rows[0].updated_at
  image=(await as(uid,"update public.place_images set license_basis='owned',license_evidence='Synthetic owned test image',attribution='QA author',source_url='https://example.org/photo' where id=$1 returning *",[image.id],sid,true)).rows[0]
  await as(uid,'select public.admin_approve_image($1,$2)',[image.id,image.updated_at],sid,true)
  await as(uid,"select public.admin_set_place_status($1,'published',$2)",[pid,stamp],sid,true)
  assert.equal((await as(null,'select * from public.places')).rows.length,1)
  assert.equal((await as(null,'select * from storage.objects')).rows.length,1)
  await rejected(uid,'delete from public.place_images where id=$1',[image.id])
  await rejected(uid,'delete from public.place_categories where place_id=$1',[pid])
  await rejected(uid,'update public.categories set is_active=false where id=$1',[cat])
  assert.equal((await as(uid,'delete from storage.objects where name=$1 returning *',[image.storage_path])).rows.length,0)
  // Existing published-content immutability remains separate from status selection.
  await rejected(uid,"update public.places set name='Changed' where id=$1",[pid])
  await rejected(uid,"update public.places set description='' where id=$1",[pid])
})
await check('audit entries cannot be forged or edited by clients',async()=>{
  assert.ok((await as(uid,'select * from public.admin_audit_logs')).rows.length>0)
  await rejected(uid,"insert into public.admin_audit_logs(action,entity_table,entity_key) values('INSERT','fake','{}')")
  await rejected(uid,'delete from public.admin_audit_logs')
})
await check('browser input rejects unsafe data and executable image types',async()=>{
  assert.throws(()=>placePayload({...emptyPlace,name:'x',slug:'x',latitude:31}))
  assert.throws(()=>placePayload({...emptyPlace,name:'x',slug:'x',source_url:'javascript:alert(1)'}))
  for(const path of ['https://evil.test','//evil.test','/admin\\evil','/admin/login'])assert.equal(safeAdminReturn(path),'/admin')
  await assert.rejects(validateImage(new File(['<svg/>'],'x.svg',{type:'image/svg+xml'})))
})
await check('cover replacement rejects anonymous, non-admin, stale, cross-place and published operations',async()=>{
  const path=`${pid}/00000000-0000-4000-8000-000000000099.jpg`
  await db.query("insert into storage.objects(bucket_id,name) values('place-images',$1)",[path])
  image=(await db.query('select * from public.place_images where id=$1',[image.id])).rows[0]
  const args=[image.id,image.updated_at,path,'New local photograph']
  const sql='select public.admin_replace_cover_image($1,$2,$3,$4) id'
  await rejected(null,sql,args);await rejected(ordinary,sql,args);await rejected(uid,sql,args)
  stamp=(await db.query('select updated_at from public.places where id=$1',[pid])).rows[0].updated_at
  await as(uid,"select public.admin_set_place_status($1,'draft',$2)",[pid,stamp],sid,true)
  await rejected(uid,sql,[image.id,'2020-01-01',path,'New local photograph'])
  await rejected(uid,sql,[image.id,image.updated_at,`${ordinary}/00000000-0000-4000-8000-000000000099.jpg`,'New local photograph'])
  await rejected(uid,sql,[image.id,image.updated_at,image.storage_path,'New local photograph'])
  await rejected(uid,sql,[image.id,image.updated_at,path,''])
  assert.equal((await db.query('select is_cover from public.place_images where id=$1',[image.id])).rows[0].is_cover,true)
})
await check('atomic replacement preserves evidence and private pending media independently of publication',async()=>{
  const path=`${pid}/00000000-0000-4000-8000-000000000099.jpg`
  const replacement=(await as(uid,'select public.admin_replace_cover_image($1,$2,$3,$4) id',[image.id,image.updated_at,path,'New local photograph'],sid,true)).rows[0].id
  const old=(await db.query('select * from public.place_images where id=$1',[image.id])).rows[0],next=(await db.query('select * from public.place_images where id=$1',[replacement])).rows[0]
  assert.equal(old.is_cover,false)
  for(const key of ['storage_path','attribution','source_url','license_basis','license_evidence','approved_at','approved_by'])assert.deepEqual(old[key],image[key])
  assert.equal(next.is_cover,true);assert.equal(next.storage_path,path);assert.equal(next.alt_text,'New local photograph')
  for(const key of ['approved_at','approved_by','license_basis','license_evidence','attribution','source_url'])assert.equal(next[key],null)
  assert.equal((await db.query('select count(*) n from public.place_images where place_id=$1 and is_cover',[pid])).rows[0].n,1)
  assert.equal((await as(null,'select * from storage.objects')).rows.length,0)
  const issues=(await as(uid,'select public.admin_publication_issues($1) v',[pid])).rows[0].v
  assert.deepEqual(issues,[])
  stamp=(await db.query('select updated_at from public.places where id=$1',[pid])).rows[0].updated_at
  await as(uid,"select public.admin_set_place_status($1,'published',$2)",[pid,stamp],sid,true)
  assert.equal((await as(null,'select * from places where id=$1',[pid])).rows.length,1)
  assert.equal((await as(null,'select * from place_images where id=$1',[replacement])).rows.length,0)
  assert.equal((await as(null,'select * from storage.objects where name=$1',[path])).rows.length,0)
  await rejected(uid,'select public.admin_replace_cover_image($1,$2,$3,$4)',[image.id,image.updated_at,path,'Repeated replacement'])
})
await mkdir('docs/validation',{recursive:true});await writeFile('docs/validation/phase04-database-tests.json',JSON.stringify({scope:'Disposable PGlite/PostGIS with simulated Auth sessions and Storage; no remote writes',passed:results.length,results},null,2)+'\n')
}finally{await db.close()}

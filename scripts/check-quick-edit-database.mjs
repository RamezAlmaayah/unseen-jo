import assert from 'node:assert/strict'
import {readFile,readdir,writeFile} from 'node:fs/promises'
import {PGlite} from '@electric-sql/pglite'
import {postgis} from '@electric-sql/pglite-postgis'
const db=new PGlite({extensions:{postgis}}),results=[],a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002',ordinary='00000000-0000-4000-8000-000000000003',sid='00000000-0000-4000-8000-000000000004',sidB='00000000-0000-4000-8000-000000000005'
async function as(user,sql,args=[],session=user===b?sidB:sid){await db.exec(`begin;set local role ${user?'authenticated':'anon'}`);try{await db.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",[user||'',JSON.stringify({sub:user,session_id:session})]);const r=await db.query(sql,args);await db.exec('commit');return r}catch(e){await db.exec('rollback');throw e}}
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
const one=async(sql,args=[]) =>(await db.query(sql,args)).rows[0]
const state=async id=>(await as(a,'select public.admin_quick_edit_state($1) value',[id])).rows[0].value
const apply=async(form,version,reviewed=false)=>(await as(a,'select public.admin_apply_quick_edit($1,$2,$3) id',[form,version,reviewed])).rows[0].id
let pid,form,cover,cat
try{
 await check('full migrations and isolated owner-only editor workspaces',async()=>{
  await db.exec(await readFile('supabase/tests/bootstrap.sql','utf8'));await db.exec('create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz)')
  for(const f of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+f,'utf8'))
  await db.exec(await readFile('supabase/content/phase02b-starter.sql','utf8'))
  await db.query('insert into auth.users(id) values($1),($2),($3)',[a,b,ordinary]);await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[sid,a]);await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[sidB,b]);await db.query("insert into public.user_roles(user_id,role) values($1,'admin'),($2,'admin')",[a,b])
  pid=(await one("select id from places where slug='wadi-mujib'")).id;cat=(await one('select id from categories where is_active limit 1')).id
  await assert.rejects(as(null,'select public.admin_quick_edit_state($1)',[pid]));await assert.rejects(as(ordinary,'select public.admin_quick_edit_state($1)',[pid]));await assert.rejects(as(a,'select public.admin_quick_edit_state($1)',[pid],ordinary))
  assert.equal((await as(null,'select * from public.place_quick_drafts').catch(()=>({rows:[]}))).rows.length,0)
 })
 await check('autosave accepts incomplete drafts without public writes and enforces workspace concurrency',async()=>{
  const before=await one('select to_jsonb(p) value from places p where id=$1',[pid]),s=await state(pid),payload={english:{name:''},arabic:{description:'نص يدوي غير مكتمل'},category_ids:[],images:[],review:{}}
  const stamp=(await as(a,'select public.admin_save_quick_draft($1,$2,$3,null) stamp',[pid,s.version,payload])).rows[0].stamp
  assert.deepEqual((await one('select to_jsonb(p) value from places p where id=$1',[pid])),before)
  await assert.rejects(as(a,'select public.admin_save_quick_draft($1,$2,$3,null)',[pid,s.version,payload]));await as(a,'select public.admin_save_quick_draft($1,$2,$3,$4)',[pid,s.version,payload,stamp])
  assert.equal((await as(b,'select * from public.place_quick_drafts')).rows.length,0);assert.equal((await as(a,'select * from public.place_quick_drafts')).rows.length,1)
 })
 await check('one save creates a new bilingual destination as draft and ignores publication injection',async()=>{
  const initial=await one('select * from places where id=$1',[pid])
  form={english:{...initial,id:null,name:'Quick fixture',slug:'quick-fixture',description:'Original English destination description. '.repeat(4),source_url:'https://example.test/source',latitude:31.95,longitude:35.91,primary_category_id:cat,status:'published',region:'Amman',opening_hours:null,activities:'Walking',visitor_information:'Confirmed visitor advice'},arabic:{name:'وجهة اختبار',description:'وصف عربي يدوي محفوظ لا يجوز استبداله دون موافقة المسؤول. '.repeat(4),region:'عمّان',activities:'المشي'},category_ids:[cat],images:[],review:{location_kind:'entrance',coordinate_source:'https://example.test/map'}}
  pid=await apply(form,null);form.english.id=pid
  assert.equal((await one('select status from places where id=$1',[pid])).status,'draft');assert.equal((await one('select description from place_translations where place_id=$1',[pid])).description,form.arabic.description)
 })
 await check('explicit source and translation review never publishes a draft, and licensed media require explicit confirmation',async()=>{
  const path=pid+'/00000000-0000-4000-8000-000000000020.jpg';await db.query("insert into storage.objects(bucket_id,name) values('place-images',$1)",[path])
  cover={storage_path:path,alt_text:'Fixture destination photograph',is_cover:true,sort_order:0,attribution:'Fixture author',source_url:'https://example.test/photo',license_basis:'owned',license_evidence:'Fixture documented ownership',rights_confirmed:false};form.images=[cover]
  await apply(form,(await state(pid)).version,true)
  assert.equal((await one('select status from places where id=$1',[pid])).status,'draft');assert.equal((await one('select approved_at from place_images where place_id=$1',[pid])).approved_at,null)
  cover.id=(await one('select id from place_images where place_id=$1',[pid])).id;cover.rights_confirmed=true
  await apply(form,(await state(pid)).version,true)
  const image=await one('select * from place_images where id=$1',[cover.id]);assert.equal(image.approved_by,a)
  const p=await one('select * from places where id=$1',[pid]),t=await one('select * from place_translations where place_id=$1',[pid])
  await as(a,'select public.admin_publish_localized_place($1,$2,$3)',[pid,p.updated_at,t.updated_at]) // Only synthetic local fixture publication.
 })
 await check('reviewed published corrections update English and Arabic atomically without changing IDs/slugs/status',async()=>{
  form.english.name='Corrected English name';form.arabic.name='الاسم العربي المصحح';cover.rights_confirmed=false
  const version=(await state(pid)).version;await assert.rejects(apply(form,version,false));await apply(form,version,true)
  const p=await one('select * from places where id=$1',[pid]),t=await one('select * from place_translations where place_id=$1',[pid])
  assert.equal(p.status,'published');assert.equal(p.slug,'quick-fixture');assert.equal(p.name,form.english.name);assert.equal(t.name,form.arabic.name);assert.equal(t.editorial_status,'reviewed');assert.equal(t.source_updated_at.getTime(),p.updated_at.getTime());assert.equal(t.reviewed_by,a)
  assert.equal((await as(null,'select name from place_translations where place_id=$1',[pid])).rows[0].name,form.arabic.name)
 })
 await check('pending cover, invalid rights and unsafe coordinates roll back every public mutation',async()=>{
  const before=await one('select to_jsonb(p) p from places p where id=$1',[pid]),oldImages=(await db.query('select * from place_images where place_id=$1',[pid])).rows,version=(await state(pid)).version,path=pid+'/00000000-0000-4000-8000-000000000021.jpg'
  await db.query("insert into storage.objects(bucket_id,name) values('place-images',$1)",[path])
  const replacement={...cover,id:null,storage_path:path,attribution:null,license_basis:null,license_evidence:null,source_url:null,is_cover:true};form.images=[{...cover,is_cover:false},replacement]
  await assert.rejects(apply(form,version,true));replacement.rights_confirmed=true;await assert.rejects(apply(form,version,true))
  form.images=[cover];const lat=form.english.latitude;form.english.latitude=10;await assert.rejects(apply(form,version,true));form.english.latitude=lat
  assert.deepEqual(await one('select to_jsonb(p) p from places p where id=$1',[pid]),before);assert.deepEqual((await db.query('select * from place_images where place_id=$1',[pid])).rows,oldImages)
 })
 await check('verified replacement changes actual media while preserving previous approval and original bytes',async()=>{
  const old=await one('select * from place_images where id=$1',[cover.id]),path=pid+'/00000000-0000-4000-8000-000000000021.jpg'
  form.images=[{...cover,is_cover:false},{...cover,id:null,storage_path:path,alt_text:'New photograph',rights_confirmed:true}]
  await apply(form,(await state(pid)).version,true)
  const next=await one('select * from place_images where place_id=$1 and is_cover',[pid]);assert.equal(next.storage_path,path);assert.equal(next.approved_by,a)
  const previous=await one('select * from place_images where id=$1',[cover.id]);assert.deepEqual(previous.approved_at,old.approved_at);assert.equal(previous.license_evidence,old.license_evidence)
  assert.equal((await one('select count(*) n from storage.objects where name=$1',[old.storage_path])).n,1)
  form.images[1].id=next.id;form.images[1].rights_confirmed=false
 })
 await check('cover selection/reordering and removal use only this destination and keep original files',async()=>{
  const foreign=structuredClone(form);foreign.images[0].storage_path=b+'/foreign.jpg';await assert.rejects(apply(foreign,(await state(pid)).version,true))
  form.images=[{...form.images[0],is_cover:true,sort_order:0},{...form.images[1],is_cover:false,sort_order:1}];await apply(form,(await state(pid)).version,true)
  assert.equal((await one('select id from place_images where place_id=$1 and is_cover',[pid])).id,cover.id)
  const removed=form.images.pop();await apply(form,(await state(pid)).version,true);assert.equal((await one('select count(*) n from place_images where id=$1',[removed.id])).n,0);assert.equal((await one('select count(*) n from storage.objects where name=$1',[removed.storage_path])).n,1)
 })
 await check('stale dependencies and incomplete payload cannot overwrite manual work',async()=>{
  const s=await state(pid);await as(a,"update public.place_translations set visitor_guidance='Manual concurrent note' where place_id=$1",[pid])
  await assert.rejects(apply(form,s.version,true));await assert.rejects(apply({english:form.english,arabic:form.arabic},(await state(pid)).version,true))
  assert.equal((await one('select visitor_guidance from place_translations where place_id=$1',[pid])).visitor_guidance,'Manual concurrent note')
 })
 await check('snapshot supplies current bilingual content and delayed requests cannot cross account identities',async()=>{
  const s=await state(pid);assert.equal(s.place.place_translations[0].visitor_guidance,'Manual concurrent note');assert.equal(s.place.id,pid);assert.ok(s.place.place_images.length)
  await assert.rejects(as(b,'select public.admin_save_quick_draft($1,$2,$3,null)',[pid,s.version,{...form,editor_id:a}]))
  await assert.rejects(apply({...form,editor_id:b},s.version,true))
 })
 let original,unknownPath,requested,declared
 const simple=async(images,id=pid)=>(await as(a,'select public.admin_save_simple_images($1,$2,$3,$4) id',[id,(await state(id)).version,images,a])).rows[0].id
 await check('simple images reject anonymous/non-admin requests and ignore fabricated Google license fields',async()=>{
  await db.exec('alter table storage.objects add column metadata jsonb')
  original=await one('select * from place_images where place_id=$1 and is_cover',[pid]);unknownPath=pid+'/00000000-0000-4000-8000-000000000031.jpg'
  await db.query("insert into storage.objects(bucket_id,name,metadata) values('place-images',$1,$2)",[unknownPath,{eTag:'test-original-bytes',size:200,mimetype:'image/jpeg'}])
  requested=[{...original,is_cover:false},{storage_path:unknownPath,alt_text:'Original project test image',sort_order:1,is_cover:true,license_basis:'public_domain',source_url:'https://www.google.com/imgres?fixture',license_evidence:'Client fabricated claims',rights_confirmed:true}]
  for(const user of [null,ordinary])await assert.rejects(as(user,'select public.admin_image_eligibility($1,$2)',[pid,requested]))
  const ready=(await as(a,'select public.admin_image_eligibility($1,$2) images',[pid,requested])).rows[0].images
  assert.equal(ready[1].rights_ready,false);assert.equal(ready[1].license_basis,null);assert.equal(ready[1].rights_confirmed,false)
  const old=await one('select to_jsonb(p) p from places p where id=$1',[pid]);await assert.rejects(simple(requested));assert.deepEqual(await one('select to_jsonb(p) p from places p where id=$1',[pid]),old)
 })
 await check('one original-ownership declaration records the real actor/object and cannot be forged or edited',async()=>{
  await assert.rejects(as(ordinary,'select public.admin_confirm_original_images($1,$2,$3)',[pid,[unknownPath],ordinary]))
  await assert.rejects(as(a,'select public.admin_confirm_original_images($1,$2,$3)',[pid,[unknownPath],b]))
  await as(a,'select public.admin_confirm_original_images($1,$2,$3)',[pid,[unknownPath],a])
  declared=await one('select * from place_image_ownership where storage_path=$1',[unknownPath]);assert.equal(declared.declared_by,a);assert.ok(declared.object_fingerprint.metadata.eTag);assert.ok(declared.statement.includes('original photographs'))
  await assert.rejects(as(a,"update public.place_image_ownership set declared_by=$1 where id=$2",[b,declared.id]))
  await assert.rejects(as(null,'select * from public.place_image_ownership'))
  const ready=(await as(a,'select public.admin_image_eligibility($1,$2) images',[pid,requested])).rows[0].images
  assert.equal(ready[1].license_basis,'owned');assert.equal(ready[1].rights_ready,true);assert.ok(ready[1].source_url.includes(declared.id));assert.ok(ready[1].license_evidence.includes(a));assert.ok(!ready[1].license_evidence.includes('public domain'))
 })
 await check('Replace and Save changes actual published cover without changing any text, translation review or status',async()=>{
  const before=await one('select to_jsonb(p) p from places p where id=$1',[pid]),translation=await one('select to_jsonb(t) t from place_translations t where place_id=$1',[pid])
  await simple(requested)
  const next=await one('select * from place_images where place_id=$1 and is_cover',[pid]);assert.equal(next.storage_path,unknownPath);assert.equal(next.license_basis,'owned');assert.equal(next.approved_by,a)
  assert.deepEqual(await one('select to_jsonb(p) p from places p where id=$1',[pid]),before);assert.deepEqual(await one('select to_jsonb(t) t from place_translations t where place_id=$1',[pid]),translation)
  const old=await one('select * from place_images where id=$1',[original.id]);assert.equal(old.is_cover,false);assert.equal(old.storage_path,original.storage_path);assert.deepEqual(old.approved_at,original.approved_at);assert.equal(old.license_evidence,original.license_evidence)
  assert.equal((await one('select count(*) n from storage.objects where name=$1',[original.storage_path])).n,1)
  requested=[{...next,sort_order:0},{...old,sort_order:1}]
 })
 await check('verified image reuse and caption edits preserve recorded approval and backend evidence',async()=>{
  const old=await one('select * from place_images where id=$1',[original.id]);requested[0].is_cover=false;requested[1].is_cover=true;requested[1].alt_text='Improved accessible description';requested[1].source_url='https://www.google.com/imgres?not-evidence'
  await simple(requested)
  const after=await one('select * from place_images where id=$1',[original.id]);assert.equal(after.is_cover,true);assert.equal(after.source_url,old.source_url);assert.deepEqual(after.approved_at,old.approved_at);assert.equal(after.approved_by,old.approved_by)
  await assert.rejects(as(a,"update public.place_images set alt_text='Direct REST-style bypass' where id=$1",[original.id]))
  // Even a forged SQL transaction context cannot commit an invalid public cover.
  await assert.rejects(as(a,"with context as materialized(select set_config('unseen.simple_image_target',$1,true)) update public.place_images set approved_at=null,approved_by=null from context where id=$2",[pid,original.id]))
 })
 await check('ownership evidence cannot approve changed object bytes and unknown drafts remain private',async()=>{
  const path=pid+'/00000000-0000-4000-8000-000000000032.jpg';await db.query("insert into storage.objects(bucket_id,name,metadata) values('place-images',$1,$2)",[path,{eTag:'first',size:200}]);await as(a,'select public.admin_confirm_original_images($1,$2,$3)',[pid,[path],a])
  await db.query("update storage.objects set metadata=$1 where name=$2",[{eTag:'different-bytes',size:201},path])
  const eligibility=(await as(a,'select public.admin_image_eligibility($1,$2) images',[pid,[{storage_path:path,alt_text:'Changed file'}]])).rows[0].images;assert.equal(eligibility[0].rights_ready,false)
  const draftForm=structuredClone(form);draftForm.english.id=null;draftForm.english.slug='simple-image-private';draftForm.images=[];const privateId=await apply(draftForm,null,false),privatePath=privateId+'/00000000-0000-4000-8000-000000000033.jpg'
  await db.query("insert into storage.objects(bucket_id,name) values('place-images',$1)",[privatePath]);await simple([{storage_path:privatePath,alt_text:'Private unverified photograph',sort_order:0,is_cover:true}],privateId)
  assert.equal((await one('select status from places where id=$1',[privateId])).status,'draft');assert.equal((await one('select approved_at from place_images where place_id=$1',[privateId])).approved_at,null);assert.equal((await as(null,'select * from storage.objects where name=$1',[privatePath])).rows.length,0)
 })
 await writeFile('docs/validation/quick-edit-database.json',JSON.stringify({scope:'Disposable PGlite/PostGIS, simulated Auth and Storage only; no hosted content writes',passed:results.length,results},null,2)+'\n')
}finally{await db.close()}

// Real disposable PostgreSQL/RLS and local package tests; NEVER hosted writes.
import assert from 'node:assert/strict'
import {readFile,readdir,writeFile} from 'node:fs/promises'
import {PGlite} from '@electric-sql/pglite'
import {postgis} from '@electric-sql/pglite-postgis'
import {validatePhase08Package,runPhase08Import,matchesImportedField} from '../src/features/admin/phase08Import.js'
import {normalizePlace,filterPlaces} from '../src/features/tourism/model.js'
import {localizeDestination} from '../src/i18n/destinations.js'
import {phase08EvidenceIssues} from '../src/features/admin/phase08Freshness.js'
const manifest=JSON.parse(await readFile('docs/evidence/phase08/import-package.json','utf8')),db=new PGlite({extensions:{postgis}}),results=[]
const user='00000000-0000-4000-8000-000000000081',ordinary='00000000-0000-4000-8000-000000000082',sid='00000000-0000-4000-8000-000000000083'
const check=async(name,fn)=>{await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
async function as(id,sql,args=[],commit=false){await db.exec(`begin;set local role ${id?'authenticated':'anon'}`);try{await db.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",[id||'',JSON.stringify({sub:id,session_id:sid})]);const r=await db.query(sql,args);if(commit)await db.exec('commit');return r}finally{await db.exec('rollback')}}
let before,categories
// Ensure an assertion before the first query cannot leave close() awaiting startup.
await db.waitReady
try{
 await check('exact 18-candidate inventory, package hashes, bilingual content and qualified coordinates',async()=>{
  await validatePhase08Package(manifest);assert.equal(manifest.places.length,18);for(const p of manifest.places){assert.equal(p.english.description.split('\n\n').length,2);assert.equal(p.arabic.description.split('\n\n').length,2);assert.equal(p.english.price_min_jod,null);assert.equal(p.english.price_max_jod,null);assert.ok(p.evidence.unknowns.length);assert.ok(p.english.visitor_information);assert.ok(p.arabic.visitor_information);assert.ok(p.evidence.sources.every(s=>s.url.startsWith('https://')))}
  assert.equal(manifest.places.find(p=>p.slug==='um-er-rasas').english.region,'Amman');assert.ok(manifest.places.find(p=>p.slug==='aqaba-marine-reserve').criticalBlockers.length)
  const corrupt=structuredClone(manifest);corrupt.places[0].english.name='Tampered';await assert.rejects(validatePhase08Package(corrupt),/checksum/)
 })
 await check('auth, target-project and explicit publication attestation fail before mutations',async()=>{
  const forbidden=()=>{throw Error('Unexpected mutation or query')},repo={applyQuickEdit:forbidden},client={from:forbidden,rpc:forbidden,supabaseUrl:'https://unrelated.supabase.co'};await assert.rejects(runPhase08Import(client,repo,manifest),/Unexpected Supabase project/)
  await assert.rejects(runPhase08Import({supabaseUrl:'https://dkhwwvoplhfjccvjegty.supabase.co',auth:{getUser:async()=>({data:{user:null}})}},{},manifest),/Sign in/)
  await assert.rejects(runPhase08Import({},{},manifest,{publish:true,attested:false}),/attestation/)
 })
 await check('expiry follows actual per-source and per-file checks, not the package rebuild time',async()=>{
  // This historical fixture was valid when built. Never renew its evidence dates.
  const now=Math.max(Date.parse(manifest.preparedAt),...manifest.revalidation.records.flatMap(r=>[Date.parse(r.checkedAt),...r.sources.map(s=>Date.parse(s.checkedAt))]),...manifest.revalidation.licenses.map(i=>Date.parse(i.checkedAt))),plan=manifest.places[0];for(const p of manifest.places)assert.deepEqual(phase08EvidenceIssues(manifest,p,now),[])
  for(const p of manifest.places)assert.ok(phase08EvidenceIssues(manifest,p,now+86400000).length,'expired historical evidence must fail')
  const stale=structuredClone(manifest);stale.preparedAt=new Date(now).toISOString();stale.revalidation.records.find(p=>p.slug===plan.slug).sources[0].checkedAt=new Date(now-90000000).toISOString();assert.ok(phase08EvidenceIssues(stale,plan,now).some(s=>s.startsWith('Source')))
  const licence=structuredClone(manifest);licence.preparedAt=new Date(now).toISOString();licence.revalidation.licenses[0].checkedAt=new Date(now-90000000).toISOString();assert.ok(phase08EvidenceIssues(licence,plan,now).some(s=>s.startsWith('Image')))
  licence.revalidation.licenses[0].checkedAt=new Date(now+60000).toISOString();assert.ok(phase08EvidenceIssues(licence,plan,now).some(s=>s.startsWith('Image')))
  const mismatch=structuredClone(manifest);mismatch.revalidation.licenses[0].originalSha256='0'.repeat(64);assert.ok(phase08EvidenceIssues(mismatch,plan,now).length)
  const unverified=structuredClone(manifest);unverified.revalidation.records[0].status='blocked';assert.ok(phase08EvidenceIssues(unverified,plan,now).length)
 })
 await check('hosted float8 JSON representation is canonicalized without accepting content or meaningful coordinate changes',async()=>{
  const hosted=JSON.parse(await readFile('docs/validation/phase08-hosted-drafts.json','utf8'))
  for(const p of manifest.places){const actual=hosted.places.find(r=>r.slug===p.slug),ar=actual.place_translations.find(t=>t.locale==='ar-JO');for(const [key,v]of Object.entries(p.english))assert.ok(matchesImportedField(key,actual[key],v),p.slug+':'+key);for(const [key,v]of Object.entries(p.arabic))assert.deepEqual(ar[key],v,p.slug+':ar:'+key)}
  assert.equal(matchesImportedField('latitude',29.6397222222222,29.639722222222222),true)
  assert.equal(matchesImportedField('latitude',29.63972222223,29.639722222222222),false)
  assert.equal(matchesImportedField('latitude','29.6397222222222',29.639722222222222),false)
  assert.equal(matchesImportedField('description','Changed text','Original text'),false)
  assert.equal(matchesImportedField('name','البترا ','البترا'),false)
 })
 await check('full migration replay, original starter protection and ordinary-user denial',async()=>{
  await db.exec(await readFile('supabase/tests/bootstrap.sql','utf8'));await db.exec('create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz)')
  for(const f of(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+f,'utf8'))
  await db.exec(await readFile('supabase/content/phase02b-starter.sql','utf8'));before=(await db.query('select jsonb_agg(to_jsonb(p) order by id) as rows from places p')).rows[0].rows
  await db.query('insert into auth.users(id) values($1),($2)',[user,ordinary]);await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[sid,user]);await db.query("insert into user_roles(user_id,role) values($1,'admin')",[user]);categories=(await db.query('select * from categories')).rows
  await assert.rejects(as(null,"select admin_apply_quick_edit('{}',null,false)"));await assert.rejects(as(ordinary,"select admin_apply_quick_edit('{}',null,false)"))
 })
 await check('all 18 bilingual drafts use the existing guarded Quick Edit RPC without approvals',async()=>{
  for(const p of manifest.places){const cats=p.categorySlugs.map(slug=>categories.find(c=>c.slug===slug).id),english={...p.english,primary_category_id:cats[0]},changes={english,arabic:p.arabic,category_ids:cats,images:[]};const id=(await as(user,'select admin_apply_quick_edit($1,null,false) id',[changes],true)).rows[0].id
   const row=(await as(user,'select * from places where id=$1',[id])).rows[0],ar=(await as(user,"select * from place_translations where place_id=$1 and locale='ar-JO'",[id])).rows[0]
   assert.equal(row.status,'draft');assert.equal(row.verified_at,null);assert.equal(ar.editorial_status,'pending');for(const k of Object.keys(english))assert.deepEqual(row[k],english[k],p.slug+':'+k);for(const k of Object.keys(p.arabic))assert.deepEqual(ar[k],p.arabic[k],p.slug+':ar:'+k)
   await as(user,'insert into place_reviews(place_id,location_kind,coordinate_source,claims_reviewed,location_reviewed,notes) values($1,$2,$3,false,false,$4)',[id,p.location_kind,p.coordinateSource,JSON.stringify({...p.evidence,contentHash:p.contentHash})],true)
  }assert.equal((await as(user,'select count(*)::int n from places')).rows[0].n,24)
 })
 await check('duplicates cannot insert, original six rows remain byte-equivalent and audit actors are genuine test identities',async()=>{
  assert.deepEqual((await db.query('select jsonb_agg(to_jsonb(p) order by id) rows from places p where slug=any($1)',[before.map(p=>p.slug)])).rows[0].rows,before)
  const p=manifest.places[0],cats=p.categorySlugs.map(slug=>categories.find(c=>c.slug===slug).id);await assert.rejects(as(user,'select admin_apply_quick_edit($1,null,false)',[{english:{...p.english,primary_category_id:cats[0]},arabic:p.arabic,category_ids:cats,images:[]}]))
  assert.ok((await db.query('select count(*)::int n from admin_audit_logs where actor_id=$1',[user])).rows[0].n>=36)
 })
 await check('drafts and Arabic remain invisible to guests and ordinary users; incomplete publication is rejected',async()=>{
  for(const role of [null,ordinary]){assert.equal((await as(role,'select * from places')).rows.length,0);assert.equal((await as(role,'select * from place_translations')).rows.length,0);assert.equal((await as(role,'select * from storage.objects')).rows.length,0)}
  const p=(await as(user,"select id,updated_at from places where slug='petra'")).rows[0],t=(await as(user,"select updated_at from place_translations where place_id=$1",[p.id])).rows[0];await assert.rejects(as(user,'select admin_publish_localized_place($1,$2,$3)',[p.id,p.updated_at,t.updated_at]))
 })
 await check('bilingual new-destination names are searchable without approving draft content',async()=>{
  const current=(await as(user,"select p.*,coalesce((select jsonb_agg(t) from place_translations t where t.place_id=p.id),'[]') place_translations from places p where slug=any($1)",[manifest.places.map(p=>p.slug)])).rows
  // Simulated published/current translations ONLY in local JS fixtures, never database updates.
  const places=current.map(r=>normalizePlace({...r,status:'published',place_translations:r.place_translations.map(t=>({...t,editorial_status:'reviewed',source_updated_at:r.updated_at}))}))
  for(const lang of ['en','ar-JO'])for(const p of manifest.places){const hits=filterPlaces(places.map(p=>localizeDestination(p,lang)),{query:p.arabic.name});assert.ok(hits.some(r=>r.slug===p.slug))}
 })
 await check('explicit synthetic Admin attestation permits only a complete localized destination through actual guarded RPCs',async()=>{
  const plan=manifest.places.find(p=>p.slug==='petra'),photo=manifest.photos.find(p=>p.slug==='petra'&&p.isCover),p=(await as(user,"select * from places where slug='petra'")).rows[0],path=p.id+'/phase08-'+photo.uploadSha256+'.jpg'
  // Storage metadata is a disposable fixture, not a real hosted upload.
  await as(user,"insert into storage.objects(bucket_id,name) values('place-images',$1)",[path],true)
  const image=(await as(user,"insert into place_images(place_id,storage_path,alt_text,source_url,attribution,license_basis,license_evidence,is_cover) values($1,$2,$3,$4,$5,'licensed',$6,true) returning *",[p.id,path,photo.altEn,photo.page,photo.attribution,photo.licenseEvidence],true)).rows[0]
  await as(user,'select admin_approve_image($1,$2)',[image.id,image.updated_at],true)
  await as(user,'select admin_review_place($1,$2,$3)',[p.id,p.updated_at,{location_kind:plan.location_kind,coordinate_source:plan.coordinateSource,claims_reviewed:true,location_reviewed:true,notes:'EXPLICIT SYNTHETIC TEST ADMIN ATTESTATION - no hosted approval'}],true)
  const current=(await as(user,'select * from places where id=$1',[p.id])).rows[0]
  await as(user,"update place_translations set source_updated_at=(select updated_at from places where id=$1) where place_id=$1 and locale='ar-JO'",[p.id],true)
  await as(user,"update place_translations set editorial_status='reviewed' where place_id=$1 and locale='ar-JO'",[p.id],true)
  const ar=(await as(user,"select * from place_translations where place_id=$1 and locale='ar-JO'",[p.id])).rows[0]
  assert.deepEqual((await as(user,'select admin_publication_issues($1) issues',[p.id])).rows[0].issues,[])
  await as(user,'select admin_publish_localized_place($1,$2,$3)',[p.id,current.updated_at,ar.updated_at],true)
  assert.equal((await as(null,"select * from places where slug='petra'")).rows.length,1);assert.equal((await as(null,'select * from place_translations where place_id=$1',[p.id])).rows.length,1)
  assert.equal((await as(null,"select * from places where slug='aqaba-marine-reserve'")).rows.length,0)
 })
}finally{await db.close();await writeFile('docs/validation/phase08-unit-database.json',JSON.stringify({scope:'Local package validation and real disposable PostgreSQL with real RLS; zero hosted writes. Synthetic test users never exist in hosted Supabase.',results},null,2)+'\n')}

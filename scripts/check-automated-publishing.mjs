// All publication writes in this runner test are isolated in-memory operations.
import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {runAutomatedPublishing} from '../src/features/admin/automatedPublishing.js'
const read=async p=>JSON.parse(await readFile(p,'utf8')),manifest=await read('docs/evidence/automated-publishing/publication-plan.json'),baseline=await read('docs/validation/automation-before.json'),results=[]
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
const sign=m=>({...m,evidenceSha256:createHash('sha256').update(JSON.stringify({places:m.places,photos:m.photos})).digest('hex')})
function fixture(){
 let seq=0,authCallback;const rows=baseline.places.map(p=>({...structuredClone(p),review:structuredClone(baseline.reviews.find(r=>r.place_id===p.id)),place_images:structuredClone(baseline.images.filter(i=>i.place_id===p.id)),place_translations:structuredClone(baseline.translations.filter(t=>t.place_id===p.id))})),writes=[]
 const clock=()=>new Date(Date.now()+ ++seq*1000).toISOString(),get=id=>rows.find(p=>p.id===id)
 const client={supabaseUrl:'https://dkhwwvoplhfjccvjegty.supabase.co',auth:{getUser:async()=>({data:{user:{id:'fixture-admin',email_confirmed_at:'2026-01-01'}}}),onAuthStateChange:callback=>{authCallback=callback;return {data:{subscription:{unsubscribe:()=>{authCallback=null}}}}}},rpc:async()=>({error:null})}
 const repo={getPlace:async id=>structuredClone(get(id)),upload:async(id,file)=>{const path=id+'/'+file.name;get(id).place_images.push({id:path,storage_path:path,alt_text:file.name,approved_at:null});writes.push({type:'upload',id});return path},updateImage:async(image,changes)=>{Object.assign(rows.flatMap(p=>p.place_images).find(i=>i.id===image.id),changes);writes.push({type:'image metadata',id:image.id})},signedImages:async images=>images.map(i=>({...i,url:'https://fixture.invalid/'+i.id})),approveImage:async image=>{rows.flatMap(p=>p.place_images).find(i=>i.id===image.id).approved_at=clock();writes.push({type:'image approval',id:image.id})},reviewPlace:async(p,review)=>{Object.assign(get(p.id),{updated_at:clock(),verified_at:clock(),review});writes.push({type:'source review',id:p.id,review})},saveTranslation:async(p,arabic,old)=>{const t={...old,...arabic,locale:'ar-JO',source_updated_at:p.updated_at,updated_at:clock(),editorial_status:'pending'};get(p.id).place_translations=[t];writes.push({type:'Arabic version sync',id:p.id});return structuredClone(t)},reviewTranslation:async t=>{const saved=get(t.place_id).place_translations[0];saved.editorial_status='reviewed';saved.updated_at=clock();writes.push({type:'translation review',id:t.place_id});return structuredClone(saved)},publicationIssues:async id=>{const p=get(id);return p.verified_at&&p.place_images.some(i=>i.is_cover&&i.approved_at)?[]:['Unverified content or missing approved cover']},publishLocalized:async(p)=>{const row=get(p.id);row.status='published';row.updated_at=clock();row.place_translations[0].source_updated_at=row.updated_at;writes.push({type:'atomic publication',id:p.id})},savePlace:()=>{throw Error('English must never be overwritten')}}
 const fetchFile=async url=>{if(url.startsWith('/docs/'))return new Response(await readFile(url.slice(1)));const id=url.replace('https://fixture.invalid/',''),image=rows.flatMap(p=>p.place_images).find(i=>i.id===id),photo=manifest.photos.find(p=>p.page===image?.source_url);return photo?new Response(await readFile(photo.uploadPath)):new Response('',{status:404})}
 return {client,repo,fetchFile,writes,rows,switchAuth:()=>authCallback?.('SIGNED_OUT',null)}
}
await check('all twelve prepared images retain licensed originals and responsive variants',async()=>{
 const variants=await read('docs/evidence/automated-publishing/responsive-manifest.json');assert.equal(manifest.photos.length,12)
 for(const photo of manifest.photos){assert.equal(photo.verification.eligible,true);const bytes=await readFile(photo.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),photo.sha256);assert.ok(photo.author&&photo.licenseEvidence&&photo.attribution);assert.ok(variants.images.some(v=>v.id===photo.id&&v.variants.length>=2))}
 assert.equal(manifest.photos.some(p=>p.alt==='um.jfif'),false)
})
await check('wrong project, absent real-session authorization, expired or tampered evidence refuse all writes',async()=>{
 let f=fixture();f.client.supabaseUrl='https://other.supabase.co';await assert.rejects(runAutomatedPublishing(f.client,f.repo,manifest,f.fetchFile));assert.equal(f.writes.length,0)
 f=fixture();f.client.rpc=async()=>({error:{message:'Administrator session required'}});await assert.rejects(runAutomatedPublishing(f.client,f.repo,manifest,f.fetchFile));assert.equal(f.writes.length,0)
 f=fixture();await assert.rejects(runAutomatedPublishing(f.client,f.repo,{...manifest,preparedAt:'2000-01-01'},f.fetchFile));await assert.rejects(runAutomatedPublishing(f.client,f.repo,{...manifest,evidenceSha256:'0'.repeat(64)},f.fetchFile));assert.equal(f.writes.length,0)
 const expired=structuredClone(manifest);expired.places.forEach(p=>p.evidenceRetrievedAt='2000-01-01');const expiredResult=await runAutomatedPublishing(f.client,f.repo,sign(expired),f.fetchFile);assert.ok(expiredResult.results.every(r=>r.status==='blocked'));assert.equal(f.writes.length,0)
})
await check('eligible batch runs through saved-evidence operations, preserves English and never approves the test upload',async()=>{
 const f=fixture(),before=f.rows.map(p=>({id:p.id,name:p.name,description:p.description,slug:p.slug})),report=await runAutomatedPublishing(f.client,f.repo,manifest,f.fetchFile)
 assert.ok(report.results.every(r=>r.status==='published'),JSON.stringify(report.results));assert.equal(f.writes.filter(w=>w.type==='upload').length,1,'Only the new Ajloun woodland cover is missing from current associations')
 assert.deepEqual(f.rows.map(p=>({id:p.id,name:p.name,description:p.description,slug:p.slug})),before);assert.equal(f.rows.flatMap(p=>p.place_images).find(i=>i.alt_text==='um.jfif').approved_at,null)
 assert.ok(!f.rows.find(p=>p.slug==='umm-qais').place_translations[0].visitor_guidance.includes('um.jfif'));assert.ok(manifest.places.find(p=>p.slug==='umm-qais').expectedArabic.visitor_guidance.includes('um.jfif'))
 assert.ok(f.writes.filter(w=>w.type==='source review').every(w=>w.review.notes.includes('Automated primary-source')))
 const second=await runAutomatedPublishing(f.client,f.repo,manifest,f.fetchFile);assert.ok(second.results.every(r=>r.status==='already published'));assert.equal(f.writes.filter(w=>w.type==='upload').length,1)
})
await check('one changed or critically blocked destination does not prevent other eligible records',async()=>{
 const f=fixture();f.rows[0].description='A newer real editorial change';const report=await runAutomatedPublishing(f.client,f.repo,manifest,f.fetchFile);assert.equal(report.results[0].status,'blocked');assert.equal(report.results.filter(r=>r.status==='published').length,5);assert.equal(f.rows[0].description,'A newer real editorial change')
 const stale=structuredClone(manifest);stale.places[0].evidenceRetrievedAt='2000-01-01';const h=fixture(),staleReport=await runAutomatedPublishing(h.client,h.repo,sign(stale),h.fetchFile);assert.equal(staleReport.results.filter(r=>r.status==='published').length,5)
 const m=structuredClone(manifest);m.places[0].criticalBlockers=['A critical factual issue'];const g=fixture(),r=await runAutomatedPublishing(g.client,g.repo,sign(m),g.fetchFile);assert.equal(r.results[0].status,'blocked');assert.equal(r.results.filter(r=>r.status==='published').length,5)
})
await check('explicit Needs Changes feedback prevents automatic translation approval',async()=>{
 const f=fixture();f.rows[0].place_translations[0].editorial_status='needs_changes';const report=await runAutomatedPublishing(f.client,f.repo,manifest,f.fetchFile);assert.equal(report.results[0].status,'blocked');assert.ok(report.results[0].blocker.includes('feedback'));assert.equal(f.rows[0].status,'draft')
})
await check('account changes stop the next write; newer editorial notes are never overwritten',async()=>{
 const f=fixture(),fetchFile=async(...args)=>{const r=await f.fetchFile(...args);f.switchAuth();return r};const report=await runAutomatedPublishing(f.client,f.repo,manifest,fetchFile);assert.equal(f.writes.length,0);assert.ok(report.results.every(r=>r.status==='blocked'))
 const g=fixture();g.rows[0].review.notes='A newer reviewer correction';const r=await runAutomatedPublishing(g.client,g.repo,manifest,g.fetchFile);assert.equal(r.results[0].status,'blocked');assert.equal(g.rows[0].review.notes,'A newer reviewer correction')
})
await writeFile('docs/validation/automated-publishing-tests.json',JSON.stringify({scope:'Local actual file hashes and isolated repository/API fixtures; no real Auth, Storage writes or hosted approvals',passed:results.length,results},null,2)+'\n')

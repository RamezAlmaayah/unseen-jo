import assert from 'node:assert/strict'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {manifest,fixtureAdapter,fixtureRows} from './content-sync-test-fixture.mjs'
import {validateContentSyncPackage,inspectContentSync,destinationProblems,translationState,sameVersion,rightsUsable,localContentSyncEnabled,syncError,digest} from '../src/features/admin/contentSyncModel.js'
import {inspectSync,runContentSyncBatch,createContentSyncAdapter} from '../src/features/admin/contentSyncExecutor.js'
import {CONTENT_SYNC_PACKAGE_SHA256} from '../src/features/admin/contentSyncPackage.js'
const results=[],check=async(name,fn)=>{await fn();results.push({name,status:'PASS'});console.log('PASS '+name)},clone=structuredClone
const changed=manifest.translations.find(t=>t.slug==='petra'),other=manifest.translations.find(t=>t.id!==changed.id)
const run=(f,p,ids=[changed.id],extra={})=>runContentSyncBatch(f.adapter,manifest,p,{ids,confirmed:true,...extra})
await check('package digest, exact identities, counts and rights exclusions',async()=>{
 assert.equal(await digest(await readFile('supabase/content/phase14-admin-sync.json','utf8')),CONTENT_SYNC_PACKAGE_SHA256)
 validateContentSyncPackage(manifest);assert.equal(manifest.images.filter(rightsUsable).length,30);assert.equal(manifest.excluded.length,4)
 for(const mutate of [p=>p.projectRef='other',p=>p.translations.push(p.translations[0]),p=>p.translations[0].id=p.translations[1].id,p=>p.images[0].baseline.storage_path='wrong/file.jpg',p=>p.excluded[0].id=p.images[0].photoId]){const p=clone(manifest);mutate(p);assert.throws(()=>validateContentSyncPackage(p))}
 const p=clone(manifest);p.images[0].rights.eligible=false;assert.equal(inspectContentSync(p,fixtureRows()).images[0].state,'excluded')
 assert.equal(rightsUsable({...manifest.images[0],rights:{...manifest.images[0].rights,licenseUrl:'https://evil.test/license'}}),false)
})
await check('timestamp precision, local-only execution and safe error reporting',()=>{
 assert.ok(sameVersion('2026-10-01T00:00:00.123456+00:00','2026-10-01T00:00:00.123456Z'));assert.ok(!sameVersion('2026-10-01T00:00:00.123457Z','2026-10-01T00:00:00.123456Z'));assert.ok(!sameVersion('invalid','invalid'))
 assert.ok(localContentSyncEnabled({DEV:true},'127.0.0.1'));assert.ok(!localContentSyncEnabled({DEV:false},'localhost'));assert.ok(!localContentSyncEnabled({DEV:true},'unseen.example'))
 assert.ok(!syncError('Bearer secret password=abc token=def eyJabc.abc.abc').includes('secret'));assert.ok(!syncError('password=abc').includes('abc'))
})
await check('read-only preview: 19 ready, six text changes, 30 image approvals blocked, no mutation',async()=>{
 const f=fixtureAdapter(),p=await inspectSync(f.adapter,manifest);assert.equal(p.problems.length,0);assert.equal(p.translations.filter(t=>t.state==='ready').length,19);assert.equal(p.translations.filter(t=>t.changes?.length).length,6);assert.equal(p.images.filter(i=>i.state==='blocked').length,30);assert.equal(f.state.writes.length,0)
})
await check('confirmation, duplicate IDs, wrong batch size and destination conflict fail closed',async()=>{
 const f=fixtureAdapter(),p=await inspectSync(f.adapter,manifest)
 for(const options of [{ids:[changed.id],confirmed:false},{ids:[changed.id,changed.id],confirmed:true},{ids:manifest.translations.slice(0,6).map(t=>t.id),confirmed:true}])await assert.rejects(runContentSyncBatch(f.adapter,manifest,p,options))
 const bad=clone(p);bad.problems=['concurrent English edit'];await assert.rejects(run(f,bad));assert.equal(f.state.writes.length,0)
})
await check('hosted version, deleted rows, added destinations, changed rights detected without overwrite',async()=>{
 const rows=fixtureRows(),p=manifest.translations[0],r=rows.find(d=>d.id===p.id);r.place_translations[0].updated_at='2026-10-24T00:00:00.000001Z';assert.equal(translationState(p,r).state,'conflict');assert.ok(destinationProblems(manifest,[...rows,rows[0]]).length);assert.equal(translationState(p,{...r,place_translations:[]}).state,'conflict')
 const image=manifest.images[0],place=rows.find(d=>d.id===image.placeId);place.place_images.find(i=>i.id===image.imageId).license_evidence='unreviewed replacement';assert.equal(inspectContentSync(manifest,rows).images[0].state,'conflict')
})
await check('all 19 execute in controlled batches; rerun idempotent; 24 destinations/images/categories preserved',async()=>{
 const f=fixtureAdapter(),before=clone(f.state.rows)
 for(let offset=0;offset<19;offset+=5){const p=await inspectSync(f.adapter,manifest),r=await run(f,p,manifest.translations.slice(offset,offset+5).map(t=>t.id));assert.equal(r.verification,'passed');assert.ok(r.results.every(r=>r.status==='applied'))}
 assert.equal(f.state.writes.filter(w=>w.operation==='save').length,6);assert.equal(f.state.writes.filter(w=>w.operation==='review').length,19)
 for(const b of before){const a=f.state.rows.find(p=>p.id===b.id);assert.deepEqual({...a,place_translations:null},{...b,place_translations:null})}
 const count=f.state.writes.length,p=await inspectSync(f.adapter,manifest);assert.ok(p.translations.every(t=>t.state==='already_applied'));const repeat=await run(f,p,[changed.id]);assert.equal(repeat.results[0].status,'already_applied');assert.equal(f.state.writes.length,count)
})
await check('CAS race after preflight preserves newer text and stops the next record',async()=>{
 const f=fixtureAdapter({beforeSave:async s=>{const r=s.rows.find(p=>p.id===changed.id).place_translations[0];r.updated_at='2026-10-24T00:00:00.999999Z';r.description='Newer editor content'}}),p=await inspectSync(f.adapter,manifest),r=await run(f,p,[changed.id,other.id]);assert.equal(r.results[0].status,'conflict');assert.equal(r.results[1].status,'not_attempted');assert.equal(f.state.writes.length,0);assert.equal(f.row(changed.id).description,'Newer editor content')
})
await check('revoked session after text save leaves a truthful partial result; no auto retry',async()=>{
 const f=fixtureAdapter({afterSave:async s=>{s.allowed=false}}),p=await inspectSync(f.adapter,manifest),r=await run(f,p,[changed.id,other.id]);assert.equal(r.results[0].status,'saved_pending_or_unverified');assert.equal(r.results[1].status,'not_attempted');assert.equal(r.verification,'unavailable');assert.equal(f.state.writes.length,1);assert.equal(f.row(changed.id).editorial_status,'pending')
})
await check('lost text-save reply is unverified, never automatically replayed',async()=>{
 const f=fixtureAdapter({afterSave:async()=>{throw Error('Network timeout')}}),p=await inspectSync(f.adapter,manifest),r=await run(f,p);assert.equal(r.results[0].status,'failed_or_unverified');assert.equal(r.results[0].textSaved,false);assert.equal(f.state.writes.length,1);assert.equal(translationState(changed,f.state.rows.find(t=>t.id===changed.id)).state,'conflict')
})
await check('lost review reply does not claim completion; new preview recognizes committed review',async()=>{
 const f=fixtureAdapter({afterReview:async()=>{throw Error('Network timeout')}}),p=await inspectSync(f.adapter,manifest),r=await run(f,p);assert.equal(r.results[0].status,'saved_pending_or_unverified');assert.equal(r.results[0].reviewVerified,false);assert.equal((await inspectSync(f.adapter,manifest)).translations.find(t=>t.id===changed.id).state,'already_applied')
})
await check('cancellation and account switch stop further requests',async()=>{
 for(const switched of [false,true]){let stop=false;const f=fixtureAdapter({afterSave:async s=>{if(switched)s.actorChanged();else stop=true}}),p=await inspectSync(f.adapter,manifest),r=await run(f,p,[changed.id,other.id],{shouldStop:()=>stop});assert.equal(r.results[0].status,'saved_pending_or_unverified');assert.equal(r.results[1].status,'not_attempted');assert.equal(f.state.writes.length,1);assert.ok(f.state.unsubscribed)}
})
await check('readback failure does not report verified success',async()=>{
 const f=fixtureAdapter({read:async s=>{if(s.writes.length>1)throw Error('Read unavailable')}}),p=await inspectSync(f.adapter,manifest),r=await run(f,p);assert.equal(r.results[0].reviewVerified,false);assert.equal(r.verification,'unavailable')
})
await check('adapter rejects wrong project, guest and missing backend permission; production guard blocks writes',async()=>{
 const repo={reviewTranslation:()=>assert.fail('must not write')},base={supabaseUrl:'https://dkhwwvoplhfjccvjegty.supabase.co',auth:{getUser:async()=>({data:{user:{id:'synthetic'}}})},rpc:()=>({retry(){return this},abortSignal:async()=>({error:{code:'42501',message:'Administrator session required'}})})}
 await assert.rejects(createContentSyncAdapter({...base,supabaseUrl:'https://other.supabase.co'},repo).authorize());await assert.rejects(createContentSyncAdapter({...base,auth:{getUser:async()=>({data:{user:null}})}},repo).authorize());await assert.rejects(createContentSyncAdapter(base,repo).authorize());await assert.rejects(createContentSyncAdapter(base,repo).saveTranslation(changed,{}));await assert.rejects(createContentSyncAdapter(base,repo).reviewTranslation({}))
})
await mkdir('docs/validation',{recursive:true});await writeFile('docs/validation/admin-content-sync-model.json',JSON.stringify({scope:'Offline fixtures only; no hosted access or writes',tests:results},null,2)+'\n');console.log(`${results.length} offline checks passed`)

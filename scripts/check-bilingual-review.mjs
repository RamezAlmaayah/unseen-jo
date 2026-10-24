import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {createAdminRepository} from '../src/features/admin/repository.js'
import {translationFlags} from '../src/features/admin/translationReviewModel.js'
const results=[]
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
const remote=JSON.parse(await readFile('docs/validation/phase04l-preservation-snapshot.json','utf8'))
const source=JSON.parse(await readFile('supabase/content/phase04-completion.json','utf8'))
await check('all six destinations have targeted review prompts and source caution comparisons',()=>{
 for(const p of remote.places){const t=remote.translations.find(t=>t.place_id===p.id),s=source.places.find(s=>s.slug===p.slug);assert.ok(s.sources.length);assert.ok(translationFlags(p,t,s).length);assert.ok(translationFlags(p,{...t,description:''},s).some(f=>f.field==='description'&&f.message.includes('missing')))}
})
await check('heuristics flag missing Arabic, stale English and numeric discrepancies',()=>{
 const flags=translationFlags({description:'Fee 17. Age 18.',updated_at:'2026-10-19'},{description:'رسوم ١٨ وعمر ١٧',source_updated_at:'2026-10-19'})
 assert.equal(flags.length,0)
 assert.ok(translationFlags({description:'Fee 17.',updated_at:'2026-10-19'},{description:'رسوم ١٨',source_updated_at:'2000-01-01'}).length===2)
})
await check('repository isolates Arabic fields, enforces optimistic concurrency and validates review notes',async()=>{
 let calls=[],response={data:[{place_id:'id',editorial_status:'pending'}],error:null}
 const chain={};for(const name of ['update','insert','eq','select'])chain[name]=(...args)=>{calls.push([name,...args]);return chain};chain.abortSignal=async()=>response
 const client={from:table=>{calls.push(['from',table]);return chain}},repo=createAdminRepository(client),place={id:'id',updated_at:'source'},previous={place_id:'id',updated_at:'version'}
 await repo.saveTranslation(place,{name:' عربي ',description:'وصف',status:'published',approved_at:'now',verified_at:'now'},previous)
 const payload=calls.find(c=>c[0]==='update')[1];assert.equal(payload.name,'عربي');assert.equal(payload.status,undefined);assert.equal(payload.approved_at,undefined);assert.equal(payload.verified_at,undefined);assert.ok(calls.some(c=>c[0]==='eq'&&c[1]==='updated_at'&&c[2]==='version'));assert.ok(calls.every(c=>c[0]!=='from'||c[1]==='place_translations'))
 calls=[];await repo.reviewTranslation(previous,'needs_changes',' Compare source ');assert.deepEqual(calls.find(c=>c[0]==='update')[1],{editorial_status:'needs_changes',review_notes:'Compare source'})
 await assert.rejects(repo.reviewTranslation(previous,'needs_changes',' '));await assert.rejects(repo.reviewTranslation(previous,'published',''));await assert.rejects(repo.reviewTranslation(previous,'needs_changes','x'.repeat(4001)))
 response={data:[],error:null};await assert.rejects(repo.saveTranslation(place,{name:'عربي'},previous),/Translation changed/);await assert.rejects(repo.reviewTranslation(previous,'pending'),/Translation changed/)
})
await writeFile('docs/validation/bilingual-review-unit.json',JSON.stringify({scope:'Local heuristics and repository boundary tests; no remote writes',passed:results.length,results},null,2)+'\n')

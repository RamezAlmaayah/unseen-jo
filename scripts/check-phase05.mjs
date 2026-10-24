import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {createClient} from '@supabase/supabase-js'
import {DEFAULT_WEIGHTS,weightPercentages,normalizePreferences,extractFeatures,eligibility,scoreFeatures,rankDestinations,chooseRecommendation,explain} from '../src/features/recommendations/engine.js'
import {createTourismRepository,RECOMMENDATION_SELECT} from '../src/features/tourism/repository.js'
import {distanceKm,cityCenters} from '../src/features/map/geography.js'
import {validatePreferences} from '../src/features/recommendations/preferences.js'
const categories=['nature','adventure','history','culture'].map(slug=>({id:slug,slug,name:slug})),base={id:'p1',slug:'place-one',name:'Place One',status:'published',is_demo:false,latitude:32,longitude:35.8,place_categories:[{categories:categories[0]}],price_min_jod:null,price_max_jod:null,duration_min_minutes:120,duration_max_minutes:240,suitable_groups:null}
const input={interests:['nature'],startingLocation:'amman',availableTime:'4-hours',budget:'jod:20',transportation:'car',travelGroup:'friends'},p=normalizePreferences(input,categories),results=[]
const check=async(name,fn)=>{await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
await check('normalization reuses categories, ranges, custom total budget and hours without inventing GPS',()=>{
 assert.deepEqual(p.interests,['nature']);assert.equal(p.budget,20);assert.equal(p.minutes,240);assert.equal(p.origin.id,'amman')
 const custom=normalizePreferences({...input,interests:['nature','nature','unrecognized'],totalBudget:'7.25',hoursAvailable:'1.5'},categories);assert.equal(custom.budget,7.25);assert.equal(custom.minutes,90);assert.deepEqual(custom.interests,['nature'])
 assert.equal(normalizePreferences({budget:'over-30'},categories).budget,null);assert.equal(normalizePreferences({startingLocation:'salt'},categories).origin,null)
 assert.deepEqual(validatePreferences({...input,totalBudget:'-1'}).totalBudget!=null,true);assert.ok(validatePreferences({...input,hoursAvailable:'0'}).hoursAvailable)
})
await check('multiple interests and multi-category records materially affect ranking',()=>{
 const pp=normalizePreferences({...input,interests:['nature','history']},categories),a=extractFeatures(base),b=extractFeatures({...base,place_categories:[...base.place_categories,{categories:categories[2]}]})
 assert.equal(scoreFeatures(a,pp).dimensions.find(d=>d.id==='interest').quality,0.5);assert.equal(scoreFeatures(b,pp).dimensions.find(d=>d.id==='interest').quality,1)
 const rank=rankDestinations([{...base,id:'history',slug:'history',place_categories:[{categories:categories[2]}]},base],{...input,interests:['history']},categories);assert.equal(rank.ranked[0].id,'history')
})
await check('fixed denominator penalizes missing evidence; coverage is separate from match quality',()=>{
 const f=extractFeatures({...base,latitude:null,longitude:null,duration_min_minutes:null,duration_max_minutes:null}),s=scoreFeatures(f,p)
 assert.equal(s.score,40);assert.equal(s.coverage,0.4);assert.equal(s.quality,1);assert.equal(s.scoreSupported,false)
 assert.equal(s.score,Math.round(s.quality*s.coverage*100));assert.equal(scoreFeatures(f,normalizePreferences({},categories)).score,0)
 const doubled=Object.fromEntries(Object.entries(DEFAULT_WEIGHTS).map(([key,value])=>[key,value*2]));assert.deepEqual(weightPercentages(doubled),DEFAULT_WEIGHTS);assert.equal(scoreFeatures(f,p,doubled).score,s.score)
 assert.throws(()=>scoreFeatures(f,p,{...DEFAULT_WEIGHTS,time:-1}));assert.throws(()=>scoreFeatures(f,p,Object.fromEntries(Object.keys(DEFAULT_WEIGHTS).map(k=>[k,0]))))
 for(let i=0;i<100;i++){const r=scoreFeatures(extractFeatures({...base,price_max_jod:i}),p);assert.ok(r.score>=0&&r.score<=100)}
})
await check('unknown admission is never free; strict total budget cannot be proved from admission',()=>{
 const f=extractFeatures(base),free=normalizePreferences({...input,budget:'free'},categories)
 assert.equal(scoreFeatures(f,free).dimensions.find(d=>d.id==='budget').coverage,0)
 assert.ok(!eligibility(f,{...p,strict:{budget:true}}).eligible)
 const zero=extractFeatures({...base,price_min_jod:0,price_max_jod:0});assert.equal(scoreFeatures(zero,free).dimensions.find(d=>d.id==='budget').quality,1)
 assert.equal(eligibility(zero,{...p,strict:{budget:true}}).eligible,false)
 const costly=extractFeatures({...base,price_min_jod:25,price_max_jod:30});assert.equal(eligibility(costly,p,{allowUnknown:true}).eligible,false)
 const under=normalizePreferences({...input,budget:'under-10'},categories);assert.equal(eligibility(extractFeatures({...base,price_min_jod:10}),under).eligible,false)
 assert.ok(scoreFeatures(extractFeatures({...base,price_min_jod:5,price_max_jod:10}),under).dimensions.find(d=>d.id==='budget').quality<1)
})
await check('time uses visit estimates, excludes known impossible minima and preserves unknowns',()=>{
 const short=normalizePreferences({...input,availableTime:'30-min'},categories),f=extractFeatures(base);assert.equal(eligibility(f,short).eligible,false)
 const partial=normalizePreferences({...input,hoursAvailable:3},categories),s=scoreFeatures(f,partial);assert.equal(s.dimensions.find(d=>d.id==='time').quality,0.75);assert.ok(explain(f,partial,s).some(r=>r.key.startsWith('Only part')))
 assert.equal(eligibility(f,{...partial,strict:{time:true}}).eligible,false)
 const unknown=extractFeatures({...base,duration_min_minutes:null,duration_max_minutes:null});assert.ok(eligibility(unknown,short).eligible);assert.equal(eligibility(unknown,{...short,strict:{time:true}}).eligible,false)
 assert.deepEqual(extractFeatures({...base,duration_min_minutes:100,duration_max_minutes:10}).duration,{min:null,max:null})
})
await check('geodesic distances are approximate straight-line km; missing location is safe',()=>{
 const [amman,irbid]=cityCenters;assert.equal(distanceKm(amman,amman),0);assert.ok(distanceKm(amman,irbid)>60&&distanceKm(amman,irbid)<75);assert.equal(distanceKm(null,irbid),null)
 const f=extractFeatures({...base,latitude:999}),pp={...p,strict:{location:true}};assert.equal(eligibility(f,pp).eligible,false)
 const denied=normalizePreferences({...input,startingLocation:''},categories);assert.equal(scoreFeatures(extractFeatures(base),denied).distanceKm,null)
 assert.ok(Number.isFinite(distanceKm({latitude:0,longitude:0},{latitude:0,longitude:180})))
})
await check('published-only eligibility rejects drafts, demos, deleted/inactive and malformed records',()=>{
 for(const change of [{id:''},{status:'draft'},{status:'archived'},{is_demo:true},{is_active:false},{slug:'BAD SLUG'},{name:null},{mode:'supabase',status:'draft'}])assert.equal(eligibility(extractFeatures({...base,...change}),p).eligible,false)
 assert.equal(eligibility(extractFeatures(null),p).eligible,false);assert.deepEqual(extractFeatures({...base,place_categories:{}}).categories,[])
 assert.equal(rankDestinations([],input,categories).ranked.length,0)
})
await check('strict unknowns require explicit relaxation; verified failures remain blocked',()=>{
 const result=rankDestinations([base],{...input,strict:{transport:true,budget:true}},categories);assert.equal(result.ranked.length,0);assert.equal(result.relaxed.length,1);assert.deepEqual(result.relaxed[0].uncertainRequirements,['total_unknown','transport_unknown'])
 const none=rankDestinations([{...base,price_min_jod:100}],{...input,strict:{transport:true}},categories);assert.equal(none.relaxed.length,0)
 assert.equal(rankDestinations([base],{...input,strict:{interest:true},interests:['history']},categories).relaxed.length,0)
})
await check('explanations are evidence based: no budget, transport, opening or family safety claims',()=>{
 const f=extractFeatures({...base,transportation_notes:'Accessible by car',suitable_groups:['family']}),pp=normalizePreferences({...input,travelGroup:'family'},categories),s=scoreFeatures(f,pp),reasons=explain(f,pp,s)
 assert.equal(f.transportModes,null);assert.ok(reasons.some(r=>r.id==='transport'&&!r.fits));assert.ok(reasons.some(r=>r.id==='budget'&&!r.fits));assert.ok(reasons.find(r=>r.id==='group').key.includes('restrictions'))
 assert.ok(reasons.find(r=>r.id==='distance').key.includes('straight line'));assert.ok(reasons.find(r=>r.id==='time').key.includes('estimated'))
 assert.ok(!JSON.stringify(reasons).includes('Fits your budget'));assert.ok(!JSON.stringify(reasons).includes('open now'))
})
await check('deterministic ranking and controlled diversity preserve strong preferences',()=>{
 const rows=[base,{...base,id:'p2',slug:'place-two'},{...base,id:'p3',slug:'place-three',place_categories:[{categories:categories[2]}]}]
 const ranked=rankDestinations(rows,input,categories).ranked;assert.deepEqual(ranked.map(r=>r.id),rankDestinations([...rows].reverse(),input,categories).ranked.map(r=>r.id))
 const first=chooseRecommendation(ranked),second=chooseRecommendation(ranked,[first.id]);assert.notEqual(first.id,second.id);assert.notEqual(second.id,'p3');assert.equal(chooseRecommendation([ranked[0]],[ranked[0].id]).id,ranked[0].id);assert.equal(chooseRecommendation([]),null)
})
await check('public recommendations use the shared image-qualified catalog, ordered pages and published/demo filters',async()=>{
 const rows=Array.from({length:1001},(_,i)=>({...base,id:String(i),slug:'place-'+i,place_images:[{storage_path:`${i}/fixture.jpg`,alt_text:'Isolated approved public photo',is_cover:true,sort_order:0}]})),requests=[];let fail=false,tick=0,visible=rows
 const client=createClient('https://example.supabase.co','sb_publishable_test',{auth:{persistSession:false},global:{fetch:async(input)=>{const u=new URL(input);requests.push(u);if(fail)return new Response('{}',{status:503});const offset=Number(u.searchParams.get('offset')||0),limit=Number(u.searchParams.get('limit')||500);return new Response(JSON.stringify(visible.slice(offset,offset+limit)),{headers:{'content-type':'application/json'}})}}})
 client.storage.from=()=>({createSignedUrls:async paths=>({data:paths.map(path=>({path,signedUrl:'https://example.supabase.co/'+path}))})})
 const repo=createTourismRepository(client,{now:()=>tick});const [a,b]=await Promise.all([repo.fetchRecommendationCandidates(),repo.fetchRecommendationCandidates()]);assert.equal(a.length,1001);assert.equal(a,b);assert.equal(requests.length,3);assert.ok(a.every(p=>p.image))
 for(const u of requests){assert.equal(u.searchParams.get('select'),RECOMMENDATION_SELECT);assert.equal(u.searchParams.get('status'),'eq.published');assert.equal(u.searchParams.get('is_demo'),'eq.false');assert.equal(u.searchParams.get('order'),'slug.asc,id.asc');assert.equal(u.searchParams.get('limit'),'500')}
 assert.ok(RECOMMENDATION_SELECT.includes('place_images'));repo.invalidate();fail=true;await assert.rejects(repo.fetchRecommendationCandidates());fail=false;assert.equal((await repo.fetchRecommendationCandidates()).length,1001);tick=61000;visible=[];assert.equal((await repo.fetchRecommendationCandidates()).length,0,'expired inventory is re-read and removed records disappear')
})
const processing=[]
for(const count of [6,1000,10000]){const rows=Array.from({length:count},(_,i)=>({...base,id:String(i),slug:'place-'+i})),times=[];for(let n=0;n<25;n++){const start=performance.now();rankDestinations(rows,input,categories);times.push(performance.now()-start)}times.sort((a,b)=>a-b);processing.push({count,medianMs:times[12],p95Ms:times[23]})}
await writeFile('docs/validation/phase05-model.json',JSON.stringify({scope:'Pure engine plus installed SDK against intercepted read-only responses; no hosted writes. Node CPU timings exclude network/React.',results,processing},null,2)+'\n');console.log(JSON.stringify(processing));console.log(results.length+' Phase 05 groups passed')

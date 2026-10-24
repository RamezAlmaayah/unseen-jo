import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
import {createTourismRepository,PLACE_SELECT} from '../src/features/tourism/repository.js'
import {rankDestinations,chooseRecommendation} from '../src/features/recommendations/engine.js'
const env=loadEnv('production',process.cwd(),'VITE_');assert.equal(new URL(env.VITE_SUPABASE_URL).hostname,'dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),repo=createTourismRepository(client),start=performance.now()
const [rows,categories]=await Promise.all([repo.fetchRecommendationCandidates(),repo.fetchCategories()]),retrievalMs=performance.now()-start
assert.equal(rows.length,6);assert.ok(rows.every(r=>r.status==='published'&&r.is_demo===false))
const base={startingLocation:'amman',availableTime:'full-day',budget:'jod:20',travelGroup:'solo',transportation:'car'},profiles=[]
for(const interests of [['nature'],['history'],['nature','adventure'],[]]){const start=performance.now(),ranking=rankDestinations(rows,{...base,interests},categories),processingMs=performance.now()-start,selected=chooseRecommendation(ranking.ranked);assert.ok(selected);profiles.push({interests,processingMs,selected:selected.slug,ranked:ranking.ranked.map(r=>({slug:r.slug,score:r.score,coverage:r.coverage,scoreSupported:r.scoreSupported}))})}
assert.notEqual(profiles[0].selected,profiles[1].selected)
const strict=rankDestinations(rows,{...base,interests:['nature'],strict:{budget:true,transport:true}},categories);assert.equal(strict.ranked.length,0);assert.equal(strict.relaxed.length,6)
const place=await repo.fetchPublishedPlaceBySlug(profiles[0].selected);assert.equal(place.mode,'supabase');assert.ok(place.image);assert.ok(!place.image.includes('/assets/figma/'))
const privateRows=await client.from('place_reviews').select('place_id').limit(1);assert.ok(privateRows.error||!privateRows.data.length)
const snapshot=await client.from('places').select(PLACE_SELECT).eq('status','published').eq('is_demo',false).order('slug');assert.ifError(snapshot.error)
await writeFile('docs/validation/phase05-public-snapshot.json',JSON.stringify({retrievedAt:new Date().toISOString(),project:'dkhwwvoplhfjccvjegty',scope:'Genuine anonymous public records only; no signed media URLs or credentials',categories,rows:snapshot.data},null,2)+'\n')
const output={scope:'Genuine anonymous hosted read APIs and production repository. No API interception, no data/status/Storage writes.',project:'dkhwwvoplhfjccvjegty',published:rows.map(r=>({id:r.id,slug:r.slug,status:r.status})),retrievalMs,profiles,strict:{confirmed:strict.ranked.length,unverifiedAlternatives:strict.relaxed.length},selectedPhotoAvailable:!!place.image,privateReviewsExposed:false}
await writeFile('docs/validation/phase05-hosted.json',JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output,null,2))

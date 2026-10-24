import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
import {createTourismRepository} from '../src/features/tourism/repository.js'
import {filterPlaces} from '../src/features/tourism/model.js'
import {localizeDestination} from '../src/i18n/destinations.js'
import {searchEmbeds,applyAdminSearch} from '../src/features/search/adminSearch.js'
const env=loadEnv('production',process.cwd(),'VITE_');assert.equal(new URL(env.VITE_SUPABASE_URL).hostname,'dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),repo=createTourismRepository(client),catalog=await repo.fetchCatalog(),results=[]
assert.equal(catalog.destinations.length,6)
const cases=[['Ajloun','ajloun-forest'],[' AJLOUN ','ajloun-forest'],['عَجْلُـون','ajloun-forest'],['عجل','ajloun-forest'],['Wadi Mujib','wadi-mujib'],['وادي الموجب','wadi-mujib'],['الموج','wadi-mujib'],['Umm Qais','umm-qais'],['أُمّ قَيْس','umm-qais'],['ام قيس','umm-qais'],['not-a-real-destination',null],['%_',null],['',null]]
for(const [query,expected] of cases){
 for(const lang of ['en','ar-JO']){const rows=filterPlaces(catalog.destinations.map(p=>localizeDestination(p,lang)),{query});if(expected)assert.ok(rows.some(p=>p.slug===expected),lang+query);else assert.equal(rows.length,query?0:6);results.push({scope:'Actual public catalog + production local filter',lang,query,slugs:rows.map(p=>p.slug)})}
 // Execute exactly the Admin predicate grammar against public fields under anon
 // RLS. This validates PostgREST syntax; it is NOT authenticated Admin acceptance.
 let request=client.from('places').select('id,slug'+(searchEmbeds(query).length?','+searchEmbeds(query).join(','):''),{count:'exact'}).eq('status','published').eq('is_demo',false)
 const applied=applyAdminSearch(request,query);request=applied.request;if(applied.conditions.length)request=request.or('and('+applied.conditions.join(',')+')')
 const response=await request.order('id').range(0,19);assert.ifError(response.error);if(expected)assert.ok(response.data.some(p=>p.slug===expected),'server '+query);else assert.equal(response.data.length,query?0:6)
 results.push({scope:'Actual PostgREST predicate with anonymous public projection; not Admin session',query,count:response.count})
}
await writeFile('docs/validation/search-hosted.json',JSON.stringify({project:'dkhwwvoplhfjccvjegty',mutations:0,results},null,2)+'\n');console.log('PASS '+results.length+' hosted public/localized/server-predicate cases')

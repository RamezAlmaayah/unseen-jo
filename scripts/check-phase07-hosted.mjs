// Read-only hosted HTTP verification. No credentials exported, users created or rows written.
import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
import {createTourismRepository} from '../src/features/tourism/repository.js'
const env=loadEnv('production',process.cwd(),'VITE_')
assert.equal(new URL(env.VITE_SUPABASE_URL).hostname,'dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),results=[]
for(const table of ['saved_places','user_visited_places','user_discovery_history','profiles']){const result=await client.from(table).select('*').limit(1);assert.ok(result.error);assert.equal(result.error.code,'42501');results.push({name:'Anonymous access denied: '+table,code:result.error.code})}
const start=performance.now(),repo=createTourismRepository(client),catalog=await repo.fetchCatalog()
assert.equal(catalog.destinations.length,6)
assert.ok(catalog.destinations.every(p=>p.mode==='supabase'))
results.push({name:'Actual anonymous published catalog',count:6,slugs:catalog.destinations.map(p=>p.slug),retrievalMs:Math.round(performance.now()-start),images:catalog.destinations.filter(p=>p.image).length})
await writeFile('docs/validation/phase07-hosted-http.json',JSON.stringify({project:'dkhwwvoplhfjccvjegty',scope:'Genuine anonymous APIs, no authenticated writes or account acceptance claimed.',results},null,2)+'\n');console.log(results)

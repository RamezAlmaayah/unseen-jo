import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
const env=loadEnv('production',process.cwd(),'VITE_'),client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),results=[]
assert.equal(env.VITE_SUPABASE_URL,'https://dkhwwvoplhfjccvjegty.supabase.co')
const publicRows=await client.from('places').select('id,slug,status').eq('status','published');assert.ifError(publicRows.error);assert.equal(publicRows.data.length,6);results.push({name:'Genuine anonymous published catalog remains the original six',status:'passed',count:6})
const drafts=await client.from('places').select('id').eq('status','draft');assert.ifError(drafts.error);assert.deepEqual(drafts.data,[]);results.push({name:'Genuine anonymous queries cannot expose the 18 drafts',status:'passed'})
const overlays=await client.from('private_prototype_places').select('place_id');assert.ok(overlays.error&&overlays.data==null);results.push({name:'Genuine anonymous REST access to private overlays denied',status:'passed',code:overlays.error.code})
const rpc=await client.rpc('admin_private_prototype_catalog');assert.ok(rpc.error&&rpc.data==null);results.push({name:'Genuine anonymous private-catalog RPC denied',status:'passed',code:rpc.error.code})
await writeFile('docs/validation/private-prototype-public-security.json',JSON.stringify({scope:'Actual anonymous Supabase reads; no mocked responses, no privileged content writes',verifiedAt:new Date().toISOString(),results},null,2)+'\n');console.log('PASS four genuine hosted public/privacy checks; synthetic catalog stays private')

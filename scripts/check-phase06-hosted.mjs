// Anonymous HTTP probes only. Never creates accounts or changes Auth/content.
import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
const env=loadEnv('production',process.cwd(),'VITE_'),url=env.VITE_SUPABASE_URL,key=env.VITE_SUPABASE_PUBLISHABLE_KEY
assert.equal(new URL(url).hostname,'dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),results=[]
const settings=await fetch(new URL('/auth/v1/settings',url),{headers:{apikey:key}}).then(r=>{assert.equal(r.status,200);return r.json()})
results.push({name:'Actual public Auth configuration',email:settings.external.email,google:settings.external.google,signupDisabled:settings.disable_signup,emailAutoConfirmed:settings.mailer_autoconfirm,status:'passed'})
for(const table of ['profiles','user_preferences','user_preference_categories','saved_places']){const r=await client.from(table).select('*').limit(1);assert.ok(r.error);results.push({name:'Anonymous private-table access denied: '+table,code:r.error.code,status:'passed'})}
const rpc=await client.rpc('uj_save_preferences',{settings:{},expected_version:null});assert.ok(rpc.error);assert.equal(rpc.error.code,'42501');results.push({name:'Anonymous preference RPC denied before mutation',code:rpc.error.code,status:'passed'})
const places=await client.from('places').select('id,status,is_demo').eq('status','published').eq('is_demo',false);assert.ifError(places.error);assert.equal(places.data.length,6);results.push({name:'All six published destinations remain publicly accessible',count:6,status:'passed'})
await writeFile('docs/validation/phase06-hosted-http.json',JSON.stringify({project:'dkhwwvoplhfjccvjegty',scope:'Genuine anonymous Auth settings/Data API probes. No impersonated authenticated session and no successful writes.',results},null,2)+'\n');console.log(results.map(r=>'PASS '+r.name).join('\n'))

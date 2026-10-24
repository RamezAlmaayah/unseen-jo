import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
const env=loadEnv('production',process.cwd(),'VITE_'),url='https://dkhwwvoplhfjccvjegty.supabase.co';assert.equal(env.VITE_SUPABASE_URL,url)
const client=createClient(url,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),{data,error}=await client.from('places').select('id,slug,status,is_demo,region,opening_hours,activities,visitor_information').order('slug');assert.ifError(error);assert.equal(data.length,6);assert.ok(data.every(p=>p.status==='published'&&!p.is_demo))
const target=data[0].id,denials=[]
for(const[name,args]of [['admin_quick_edit_state',{target}],['admin_save_quick_draft',{target,base_version:'unavailable',changes:{},expected_draft_updated_at:null}],['admin_apply_quick_edit',{changes:{},expected_version:'unavailable',reviewed_changes:false}]]){const response=await client.rpc(name,args);assert.equal(response.error?.code,'42501');denials.push({name,code:response.error.code})}
const privateRows=await client.from('place_quick_drafts').select('*');assert.equal(privateRows.error?.code,'42501')
for(const[name,args]of [['admin_image_eligibility',{target,images:[]}],['admin_confirm_original_images',{target,uploaded_paths:[target+'/00000000-0000-4000-8000-000000000099.jpg'],editor_id:target}],['admin_save_simple_images',{target,expected_version:'unavailable',images:[],editor_id:target}]]){const response=await client.rpc(name,args);assert.equal(response.error?.code,'42501');denials.push({name,code:response.error.code})}
const ownership=await client.from('place_image_ownership').select('*');assert.equal(ownership.error?.code,'42501')
await writeFile('docs/validation/quick-edit-hosted.json',JSON.stringify({scope:'Genuine anonymous hosted reads and permission-denial checks only; zero stored writes or owner credentials',project:url,places:data,denials,privateDraftReadDenied:true},null,2)+'\n');console.log('PASS hosted project, six existing statuses, public columns and private RPC/workspace denial')

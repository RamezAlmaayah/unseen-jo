// Genuine anonymous Data API checks; no hosted writes or admin session.
import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
const env=loadEnv('production',process.cwd(),'VITE_')
assert.equal(env.VITE_SUPABASE_URL,'https://dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
const response=await client.from('places').select('id,status').order('id')
assert.ifError(response.error);assert.equal(response.data.length,6);assert.ok(response.data.every(p=>p.status==='published'))
const denied=await client.rpc('admin_change_place_status',{target:response.data[0].id,next_status:'draft',expected_updated_at:null,expected_status:'published'})
assert.equal(denied.error?.code,'42501')
await writeFile('docs/validation/destination-status-api.json',JSON.stringify({at:new Date().toISOString(),project:'dkhwwvoplhfjccvjegty',scope:'Real anonymous Supabase SDK/Data API; no hosted writes',publishedCount:response.data.length,statusRpcAvailable:true,anonymousStatusChangeDenied:true,errorCode:denied.error.code},null,2)+'\n')
console.log('PASS hosted Data API: six published destinations visible; migrated status RPC exists and denies anonymous changes')

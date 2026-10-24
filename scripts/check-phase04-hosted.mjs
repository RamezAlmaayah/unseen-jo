// Read-only hosted checks using the publishable key. No users or data are created.
import assert from 'node:assert/strict'
import { mkdir,writeFile } from 'node:fs/promises'
import { loadEnv } from 'vite'
import { createClient } from '@supabase/supabase-js'
import { readSupabaseConfig } from '../src/lib/supabase/config.js'
const config=readSupabaseConfig(loadEnv('production',process.cwd(),'VITE_'))
assert.equal(config.url,'https://dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(config.url,config.publishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),results=[]
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
await check('anonymous CMS and overview RPC access denied',async()=>{for(const name of ['admin_cms_status','admin_overview']){const{error}=await client.rpc(name);assert.equal(error?.code,'42501')}})
await check('anonymous cannot inspect reviews or audit history',async()=>{for(const name of ['place_reviews','admin_audit_logs']){const{error}=await client.from(name).select('*');assert.equal(error?.code,'42501')}})
await check('draft destinations and unapproved images remain hidden',async()=>{for(const name of ['places','place_images']){const query=client.from(name).select('id');const{data,error}=await(name==='places'?query.neq('status','published'):query.is('approved_at',null));assert.equal(error,null);assert.deepEqual(data,[])}})
await check('seven active categories remain publicly readable',async()=>{const{data,error}=await client.from('categories').select('id');assert.equal(error,null);assert.equal(data.length,7)})
await mkdir('docs/validation',{recursive:true});await writeFile('docs/validation/phase04-hosted-tests.json',JSON.stringify({project:'dkhwwvoplhfjccvjegty',scope:'Read-only real hosted anonymous SDK checks',passed:results.length,results},null,2)+'\n')

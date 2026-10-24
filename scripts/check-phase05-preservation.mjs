import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFile,writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
import {PLACE_SELECT} from '../src/features/tourism/repository.js'
const before=JSON.parse(await readFile('docs/validation/phase05-public-snapshot.json','utf8')),env=loadEnv('production',process.cwd(),'VITE_')
assert.equal(new URL(env.VITE_SUPABASE_URL).hostname,'dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
const after=await client.from('places').select(PLACE_SELECT).eq('status','published').eq('is_demo',false).order('slug');assert.ifError(after.error)
const canonical=value=>Array.isArray(value)?value.map(canonical).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)])):value
const hash=rows=>createHash('sha256').update(JSON.stringify(canonical(rows))).digest('hex'),original=hash(before.rows),current=hash(after.data)
assert.equal(current,original,'published fields, versions, media links, attribution and public translations must remain unchanged')
await writeFile('docs/validation/phase05-preservation.json',JSON.stringify({scope:'Genuine final anonymous read of the same public projection; no writes. This verifies public records, not private audit tables.',checkedAt:new Date().toISOString(),count:after.data.length,beforeHash:original,afterHash:current,status:'passed'},null,2)+'\n')
console.log('PASS all six public records, versions, publication states, media links, attribution and translations match the initial snapshot')

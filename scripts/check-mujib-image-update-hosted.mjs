// Genuine anonymous SDK checks only. No administrator tokens or stored mutations.
import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
const env=loadEnv('production',process.cwd(),'VITE_'),expected='https://dkhwwvoplhfjccvjegty.supabase.co'
assert.equal(env.VITE_SUPABASE_URL,expected)
const client=createClient(expected,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
const {data,error}=await client.from('places').select('id,slug,status,is_demo,place_images(id,storage_path,is_cover,source_url)').eq('slug','wadi-mujib').single()
assert.ifError(error);assert.equal(data.status,'published');assert.equal(data.is_demo,false)
const cover=data.place_images.find(i=>i.is_cover);assert.ok(cover.storage_path.endsWith('/d29713d8-0ff2-43da-b21a-e7bf110fea2d.jpg'))
const denied=await client.rpc('admin_replace_cover_image',{target:cover.id,expected_updated_at:'2026-10-19T00:00:00Z',uploaded_path:data.id+'/00000000-0000-4000-8000-000000000099.jpg',replacement_alt_text:'Not an upload'})
assert.ok(denied.error);assert.equal(denied.error.code,'42501')
await writeFile('docs/validation/mujib-image-update-hosted.json',JSON.stringify({project:expected,scope:'Genuine hosted anonymous SDK reads and permission-denial check; zero stored writes',slug:data.slug,status:data.status,isDemo:data.is_demo,coverPath:cover.storage_path,imageCount:data.place_images.length,citationIsSeparateFromStorage:cover.source_url.startsWith('https://www.google.com/imgres'),anonymousReplacementDenied:denied.error.code},null,2)+'\n')
console.log('PASS genuine hosted Wadi cover and anonymous replacement denial')

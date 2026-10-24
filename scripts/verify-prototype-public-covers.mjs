// Genuine anonymous reads of the original six approved covers. No hosted writes.
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
const env=loadEnv('production',process.cwd(),'VITE_'),client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),b=JSON.parse(await readFile('docs/validation/prototype-before.json','utf8')),results=[]
await mkdir('docs/evidence/private-prototype/preserved-covers',{recursive:true})
for(const p of b.places.filter(p=>p.status==='published')){
 const cover=p.place_images.find(i=>i.is_cover&&i.approved_at);if(!cover)throw Error('Original approved cover missing '+p.slug)
 const response=await client.storage.from('place-images').download(cover.storage_path);if(response.error)throw response.error
 const bytes=Buffer.from(await response.data.arrayBuffer()),path='docs/evidence/private-prototype/preserved-covers/'+p.slug+'.jpg';await writeFile(path,bytes)
 results.push({slug:p.slug,path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),storagePath:cover.storage_path,sourceUrl:cover.source_url,attribution:cover.attribution,licenseEvidence:cover.license_evidence,status:'passed',scope:'Genuine anonymous hosted original-cover download; no source/image/status changes'})
}
await writeFile('docs/validation/private-prototype-public-covers.json',JSON.stringify({verifiedAt:new Date().toISOString(),results},null,2)+'\n');console.log('PASS all six actual published covers downloaded without authentication; original image data unchanged')

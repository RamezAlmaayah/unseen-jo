// Live anonymous GET evidence. Never prints/persists short-lived signed tokens.
import assert from 'node:assert/strict'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
import {mkdir,writeFile} from 'node:fs/promises'
const e=loadEnv('production',process.cwd(),'VITE_');assert.equal(e.VITE_SUPABASE_URL,'https://dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(e.VITE_SUPABASE_URL,e.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
const {data:rows,error}=await client.from('places').select('id,slug,status,place_images(id,storage_path,is_cover,source_url,attribution,approved_at)').eq('status','published');assert.equal(error,null)
const results=[]
await mkdir('artifacts/image-performance/hosted-samples',{recursive:true})
for(const slug of ['ajloun-forest','dana-reserve']){
 const photo=rows.find(p=>p.slug===slug).place_images.find(p=>p.is_cover)
 for(const width of [0,640,1280,2400]){
  const signed=await client.storage.from('place-images').createSignedUrl(photo.storage_path,300,width?{transform:{width,quality:90,resize:'contain'}}:undefined);assert.equal(signed.error,null)
  const start=performance.now(),response=await fetch(signed.data.signedUrl,{headers:{Accept:'image/avif,image/webp,image/apng,image/*;q=0.8','User-Agent':'Mozilla/5.0 Chrome/130.0.0.0'}}),headersMs=performance.now()-start,data=Buffer.from(await response.arrayBuffer());assert.equal(response.status,200)
  const path=`artifacts/image-performance/hosted-samples/${slug}-${width||'original'}.image`;await writeFile(path,data)
  results.push({slug,imageId:photo.id,width:width||'original',requestedQuality:width?90:null,path,bytes:data.length,headersMs,totalGetMs:performance.now()-start,headers:Object.fromEntries([...response.headers].filter(([key])=>['cache-control','expires','last-modified','etag','age','cf-cache-status','content-type','vary','access-control-allow-origin','timing-allow-origin'].includes(key))),sourceUrl:photo.source_url,attribution:photo.attribution})
 }
}
const denied=await client.storage.from('place-images').createSignedUrl('066dbed9-ca25-421e-8187-00fbc78fcda3/e02dd86c-a43b-43b1-8820-670115101f7f.jpg',300,{transform:{width:640,quality:90}})
assert.ok(denied.error);assert.equal(denied.data,null)
await writeFile('docs/validation/hosted-image-delivery.json',JSON.stringify({checkedAt:new Date().toISOString(),scope:'Genuine anonymous Storage signing and GET; existing transformation availability verified, no settings/subscription or content writes',publishedDestinations:rows.length,unapprovedTestImageSigningDenied:true,results},null,2)+'\n');console.log('PASS real signed originals and display sizes; unapproved test image remains denied')

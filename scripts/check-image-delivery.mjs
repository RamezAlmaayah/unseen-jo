import assert from 'node:assert/strict'
import {writeFile,readFile} from 'node:fs/promises'
import {createImageDelivery} from '../src/features/tourism/imageDelivery.js'
import {createAdminRepository} from '../src/features/admin/repository.js'
import {createClient} from '@supabase/supabase-js'
import {catalogVersion} from '../src/features/tourism/catalogEvents.js'
const results=[]
async function check(name,test){await test();results.push({name,status:'passed'});console.log('PASS '+name)}
await check('signed variants coalesce, keep URLs stable, expire before the token, and invalidate',async()=>{
 let clock=0,calls=0;const client={storage:{from:bucket=>({createSignedUrl:async(path,seconds,options)=>{assert.equal(bucket,'place-images');assert.equal(seconds,300);assert.equal(options.transform.quality,90);assert.equal(options.transform.resize,'contain');return {data:{signedUrl:`https://example.invalid/${path}/${options.transform.width}/${++calls}`}}}})}}
 const delivery=createImageDelivery(client,{now:()=>clock}),photo=delivery.forPath('place/image.jpg');assert.equal(photo,delivery.forPath('place/image.jpg'))
 const [a,b]=await Promise.all([photo.sources([640,1280]),photo.sources([640,1280])]);assert.deepEqual(a,b);assert.equal(calls,2)
 clock=269000;assert.deepEqual(await photo.sources([640,1280]),a);clock=270001;assert.notDeepEqual(await photo.sources([640,1280]),a);assert.equal(calls,4)
 delivery.clear();await delivery.forPath('place/image.jpg').sources([640]);assert.equal(calls,5)
 await assert.rejects(photo.sources([999]));assert.equal(calls,5)
})
await check('signing failures fail closed and retry without reusing denied signatures',async()=>{
 let denied=true;const d=createImageDelivery({storage:{from:()=>({createSignedUrl:async()=>denied?{error:{message:'Denied'}}:{data:{signedUrl:'https://example.invalid/recovered'}}})}})
 await assert.rejects(d.forPath('private.jpg').sources([640]));denied=false;assert.equal((await d.forPath('private.jpg').sources([640]))[0].src,'https://example.invalid/recovered')
})
await check('signing work is bounded to four concurrent requests',async()=>{
 let active=0,max=0;const d=createImageDelivery({storage:{from:()=>({createSignedUrl:async()=>{max=Math.max(max,++active);await new Promise(r=>setTimeout(r,5));active--;return {data:{signedUrl:'https://example.invalid/fixture'}}}})}})
 await Promise.all(Array.from({length:30},(_,i)=>d.forPath(`place/${i}.jpg`).sources([640])));assert.equal(max,4)
})
await check('private preview signatures are reused within a repository and isolated between account-scoped repositories',async()=>{
 let calls=0
 const client={storage:{from:()=>({createSignedUrls:async paths=>({data:paths.map(path=>({path,signedUrl:`https://example.invalid/private-${++calls}`}))})})}}
 const images=[{id:'private',storage_path:'private/photo.jpg'}],a=createAdminRepository(client),b=createAdminRepository(client)
 const first=await a.signedImages(images);assert.equal((await a.signedImages(images))[0].url,first[0].url);assert.equal(calls,1);assert.notEqual((await b.signedImages(images))[0].url,first[0].url);assert.equal(calls,2)
})
await check('display derivatives have integrity, preserve proportions and never upscale; originals retain approved hashes',async()=>{
 const {createHash}=await import('node:crypto'),manifest=JSON.parse(await readFile('docs/validation/local-image-derivatives.json','utf8'))
 for(const[path,item]of Object.entries(manifest)){
  assert.equal(createHash('sha256').update(await readFile('public'+path)).digest('hex'),item.originalSha256)
  for(const v of item.variants){assert.ok(v.width<=item.width);assert.ok(Math.abs(v.height-v.width*item.height/item.width)<=1);const data=await readFile('public'+v.src);assert.equal(data.length,v.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),v.sha256)}
 }
})
await check('explicit cover file replacement uses immutable uploads, invalidates signatures and never fetches citation URLs',async()=>{
 const place={id:'00000000-0000-4000-8000-000000000001',status:'draft'},image={id:'00000000-0000-4000-8000-000000000002',place_id:place.id,is_cover:true,updated_at:'2026-10-19T19:00:00Z',storage_path:place.id+'/old.jpg'},calls=[]
 let signs=0,fail=false
 const client=createClient('https://example.invalid','sb_publishable_fixture',{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:async(input,options)=>{
  const path=new URL(input).pathname;calls.push({path,options})
  if(path.includes('/object/sign/'))return new Response(JSON.stringify(JSON.parse(options.body).paths.map(path=>({path,signedURL:'/object/sign/place-images/'+path+'?token=fixture-'+(++signs)}))),{headers:{'Content-Type':'application/json'}})
  if(path.endsWith('/admin_replace_cover_image'))return new Response(JSON.stringify(fail?{message:'Cover changed'}:'00000000-0000-4000-8000-000000000003'),{status:fail?409:200,headers:{'Content-Type':'application/json'}})
  return new Response(JSON.stringify(path.includes('/object/')?{Key:'fixture'}:[{id:image.id}]),{headers:{'Content-Type':'application/json'}})
 }}}),repo=createAdminRepository(client)
 const initial=(await repo.signedImages([image]))[0].url,file=new File([Buffer.from([255,216,255,224,0,16,74,70,73,70,0,1])],'replacement.jpg',{type:'image/jpeg'})
 await repo.updateImage(image,{source_url:'https://citation.example.test/evidence'});assert.equal(calls.filter(c=>c.path.includes('/object/place-images/')).length,0)
 const start=catalogVersion();await repo.replaceCoverImage(place,image,file);assert.equal(catalogVersion(),start+1)
 assert.notEqual((await repo.signedImages([image]))[0].url,initial)
 const upload=calls.find(c=>c.path.includes('/object/place-images/')),rpc=calls.find(c=>c.path.endsWith('/admin_replace_cover_image'))
 assert.equal(new Headers(upload.options.headers).get('x-upsert'),'false')
 const args=JSON.parse(rpc.options.body);assert.equal(args.target,image.id);assert.equal(args.expected_updated_at,image.updated_at);assert.notEqual(args.uploaded_path,image.storage_path);assert.ok(args.uploaded_path.startsWith(place.id+'/'));assert.equal(args.replacement_alt_text,'replacement.jpg');assert.ok(!('source_url' in args))
 fail=true;const version=catalogVersion();await assert.rejects(repo.replaceCoverImage(place,image,file),/Replacement upload retained/);assert.equal(catalogVersion(),version)
 await assert.rejects(repo.replaceCoverImage({...place,status:'published'},image,file),/draft/)
 await assert.rejects(repo.replaceCoverImage(place,{...image,place_id:'other'},file),/current cover/)
 assert.ok(calls.every(c=>!c.path.includes('remove')))
})
await writeFile('docs/validation/image-delivery-tests.json',JSON.stringify({scope:'Local deterministic cache/concurrency/security, real SDK with fake transport, and actual derivative integrity tests; no hosted mutations',passed:results.length,results},null,2)+'\n')

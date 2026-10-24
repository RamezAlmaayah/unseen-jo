import {digest,runPhase08Import,validatePhase08Package} from '../admin/phase08Import.js'
import {notifyPublicCatalogChange} from '../tourism/catalogEvents.js'
const checked=r=>{if(r.error)throw Error(r.error.message);return r.data},check=(v,m)=>{if(!v)throw Error(m)}
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,value])=>[k,canonical(value)])):v
export const prototypeReadbackMatches=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b))
export async function validatePrototypePackage(m){
 const {sha256,...body}=m;check(await digest(new TextEncoder().encode(JSON.stringify(body)))===sha256,'Prototype package checksum changed.')
 check(m.projectRef==='dkhwwvoplhfjccvjegty'&&m.version===1&&m.designation==='private_prototype'&&m.places.length===24&&new Set(m.places.map(p=>p.id)).size===24&&new Set(m.places.map(p=>p.slug)).size===24,'Expected 24 existing destinations.')
 for(const p of m.places){check(p.payload.designation==='private_prototype'&&p.payload.syntheticFields.length>5,'Prototype designation required.');for(const lang of ['english','arabic'])for(const k of ['name','description','city','region','address','activities','visitor_information','opening_hours','best_time_to_visit','transportation_notes'])check(typeof p.payload[lang][k]==='string'&&p.payload[lang][k].trim().length>1,'Complete bilingual field required: '+p.slug+' '+k)}
 return true
}
async function storeBytes(client,path,blob,sha,guard){
 const existing=await client.storage.from('place-images').download(path)
 if(!existing.error){check(await digest(await existing.data.arrayBuffer())===sha,'Existing immutable media bytes differ.');return}
 if(!/not found|resource|object|404/i.test(existing.error.message))throw Error(existing.error.message)
 guard();const upload=await client.storage.from('place-images').upload(path,blob,{contentType:blob.type,cacheControl:'31536000',upsert:false})
 if(upload.error&&!/exist|duplicate/i.test(upload.error.message))throw Error(upload.error.message)
 const saved=checked(await client.storage.from('place-images').download(path));check(await digest(await saved.arrayBuffer())===sha,'Private image byte read-back failed.')
}
async function variants(client,id,image,prepared,previous,guard,fetchFile){
 if(previous?.renditions?.length){
  const paths=previous.renditions.map(r=>r.storagePath),response=await client.storage.from('place-images').createSignedUrls(paths,60)
  if(!response.error&&response.data.length===paths.length&&response.data.every(r=>r.signedUrl&&!r.error))return previous.renditions
 }
 const result=[]
 if(prepared?.renditions?.length){for(const r of prepared.renditions){guard();const response=await fetchFile('/'+r.path);check(response.ok,'Prepared responsive file unavailable.');const bytes=await response.arrayBuffer();check(bytes.byteLength===r.bytes&&await digest(bytes)===r.sha256,'Prepared responsive bytes changed.');const storagePath=`${id}/prototype-${r.sha256}-${r.width}.webp`;await storeBytes(client,storagePath,new Blob([bytes],{type:'image/webp'}),r.sha256,guard);result.push({width:r.width,height:r.height,storagePath,sha256:r.sha256})}return result}
 const original=checked(await client.storage.from('place-images').download(image.storage_path)),bitmap=await createImageBitmap(original)
 try{for(const width of [320,640,1280,2400].filter(w=>w<=bitmap.width)){
  guard();const canvas=document.createElement('canvas');canvas.width=width;canvas.height=Math.round(bitmap.height*width/bitmap.width);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height)
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.92));check(blob,'Responsive conversion unavailable.');const sha256=await digest(await blob.arrayBuffer()),storagePath=`${id}/prototype-${sha256}-${width}.webp`;await storeBytes(client,storagePath,blob,sha256,guard);result.push({width,height:canvas.height,storagePath,sha256})
 }}finally{bitmap.close()}
 check(result.length,'Original image too small for a sharp cover.');return result
}
export async function runPrivatePrototype(client,repo,manifest,research,illustration,{onStep=()=>{},fetchFile=fetch}={}){
 check(client.supabaseUrl==='https://dkhwwvoplhfjccvjegty.supabase.co','Unexpected Supabase project.');await validatePrototypePackage(manifest);await validatePhase08Package(research)
 const auth=await client.auth.getUser();check(!auth.error&&auth.data.user?.email_confirmed_at,'Confirmed administrator required.');checked(await client.rpc('admin_cms_status'));const owner=auth.data.user.id
 let changed=false;const subscription=client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||session?.user?.id!==owner)changed=true}).data.subscription,guard=()=>check(!changed,'Account changed. Private writes stopped.')
 const results=[]
 try{
  // Existing idempotent authenticated importer; no approvals/publication requested.
  const resumed=await runPhase08Import(client,repo,research,{publish:false,onStep:e=>onStep({slug:e.slug,message:e.message}),fetchFile})
  for(const candidate of manifest.places){
   guard();const {id,slug}=candidate
   try{
    let place=await repo.getPlace(id);check(place.slug===slug,'Existing ID/slug mismatch.');check(place.name===candidate.payload.english.name,'Identity changed; preserved.');
    const previous=checked(await client.from('private_prototype_places').select('payload').eq('place_id',id).maybeSingle())?.payload
    if(slug==='aqaba-marine-reserve'){
     const response=await fetchFile(illustration.localUrl);check(response.ok,'Original Aqaba illustration unavailable.');const bytes=await response.arrayBuffer();check(bytes.byteLength===illustration.bytes&&await digest(bytes)===illustration.sha256,'Illustration checksum changed.');const path=`${id}/prototype-${illustration.sha256}.png`
     if(!place.place_images.some(i=>i.storage_path===path)){
      await storeBytes(client,path,new Blob([bytes],{type:'image/png'}),illustration.sha256,guard);guard()
      checked(await client.from('place_images').insert({place_id:id,storage_path:path,is_cover:!place.place_images.some(i=>i.is_cover),sort_order:0,alt_text:'Original Aqaba coast prototype illustration — رسم تجريبي أصلي لساحل العقبة',license_basis:'owned',license_evidence:illustration.rights+' SHA-256 '+illustration.sha256,attribution:'Unseen Jo · original prototype illustration; not a destination photograph',source_url:null}))
     }
     place=await repo.getPlace(id)
    }
    const selected=research.photos.filter(p=>p.slug===slug),photos=selected.length?selected.slice().sort((a,b)=>Number(b.isCover)-Number(a.isCover)||a.index-b.index).map(p=>place.place_images.find(i=>i.storage_path===`${id}/phase08-${p.uploadSha256}.jpg`)):place.place_images.filter(i=>slug==='aqaba-marine-reserve'?i.storage_path.endsWith(illustration.sha256+'.png'):!!i.approved_at).sort((a,b)=>Number(b.is_cover)-Number(a.is_cover)||a.sort_order-b.sort_order)
    check(photos.length&&photos.every(Boolean),'Private source media upload not complete.');const media=[]
    for(const image of photos){guard();check(image.license_basis&&image.license_evidence&&image.attribution,'Image rights evidence required.');const prepared=selected.find(p=>image.storage_path.endsWith(p.uploadSha256+'.jpg')),old=previous?.media.find(m=>m.imageId===image.id),renditions=await variants(client,id,image,prepared,old,guard,fetchFile);media.push({imageId:image.id,storagePath:image.storage_path,kind:slug==='aqaba-marine-reserve'?'illustration':'photograph',renditions});onStep({slug,message:'Prepared responsive private image '+media.length})}
    guard();const content={...candidate.payload,media};checked(await client.rpc('admin_save_private_prototype',{target:id,expected_source_version:place.updated_at,content}))
    const readback=checked(await client.from('private_prototype_places').select('payload,enabled').eq('place_id',id).single());check(readback.enabled&&prototypeReadbackMatches(readback.payload,content),'Prototype read-back did not match; retained for safe retry.')
    results.push({id,slug,status:'enabled privately',actualPublicationStatus:place.status,images:media.length});onStep({slug,message:'Enabled complete private prototype'})
   }catch(e){results.push({id,slug,status:'needs retry',error:e.message});onStep({slug,message:e.message})}
  }
  const rows=checked(await client.rpc('admin_private_prototype_catalog'));return {scope:'Genuine current Admin operations; private overlays, not publication',results,visible:rows.length,actuallyPublished:rows.filter(r=>r.row.status==='published').length,resume:resumed.results,completedAt:new Date().toISOString()}
 }finally{subscription.unsubscribe();repo.invalidate();notifyPublicCatalogChange()}
}

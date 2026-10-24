import {readFile} from 'node:fs/promises'
import {phase08Fixture} from './phase08-browser-fixture.mjs'
const baseline=JSON.parse(await readFile('docs/validation/prototype-before.json','utf8')),research=JSON.parse(await readFile('docs/evidence/phase08/import-package.json','utf8')),categories=JSON.parse(await readFile('docs/validation/phase05-public-snapshot.json','utf8')).categories
export async function preparedPrototypeSeed(){
 const manifest=JSON.parse(await readFile('docs/evidence/private-prototype/package.json','utf8')),art=JSON.parse(await readFile('docs/evidence/private-prototype/illustration.json','utf8')),covers=JSON.parse(await readFile('docs/validation/private-prototype-public-covers.json','utf8')).results,rows=structuredClone(baseline.places),overlays=[],objects=new Map(),fixtureBytes=await readFile(research.photos[0].uploadPath)
 for(const p of rows){p.review=p.place_reviews?.[0]||null;const plan=manifest.places.find(x=>x.id===p.id),selected=research.photos.filter(i=>i.slug===p.slug).sort((a,b)=>Number(b.isCover)-Number(a.isCover)||a.index-b.index),media=[]
  if(p.slug==='aqaba-marine-reserve')p.place_images.push({id:crypto.randomUUID(),place_id:p.id,storage_path:p.id+'/prototype-'+art.sha256+'.png',alt_text:'Isolated illustration fixture',attribution:art.author,license_basis:'owned',license_evidence:art.rights,is_cover:true,approved_at:null})
  for(const photo of selected)if(!p.place_images.some(i=>i.storage_path.endsWith(photo.uploadSha256+'.jpg')))p.place_images.push({id:crypto.randomUUID(),place_id:p.id,storage_path:p.id+'/phase08-'+photo.uploadSha256+'.jpg',alt_text:photo.altEn,attribution:photo.attribution,source_url:photo.page,license_basis:'licensed',license_evidence:photo.licenseEvidence,is_cover:photo.isCover,approved_at:null})
  const images=selected.length?selected.map(a=>p.place_images.find(i=>i.storage_path.endsWith(a.uploadSha256+'.jpg'))):p.place_images.filter(i=>p.slug==='aqaba-marine-reserve'||i.approved_at).sort((a,b)=>Number(b.is_cover)-Number(a.is_cover))
  for(const image of images){const photo=selected.find(a=>image.storage_path.endsWith(a.uploadSha256+'.jpg')),cover=covers.find(c=>c.storagePath===image.storage_path),r=photo?.renditions||(p.slug==='aqaba-marine-reserve'?art.renditions:cover?.renditions)||research.photos[0].renditions;objects.set(image.storage_path,photo?await readFile(photo.uploadPath):p.slug==='aqaba-marine-reserve'?await readFile('docs/evidence/private-prototype/aqaba-illustration.png'):cover?await readFile(cover.path):fixtureBytes);const renditions=[];for(const v of r){const path=p.id+'/ui-fixture-'+image.id+'-'+v.width+'.webp';objects.set(path,await readFile(v.path));renditions.push({width:v.width,height:v.height,storagePath:path})}media.push({imageId:image.id,storagePath:image.storage_path,kind:p.slug==='aqaba-marine-reserve'?'illustration':'photograph',renditions})}
  overlays.push([p.id,{...plan.payload,media}])
 }
 return {rows,overlays,objects:[...objects]}
}
export async function prototypeFixture(browser,lang,width,seed=null,{denyAdmin=false}={}){
 const s=await phase08Fixture(browser,lang,width,{resumeHosted:true}),{context:c,rows,objects}=s,overlays=new Map(seed?.overlays||[]),prototypeRequests=[],sourceRows=baseline.places.filter(p=>p.status==='published')
 await c.addInitScript(()=>{const realNow=Date.now;window.prototypeClockOffset=0;Date.now=()=>realNow()+window.prototypeClockOffset})
 for(let i=0;i<6;i++){const source=sourceRows.find(p=>p.id===rows[i].id);Object.assign(rows[i],structuredClone(source),{review:null})}
 const originalFixtureBytes=await readFile(research.photos[0].uploadPath)
 for(const p of rows.slice(0,6))for(const image of p.place_images)objects.set(image.storage_path,originalFixtureBytes)
 if(seed){for(const [k,v]of seed.objects)objects.set(k,v);for(let i=0;i<rows.length;i++){const seeded=seed.rows.find(p=>p.id===rows[i].id);if(seeded)Object.assign(rows[i],structuredClone(seeded))}}
 await c.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{
  const req=route.request(),u=new URL(req.url()),path=u.pathname,method=req.method(),json=(v,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(v)})
  if(path.endsWith('/auth/v1/logout'))return json({})
  if(denyAdmin&&path.endsWith('/admin_cms_status'))return json({code:'42501',message:'Administrator session required'},403)
  if(path.endsWith('/places')&&u.searchParams.get('status')==='eq.published')return json(rows.filter(r=>r.status==='published'))
  if(path.endsWith('/admin_private_prototype_catalog')){
   prototypeRequests.push({path,method})
   const catalog=rows.filter(p=>overlays.has(p.id)).map(p=>({payload:overlays.get(p.id),row:{...p,place_categories:p.place_categories.map(pc=>({categories:categories.find(c=>c.id===pc.category_id)}))}}))
   return json(catalog)
  }
  if(path.endsWith('/private_prototype_places')){const id=u.searchParams.get('place_id')?.slice(3),payload=overlays.get(id);return json(payload?{payload,enabled:true}:null)}
  if(path.endsWith('/admin_save_private_prototype')){const b=req.postDataJSON(),row=rows.find(p=>p.id===b.target);if(!row||row.updated_at!==b.expected_source_version)return json({message:'Source changed'},409);if(b.content.media.some(i=>!objects.has(i.storagePath)||i.renditions.some(r=>!objects.has(r.storagePath))))return json({message:'Stored media missing'},400);overlays.set(b.target,JSON.parse(JSON.stringify(b.content),function(k,v){return v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).reverse()):v}));prototypeRequests.push({path,method,id:b.target});return json(null)}
  if(path.includes('/storage/v1/object/sign/')&&method==='POST'){prototypeRequests.push({path,method});const b=req.postDataJSON();return json(b.paths?b.paths.map(path=>objects.has(path)?{path,signedURL:'/object/sign/place-images/'+path+'?token=isolated-fixture'}:{path,error:'Object not found'}):{signedURL:'/object/sign/place-images/'+path.split('/place-images/')[1]+'?token=isolated-fixture'})}
  if(path.includes('/storage/v1/object/sign/')&&method==='GET'){const key=decodeURIComponent(path.split('/place-images/')[1]),bytes=objects.get(key);return bytes?route.fulfill({status:200,contentType:key.endsWith('.webp')?'image/webp':key.endsWith('.png')?'image/png':'image/jpeg',body:bytes}):json({message:'Object not found'},404)}
  return route.fallback()
 })
 return {...s,overlays,prototypeRequests}
}

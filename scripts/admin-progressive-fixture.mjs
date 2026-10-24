// Entirely isolated Auth/REST/Storage fixture. Never a real administrator session.
import {setup,browser,rows,errors,AxeBuilder} from './localization-browser-fixtures.mjs'
import {syntheticImage} from './synthetic-image-fixture.mjs'
export {browser,errors,AxeBuilder}
export const places=Array.from({length:240},(_,n)=>({...structuredClone(rows[n%rows.length]),id:`00000000-0000-4000-8000-${String(n+10).padStart(12,'0')}`,name:`Destination ${String(n).padStart(3,'0')}`,slug:`destination-${n}`,updated_at:new Date(Date.UTC(2026,9,20,0,0,n)).toISOString()}))
export const media=Array.from({length:80},(_,n)=>({id:`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`,place_id:places[0].id,storage_path:places[0].id+`/photo-${n}.png`,alt_text:`Fixture photo ${n}`,created_at:new Date(Date.UTC(2026,9,20,0,0,n)).toISOString(),sort_order:n,is_cover:n===0,approved_at:null,places:{name:places[0].name,status:'draft'}}))
places[0].place_images=media
export async function fixture(width=1440,language='en'){
 const dataset=structuredClone(places)
 const {context,page}=await setup(width,language,true),requests=[],writes=[];let draft=null
 await page.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{
  const req=route.request(),u=new URL(req.url()),path=u.pathname,method=req.method();requests.push({path,method,query:Object.fromEntries(u.searchParams),at:Date.now()})
  const json=(data,count)=>route.fulfill({status:200,contentType:'application/json',headers:count!=null?{'access-control-expose-headers':'content-range','content-range':`0-${Math.max(0,(data?.length||0)-1)}/${count}`}:{},body:method==='HEAD'?'':JSON.stringify(data)})
  const pageRows=(data,project=x=>x)=>{const offset=Number(u.searchParams.get('offset')||0),limit=Number(u.searchParams.get('limit')||500);return json(data.slice(offset,offset+limit).map(project),data.length)}
  if(path.endsWith('/places')){
   if(method!=='GET'&&method!=='HEAD')throw Error('Fixture forbids destination mutations')
   let found=dataset;const id=u.searchParams.get('id')?.replace('eq.',''),status=u.searchParams.get('status')?.replace('eq.','');if(id)return json(dataset.find(p=>p.id===id))
   if(status)found=found.filter(p=>p.status===status)
   if(u.searchParams.get('or')?.includes('latitude.is.null'))found=found.filter(p=>p.latitude==null||p.longitude==null)
   if(u.searchParams.get('or')?.includes('description.not.match'))found=found.filter(p=>!p.description||p.description.trim().length<80||!p.source_url||!p.primary_category_id)
   const query=u.searchParams.get('name')?.replace('ilike.','').replaceAll('%','')||u.searchParams.get('or')?.match(/name.ilike."?%([^%]*)%/)?.[1]
   if(query)found=found.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())||p.place_translations[0].name.includes(query))
   if(u.searchParams.has('approved_cover'))found=found.filter(p=>!p.place_images.some(i=>i.is_cover&&i.approved_at))
   const select=u.searchParams.get('select')||'*',project=p=>select.startsWith('*')?p:{...Object.fromEntries(['id','slug','name','city','status','updated_at','verified_at','latitude','longitude','primary_category_id'].filter(k=>select.includes(k)).map(k=>[k,p[k]])),...(select.includes('place_categories')?{place_categories:p.place_categories.map(c=>({category_id:c.category_id}))}:{}),...(select.includes('place_images')?{place_images:p.place_images.map(i=>({is_cover:i.is_cover,approved_at:i.approved_at}))}:{}),...(select.includes('place_reviews')?{place_reviews:{claims_reviewed:p.place_reviews.claims_reviewed}}:{}),place_translations:p.place_translations.map(t=>Object.fromEntries(['locale','name','editorial_status','source_updated_at'].map(k=>[k,t[k]])))}
   return pageRows([...found].sort((a,b)=>u.searchParams.get('order')?.startsWith('name')?a.name.localeCompare(b.name):b.updated_at.localeCompare(a.updated_at)),project)
  }
  if(path.endsWith('/admin_overview'))return json({total:240,published:0,draft:240,archived:0,categories:4,review:240,coordinates:0,covers:240,recent:[]})
  if(path.endsWith('/admin_publication_issues'))return json(['Source review required'])
  if(path.endsWith('/place_reviews'))return json(dataset[0].place_reviews)
  if(path.endsWith('/place_images'))return pageRows(media)
  if(path.endsWith('/place_categories'))return json([],100)
  if(path.endsWith('/admin_audit_logs'))return pageRows(Array.from({length:85},(_,i)=>({id:String(i),action:'UPDATE',entity_table:'places',created_at:'2026-10-20',changed_columns:['name'],actor_id:'fixture'})))
  if(path.endsWith('/admin_quick_edit_state'))return json({version:'fixture-v1',draft,place:{...dataset[0],review:dataset[0].place_reviews}})
  if(path.endsWith('/place_translations')&&method==='PATCH'){
   const place=dataset.find(p=>p.id===u.searchParams.get('place_id')?.replace('eq.',''));if(!place)throw Error('Fixture translation target unavailable')
   const change=req.postDataJSON(),row={...place.place_translations[0],...change,place_id:place.id,updated_at:new Date().toISOString()};place.place_translations=[row];writes.push({path,body:change});return json([row])
  }
  if(path.endsWith('/admin_image_eligibility'))return json(req.postDataJSON().images.map(i=>({...i,rights_ready:false})))
  if(path.endsWith('/admin_save_quick_draft')){writes.push({path,body:req.postDataJSON()});draft={changes:req.postDataJSON().changes,updated_at:new Date().toISOString(),base_version:'fixture-v1'};return json(draft.updated_at)}
  if(path.includes('/storage/v1/')&&method==='POST'){
   const body=req.postDataJSON();if(!path.includes('/sign/'))throw Error('Fixture forbids uploads')
   return json(body.paths?body.paths.map(p=>({path:p,signedURL:'/object/sign/place-images/'+p+'?token=fixture'})):{signedURL:(body.transform?'/render/image/sign/':'/object/sign/')+'place-images/'+path.split('/place-images/')[1]+'?token=fixture'})
  }
  if(path.includes('/storage/v1/')&&method==='GET')return route.fulfill({status:200,contentType:'image/png',body:syntheticImage})
  return route.fallback()
 });return {context,page,requests,writes}
}

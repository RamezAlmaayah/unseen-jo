import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {setup,browser,rows,errors} from './localization-browser-fixtures.mjs'
const results=[],coverPath='0a905153-1e27-44b0-a2d8-3f9b8cf6b089/d29713d8-0ff2-43da-b21a-e7bf110fea2d.jpg'
const safe=url=>new URL(url).pathname
async function photo(page,selector,path){await page.locator(selector).first().scrollIntoViewIfNeeded();await page.waitForFunction(({selector,path})=>{const i=document.querySelector(selector);return i?.complete&&i.naturalWidth>0&&i.currentSrc.includes(path)},{selector,path},{timeout:45000})}
try{
 // Genuine hosted public reads: no Auth fixture, routes or writes in this context.
 for(const base of ['http://127.0.0.1:4184','http://127.0.0.1:4190']){
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),responses=[]
  page.on('response',r=>{if(r.request().resourceType()==='image'&&r.url().includes(coverPath))responses.push({path:safe(r.url()),status:r.status(),cacheControl:r.headers()['cache-control']})})
  await page.goto(base+'/');await page.locator('.featured-grid .featured-card').first().waitFor();assert.equal(await page.locator('.featured-grid a[href="/places/wadi-mujib"]').count(),0)
  await page.goto(base+'/explore');const card=page.locator('.destination-card').filter({hasText:'Mujib Biosphere Reserve'});await card.waitFor();await card.locator('img.asset-image').scrollIntoViewIfNeeded();await page.waitForFunction(path=>[...document.querySelectorAll('.destination-card img')].some(i=>i.complete&&i.naturalWidth>0&&i.currentSrc.includes(path)),coverPath,{timeout:45000})
  await page.goto(base+'/places/wadi-mujib');await photo(page,'.photo-gallery img',coverPath)
  assert.ok((await page.locator('.photo-gallery img').first().getAttribute('srcset')).includes('/render/image/sign/'))
  results.push({scope:'Genuine anonymous hosted reads',base,home:'Wadi Mujib is outside the current first-three featured selection; hero artwork is independent',explore:'Current stored cover rendered',details:'Same current cover rendered using responsive signing',responses,status:'passed'})
  await context.close();console.log('PASS live Wadi cover Home/Explore/Details '+base)
 }
 // All following Auth, uploads, RPCs and publication visibility are intercepted
 // fixtures. No fabricated session is ever sent to the hosted project.
 const row=rows.find(r=>r.slug==='wadi-mujib');rows.splice(rows.indexOf(row),1);rows.unshift(row)
 const old={id:'00000000-0000-4000-8000-000000000077',place_id:row.id,storage_path:row.id+'/fixture-old.jpg',alt_text:'Fixture Wadi cover',is_cover:true,sort_order:1,source_url:'https://example.test/citation',attribution:'Fixture rights holder',license_basis:'owned',license_evidence:'Fixture rights evidence only',approved_at:row.updated_at,approved_by:'fixture',updated_at:row.updated_at}
 row.place_images=[old]
 const imageBytes=await readFile('public/assets/figma/landing/petra-promo-banner.png')
 for(const language of ['en','ar-JO']){
  row.place_images=[{...old}];let uploads=0,rpcs=0,replacementPath
  const {context,page}=await setup(1440,language,true),publicPage=await context.newPage()
  const handler=async route=>{
   const request=route.request(),u=new URL(request.url()),path=u.pathname,method=request.method(),body=()=>request.postDataJSON()
   const json=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)})
   if(path.includes('/storage/v1/')&&method==='GET')return route.fulfill({status:200,contentType:'image/png',body:imageBytes})
   if(path.includes('/storage/v1/object/sign/')&&method==='POST'){
    const b=body();return json(b.paths?b.paths.map(p=>({path:p,signedURL:'/object/sign/place-images/'+p+'?token=fixture'})):{signedURL:(b.transform?'/render/image/sign/':'/object/sign/')+'place-images/'+path.split('/place-images/')[1]+'?token=fixture'})
   }
   if(path.includes('/storage/v1/object/place-images/')&&method==='POST'){uploads++;replacementPath=path.split('/place-images/')[1];assert.equal(request.headers()['x-upsert'],'false');return json({Key:'place-images/'+replacementPath})}
   if(path.endsWith('/admin_replace_cover_image')){
    rpcs++;const b=body();assert.equal(b.target,row.place_images[0].id);assert.equal(b.uploaded_path,replacementPath);assert.equal(b.expected_updated_at,row.place_images[0].updated_at)
    row.place_images[0].is_cover=false
    row.place_images.unshift({id:'00000000-0000-4000-8000-000000000078',place_id:row.id,storage_path:replacementPath,alt_text:b.replacement_alt_text,is_cover:true,sort_order:1,updated_at:'2026-10-19T20:00:00Z',approved_at:null,source_url:null,attribution:null,license_basis:null,license_evidence:null})
    return json(row.place_images[0].id)
   }
   if(path.endsWith('/place_images')&&method==='PATCH'){Object.assign(row.place_images[0],body(),{updated_at:'2026-10-19T19:59:00Z'});return json([{id:old.id}])}
   if(path.endsWith('/places')&&u.searchParams.get('status')==='eq.published'){const slug=u.searchParams.get('slug')?.replace('eq.','');return json(rows.filter(p=>!slug||p.slug===slug).map(p=>({...p,status:'published'})))}
   if(path.endsWith('/categories'))return json(rows.flatMap(p=>p.place_categories.map(c=>c.categories)).filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i))
   return route.fallback()
  };await context.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',handler);await page.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',handler)
  const base='http://127.0.0.1:4184';await publicPage.goto(base+'/');await photo(publicPage,'.featured-grid img.asset-image','fixture-old.jpg')
  await page.goto(base+'/admin/places/'+row.id+'?advanced=1')
  // Accessible labels below exercise both resource languages.
  const label=language==='en'?'Image source citation URL':'رابط مصدر الصورة للتوثيق'
  await page.getByRole('textbox',{name:label,exact:true}).fill('https://example.test/changed-citation')
  await page.getByRole('button',{name:language==='en'?'Save media metadata':'حفظ بيانات الصورة',exact:true}).click()
  await page.waitForFunction(()=>document.querySelector('#media input[type="file"][aria-label]'))
  await page.waitForTimeout(400);assert.equal(uploads,0);assert.equal(rpcs,0);assert.equal(row.place_images[0].storage_path,old.storage_path)
  await photo(publicPage,'.featured-grid img.asset-image','fixture-old.jpg')
  const fileLabel=language==='en'?'Replace cover photograph':'استبدال صورة الغلاف'
  await page.getByLabel(fileLabel,{exact:true}).setInputFiles({name:'new-wadi-photo.png',mimeType:'image/png',buffer:imageBytes})
  await page.getByRole('dialog').getByRole('button',{name:language==='en'?'Confirm change':'تأكيد التغيير',exact:true}).click()
  await page.waitForTimeout(800);assert.equal(uploads,1);assert.equal(rpcs,1);assert.notEqual(replacementPath,old.storage_path);assert.equal(row.place_images[0].approved_at,null)
  // The fixture deliberately exposes draft rows as public: this validates the
  // rendering/cache path, NOT real publication or real RLS (covered by PGlite).
  await photo(publicPage,'.featured-grid img.asset-image',replacementPath)
  await publicPage.goto(base+'/explore');await photo(publicPage,'.destination-card img.asset-image',replacementPath)
  await publicPage.goto(base+'/places/wadi-mujib');await photo(publicPage,'.photo-gallery img',replacementPath)
  assert.equal(await page.locator('html').getAttribute('dir'),language==='en'?'ltr':'rtl')
  results.push({scope:'Intercepted Admin and public rendering fixtures, not hosted writes',language,citationChangeUploads:0,replacementUploads:uploads,replacementRPCs:rpcs,newCoverPending:true,homeCrossTabInvalidation:true,explore:true,details:true,status:'passed'})
  await context.close();console.log('PASS citation-only and explicit replacement fixture '+language)
 }
 assert.deepEqual(errors,[])
}finally{await browser.close();await writeFile('docs/validation/mujib-image-update-browser.json',JSON.stringify({results,errors},null,2)+'\n')}

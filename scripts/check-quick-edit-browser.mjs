import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {setup,browser,rows,errors,AxeBuilder} from './localization-browser-fixtures.mjs'
import ar from '../src/i18n/locales/ar-JO.json' with {type:'json'}
import {syntheticImage} from './synthetic-image-fixture.mjs'
const results=process.argv.includes('--focused')?JSON.parse(await readFile('docs/validation/quick-edit-browser.json','utf8')).results:[],oldBytes=await readFile('public/assets/figma/landing/petra-promo-banner.png'),newBytes=syntheticImage
const fixture=structuredClone(rows.find(p=>p.slug==='wadi-mujib')),categories=[...new Map(rows.flatMap(r=>r.place_categories.map(c=>[c.categories.id,c.categories]))).values()]
await mkdir('artifacts/quick-edit',{recursive:true})
async function loaded(page,selector,path){await page.locator(selector).first().waitFor();await page.evaluate(selector=>document.querySelector(selector)?.scrollIntoView({block:'center'}),selector);await page.waitForFunction(({selector,path})=>{const image=document.querySelector(selector);return image?.complete&&image.naturalWidth>0&&(!path||image.currentSrc.includes(path))},{selector,path},{timeout:45000})}
try{
 for(const [base,language,width] of [['http://127.0.0.1:4184','en',1440],['http://127.0.0.1:4184','ar-JO',390],['http://127.0.0.1:4190','en',1440],['http://127.0.0.1:4190','ar-JO',390]]){
  if(process.argv.includes('--mobile-only')&&width!==390)continue
  if(process.argv.includes('--focused')&&!(width===1440&&base.endsWith('4184')))continue
  const label=key=>language==='en'?key:ar[key]||key,row=structuredClone(fixture);row.status='published';row.place_translations[0].editorial_status='reviewed'
  row.place_images=[{id:'00000000-0000-4000-8000-000000000070',place_id:row.id,storage_path:row.id+'/old-cover.png',alt_text:'Fixture old cover',sort_order:0,is_cover:true,approved_at:row.updated_at,attribution:'Fixture photographer',source_url:'https://example.test/old',license_basis:'owned',license_evidence:'Fixture original evidence',updated_at:row.updated_at}]
  let workspace=null,version='1',counter=0,applies=0,uploads=0,replacementPath,created,confirmations=0,simpleSaves=0;const originals=new Set()
  const {context,page}=await setup(width,language,true),publicPage=await context.newPage()
  await publicPage.addInitScript(language=>localStorage.setItem('unseen-jo-language',language),language)
  const handler=async route=>{const request=route.request(),url=new URL(request.url()),path=url.pathname,method=request.method(),body=()=>request.postDataJSON(),json=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)}),nextStamp=()=>new Date(Date.UTC(2026,9,19,22,0,++counter)).toISOString()
   if(path.includes('/storage/v1/')&&method==='GET')return route.fulfill({status:200,contentType:'image/png',body:path.includes('old-cover.png')?oldBytes:newBytes})
   if(path.includes('/storage/v1/object/sign/')&&method==='POST'){const b=body();return json(b.paths?b.paths.map(p=>({path:p,signedURL:'/object/sign/place-images/'+p+'?token=fixture'})):{signedURL:(b.transform?'/render/image/sign/':'/object/sign/')+'place-images/'+path.split('/place-images/')[1]+'?token=fixture'})}
   if(path.includes('/storage/v1/object/place-images/')&&method==='POST'){uploads++;replacementPath=path.split('/place-images/')[1];assert.equal(request.headers()['x-upsert'],'false');return json({Key:'place-images/'+replacementPath})}
   if(path.endsWith('/admin_image_eligibility'))return json(body().images.map(i=>({...i,rights_ready:!!row.place_images.find(x=>x.id===i.id&&x.approved_at)||originals.has(i.storage_path)})))
   if(path.endsWith('/admin_confirm_original_images')){confirmations++;for(const path of body().uploaded_paths)originals.add(path);return json(null)}
   if(path.endsWith('/admin_save_simple_images')){const b=body();assert.equal(b.expected_version,version);assert.ok(b.editor_id);if(b.images.some(i=>i.is_cover&&!originals.has(i.storage_path)&&!row.place_images.find(x=>x.id===i.id)?.approved_at))return json({code:'23514',message:'Private preview only'},400);simpleSaves++;row.place_images=b.images.map(i=>({...i,id:i.id||crypto.randomUUID(),place_id:row.id,approved_at:row.place_images.find(x=>x.id===i.id)?.approved_at||(originals.has(i.storage_path)?nextStamp():null),updated_at:nextStamp()}));version=String(Number(version)+1);workspace=null;return json(row.id)}
   if(path.endsWith('/admin_quick_edit_state'))return json({version,draft:workspace,place:{...row,review:row.place_reviews}})
   if(path.endsWith('/admin_save_quick_draft')){const b=body();assert.equal(b.base_version,version);assert.equal(b.expected_draft_updated_at,workspace?.updated_at||null);workspace={changes:b.changes,base_version:version,updated_at:nextStamp()};assert.ok(workspace.changes.images.every(i=>!i.rights_confirmed));return json(workspace.updated_at)}
   if(path.endsWith('/admin_apply_quick_edit')){
    const b=body(),c=b.changes;assert.equal(b.expected_version,c.english.id?version:null)
    if(row.status==='published'&&c.english.id&&c.images.some(i=>i.is_cover&&!row.place_images.find(old=>old.id===i.id)?.approved_at&&!i.rights_confirmed))return json({code:'23514',message:'An uploaded, rights-approved cover image is required'},400)
    if(c.images.some(i=>i.rights_confirmed&&(!i.license_basis||!i.attribution||!i.source_url||i.license_evidence?.length<12)))return json({code:'23514',message:'Save rights evidence before approval'},400)
    applies++;if(!c.english.id){created=structuredClone(c);created.id='00000000-0000-4000-8000-000000000079';return json(created.id)}
    const status=row.status;Object.assign(row,c.english,{status,updated_at:nextStamp()});row.place_translations=[{...row.place_translations[0],...c.arabic,source_updated_at:row.updated_at,updated_at:row.updated_at,editorial_status:b.reviewed_changes?'reviewed':'pending'}]
    row.place_images=c.images.map(i=>({...i,id:i.id||crypto.randomUUID(),place_id:row.id,approved_at:i.rights_confirmed?row.updated_at:row.place_images.find(old=>old.id===i.id)?.approved_at||null,updated_at:row.updated_at}))
    row.place_categories=c.category_ids.map(id=>({category_id:id,categories:categories.find(c=>c.id===id)}));version=String(Number(version)+1);workspace=null;return json(row.id)
   }
   if(path.endsWith('/places')){if(url.searchParams.get('status')==='eq.published')return json(row.status==='published'?[{...row,place_images:row.place_images.filter(i=>i.approved_at)}]:[]);return json(url.searchParams.get('id')?row:[row])}
   if(path.endsWith('/categories'))return json(categories)
   if(path.endsWith('/place_reviews'))return json(row.place_reviews)
   if(path.endsWith('/place_images')&&method==='GET')return json(row.place_images.map(i=>({...i,places:{name:row.name,status:row.status}})))
   return route.fallback()
  }
  await context.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',route=>route.fulfill({status:403,contentType:'application/json',body:'{"message":"Fixture blocks all unhandled hosted operations"}'}))
  await context.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',handler);await page.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',handler)
  await publicPage.goto(base+'/');await loaded(publicPage,'.featured-card img.asset-image','old-cover.png')
  const mapPage=process.argv.includes('--focused')?await context.newPage():null
  if(mapPage){await mapPage.goto(base+'/explore');await mapPage.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000});await mapPage.locator('.map-view-jumps button').first().click();await mapPage.locator('button.destination-card__image').first().click();await mapPage.locator('.destination-preview[open]').waitFor()}
  await page.goto(base+'/admin/places/'+row.id);await page.getByRole('heading',{name:label('Quick Edit'),exact:true}).waitFor();await page.getByRole('textbox',{name:label('Destination name (English)'),exact:true}).waitFor({state:'visible'})
  await page.waitForFunction(()=>!document.querySelector('.quick-editor>fieldset').disabled)
  assert.equal(await page.locator('html').getAttribute('dir'),language==='en'?'ltr':'rtl');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));assert.equal(await page.locator('.admin-file-path').filter({hasText:'old-cover.png'}).isVisible(),false)
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),[])
  await page.screenshot({path:`artifacts/quick-edit/${base.endsWith('4190')?'preview':'dev'}-${language}.png`,fullPage:true})
  await page.getByRole('textbox',{name:label('Destination name (English)'),exact:true}).fill('Quick corrected English name')
  await page.getByRole('textbox',{name:label('Destination name (Arabic)'),exact:true}).fill('اسم عربي مصحح يدويًا')
  await page.waitForFunction(()=>document.querySelector('[role="status"].admin-help')?.textContent.includes('automatically')||document.querySelector('[role="status"].admin-help')?.textContent.includes('تلقائيًا'),{},{timeout:15000}).catch(async e=>{console.log({message:await page.locator('[role=status].admin-help').textContent(),error:await page.locator('[role=alert]').allTextContents(),workspace:!!workspace});await page.screenshot({path:'artifacts/quick-edit/failure.png',fullPage:true});throw e})
  assert.equal(applies,0);assert.equal(row.name,fixture.name);assert.ok(workspace);await page.reload();await page.waitForFunction(()=>!document.querySelector('.quick-editor>fieldset')?.disabled&&!!document.querySelector('.quick-save'))
  assert.equal(await page.getByRole('textbox',{name:label('Destination name (English)'),exact:true}).inputValue(),'Quick corrected English name');assert.equal(await page.locator('.quick-save input[type="checkbox"]').isChecked(),false)
  await page.getByRole('button',{name:label('Save Changes'),exact:true}).click();await page.waitForTimeout(500);assert.equal(applies,0)
  await page.locator('.quick-save input[type="checkbox"]').check();await page.getByRole('button',{name:label('Save Changes'),exact:true}).click()
  await publicPage.waitForFunction(name=>document.querySelector('.featured-card')?.textContent.includes(name),language==='en'?'Quick corrected English name':'اسم عربي مصحح يدويًا')
  assert.equal(applies,1);assert.equal(row.status,'published')
  if(mapPage)await mapPage.waitForFunction(()=>document.querySelector('.destination-preview h2')?.textContent==='Quick corrected English name')
  await page.waitForFunction(()=>!document.querySelector('.quick-editor>fieldset')?.disabled&&!!document.querySelector('.quick-save'))
  await page.locator('#media').scrollIntoViewIfNeeded();await page.getByLabel(label('Replace Image'),{exact:true}).setInputFiles({name:'original-test-image.png',mimeType:'image/png',buffer:newBytes})
  await page.waitForFunction(()=>document.querySelectorAll('.quick-editor .admin-media-card').length===2);if(process.argv.includes('--focused')){const ownershipAudit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(ownershipAudit.violations.map(v=>v.id),[])}await page.getByRole('button',{name:label('Keep private'),exact:true}).click()
  await page.getByRole('button',{name:label('Preview'),exact:true}).click();await loaded(page,'.admin-preview-cover',replacementPath);await page.getByRole('button',{name:label('Return to editor'),exact:true}).click()
  assert.equal(await page.locator('.quick-save input[type="checkbox"]').count(),0)
  for(const field of ['Attribution','Image source citation URL','Rights evidence','License basis'])assert.equal(await page.getByLabel(label(field),{exact:true}).count(),0)
  assert.equal(await page.locator('#media input[type="checkbox"]').count(),0)
  await page.getByRole('button',{name:label('Save Changes'),exact:true}).click();await page.waitForTimeout(400);assert.equal(row.place_images.find(i=>i.is_cover).storage_path.endsWith('/old-cover.png'),true);assert.equal(simpleSaves,0)
  await page.reload();await page.waitForFunction(()=>!document.querySelector('.quick-editor>fieldset')?.disabled&&!!document.querySelector('.quick-save'));await page.getByRole('button',{name:label('Preview'),exact:true}).click();await loaded(page,'.admin-preview-cover',replacementPath);await page.getByRole('button',{name:label('Return to editor'),exact:true}).click()
  await page.getByRole('button',{name:label('Confirm original ownership'),exact:true}).click();await page.getByRole('button',{name:label('Confirm project originals'),exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.quick-editor>fieldset')?.disabled);await page.getByRole('button',{name:label('Save Changes'),exact:true}).click()
  await loaded(publicPage,'.featured-card img.asset-image',replacementPath);assert.equal(uploads,1);assert.equal(row.status,'published')
  if(mapPage){await loaded(mapPage,'.destination-preview img',replacementPath);await mapPage.getByRole('button',{name:'Close destination preview'}).click();await loaded(mapPage,'.tourism-popup img',replacementPath);await mapPage.close()}
  await publicPage.goto(base+'/explore');if(width<760)await publicPage.locator('[aria-controls="explore-list"]').click();await loaded(publicPage,'.destination-card img.asset-image',replacementPath)
  await publicPage.goto(base+'/places/wadi-mujib');await loaded(publicPage,'.photo-gallery img',replacementPath)
  if(process.argv.includes('--focused')){
   const mediaReady=async()=>{await page.locator('#media').scrollIntoViewIfNeeded();await page.locator('.quick-editor .admin-media-card').first().waitFor()}
   async function reviewedSave(){if(await page.locator('.quick-save input[type="checkbox"]').count())await page.locator('.quick-save input[type="checkbox"]').check();await Promise.all([page.waitForResponse(r=>(r.url().endsWith('/admin_apply_quick_edit')||r.url().endsWith('/admin_save_simple_images'))&&r.status()===200),page.getByRole('button',{name:label('Save Changes'),exact:true}).click()]);await page.waitForFunction(()=>!document.querySelector('.quick-editor>fieldset')?.disabled&&!!document.querySelector('.quick-save'))}
   await mediaReady();await page.getByRole('button',{name:label('Move image up'),exact:true}).last().click();await reviewedSave();assert.equal(row.place_images[0].storage_path.endsWith('/old-cover.png'),true)
   await mediaReady();await page.getByRole('button',{name:label('Choose Existing Image'),exact:true}).click();await page.getByRole('button',{name:'Fixture old cover',exact:true}).click();await reviewedSave();assert.equal(row.place_images.find(i=>i.is_cover).storage_path.endsWith('/old-cover.png'),true)
   await mediaReady();await page.getByRole('button',{name:label('Remove Image'),exact:true}).last().click();await page.getByRole('dialog').getByRole('button',{name:label('Confirm change'),exact:true}).click();await reviewedSave();assert.equal(row.place_images.length,1);assert.equal(uploads,1)
  }
  await page.reload();await page.waitForFunction(()=>!document.querySelector('.quick-editor>fieldset')?.disabled&&!!document.querySelector('.quick-save'));assert.equal(await page.getByRole('dialog').count(),0);assert.equal(confirmations,1)
  // Ordinary return-to-tab must retain the mounted editor and current form.
  await page.getByRole('textbox',{name:label('Destination name (English)'),exact:true}).fill('Unsaved tab state')
  await page.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'))});assert.equal(await page.getByRole('textbox',{name:label('Destination name (English)'),exact:true}).inputValue(),'Unsaved tab state')
  if(width===1440){await page.goto(base+'/admin/places/new');await page.getByRole('textbox',{name:label('Destination name (English)'),exact:true}).fill('Brand new fixture');await page.getByRole('button',{name:label('Save Changes'),exact:true}).click();await page.waitForTimeout(700);assert.ok(created);assert.equal(created.english.slug,'brand-new-fixture');assert.equal(created.english.id,undefined)}
  if(process.argv.includes('--focused')){
   await page.goto(base+'/admin/media');await page.getByRole('link',{name:label('Manage images'),exact:true}).first().waitFor();assert.equal(await page.getByRole('combobox',{name:label('License basis')}).count(),0);assert.equal(await page.getByRole('textbox',{name:label('Rights evidence')}).count(),0)
   await page.goto(base+'/admin/publishing');await page.getByRole('link',{name:label('Manage images'),exact:true}).waitFor();assert.equal(await page.getByRole('textbox',{name:label('Attribution')}).count(),0)
  }
  results.push({base,language,width,status:'passed',privateAutosave:true,refreshRestoration:true,noImplicitReview:true,reviewedPublishedUpdate:true,unverifiedCoverBlocked:true,actualReplacementPath:true,homeExploreDetails:true,privatePreview:true,tabState:true,createdDraft:width===1440,accessibilityViolations:0,focusedOpenPreviewAndMapUpdate:!!mapPage,licensingFormsAbsent:true,oneOwnershipDeclaration:confirmations===1,mediaOnlySaves:simpleSaves,refreshSelectedCover:true});console.log('PASS Quick Edit '+base+' '+language+' '+width)
  await context.close()
 }
 assert.deepEqual(errors,[])
}finally{await browser.close();await writeFile('docs/validation/quick-edit-browser.json',JSON.stringify({scope:'Intercepted Auth, REST, RPC and Storage fixtures only; actual React/SDK/browser, distinct old/new image bytes, real MapLibre and axe; NOT genuine hosted Admin acceptance',results,errors},null,2)+'\n')}

// Read-only browser rendering of researched values with fixture Auth/HTTP. Never authenticates against hosted Auth.
import assert from 'node:assert/strict'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const {default:AxeBuilder}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/@axe-core/playwright/dist/index.mjs')))
const content=JSON.parse(await readFile('supabase/content/phase04-completion.json','utf8'))
const images=JSON.parse(await readFile('docs/evidence/content-completion/media-import.json','utf8')).photos
const categoryIds={nature:'437effb5-2dff-4123-ab4f-a1bdbc275253',history:'2ca78305-d041-4108-b860-8f58d4d67338',culture:'6ac69bce-0264-4cef-b6c7-438772b75ee5',adventure:'76c091cd-4de2-4c00-b579-d8470ddc07c1'}
const categories=Object.entries(categoryIds).map(([slug,id])=>({slug,id,name:slug[0].toUpperCase()+slug.slice(1),is_active:true,sort_order:1}))
const rows=content.places.map(p=>({...p,status:'draft',is_demo:false,updated_at:'2026-10-19T11:20:48.274507Z',primary_category_id:categoryIds[p.primary_category],place_categories:p.categories.map(slug=>({category_id:categoryIds[slug],categories:categories.find(c=>c.slug===slug)})),place_images:[],place_reviews:{location_kind:p.location_kind,coordinate_source:p.coordinate_source,location_reviewed:false,claims_reviewed:false,notes:p.coordinate_note}}))
const user={id:'00000000-0000-4000-8000-000000000001',email:'reviewer@example.test',email_confirmed_at:'2026-01-01',role:'authenticated',aud:'authenticated'}
const exp=Math.floor(Date.now()/1000)+3600,session={access_token:`${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({sub:user.id,exp})).toString('base64url')}.fixture`,refresh_token:'fixture',expires_at:exp,expires_in:3600,token_type:'bearer',user}
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),results=[],errors=[],writes=[]
page.on('pageerror',e=>errors.push(e.message))
await page.addInitScript(s=>localStorage.setItem('unseen-jo-admin-auth',JSON.stringify(s)),session)
await page.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{
 const request=route.request(),url=new URL(request.url()),path=url.pathname,body=request.postDataJSON?.(),id=url.searchParams.get('id')?.replace('eq.','')
 let data
 if(path.endsWith('/auth/v1/user'))data=user
 else if(path.endsWith('/admin_cms_status'))data={version:4}
 else if(path.endsWith('/admin_overview'))data={total:6,draft:6,published:0,categories:4,recent:[]}
 else if(path.endsWith('/admin_publication_issues'))data=['Source and essential claims require an explicit review','Review a sourced Jordan location and its precision','An uploaded, rights-approved cover image is required']
 else if(path.endsWith('/categories'))data=categories
 else if(path.endsWith('/places'))data=id?rows.find(p=>p.id===id):rows
 else if(path.endsWith('/place_reviews'))data=rows.find(p=>p.id===url.searchParams.get('place_id')?.replace('eq.',''))?.place_reviews||null
 else{writes.push({path,method:request.method(),body});return route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({message:'Read-only review fixture prohibits this operation'})})}
 await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)})
})
await mkdir('docs/screenshots/content-completion',{recursive:true})
try{
 for(const p of process.argv.includes('--import-only')?[]:rows){
  await page.goto(`http://127.0.0.1:4184/admin/places/${p.id}`)
  await page.getByLabel('Name',{exact:true}).waitFor()
  assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),p.name)
  assert.equal(Number(await page.getByLabel('Latitude',{exact:true}).inputValue()),p.latitude)
  assert.equal(Number(await page.getByLabel('Longitude',{exact:true}).inputValue()),p.longitude)
  await page.locator('.admin-coordinate-map[data-map-ready="true"]').waitFor({timeout:45000})
  await page.getByRole('button',{name:'Destination coordinate marker'}).waitFor()
  assert.equal(await page.getByRole('button',{name:'Publish destination'}).isDisabled(),true)
  await page.locator('.admin-map-section').screenshot({path:`docs/screenshots/content-completion/${p.slug}-map.png`})
  await page.getByRole('button',{name:'Preview',exact:true}).click()
  const dialog=page.getByRole('dialog',{name:'Draft preview'});await dialog.waitFor()
  assert.ok((await dialog.innerText()).includes(p.description.slice(0,90)))
  assert.ok((await dialog.innerText()).includes('not published'))
  await dialog.screenshot({path:`docs/screenshots/content-completion/${p.slug}-preview.png`})
  await page.keyboard.press('Escape');results.push({name:`${p.slug}: field values, real map marker and private preview with actual researched text`,status:'passed'})
 }
 await page.goto('http://127.0.0.1:4184/admin/content-completion')
 await page.getByRole('heading',{name:'Content completion',exact:true}).waitFor()
 await page.getByRole('button',{name:'Upload prepared media privately'}).waitFor()
 await page.waitForFunction(n=>document.querySelectorAll('.admin-media-card').length===n,images.length)
 await page.waitForFunction(()=>[...document.querySelectorAll('.admin-media-card img')].every(i=>i.complete&&i.naturalWidth>0))
 await page.screenshot({path:'docs/screenshots/content-completion/private-import-review.png',fullPage:true})
 results.push({name:'local research package renders all inspected photographs and source/licence links under admin guard',status:'passed'})
 const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
 await writeFile('docs/validation/tourism-import-accessibility.json',JSON.stringify({violations:accessibility.violations},null,2)+'\n')
 assert.deepEqual(accessibility.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[])
 results.push({name:'local import evidence review page automated WCAG scan',status:'passed'})
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[])
 await writeFile(`docs/validation/${process.argv.includes('--import-only')?'tourism-import-browser':'tourism-completion-browser'}.json`,JSON.stringify({scope:'Actual researched content and local photographs rendered with fixture Auth and protected API reads; real MapLibre layers. No hosted writes or genuine signed-in session.',passed:results.length,results,errors,unexpectedOperations:writes},null,2)+'\n')
 console.log(`PASS ${results.length} researched-content browser groups; no unexpected mutations`)
}finally{await browser.close()}

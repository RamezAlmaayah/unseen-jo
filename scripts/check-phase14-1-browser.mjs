// Actual anonymous hosted reads only. No Auth session or data mutations.
import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const root=join(tmpdir(),'unseen-jo-browser-check/node_modules'),{chromium}=await import(pathToFileURL(join(root,'playwright/index.mjs'))),{default:AxeBuilder}=await import(pathToFileURL(join(root,'@axe-core/playwright/dist/index.mjs')))
const snapshot=JSON.parse(await readFile('docs/validation/phase14-1-content-baseline.json','utf8')),browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),base=process.env.QA_BASE_URL||'http://127.0.0.1:4195',results=[],errors=[]
await mkdir('docs/screenshots/phase14-1',{recursive:true})
try{
 for(const [language,width]of (process.argv.includes('--preview-only')?[]:[['en',1366],['ar-JO',390]])){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',()=>errors.push('browser page error'))
  await page.addInitScript(language=>localStorage.setItem('unseen-jo-language',language),language)
  await page.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{const request=route.request(),u=new URL(request.url());assert.ok(['GET','HEAD'].includes(request.method())||request.method()==='POST'&&u.pathname.startsWith('/storage/v1/object/sign/'),'only anonymous reads / image URL signing permitted');return route.continue()})
  for(const p of snapshot.places){
   await page.goto(base+'/places/'+p.slug);await page.locator('.place-details-page h1').waitFor({timeout:25000})
   const t=snapshot.translations.find(t=>t.place_id===p.id),translated=language==='ar-JO'&&t.editorial_status==='reviewed'&&t.source_updated_at===p.updated_at,photos=snapshot.images.filter(i=>i.place_id===p.id&&i.approved_at)
   assert.equal(await page.locator('h1').innerText(),translated?t.name:p.name)
   assert.equal(await page.locator('html').getAttribute('dir'),language==='ar-JO'?'rtl':'ltr')
   assert.equal(await page.locator('.details-description').innerText(),translated?t.description:p.description)
   assert.equal(await page.locator('.translation-notice').count(),language==='ar-JO'&&!translated?1:0)
   assert.ok((await page.locator('[data-info="admission"]').getAttribute('class')).includes('visitor-info-card--unknown'),'NULL admission never presented as free')
   if(photos.length){await page.waitForFunction(()=>{const image=document.querySelector('.photo-gallery img');return image?.complete&&image.naturalWidth>0},null,{timeout:20000})}
   else {assert.equal(await page.locator('.photo-gallery img').count(),0);assert.equal(await page.locator('.photo-gallery .asset-unavailable').count(),1)}
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow')
   if(['ajloun-forest','petra','wadi-mujib'].includes(p.slug)){
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(scan.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[])
    await page.screenshot({path:`docs/screenshots/phase14-1/${p.slug}-${language}.png`,fullPage:false})
   }
   results.push({scope:'genuine anonymous hosted read; built local UI',slug:p.slug,language,width,images:photos.length,translation:translated?'reviewed Arabic':language==='en'?'English':'explicit English fallback',status:'PASS'});console.log('PASS '+language+' '+p.slug)
  }
  await context.close()
 }
 const context=await browser.newContext(),page=await context.newPage();await page.goto(pathToFileURL(resolve('docs/content/phase14-1-review.html')).href)
 assert.equal(await page.locator('article[data-slug]').count(),19);assert.equal(await page.locator('figure img').count(),30)
 await page.evaluate(()=>{for(const image of document.images)image.loading='eager'});await page.locator('figure').last().scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0))
 for(const width of [1366,390]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`docs/screenshots/phase14-1/local-review-${width}.png`})}
 results.push({scope:'local complete Arabic/image review HTML; all 30 actual image files decode; desktop/mobile',status:'PASS'});await context.close();assert.deepEqual(errors,[])
}catch(e){errors.push(e.message);throw e}finally{await browser.close();await writeFile('docs/validation/'+(process.argv.includes('--preview-only')?'phase14-1-local-preview.json':'phase14-1-browser.json'),JSON.stringify({base,results,errors},null,2)+'\n')}

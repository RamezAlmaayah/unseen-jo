import assert from 'node:assert/strict'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {mkdir,writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
import {resolveDataMode} from '../src/features/tourism/mode.js'
import {imageVisible} from './image-visibility.mjs'

const modules=join(tmpdir(),'unseen-jo-browser-check/node_modules')
const {chromium}=await import(pathToFileURL(join(modules,'playwright/index.mjs')))
const {default:AxeBuilder}=await import(pathToFileURL(join(modules,'@axe-core/playwright/dist/index.mjs')))
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']})
const results=[],errors=[],modes={}
await mkdir('artifacts/compact-explore',{recursive:true})

async function inspect(page){
 return page.evaluate(()=>{
  const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}}
  const panel=document.querySelector('.explore-results'),grid=document.querySelector('.explore-grid')
  if(!grid)throw new Error('Explore grid missing at '+location.href+': '+document.body.textContent.slice(-500))
  return {compact:document.querySelector('.explore-page').dataset.layout==='split',panelWidth:parseFloat(getComputedStyle(panel).width)-parseFloat(getComputedStyle(panel).paddingLeft)-parseFloat(getComputedStyle(panel).paddingRight),columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,pageOverflow:document.documentElement.scrollWidth>innerWidth+1,panelOverflow:panel.scrollWidth>panel.clientWidth+1,cards:[...grid.querySelectorAll('.destination-card')].map(e=>({name:e.querySelector('h2').textContent,card:box(e),image:box(e.querySelector('.destination-card__image')),title:box(e.querySelector('h2')),category:box(e.querySelector('.destination-card__category')),favorite:box(e.querySelector('.preview-favorite')),body:box(e.querySelector('.destination-card__body')),metadata:box(e.querySelector('dl')),overflow:e.scrollWidth>e.clientWidth+1,rows:[...e.querySelectorAll('dl>div')].map(row=>({row:box(row),icon:box(row.querySelector('img')),text:box(row.querySelector('dd'))}))}))}
 })
}
function checkLayout(data,language){
 assert.equal(data.columns,!data.compact&&data.panelWidth>=576?2:1,'columns must depend on panel content width and variant')
 assert.equal(data.pageOverflow,false,'page horizontal overflow');assert.equal(data.panelOverflow,false,'list horizontal overflow')
 for(const c of data.cards){
  assert.equal(c.overflow,false,c.name+' card overflow')
  assert.ok(c.category.y>=c.title.bottom-1,c.name+' title/category overlap')
  assert.ok(c.metadata.y>=c.body.bottom-1,c.name+' metadata/body overlap')
  assert.ok(c.metadata.bottom<=c.card.bottom+1,c.name+' metadata clipped')
  if(!data.compact)assert.ok(Math.abs(c.image.width/c.image.height-344/179)<0.02,'consistent photo ratio')
  if(c.favorite.y<c.title.bottom&&c.favorite.bottom>c.title.y)assert.ok(language==='en'?c.title.right<=c.favorite.x+1:c.favorite.right<=c.title.x+1,'title/favorite overlap')
  for(const r of c.rows){
   assert.ok(r.text.x>=c.card.x-1&&r.text.right<=c.card.right+1,'text outside card')
   assert.ok(language==='en'?r.icon.right+8<=r.text.x:r.text.right+8<=r.icon.x,'icon/text gap')
  }
  for(let i=1;i<c.rows.length;i++)assert.ok(c.rows[i].row.y>=c.rows[i-1].row.bottom+(data.compact?4:8),'metadata row separation')
 }
}
try{
 for(const [name,base] of [['development','http://127.0.0.1:4184'],['production','http://127.0.0.1:4190']]){
  const env=loadEnv(name==='production'?'production':'development',process.cwd(),'VITE_')
  modes[name]=resolveDataMode({...env,PROD:name==='production'})
  assert.equal(modes[name],'supabase')
  assert.equal(env.VITE_SUPABASE_URL,'https://dkhwwvoplhfjccvjegty.supabase.co')
  const client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
  const {data,error}=await client.from('places').select('id,slug,status,is_demo').eq('status','published').eq('is_demo',false);assert.ifError(error);assert.equal(data.length,6)
  for(const language of ['en','ar-JO']){
   const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000}}),page=await context.newPage(),requests=[]
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).pathname==='/rest/v1/places')requests.push(r.url())})
   await page.addInitScript(language=>{localStorage.setItem('unseen-jo-language',language);sessionStorage.clear()},language)
   await page.addInitScript(`window.imageVisible=${imageVisible.toString()}`)
   for(const width of [1440,1100,900,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto(base+'/explore');await page.locator('.destination-card').first().waitFor({state:'attached'})
    if(width<1024)await page.locator('.map-view-jumps button').first().click()
    await page.locator('.explore-workspace').scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready)
    await page.waitForFunction(()=>[...document.querySelectorAll('.destination-card__image img')].filter(window.imageVisible).every(i=>i.complete&&i.naturalWidth>0),{},{timeout:45000})
    await page.waitForTimeout(200)
    await page.locator('.explore-grid').waitFor();const layout=await inspect(page);assert.equal(layout.cards.length,data.length);checkLayout(layout,language)
    assert.equal(await page.locator('html').getAttribute('dir'),language==='en'?'ltr':'rtl')
    assert.ok(requests.some(url=>{const u=new URL(url);return u.searchParams.get('status')==='eq.published'&&u.searchParams.get('is_demo')==='eq.false'}),'genuine filtered live query')
    const screenshot=`artifacts/compact-explore/${name}-${language}-${width}.png`
    await page.screenshot({path:screenshot})
    let accessibility
    if([1440,390].includes(width)){
     accessibility=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}));assert.deepEqual(accessibility,[])
    }
    results.push({name,language,width,kind:'live viewport',layout,accessibility,screenshot,status:'passed'});console.log(`PASS ${name} ${language} ${width}px: panel ${layout.panelWidth}px / ${layout.columns} columns`)
   }
   // Resize only the split at a fixed desktop viewport: this would fail viewport-only breakpoints.
   await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/explore');await page.locator('.destination-card').first().waitFor();await page.evaluate(()=>document.fonts.ready)
   for(const panel of [360,575,576,640]){
    await page.locator('.explore-workspace').evaluate((e,panel)=>e.style.gridTemplateColumns=`${panel}px minmax(0, 1fr)`,panel)
    await page.waitForTimeout(200);const layout=await inspect(page);checkLayout(layout,language)
    results.push({name,language,width:1440,requestedPanel:panel,kind:'resized split',layout,status:'passed'})
   }
   // Browser-only stress copy, never persisted or sent to Supabase.
   await page.evaluate(language=>{
    const card=document.querySelector('.destination-card');card.querySelector('h2 a').textContent=language==='en'?'Mujib Biosphere Reserve — Wadi Mujib Adventure and Nature Visitor Experience':'محمية الموجب للمحيط الحيوي — تجربة الزائر والطبيعة والمغامرة في وادي الموجب'
    card.querySelector('.destination-card__category').textContent=language==='en'?'Nature · History · Culture · Adventure':'الطبيعة · التاريخ · الثقافة · المغامرة'
    card.querySelectorAll('dd')[card.querySelectorAll('dd').length-1].textContent=language==='en'?'Cost unavailable — contact the official operator for current admission details':'التكلفة غير متاحة — يرجى التواصل مع الجهة المشغلة للحصول على معلومات الدخول الحالية'
   },language)
   await page.locator('.explore-workspace').evaluate(e=>e.style.gridTemplateColumns='360px minmax(0, 1fr)');await page.waitForTimeout(200)
   const stress=await inspect(page);checkLayout(stress,language);await page.locator('.destination-card').first().scrollIntoViewIfNeeded();const screenshot=`artifacts/compact-explore/${name}-${language}-long-copy.png`;await page.screenshot({path:screenshot})
   results.push({name,language,kind:'DOM-only long-copy stress',layout:stress,screenshot,status:'passed'})
   // Existing filters, preview, navigation, map selection and favorite interactions.
   await page.reload();await page.locator('.destination-card').first().waitFor();const search=page.locator('.explore-search input');await search.fill(language==='en'?'Ajloun':'عجلون');await page.waitForTimeout(200);assert.equal(await page.locator('.destination-card').count(),1)
   await search.fill('');await page.waitForTimeout(200);assert.equal(await page.locator('.destination-card').count(),6)
   const favorite=page.locator('.destination-card .preview-favorite').first();await favorite.click();assert.equal(await favorite.getAttribute('aria-pressed'),'true')
   await page.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000});await page.evaluate(()=>{window.exploreCanvas=document.querySelector('.maplibregl-canvas')});await page.locator('.destination-card__map-select').first().click();await page.locator('.destination-marker[aria-pressed="true"]').waitFor();assert.equal(await page.evaluate(()=>window.exploreCanvas===document.querySelector('.maplibregl-canvas')),true)
   await page.locator('.map-view-jumps button').first().click();await page.locator('.destination-card__image').first().click();await page.locator('.destination-preview[open]').waitFor();await page.locator('.destination-preview__close').click()
   const href=await page.locator('.destination-card h2 a').first().getAttribute('href');assert.match(href,/^\/places\//)
   results.push({name,language,kind:'filter, favorite, MapLibre selection, preview and detail link',status:'passed'})
   await context.close()
  }
 }
 assert.deepEqual(errors,[])
}finally{
 await browser.close();await writeFile('docs/validation/compact-explore-layout.json',JSON.stringify({scope:'Genuine anonymous hosted reads and real Chromium/MapLibre. No API interception, stored writes, uploads or publication calls. Long-copy stress and split widths are DOM-only test changes.',modes,results,errors},null,2)+'\n')
}

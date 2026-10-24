import assert from 'node:assert/strict'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
import i18n,{tx} from '../src/i18n/index.js'
import {normalizePlace} from '../src/features/tourism/model.js'
import {localizeDestination} from '../src/i18n/destinations.js'
import {visitorInformation,visitorBullets} from '../src/features/tourism/visitorInformation.js'
const modules=join(tmpdir(),'unseen-jo-browser-check/node_modules'),{chromium}=await import(pathToFileURL(join(modules,'playwright/index.mjs'))),{default:AxeBuilder}=await import(pathToFileURL(join(modules,'@axe-core/playwright/dist/index.mjs')))
const env=loadEnv('production',process.cwd(),'VITE_');assert.equal(env.VITE_SUPABASE_URL,'https://dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),{data:rows,error}=await client.from('places').select('*,place_translations(*)').eq('status','published').eq('is_demo',false).order('slug');assert.ifError(error);assert.equal(rows.length,6)
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=[],errors=[]
async function bounds(page){return page.evaluate(()=>{const r=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height}};const grid=document.querySelector('.visitor-info-grid');return {columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth+1,cards:[...grid.children].map(e=>({id:e.dataset.info,card:r(e),title:r(e.querySelector('dt')),value:r(e.querySelector('dd')),overflow:e.scrollWidth>e.clientWidth+1,heading:e.querySelector('dt').textContent,text:e.querySelector('.visitor-info-value').textContent,icon:!!e.querySelector('svg')}))}})}
function layoutCheck(layout,width){assert.equal(layout.columns,width>=1100?3:width>=700?2:1);assert.equal(layout.overflow,false);for(const c of layout.cards){assert.equal(c.overflow,false);assert.ok(c.icon&&c.heading.trim());assert.ok(c.value.y>=c.title.bottom);assert.ok(c.value.bottom<=c.card.bottom+1);assert.ok(c.text.length<150,'no narrative paragraph in card')}}
try{
 for(const language of ['en','ar-JO']){
  await i18n.changeLanguage(language)
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(language=>localStorage.setItem('unseen-jo-language',language),language)
  for(const width of [1440,820,390]){
   await page.setViewportSize({width,height:1000})
   for(const row of rows){
    const expected=visitorInformation(localizeDestination(normalizePlace(row),language),language)
    await page.goto('http://127.0.0.1:4190/places/'+row.slug,{waitUntil:'domcontentloaded'});await page.locator('.visitor-info-grid').waitFor();await page.locator('.visitor-information').scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready)
    const layout=await bounds(page);layoutCheck(layout,width);assert.equal(layout.cards.length,expected.cards.length);assert.equal(await page.locator('.place-info-grid').count(),0);assert.equal(await page.locator('html').getAttribute('dir'),language==='en'?'ltr':'rtl')
    for(const card of expected.cards){const actual=page.locator(`[data-info="${card.id}"] .visitor-info-value`);assert.equal((await actual.textContent()).split(' — ')[0],tx(card.value||'Unavailable'))}
    for(const note of expected.notes){const actual=await page.locator(`#visitor-note-${note.id} li`).allTextContents();assert.deepEqual(actual,visitorBullets(note.text,language),'all cautions preserved in original language')}
    assert.equal(await page.locator('[data-info="accessibility"]').count(),0,'no unsupported accessibility claim')
    if(row.slug==='ajloun-forest')assert.equal(await page.locator('[data-info="duration"] .visitor-info-value').textContent(),language==='en'?'2–4 hours':'ساعتان إلى أربع ساعات')
    let screenshot,accessibility
    if(row.slug==='ajloun-forest'||row.slug==='wadi-mujib'&&width===1440){screenshot=`artifacts/visitor-information/after-${row.slug}-${language}-${width}.png`;await page.screenshot({path:screenshot});accessibility=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}));assert.deepEqual(accessibility,[])}
    assert.match(await page.locator('.details-map a.button').getAttribute('href'),/^https:\/\/www.google.com\/maps\//)
    results.push({language,width,slug:row.slug,layout,screenshot,accessibility,status:'passed'});console.log(`PASS visitor information ${language} ${width} ${row.slug}: ${layout.cards.length} purposeful cards`)
   }
  }
  // Real native note links and disclosures, image viewer, temporary save and map.
  await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4190/places/ajloun-forest');await page.locator('.visitor-info-grid').waitFor()
  const noteLink=page.locator('[data-info="transport"] a');await noteLink.focus();await page.keyboard.press('Enter');await page.waitForURL('**#visitor-note-transport');assert.equal(await page.evaluate(()=>document.activeElement.id),'visitor-note-transport')
  if(language==='ar-JO'){const disclosure=page.locator('.visitor-source-context');assert.equal(await disclosure.getAttribute('open'),null);await disclosure.locator('summary').focus();await page.keyboard.press('Enter');assert.notEqual(await disclosure.getAttribute('open'),null);await page.keyboard.press('Enter')}
  await page.locator('.photo-gallery button').first().click();await page.locator('.photo-viewer[open]').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('.photo-viewer[open]').count(),0)
  await page.locator('.details-actions button').click();assert.equal(await page.locator('.details-actions button').getAttribute('aria-pressed'),'true')
  await page.locator('.tourism-map').scrollIntoViewIfNeeded();await page.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000});assert.equal(await page.locator('.destination-marker').count(),1)
  // Long and missing data stress is DOM-only; no content is saved.
  await page.locator('.visitor-information').scrollIntoViewIfNeeded();await page.locator('[data-info="duration"] .visitor-info-value').evaluate(e=>e.textContent+=' — '.repeat(3)+'A deliberately long visitor value for overflow testing'.repeat(4));const stress=await bounds(page);assert.equal(stress.overflow,false);assert.ok(stress.cards.every(c=>!c.overflow&&c.value.bottom<=c.card.bottom+1))
  results.push({language,kind:'keyboard, source disclosure, gallery, save, map and long-text stress',status:'passed'});await context.close()
 }
 // Development build spot-check of the same shared component.
 for(const language of ['en','ar-JO']){const page=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});await page.addInitScript(l=>localStorage.setItem('unseen-jo-language',l),language);await page.goto('http://127.0.0.1:4184/places/ajloun-forest');await page.locator('.visitor-info-grid').waitFor();layoutCheck(await bounds(page),390);results.push({language,kind:'development mobile',status:'passed'});await page.close()}
 assert.deepEqual(errors,[])
}finally{await browser.close();await writeFile('docs/validation/visitor-information-browser.json',JSON.stringify({scope:'Genuine anonymous hosted Supabase data in Chromium, all six destinations / two languages / three production widths, plus development spots; no API interception or stored writes. Stress copy is DOM-only.',results,errors},null,2)+'\n')}

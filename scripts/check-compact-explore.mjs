import assert from 'node:assert/strict'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {writeFile} from 'node:fs/promises'
import {imageVisible} from './image-visibility.mjs'
const modules=join(tmpdir(),'unseen-jo-browser-check/node_modules'),{chromium}=await import(pathToFileURL(join(modules,'playwright/index.mjs')))
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=[],errors=[]
try{
 for(const [language,width,height]of [['en',1366,768],['ar-JO',1366,768],['en',900,1000],['ar-JO',900,1000],['en',390,844],['ar-JO',390,844]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage(),catalogRequests=[]
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).pathname==='/rest/v1/places')catalogRequests.push(r.url())})
  await page.addInitScript(language=>localStorage.setItem('unseen-jo-language',language),language);await page.addInitScript(`window.imageVisible=${imageVisible.toString()}`)
  await page.goto('http://127.0.0.1:4190/explore',{waitUntil:'domcontentloaded'});await page.locator('.destination-card').first().waitFor({state:'attached'})
  if(width<1024)await page.locator('.map-view-jumps button').first().click()
  await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>[...document.querySelectorAll('.destination-card__image img')].filter(window.imageVisible).every(i=>i.complete&&i.naturalWidth>0),{},{timeout:45000})
  const measure=await page.evaluate(()=>{const p=document.querySelector('.explore-results').getBoundingClientRect();const cards=[...document.querySelectorAll('.destination-card')].map(e=>{const r=e.getBoundingClientRect(),i=e.querySelector('.destination-card__image').getBoundingClientRect();return {height:r.height,top:r.top,bottom:r.bottom,imageWidth:i.width,imageOnStart:document.dir==='rtl'?i.right>=r.right-1:i.left<=r.left+1}});return {panelHeight:p.height,cards,fullyVisible:cards.filter(c=>c.top>=p.top&&c.bottom<=Math.min(p.bottom,innerHeight)).length}})
  const screenshot=`artifacts/compact-explore/after-${language}-${width}.png`;await page.screenshot({path:screenshot});assert.equal(await page.locator('.destination-card').count(),6)
  const links=await page.locator('.destination-card h2 a').evaluateAll(elements=>elements.map(e=>e.getAttribute('href')));assert.equal(new Set(links).size,6);assert.ok(links.every(href=>/^\/places\/[a-z0-9-]+$/.test(href)))
  if(width>=1024){
   assert.ok(measure.cards.slice(0,5).every(c=>c.height>=115&&c.height<=140));assert.ok(measure.cards.every(c=>c.imageWidth===128&&c.imageOnStart));assert.ok(measure.fullyVisible>=2)
   await page.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000});const mapSize=await page.locator('.tourism-map').boundingBox()
   await page.evaluate(()=>window.compactCanvas=document.querySelector('.maplibregl-canvas'))
   await page.locator('.explore-categories .category-pill').nth(1).click();await page.waitForTimeout(150);assert.ok(await page.locator('.destination-card').count()<6)
   await page.locator('.explore-categories .category-pill').first().click();await page.waitForTimeout(150);assert.equal(await page.locator('.destination-card').count(),6)
   const nearYou=page.locator('.near-you').first();await nearYou.locator('summary').click();await nearYou.locator('select').nth(0).selectOption('amman');await nearYou.locator('select').nth(1).selectOption('250');await page.waitForTimeout(150);assert.equal(await page.locator('.destination-card').count(),6);assert.equal(await page.locator('.destination-distance').count(),6)
   await nearYou.locator('select').nth(0).selectOption('');await nearYou.locator('summary').click();await page.waitForTimeout(150)
   const url=page.url();await page.locator('.preview-favorite').first().click();assert.equal(page.url(),url);assert.equal(await page.locator('.preview-favorite').first().getAttribute('aria-pressed'),'true')
   await page.locator('.destination-card__map-select').first().click();await page.locator('.destination-marker[aria-pressed="true"]').waitFor();const selected=await page.locator('.destination-marker[aria-pressed="true"]').getAttribute('data-place-id'),catalogCount=catalogRequests.length
   await page.locator('.map-view-jumps button').first().click();assert.equal(await page.locator('.destination-card--compact').count(),0);assert.equal(await page.locator('.explore-map').isVisible(),false)
   await page.locator('.map-view-jumps button').nth(1).click();assert.equal(await page.locator('.destination-card--compact').count(),6);assert.equal(await page.evaluate(()=>window.compactCanvas===document.querySelector('.maplibregl-canvas')),true);assert.equal(await page.locator('.preview-favorite').first().getAttribute('aria-pressed'),'true')
   const nextMap=await page.locator('.tourism-map').boundingBox();assert.equal(nextMap.width,mapSize.width);assert.equal(nextMap.height,mapSize.height);assert.equal(catalogRequests.length,catalogCount)
   await page.evaluate(()=>{window.compactToken=crypto.randomUUID();document.querySelector('.explore-results').scrollTop=70;window.compactState={token:window.compactToken,scroll:document.querySelector('.explore-results').scrollTop,zoom:document.querySelector('.map-canvas').dataset.mapZoom}})
   for(const seconds of [5,30]){
    const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await page.waitForTimeout(seconds*1000);await other.close();await page.bringToFront();await page.waitForTimeout(200)
    const retained=await page.evaluate(()=>({token:window.compactToken===window.compactState.token,canvas:window.compactCanvas===document.querySelector('.maplibregl-canvas'),scroll:document.querySelector('.explore-results').scrollTop===window.compactState.scroll,zoom:document.querySelector('.map-canvas').dataset.mapZoom===window.compactState.zoom}));assert.ok(Object.values(retained).every(Boolean));assert.equal(await page.locator('.destination-marker[aria-pressed="true"]').getAttribute('data-place-id'),selected);assert.equal(catalogRequests.length,catalogCount)
    results.push({kind:'tab return',language,seconds,...retained,additionalCatalogQueries:catalogRequests.length-catalogCount,status:'passed'})
   }
   const heading=page.locator('.destination-card__open').first();await page.keyboard.press('Tab');await heading.focus();assert.equal(await heading.evaluate(e=>getComputedStyle(e,'::after').outlineStyle),'solid')
   // Hit the card's empty padding, not just its heading; the stretched native
   // link must navigate without swallowing separate favorite/map actions.
   const card=page.locator('.destination-card').first();await card.scrollIntoViewIfNeeded();const r=await card.boundingBox();await card.click({position:{x:r.width-6,y:r.height-6}});await page.waitForURL('**/places/*');assert.match(page.url(),/\/places\//)
   results.push({kind:'whole-card navigation, separate actions, category and manual Near You',language,status:'passed'})
  }
  results.push({language,width,height,...measure,links,screenshot,status:'passed'});console.log('PASS compact acceptance '+language+' '+width+': '+measure.cards[0].height+'px, '+measure.fullyVisible+' fully visible')
  await context.close()
 }
 assert.deepEqual(errors,[])
}finally{await browser.close();await writeFile('docs/validation/compact-explore-acceptance.json',JSON.stringify({scope:'Genuine anonymous live data in production Chromium. Tab tests use a second real browser page; headless scheduling may differ from visible Chrome. No API interception or stored writes.',results,errors},null,2)+'\n')}

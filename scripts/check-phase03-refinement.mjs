import assert from 'node:assert/strict'
import {mkdir,writeFile}from 'node:fs/promises'
import {pathToFileURL}from 'node:url'
import {join}from 'node:path'
import {tmpdir}from 'node:os'
import {setDestinationView}from './map-test-helpers.mjs'
const qa=join(tmpdir(),'unseen-jo-browser-check/node_modules')
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE||join(qa,'playwright/index.mjs')))
const {default:AxeBuilder}=await import(pathToFileURL(process.env.AXE_MODULE||join(qa,'@axe-core/playwright/dist/index.mjs')))
const live=process.env.QA_LIVE_URL||'http://127.0.0.1:4190',demo=process.env.QA_BASE_URL||'http://127.0.0.1:4191'
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']})
const results=[],errors=[]
await mkdir('docs/screenshots/phase03-refinement',{recursive:true});await mkdir('artifacts/phase03-refinement',{recursive:true})
try{
for(const [mode,url]of [['live',live],['demo',demo]])for(const [width,height]of [[1440,900],[768,1024],[390,844]]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',hasTouch:width<1024});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
 const requests=[];p.on('response',r=>{if(r.url().includes('openfreemap'))requests.push({url:r.url(),status:r.status()})})
 await p.goto(url+'/explore')
 if(mode==='live'){await p.locator('.destination-card').first().waitFor({state:'attached'});await p.waitForFunction(()=>document.querySelectorAll('.destination-marker').length===6);assert.equal(await p.locator('.destination-marker').count(),6)}
 else {await p.locator('.destination-card').first().waitFor();await p.locator('.destination-card__map-select:not([disabled])').first().click();await p.locator('.tourism-popup').waitFor();await p.waitForFunction(()=>document.activeElement.classList.contains('maplibregl-popup-close-button'))}
 await p.locator('.tourism-map').scrollIntoViewIfNeeded();await p.locator('[data-map-idle="true"]').waitFor({timeout:60000});await p.evaluate(()=>document.fonts.ready)
 assert.ok(requests.some(r=>r.status===200&&r.url.endsWith('.pbf')),'real geographic tile/glyph loading')
 const geometry=await p.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};return {overflow:document.documentElement.scrollWidth>innerWidth,workspace:rect('.explore-workspace'),map:rect('.tourism-map'),header:rect('.site-header'),heading:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)}})
 assert.equal(geometry.overflow,false);assert.ok(geometry.workspace.width<=1200);assert.equal(geometry.header.height,width>=768?60:104);assert.ok(geometry.heading<=44)
 if(width===1440){assert.ok(geometry.map.width/geometry.workspace.width>=.55&&geometry.map.width/geometry.workspace.width<=.60);assert.ok(geometry.map.height>=620&&geometry.map.height<=740)}
 const controls=await p.locator('.map-controls').boundingBox(),attribution=await p.locator('.maplibregl-ctrl-attrib').boundingBox();assert.ok(controls.y+controls.height<attribution.y)
 if(mode==='demo'){const popup=await p.locator('.maplibregl-popup-content').boundingBox(),map=await p.locator('.tourism-map').boundingBox();assert.ok(popup.x>=map.x&&popup.x+popup.width<=map.x+map.width&&popup.y>=map.y&&popup.y+popup.height<=map.y+map.height);assert.equal(await p.locator('.destination-marker[aria-pressed="true"]').count(),1);assert.equal(await p.locator('.destination-card--selected').count(),1)}
 const a11y=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
 await writeFile(`artifacts/phase03-refinement/axe-${mode}-${width}.json`,JSON.stringify(a11y,null,2))
 assert.deepEqual(a11y.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),[])
 await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:`docs/screenshots/phase03-refinement/${mode}-${width}-viewport.png`});await p.screenshot({path:`docs/screenshots/phase03-refinement/${mode}-${width}-full.png`,fullPage:true});await p.locator('.tourism-map').screenshot({path:`docs/screenshots/phase03-refinement/${mode}-${width}-map.png`})
 if(mode==='demo')await p.keyboard.press('Escape')
 await p.locator('.map-legend summary').click();const key=await p.locator('.map-legend > div').boundingBox(),map=await p.locator('.tourism-map').boundingBox();assert.ok(key.x>=map.x&&key.x+key.width<=map.x+map.width);assert.equal(await p.locator('.map-legend > div > span').count(),7);await p.locator('.map-legend summary').click()
 if(width<1024){await setDestinationView(p,'List');assert.equal(await p.locator('.tourism-map').isVisible(),false);await setDestinationView(p,'Map');await p.locator('[data-map-idle="true"]').waitFor();assert.equal(await p.locator('.tourism-map').isVisible(),true);await p.locator('.attribute-filters summary').click();assert.equal(await p.locator('.map-category-filters .category-pill').count(),8);await p.locator('.attribute-filters summary').click()}
 results.push({mode,width,height,geometry,axeViolations:a11y.violations.length,axePasses:a11y.passes.length,providerResponses:requests.length,status:'passed'});console.log('PASS real browser/axe/visual',mode,width);await context.close()
}
assert.deepEqual(errors,[])
}finally{await writeFile('artifacts/phase03-refinement/visual-accessibility-results.json',JSON.stringify({results,passed:results.length,errors,scope:'Actual OpenFreeMap rendering and hosted public reads in live mode; explicitly labeled sourced demo locations. Automated WCAG A/AA checks supplement manual review, not a full accessibility certification.'},null,2)+'\n');await browser.close()}

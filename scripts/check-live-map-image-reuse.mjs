import assert from 'node:assert/strict'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {writeFile} from 'node:fs/promises'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs'))),browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=[],errors=[]
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),images=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.resourceType()==='image')images.push(new URL(r.url()).pathname)})
 await page.goto('http://127.0.0.1:4190/explore');await page.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000});await page.locator('.tourism-map').scrollIntoViewIfNeeded();await page.locator('.destination-marker').first().click();await page.locator('.tourism-popup img').waitFor();await page.waitForFunction(()=>{const i=document.querySelector('.tourism-popup img');return i.complete&&i.naturalWidth>0});assert.match(await page.locator('.tourism-popup img').getAttribute('srcset'),/320w/)
 await page.evaluate(()=>{window.imageReuse={canvas:document.querySelector('.maplibregl-canvas'),source:document.querySelector('.tourism-popup img').currentSrc,selected:document.querySelector('.destination-marker[aria-pressed="true"]').dataset.placeId,zoom:document.querySelector('.map-canvas').dataset.mapZoom,document:crypto.randomUUID()}})
 for(const seconds of [5,30]){
  const start=images.length
  await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}))});await page.waitForTimeout(seconds*1000);await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}));window.dispatchEvent(new Event('focus'))});await page.waitForTimeout(600)
  const preserved=await page.evaluate(()=>({sameCanvas:window.imageReuse.canvas===document.querySelector('.maplibregl-canvas'),sameSource:window.imageReuse.source===document.querySelector('.tourism-popup img').currentSrc,sameSelection:window.imageReuse.selected===document.querySelector('.destination-marker[aria-pressed="true"]').dataset.placeId,sameZoom:window.imageReuse.zoom===document.querySelector('.map-canvas').dataset.mapZoom}))
  assert.ok(Object.values(preserved).every(Boolean));assert.equal(images.length-start,0);results.push({seconds,...preserved,imageRequests:images.slice(start),status:'passed'});console.log('PASS actual live popup photo and map state retained after '+seconds+' seconds')
 }
 assert.deepEqual(errors,[])
}finally{await browser.close();await writeFile('docs/validation/live-map-image-reuse.json',JSON.stringify({scope:'Actual anonymous hosted image and MapLibre/OpenFreeMap in a single Chromium context; controlled visibility events, no Auth/API interception',results,errors},null,2)+'\n')}

import assert from 'node:assert/strict'
import {pathToFileURL}from 'node:url'
import {join}from 'node:path'
import {tmpdir}from 'node:os'
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE||join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
import {writeFile}from 'node:fs/promises'
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=[]
try{for(const [width,height]of [[1440,900],[768,1024],[390,844]]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage()
 await page.goto((process.env.QA_BASE_URL||'http://127.0.0.1:4193')+'/places/iraq-al-amir');await page.locator('.tourism-map').scrollIntoViewIfNeeded();await page.locator('[data-map-idle="true"]').waitFor({timeout:60000})
 const rect=async s=>page.locator(s).boundingBox(),toolbar=await rect('.map-toolstrip'),scale=await rect('.maplibregl-ctrl-scale'),attribution=await rect('.maplibregl-ctrl-attrib'),controls=await rect('.map-controls')
 assert.ok(toolbar.y+toolbar.height<=scale.y,'gesture control and scale are separate');assert.ok(scale.y+scale.height<=attribution.y,'scale leaves attribution clear');assert.ok(controls.y+controls.height<=attribution.y)
 assert.match(await page.getByRole('link',{name:/^Get Directions/}).getAttribute('href'),/31\.9195625/)
 if(width===1440){for(let i=0;i<4;i++)await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.waitForFunction(()=>Number(document.querySelector('.map-canvas').dataset.mapZoom)>15.9);await page.locator('[data-map-idle="true"]').waitFor();await page.locator('.tourism-map').screenshot({path:'docs/screenshots/phase03-refinement/street-detail-map.png'})}
 await page.locator('.destination-marker').click();await page.locator('.tourism-popup').waitFor();await page.waitForFunction(()=>document.activeElement.classList.contains('maplibregl-popup-close-button'));await page.locator('.map-toolstrip').waitFor({state:'hidden'});assert.equal(await page.locator('.map-toolstrip').isVisible(),false);await page.keyboard.press('Escape');await page.locator('.map-toolstrip').waitFor({state:'visible'});assert.equal(await page.locator('.map-toolstrip').isVisible(),true)
 results.push({width,height,toolbar,scale,attribution,status:'passed'});console.log('PASS compact Details controls/directions/popup',width);await context.close()
}}finally{await writeFile('artifacts/phase03-refinement/details-control-results.json',JSON.stringify({passed:results.length,results},null,2)+'\n');await browser.close()}

import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { installMapFixture, setDestinationView } from './map-test-helpers.mjs'
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const live=process.env.QA_LIVE_URL||'http://127.0.0.1:4184', demo=process.env.QA_BASE_URL||'http://127.0.0.1:4185'
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']})
const checks=[],errors=[],responses=[],responsive=[]
await mkdir('docs/screenshots/phase03',{recursive:true});await mkdir('artifacts/phase03',{recursive:true})
async function check(name,fn){await fn();checks.push({name,status:'passed'});console.log('PASS '+name)}
async function pageFor(mock=true,options={}){const p=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce',...options});p.on('pageerror',e=>errors.push(e.message));if(mock)await installMapFixture(p);return p}
async function ready(p){await setDestinationView(p,'Map');await p.locator('.tourism-map').scrollIntoViewIfNeeded();await p.locator('[data-map-ready="true"]').waitFor({timeout:45000})}
async function nearPanel(p){await p.locator('.near-you:not(.attribute-filters) summary').click()}
async function closePanel(p){await p.locator('.near-you:not(.attribute-filters) summary').click()}
async function count(p,n){await p.waitForFunction(n=>document.querySelectorAll('.destination-card').length===n,n)}
const categories=['nature','history','adventure','culture','food','photography','family'].map((slug,i)=>({id:'cat-'+i,slug,name:slug[0].toUpperCase()+slug.slice(1)}))
const fixture=(i,latitude=31.95+i*.02,longitude=35.94+i*.02)=>({id:`fixture-${i}`,slug:`fixture-${i}`,name:`Fixture Destination ${i}`,status:'published',is_demo:false,city:i%2?'Amman':'Irbid',description:'Synthetic browser-test record, never imported.',latitude,longitude,price_min_jod:null,price_max_jod:null,duration_min_minutes:null,duration_max_minutes:null,place_categories:[{categories:categories[i%7]}],place_images:[]})
async function api(p,rows){await p.route('https://dkhwwvoplhfjccvjegty.supabase.co/rest/v1/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(new URL(r.request().url()).pathname.endsWith('/categories')?categories:rows)}))}
try{
 if (!process.env.QA_SKIP_REAL) {
 const real=await pageFor(false)
 real.on('response',r=>{if(r.url().includes('openfreemap'))responses.push({url:r.url(),status:r.status()})})
 await check('REAL provider: published Jordan destinations, geographic tiles and visible legal attribution',async()=>{
  await real.goto(live+'/explore');await ready(real);await real.locator('.destination-card').first().waitFor({state:'attached'})
  await real.waitForResponse(r=>r.url().includes('openfreemap')&&r.url().endsWith('.pbf')&&r.status()===200,{timeout:45000}).catch(()=>assert.ok(responses.some(r=>r.url.endsWith('.pbf')&&r.status===200)))
  assert.equal(await real.locator('.destination-marker').count(),6);assert.equal(await real.locator('.map-empty').count(),0)
  for(const text of ['OpenFreeMap','OpenMapTiles','OpenStreetMap','Liberty style'])assert.ok(await real.locator('.maplibregl-ctrl-attrib').getByRole('link',{name:text,exact:false}).isVisible())
  const a=await real.locator('.maplibregl-ctrl-attrib').boundingBox(),m=await real.locator('.tourism-map').boundingBox();assert.ok(a.x>=m.x-1&&a.x+a.width<=m.x+m.width+1)
  await real.locator('[data-map-idle="true"]').waitFor({timeout:45000});await real.screenshot({path:'docs/screenshots/phase03/live-jordan-desktop.png',fullPage:true})
 })
 await check('REAL map controls: zoom, drag, reset and keyboard navigation',async()=>{
  const before=Number(await real.locator('.map-canvas').getAttribute('data-map-zoom'));await real.getByRole('button',{name:'Zoom in',exact:true}).click();await real.waitForFunction(z=>Number(document.querySelector('.map-canvas').dataset.mapZoom)>z+.5,before)
  await real.getByRole('button',{name:'Enable map gestures',exact:true}).click();const canvas=real.locator('.maplibregl-canvas'),b=await canvas.boundingBox();const shot=await canvas.screenshot();await real.mouse.move(b.x+b.width*.5,b.y+b.height*.5);await real.mouse.down();await real.mouse.move(b.x+b.width*.5+70,b.y+b.height*.5+50,{steps:12});await real.mouse.up();assert.notDeepEqual(await canvas.screenshot(),shot)
  await canvas.focus();await real.keyboard.press('+');await real.getByRole('button',{name:'Reset Jordan view'}).click();await real.waitForFunction(z=>Math.abs(Number(document.querySelector('.map-canvas').dataset.mapZoom)-z)<.1,before)
 })
 await check('REAL provider: mobile rendering and sourced local demo popup at street zoom',async()=>{
  await real.setViewportSize({width:390,height:844});await real.goto(live+'/map');await ready(real);await real.locator('[data-map-idle="true"]').waitFor({timeout:45000});await real.screenshot({path:'docs/screenshots/phase03/live-jordan-mobile.png',fullPage:true})
  await real.setViewportSize({width:1440,height:900});await real.goto(demo+'/explore');await count(real,4);await ready(real)
  await setDestinationView(real,'List');await real.locator('.destination-card__map-select:not([disabled])').first().click();await real.locator('.tourism-popup').waitFor();await real.waitForFunction(()=>Number(document.querySelector('.map-canvas').dataset.mapZoom)>12)
  await real.waitForResponse(r=>r.url().includes('openfreemap')&&r.status()===200,{timeout:15000}).catch(()=>{})
  await real.locator('[data-map-idle="true"]').waitFor({timeout:45000});await real.screenshot({path:'docs/screenshots/phase03/demo-salt-streets-desktop.png',fullPage:true});assert.match(await real.locator('.tourism-popup').textContent(),/DEMONSTRATION LOCATION/)
  await real.setViewportSize({width:390,height:844});await setDestinationView(real,'List');await real.locator('.destination-card__map-select:not([disabled])').first().click();await real.locator('[data-map-idle="true"]').waitFor({timeout:45000});await real.screenshot({path:'docs/screenshots/phase03/demo-salt-streets-mobile.png',fullPage:true})
 });await real.close()
 }
 const p=await pageFor();await api(p,[...Array.from({length:7},(_,i)=>fixture(i)),fixture(7,null,null),fixture(8,200,35)])
 await check('SIMULATED published rows: all seven custom categories, invalid coordinates excluded',async()=>{
  await p.goto(live+'/explore');await count(p,9);await ready(p);assert.equal(await p.locator('.destination-marker').count(),7)
  assert.equal(await p.locator('.destination-card__map-select[disabled]').count(),2)
  const colors=await p.locator('.destination-marker').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundColor));assert.equal(new Set(colors).size,7)
  for(const b of await p.locator('.destination-marker').all()){const box=await b.boundingBox();assert.ok(box.width>=44&&box.height>=44)}
 })
 await check('SIMULATED card/marker synchronization, popup, keyboard escape and selection cleanup',async()=>{
  await p.locator('.destination-card__map-select').first().click();await p.locator('.tourism-popup').waitFor();await p.waitForFunction(()=>document.activeElement.classList.contains('maplibregl-popup-close-button'));assert.equal(await p.locator('.tourism-popup').evaluate(e=>e.scrollTop),0);assert.equal(await p.locator('.destination-card--selected').count(),1);assert.equal(await p.locator('.destination-marker[aria-pressed="true"]').count(),1)
  assert.match(await p.locator('.tourism-popup').textContent(),/Cost unavailable/);assert.equal(await p.locator('.tourism-popup img').count(),0)
  assert.match(await p.locator('.tourism-popup a').getAttribute('href'),/places\/fixture-0/)
  await p.keyboard.press('Escape');assert.equal(await p.locator('.tourism-popup').count(),0)
  await p.getByRole('button',{name:'Show Fixture Destination 0 on map',exact:true}).click();assert.equal(await p.locator('.destination-card--selected').count(),1)
  const zoom=await p.locator('.map-canvas').getAttribute('data-map-zoom');await p.getByRole('searchbox').fill('Destination 1');await count(p,1);assert.equal(await p.locator('.destination-marker').count(),1);assert.equal(await p.locator('.tourism-popup').count(),0);assert.equal(await p.locator('.map-canvas').getAttribute('data-map-zoom'),zoom)
  await p.getByRole('button',{name:'Clear search and filters',exact:true}).first().click();await count(p,9)
  await p.getByRole('button',{name:'Food',exact:true}).click();await count(p,1);assert.equal(await p.locator('.destination-marker').count(),1)
  await p.getByRole('button',{name:'Clear search and filters',exact:true}).first().click();await count(p,9)
 })
 await check('SIMULATED manual city, radius, nearest sorting, NULL exclusion and location clearing',async()=>{
  await nearPanel(p);await p.getByLabel('Manual city location').selectOption('amman');await p.getByLabel('Nearby search radius').selectOption('5');await count(p,2)
  assert.ok(await p.getByRole('img',{name:'Amman approximate city centre'}).count());assert.match(await p.locator('.destination-distance').first().textContent(),/straight-line from city centre/)
  const distances=await p.locator('.destination-distance').allTextContents();const ns=distances.map(s=>Number(s.match(/[\d.]+/)[0]));assert.deepEqual(ns,[...ns].sort((a,b)=>a-b))
  await p.getByLabel('Manual city location').selectOption('aqaba');await count(p,0);await p.getByRole('heading',{name:'No mapped destinations within this radius'}).waitFor()
  await p.getByRole('button',{name:'Clear location filtering'}).click();await count(p,9);await closePanel(p)
 })
 await check('SIMULATED supported-property filter and clear share the same marker/card list',async()=>{
  await p.locator('.attribute-filters summary').click();await p.getByLabel('City', {exact:true}).selectOption('Amman');await count(p,4);assert.equal(await p.locator('.destination-marker').count(),3)
  await p.locator('.attribute-filters summary').click();await p.getByRole('button',{name:'Clear search and filters',exact:true}).first().click();await count(p,9)
 })
 await p.close()
 const gps=await pageFor(true,{permissions:['geolocation'],geolocation:{latitude:31.95522,longitude:35.94503,accuracy:25}});await api(gps,[fixture(0)])
 await gps.addInitScript(()=>{window.geoCalls=0;const original=navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);navigator.geolocation.getCurrentPosition=(...args)=>{window.geoCalls++;return original(...args)};navigator.geolocation.watchPosition=()=>{throw Error('Continuous tracking forbidden')}})
 await check('EMULATED browser GPS granted: user action only, one-shot marker, no stored coordinates',async()=>{
  await gps.goto(live+'/explore');await ready(gps);assert.equal(await gps.evaluate(()=>window.geoCalls),0);await nearPanel(gps);await gps.getByRole('button',{name:'Use my location',exact:true}).click();await gps.getByRole('img',{name:'Your current GPS reading'}).waitFor();assert.equal(await gps.evaluate(()=>window.geoCalls),1)
  const stored=await gps.evaluate(()=>({local:localStorage.length,session:Object.entries(sessionStorage)}));assert.equal(stored.local,0);for(const [key,value] of stored.session){assert.ok(key.startsWith('unseen-jo-public-view-v1:'));const state=JSON.parse(value);assert.equal(state.camera??null,null);assert.equal(state.origin,undefined);assert.ok(!value.includes('31.95522')&&!value.includes('35.94503'));}await gps.getByRole('button',{name:'Clear location filtering'}).click();assert.equal(await gps.locator('.user-location').count(),0)
 });await gps.close()
 await check('SIMULATED pending GPS cancelled: late position cannot reactivate location',async()=>{
  const q=await pageFor();await q.addInitScript(()=>{Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition(success){window.finishGeo=()=>success({coords:{latitude:31.95522,longitude:35.94503,accuracy:25}})}}})});await q.goto(demo+'/explore');await count(q,4);await nearPanel(q);await q.getByRole('button',{name:'Use my location',exact:true}).click();await q.getByRole('button',{name:'Clear location filtering'}).click();await q.evaluate(()=>window.finishGeo());assert.equal(await q.locator('.user-location').count(),0);await count(q,4);await q.close()
 })
 for(const [name,code] of [['denied',1],['unavailable',2],['timeout',3],['unsupported',null]]){
  await check(`SIMULATED geolocation ${name}: clear error and manual fallback`,async()=>{
   const q=await pageFor();await q.addInitScript(code=>{Object.defineProperty(navigator,'geolocation',{configurable:true,value:code===null?undefined:{getCurrentPosition(_success,error){error({code})}}})},code)
   await q.goto(demo+'/explore');await count(q,4);await nearPanel(q);await q.getByRole('button',{name:'Use my location',exact:true}).click();await q.locator('.near-you__panel [role="alert"]').waitFor();assert.match(await q.locator('.near-you__panel [role="alert"]').textContent(),/city/);await q.getByLabel('Manual city location').selectOption('amman');await count(q,1);await q.close()
  })
 }
 const details=await pageFor()
 await check('DEMO details: sourced map/popup/directions and missing-location safeguard',async()=>{
  await details.goto(demo+'/places/salt-historic');await details.locator('.details-map').scrollIntoViewIfNeeded();await ready(details);assert.equal(await details.locator('.destination-marker').count(),1);await details.locator('.destination-marker').click();await details.locator('.tourism-popup').waitFor()
  const href=await details.getByRole('link',{name:/^Get Directions/}).getAttribute('href');assert.match(href,/destination=32\.042/);assert.ok(!href.includes('origin='))
  await details.goto(demo+'/places/ajloun-forest');assert.match(await details.getByRole('link',{name:/^Get Directions/}).getAttribute('href'),/destination=32\.3835625/);assert.equal(await details.locator('.details-map .tourism-map').count(),1)
 });await details.close()
 const cluster=await pageFor();await api(cluster,Array.from({length:65},(_,i)=>fixture(i,31.95+i*.0002,35.94+i*.0002)))
 await check('SIMULATED large catalog: clustering and expansion',async()=>{await cluster.goto(live+'/map');await ready(cluster);const c=cluster.getByRole('button',{name:/Zoom into .* destinations/}).first();await c.waitFor();const z=Number(await cluster.locator('.map-canvas').getAttribute('data-map-zoom'));await c.click();await cluster.waitForFunction(z=>Number(document.querySelector('.map-canvas').dataset.mapZoom)>z,z)});await cluster.close()
 const responsivePage=await pageFor(true,{hasTouch:true})
 await check('DEMO responsive/touch emulation: seven required viewports, route scale and popup bounds',async()=>{
  for(const [width,height]of [[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[375,812]]){
   await responsivePage.setViewportSize({width,height});await responsivePage.goto(demo+'/explore');await count(responsivePage,4);await ready(responsivePage);await setDestinationView(responsivePage,'List');await responsivePage.locator('.destination-card__map-select:not([disabled])').first().click();await responsivePage.locator('.tourism-popup').waitFor()
   const g=await responsivePage.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,header:document.querySelector('.site-header').getBoundingClientRect().height,h1:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)}));assert.equal(g.overflow,false);assert.equal(g.header,width>=768?60:104);assert.ok(g.h1<=44)
   const pop=await responsivePage.locator('.maplibregl-popup-content').boundingBox(),map=await responsivePage.locator('.tourism-map').boundingBox();assert.ok(pop.x>=map.x-1&&pop.x+pop.width<=map.x+map.width+1&&pop.y>=map.y-1&&pop.y+pop.height<=map.y+map.height+1,JSON.stringify({width,pop,map}));responsive.push(g)
   await responsivePage.locator('.tourism-popup').evaluate(e=>{e.scrollTop=e.scrollHeight});const close=await responsivePage.locator('.maplibregl-popup-close-button').boundingBox();assert.ok(close.y>=map.y&&close.y+close.height<=map.y+map.height,'close control stays outside scrolling popup content')
   if(width<=390){await responsivePage.keyboard.press('Escape');await responsivePage.locator('.attribute-filters summary').click();const panel=await responsivePage.locator('.attribute-filters .near-you__panel').boundingBox();assert.ok(panel.x>=0&&panel.x+panel.width<=width);await responsivePage.locator('.attribute-filters summary').click();await setDestinationView(responsivePage,'List');await responsivePage.locator('.destination-card__map-select:not([disabled])').first().click()}
   if(width===390)await responsivePage.screenshot({path:'docs/screenshots/phase03/demo-selected-mobile.png',fullPage:true})
  }
  await responsivePage.keyboard.press('Escape');await responsivePage.locator('.tourism-popup').waitFor({state:'hidden'});await responsivePage.locator('.map-toolstrip').waitFor({state:'visible'});await responsivePage.getByRole('button',{name:'Zoom in',exact:true}).tap();await responsivePage.getByRole('button',{name:'Enable map gestures'}).tap();assert.equal(await responsivePage.getByRole('button',{name:'Page scroll mode'}).getAttribute('aria-pressed'),'true')
  const before=await responsivePage.locator('.destination-marker').first().boundingBox(), box=await responsivePage.locator('.tourism-map').boundingBox();const cdp=await responsivePage.context().newCDPSession(responsivePage);const x=box.x+box.width*.5,y=Math.max(10,box.y+box.height*.4);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+60*i/8,y:y+30*i/8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await responsivePage.locator('[data-map-idle="true"]').waitFor();const after=await responsivePage.locator('.destination-marker').first().boundingBox();assert.ok(Math.abs(after.x-before.x)>15||Math.abs(after.y-before.y)>15,'touch drag changes marker screen position');await cdp.detach()
 });await responsivePage.close()
 const failure=await pageFor(false);let fail=true
 await failure.route('**/maps/unseen-nature.json',r=>r.fulfill(fail?{status:503,body:'Injected map outage'}:{status:200,contentType:'application/json',body:JSON.stringify({version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#f3e7d2'}}]})}))
 await check('SIMULATED provider outage: map error/retry without losing list',async()=>{await failure.goto(demo+'/explore');await count(failure,4);await failure.locator('.tourism-map').scrollIntoViewIfNeeded();await failure.getByRole('button',{name:'Retry map'}).waitFor();fail=false;await failure.getByRole('button',{name:'Retry map'}).click();await ready(failure);assert.equal(await failure.locator('.destination-card').count(),4)});await failure.close()
 assert.deepEqual(errors,[])
}finally{await writeFile('artifacts/phase03/browser-tests.json',JSON.stringify({checks,passed:checks.length,errors,responsive,realProviderResponses:responses,scope:'Real OpenFreeMap requests/rendering and actual published Supabase destinations; synthetic API rows/style fixtures/GPS explicitly labeled; no physical GPS accuracy claim.'},null,2)+'\n');await browser.close()}

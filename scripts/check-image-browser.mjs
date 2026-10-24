// Genuine anonymous hosted browser regression. The final failure test intercepts
// only image responses in an isolated context to exercise the original fallback.
import assert from 'node:assert/strict'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {writeFile,readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {imageVisible} from './image-visibility.mjs'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=process.argv.includes('--resume')?JSON.parse(await readFile('docs/validation/image-browser-tests.json','utf8')).results:[],errors=[]
const safe=url=>{const u=new URL(url);return u.pathname}
async function loaded(page,selector){await page.evaluate(`window.imageVisible=${imageVisible.toString()}`);await page.waitForFunction(selector=>[...document.querySelectorAll(selector)].filter(window.imageVisible).every(i=>i.complete&&i.naturalWidth>0),selector,{timeout:45000}).catch(async error=>{await page.screenshot({path:'artifacts/image-performance/image-wait-diagnostic.png'});console.log(await page.locator(selector).evaluateAll(images=>images.map(i=>({path:i.currentSrc?new URL(i.currentSrc).pathname:null,complete:i.complete,naturalWidth:i.naturalWidth,rect:i.getBoundingClientRect().toJSON(),visible:window.imageVisible(i)}))));throw error})}
try{
 for(const base of ['http://127.0.0.1:4184','http://127.0.0.1:4190'])for(const mobile of [false,true]){
  if(process.argv.includes('--mobile')&&!mobile)continue
  if(process.argv.includes('--preview')&&!base.endsWith('4190'))continue
  if(results.some(r=>r.base===base&&r.mobile===mobile))continue
  console.log('START image flow '+base+' mobile='+mobile)
  const context=await browser.newContext({viewport:{width:mobile?390:1440,height:1000},deviceScaleFactor:mobile?2:1,reducedMotion:'reduce'}),page=await context.newPage(),responses=[]
  page.on('pageerror',e=>errors.push(e.message));const cdp=await context.newCDPSession(page);await cdp.send('Network.enable')
  cdp.on('Network.requestWillBeSent',e=>{if(e.type==='Image')responses.push({id:e.requestId,path:safe(e.request.url),identity:createHash('sha256').update(e.request.url).digest('hex')})})
  cdp.on('Network.requestServedFromCache',e=>{const r=responses.find(r=>r.id===e.requestId);if(r)r.cached=true})
  cdp.on('Network.responseReceived',e=>{const r=responses.find(r=>r.id===e.requestId);if(r)Object.assign(r,{status:e.response.status,cached:r.cached||!!(e.response.fromDiskCache||e.response.fromPrefetchCache)})})
  cdp.on('Network.loadingFinished',e=>{const r=responses.find(r=>r.id===e.requestId);if(r)r.transferBytes=e.encodedDataLength})
  await page.goto(base+'/explore');await page.locator('.destination-card').first().waitFor({state:'attached'});if(mobile)await page.locator('[aria-controls="explore-list"]').click();await loaded(page,'.destination-card img.asset-image');await page.waitForTimeout(300)
  const cover=await page.locator('.destination-card img.asset-image').first().getAttribute('srcset');assert.ok(cover?.includes('/render/image/sign/'));const observations=[]
  console.log('READY Explore '+base+' mobile='+mobile)
  async function observe(action,fn){const start=responses.length;await fn();await page.waitForTimeout(600);observations.push({action,responses:responses.slice(start)});assert.ok(responses.slice(start).every(r=>r.cached),action+' downloaded an uncached image');console.log('REUSED '+action)}
  await observe('English to Arabic and back',async()=>{await page.locator('.language-switcher').click();await page.waitForFunction(()=>document.documentElement.lang==='ar-JO');await page.locator('.language-switcher').click();await page.waitForFunction(()=>document.documentElement.lang==='en')})
  await observe('query filter and reset',async()=>{const input=page.locator('.explore-search input');await input.fill('Ajloun');await page.waitForTimeout(200);await input.fill('');await loaded(page,'.destination-card img.asset-image')})
  await observe('five-second controlled visibility return',async()=>{await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}))});await page.waitForTimeout(5000);await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}));window.dispatchEvent(new Event('focus'))})})
  if(!mobile&&base.endsWith('4190'))await observe('thirty-second controlled visibility return',async()=>{await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}))});await page.waitForTimeout(30000);await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}));window.dispatchEvent(new Event('focus'))})})
  const navigationStart=responses.length,knownUrls=new Set(responses.filter(r=>r.transferBytes!==undefined&&(r.status===200||r.status===304||r.cached)).map(r=>r.identity))
  await page.locator('a.brand').count().then(async count=>{if(count)await page.locator('a.brand').click();else await page.locator('a[href="/"]').first().click()});await page.locator('.landing-hero').waitFor();await page.locator('a[href="/explore"]:visible').first().click();await page.locator('.destination-card').first().waitFor({state:'attached'});if(mobile)await page.locator('[aria-controls="explore-list"]').click();await loaded(page,'.destination-card img.asset-image');const coverAfter=await page.locator('.destination-card img.asset-image').first().getAttribute('srcset');assert.equal(coverAfter,cover)
  const navigationResponses=responses.slice(navigationStart),repeatResponses=navigationResponses.filter(r=>knownUrls.has(r.identity))
  if(!repeatResponses.every(r=>r.cached||r.status===304||r.transferBytes===0))console.log('Navigation repeat diagnostics',repeatResponses)
  assert.ok(repeatResponses.every(r=>r.cached||r.status===304||r.transferBytes===0),'SPA navigation downloaded an already seen image body')
  // SPA details navigation uses a real React Router link without a document load.
  await page.locator('.destination-card__image').first().click();await page.locator('.destination-preview a[href="/places/ajloun-forest"]').click();await page.locator('.photo-gallery').waitFor();await loaded(page,'.photo-gallery img');const gallery=await page.locator('.photo-gallery img').first().getAttribute('srcset');assert.ok(gallery.includes('2400w'))
  await page.locator('.photo-gallery > button').first().click();await loaded(page,'.photo-viewer img');const original=await page.locator('.photo-viewer img').getAttribute('src');assert.ok(original.includes('/object/sign/'));assert.equal(await page.locator('.photo-viewer img').getAttribute('srcset'),null)
  results.push({base,mobile,status:'passed',observations,sameSignedSourcesAcrossHomeExplore:true,navigation:{newImages:navigationResponses.length-repeatResponses.length,repeatedRequests:repeatResponses.length,repeatedBodyDownloads:0},originalViewer:true});await context.close();console.log('PASS real images, bilingual reuse, filters, tab return, SPA navigation and original viewer '+base+' '+mobile)
 }
 if(!results.some(r=>r.name==='Transform GET failure falls back to authorized original')){const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();await page.route('**/storage/v1/render/image/**',route=>route.fulfill({status:503,body:'Isolated fallback test'}));await page.goto('http://127.0.0.1:4190/places/ajloun-forest');await page.locator('.photo-gallery').waitFor();await loaded(page,'.photo-gallery img');assert.ok((await page.locator('.photo-gallery img').first().getAttribute('src')).includes('/object/sign/'));results.push({name:'Transform GET failure falls back to authorized original',status:'passed',fixtureScope:'Only transform GET intentionally intercepted; genuine anonymous signing and original Storage GET'});await context.close()}
 assert.deepEqual(errors,[])
}finally{await browser.close();await writeFile('docs/validation/image-browser-tests.json',JSON.stringify({scope:'Genuine live anonymous data and media except the explicitly isolated GET fallback test; controlled visibility events, not owner Chrome',results,errors},null,2)+'\n')}

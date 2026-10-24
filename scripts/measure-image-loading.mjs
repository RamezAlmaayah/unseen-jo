// Actual Chromium + live anonymous Supabase. No mocked API/Auth or content writes.
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {imageVisible} from './image-visibility.mjs'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
import {mkdir,writeFile,readFile} from 'node:fs/promises'
const phase=process.argv[2]||'before',results=process.argv.includes('--resume')?JSON.parse(await readFile(`docs/validation/image-loading-${phase}.json`,'utf8')).results:[],errors=[]
const devBase=process.env.QA_IMAGE_DEV||'http://127.0.0.1:4184',previewBase=process.env.QA_IMAGE_PREVIEW||'http://127.0.0.1:4190'
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']})
await mkdir('artifacts/image-performance',{recursive:true})
const safe=url=>{try{const u=new URL(url);return u.origin+u.pathname}catch{return url}}
async function run(base,mobile){
 for(const route of ['/','/explore','/places/ajloun-forest']){
  if(results.some(r=>r.base===base&&r.mobile===mobile&&r.route===route))continue
  const context=await browser.newContext({viewport:{width:mobile?390:1440,height:mobile?844:1000},deviceScaleFactor:mobile?2:1,isMobile:mobile,reducedMotion:'reduce'}),page=await context.newPage(),requests=[]
  page.on('pageerror',e=>errors.push(e.message));const cdp=await context.newCDPSession(page);await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:mobile?80:40,downloadThroughput:(mobile?4:10)*1024*1024/8,uploadThroughput:1024*1024})
  cdp.on('Network.responseReceived',e=>{if(e.type==='Image')requests.push({id:e.requestId,url:safe(e.response.url),status:e.response.status,cacheControl:e.response.headers['cache-control']||e.response.headers['Cache-Control'],fromDiskCache:!!e.response.fromDiskCache,mimeType:e.response.mimeType,timing:e.response.timing})})
  cdp.on('Network.loadingFinished',e=>{const r=requests.find(r=>r.id===e.requestId);if(r)r.transferBytes=e.encodedDataLength})
  await page.addInitScript(`window.imageVisible=${imageVisible.toString()}`)
  await page.addInitScript(()=>{window.imageMetrics={lcp:0,cls:0,imageCls:0};new PerformanceObserver(list=>{for(const e of list.getEntries()){window.imageMetrics.lcp=e.startTime;window.imageMetrics.lcpTag=e.element?.tagName;window.imageMetrics.lcpImage=e.url?new URL(e.url,location.href).pathname:null}}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput){window.imageMetrics.cls+=e.value;if(e.sources?.some(s=>s.node?.matches?.('img')||s.node?.closest?.('.photo-gallery,.destination-card__image,.landing-hero__artwork')))window.imageMetrics.imageCls+=e.value}}).observe({type:'layout-shift',buffered:true})})
  const started=Date.now();await page.goto(base+route,{waitUntil:'domcontentloaded'});await page.locator('h1').first().waitFor()
  if(route==='/explore'){await page.locator('.destination-card').first().waitFor({state:'attached'});if(mobile)await page.getByRole('button',{name:'List',exact:true}).click()}
  if(route.includes('/places/'))await page.locator('.photo-gallery').waitFor()
  let imageWaitTimedOut=false
  await page.waitForFunction(()=>[...document.images].filter(i=>i.getBoundingClientRect().width>100&&window.imageVisible(i)).every(i=>i.complete&&i.naturalWidth>0),{},{timeout:45000}).catch(()=>{imageWaitTimedOut=true})
  await page.waitForTimeout(600)
  const snapshot=await page.evaluate(async()=>({metrics:window.imageMetrics,images:await Promise.all([...document.images].filter(i=>i.getBoundingClientRect().width>100).map(async i=>{const r=i.getBoundingClientRect(),start=performance.now();if(i.complete&&i.naturalWidth)await i.decode().catch(()=>{});return {src:new URL(i.currentSrc||i.src,location.href).pathname,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,width:r.width,height:r.height,inViewport:window.imageVisible(i),complete:i.complete,decodeProbeMs:performance.now()-start,srcSet:!!i.srcset,loading:i.loading}})),resources:performance.getEntriesByType('resource').filter(e=>e.initiatorType==='img').map(e=>({path:new URL(e.name).pathname,durationMs:e.duration,transferSize:e.transferSize,encodedBodySize:e.encodedBodySize,responseStart:e.responseStart,startTime:e.startTime}))}))
  await page.screenshot({path:`artifacts/image-performance/${phase}-${base===devBase?'dev':'preview'}-${mobile?'mobile':'desktop'}-${route==='/'?'home':route==='/explore'?'explore':'details'}.png`})
  results.push({base,build:base===devBase?'development':'production-preview',mobile,route,imageWaitTimedOut,lcpStoppedByInteraction:mobile&&route==='/explore',network:{mbps:mobile?4:10,latencyMs:mobile?80:40},elapsedToVisibleImagesMs:Date.now()-started,...snapshot,requests})
  console.log(`${phase} ${base} ${mobile?'mobile':'desktop'} ${route}: LCP=${snapshot.metrics.lcp.toFixed(0)}ms images=${requests.reduce((n,r)=>n+(r.transferBytes||0),0)}bytes`)
  await context.close()
 }
}
try{for(const base of [devBase,previewBase])await Promise.all([run(base,false),run(base,true)])}finally{await browser.close();await writeFile(`docs/validation/image-loading-${phase}.json`,JSON.stringify({scope:'Real local Chromium; genuine hosted anonymous API, signed private Storage images and MapLibre; cold contexts; controlled network conditions, no fixtures',phase,results,errors},null,2)+'\n')}
if(errors.length)throw Error(errors.join('\n'))

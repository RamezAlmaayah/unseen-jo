// Controlled visibility returns in real Chromium. Headless targets do not hide
// on bringToFront in this environment; report that limit rather than fake it.
import {setup,browser,errors} from './localization-browser-fixtures.mjs'
import {mkdir,writeFile} from 'node:fs/promises'
const phase=process.argv[2]||'after',results=[]
await mkdir('docs/validation',{recursive:true})
async function run(base,language,scope){
 const {page:p,context}=await setup(1440,language,scope==='admin')
 const network=[];p.on('request',r=>network.push({url:r.url(),type:r.resourceType(),time:Date.now()}))
 const cdp=await context.newCDPSession(p);await cdp.send('Network.enable');let transferred=0;cdp.on('Network.loadingFinished',e=>transferred+=e.encodedDataLength)
 await p.addInitScript(()=>{window.returnRun=crypto.randomUUID();window.returnMetrics={skeletons:0,mapMounts:0};new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1){if(n.matches('.admin-skeleton')||n.querySelector('.admin-skeleton'))window.returnMetrics.skeletons++;window.returnMetrics.mapMounts+=Number(n.matches('.maplibregl-canvas'))+n.querySelectorAll('.maplibregl-canvas').length}}).observe(document,{childList:true,subtree:true})})
 try{
  await p.goto(base+(scope==='admin'?'/admin/translations':scope==='map'?'/map':'/explore'))
  if(scope==='admin'){await p.locator('#review-ar-name').waitFor();await p.locator('#review-ar-name').fill('UNSAVED PERFORMANCE CHECK')}
  else{await p.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000});await p.locator('.destination-marker').first().click();await p.locator('.tourism-popup').waitFor();await p.locator('.explore-search input').fill(language==='en'?'Ajloun':'عجلون');await p.locator('.destination-marker').first().click();await p.waitForTimeout(500)}
  const read=()=>p.evaluate(()=>({run:window.returnRun,metrics:{...window.returnMetrics},scroll:scrollY,query:document.querySelector('.explore-search input')?.value,name:document.querySelector('#review-ar-name')?.value,zoom:document.querySelector('.map-canvas')?.dataset.mapZoom,selected:document.querySelector('.destination-marker[aria-pressed="true"]')?.dataset.placeId,language:document.documentElement.lang}))
  const steps=[]
  for(const seconds of [5,30]){
   const before=await read(),start=network.length,bytes=transferred
   await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}))})
   await new Promise(resolve=>setTimeout(resolve,seconds*1000))
   const returnedAt=Date.now();await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}));window.dispatchEvent(new Event('focus'))})
   await p.waitForFunction(()=>document.querySelector('.admin-workspace')||document.querySelector('.explore-page'))
   // Wait for the finite return requests to settle, without relying on map tiles' networkidle.
   await p.waitForTimeout(800);const after=await read(),requests=network.slice(start)
   steps.push({seconds,before,after,documentReloaded:before.run!==after.run,supabaseRequests:requests.filter(r=>r.url.includes('.supabase.co/')).map(r=>new URL(r.url).pathname),documentRequests:requests.filter(r=>r.type==='document').length,imageRequests:requests.filter(r=>r.type==='image').length,mapTileRequests:requests.filter(r=>/\.(pbf|mvt)(\?|$)/.test(r.url)).length,transferredBytes:transferred-bytes,lastRequestAfterReturnMs:requests.length?Math.max(0,...requests.map(r=>r.time-returnedAt)):0,observationWindowMs:Date.now()-returnedAt})
  }
  results.push({base,language,scope,visibilityMode:'Controlled standard visibilitychange/focus events in actual Chromium; not an attached user Chrome tab',steps});console.log(`PASS observed ${phase} ${base} ${language} ${scope}: `+steps.map(s=>`${s.seconds}s API=${s.supabaseRequests.length} skeletons=${s.after.metrics.skeletons-s.before.metrics.skeletons} retained=${scope==='admin'?s.after.name===s.before.name:s.after.selected===s.before.selected}`).join('; '))
 }finally{await context.close()}
}
try{
 // Two contexts at a time avoid exhausting software WebGL resources when
 // running beside other browser checks. API/visibility fixtures are unchanged.
 for(const scope of ['explore','map','admin'])for(const base of ['http://127.0.0.1:4184','http://127.0.0.1:4190'])await Promise.all(['en','ar-JO'].map(lang=>run(base,lang,scope)))
 await writeFile(`docs/validation/tab-performance-${phase}.json`,JSON.stringify({phase,scope:'Real local browser renders with synthetic Auth/API responses. MapLibre and provider tiles are real; no hosted content writes.',results,errors},null,2)+'\n')
}finally{await browser.close()}

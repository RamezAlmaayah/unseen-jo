import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=[]
try{
 for(const port of [4184,4190])for(const lang of ['en','ar-JO'])for(const width of [1366,390]){
  const c=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),p=await c.newPage(),requests=[],errors=[]
  await c.addInitScript(l=>localStorage.setItem('unseen-jo-language',l),lang)
  p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(r.url().includes('/rest/v1/places'))requests.push(r.url())})
  await p.goto(`http://127.0.0.1:${port}/map`);await p.locator('.destination-card').first().waitFor({state:'attached'});await p.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000})
  const initial=requests.length,input=p.locator('#destination-search');await input.fill('وادي الموجب')
  await p.waitForFunction(()=>document.querySelectorAll('.destination-card').length===1&&document.querySelectorAll('.destination-marker').length===1)
  assert.ok((await p.locator('.destination-card a').first().getAttribute('href')).includes('wadi-mujib'))
  await p.locator('.map-view-jumps button').first().click();await p.waitForFunction(()=>document.querySelector('.explore-page').dataset.view==='list');assert.equal(await input.inputValue(),'وادي الموجب')
  await p.locator('.map-view-jumps button').last().click();await p.waitForFunction(()=>document.querySelector('.explore-page').dataset.view==='map');assert.equal(await input.inputValue(),'وادي الموجب')
  await input.fill('no-such-map-destination');await p.waitForFunction(()=>document.querySelectorAll('.destination-card').length===0&&document.querySelectorAll('.destination-marker').length===0)
  await p.locator('.explore-search button').first().click();await p.waitForFunction(()=>document.querySelectorAll('.destination-card').length===6&&document.querySelectorAll('.destination-marker').length===6)
  assert.equal(requests.length,initial);assert.deepEqual(errors,[]);results.push({port,lang,width,status:'passed',initialCatalogRequests:initial,additionalCatalogRequestsDuringSearchAndViewChanges:requests.length-initial});console.log(`PASS LIVE /map search, view synchronization, clear and cached reads ${port} ${lang} ${width}`);await c.close()
 }
}finally{await browser.close();await writeFile('docs/validation/search-map.json',JSON.stringify({scope:'Actual anonymous published Supabase data, no intercepted requests or writes',results},null,2)+'\n')}

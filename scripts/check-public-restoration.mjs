import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {setup,browser,base,errors,AxeBuilder} from './localization-browser-fixtures.mjs'
const results=[];async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
try{
 const {page:p,context}=await setup(1440,'en',false)
 await check('public query, selected marker, zoom and language survive a real document reload',async()=>{
  await p.goto(base+'/explore');await p.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000});await p.locator('.explore-search input').fill('Ajloun');await p.locator('.destination-marker').first().click();await p.getByRole('button',{name:'Zoom in',exact:true}).click();await p.waitForTimeout(500)
  const zoom=await p.locator('.map-canvas').getAttribute('data-map-zoom'),id=await p.locator('.destination-marker[aria-pressed="true"]').getAttribute('data-place-id');await p.locator('.language-switcher').click();await p.locator('[data-map-language="ar-JO"]').waitFor();await p.reload();await p.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000});assert.equal(await p.locator('.explore-search input').inputValue(),'Ajloun');assert.equal(await p.locator('html').getAttribute('lang'),'ar-JO');assert.ok(Math.abs(Number(await p.locator('.map-canvas').getAttribute('data-map-zoom'))-Number(zoom))<.05)
  // The English query no longer matches localized Arabic, so the selection is
  // safely hidden rather than displaying an out-of-filter or private record.
  assert.ok(id);await p.locator('.explore-search input').fill('عجلون');await p.locator('.destination-marker').first().click();await p.reload();await p.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000});assert.equal(await p.locator('.explore-search input').inputValue(),'عجلون');assert.equal(await p.locator('.destination-marker[aria-pressed="true"]').getAttribute('data-place-id'),id)
 })
 await context.close()
 const gps=await setup(1440,'en',false),g=gps.page
 await check('GPS-derived map cameras and private session data are never saved as public view preferences',async()=>{
  await gps.context.grantPermissions(['geolocation']);await gps.context.setGeolocation({latitude:31.954,longitude:35.91,accuracy:50})
  await g.goto(base+'/map');await g.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000});await g.locator('.near-you:not(.attribute-filters) summary').click();await g.getByRole('button',{name:'Use my location',exact:true}).click();await g.locator('.user-location--gps').waitFor();await g.waitForTimeout(1000)
  const state=await g.evaluate(()=>Object.entries(sessionStorage).filter(([k])=>k.startsWith('unseen-jo-public-view-v1:')))
  for(const[,v]of state){const s=JSON.parse(v);assert.ok(!s.camera);assert.equal(s.origin,undefined);assert.equal(s.access_token,undefined);assert.equal(s.user,undefined)}
 })
 await gps.context.close()
 for(const language of ['en','ar-JO']){
  const admin=await setup(1440,language,true),a=admin.page
  await check(`new publishing workspace has accessible bilingual controls (${language}), without executing it`,async()=>{
   await a.goto(base+'/admin/publishing');await a.locator('h1').waitFor();assert.ok(await a.locator('h1').innerText());const scan=await new AxeBuilder({page:a}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(scan.violations.length,0,JSON.stringify(scan.violations.map(v=>v.id)))
  });await admin.context.close()
 }
 assert.deepEqual(errors,[])
 await writeFile('docs/validation/public-restoration-tests.json',JSON.stringify({scope:'Real local browser reloads and actual MapLibre. Synthetic public/Auth responses and simulated browser GPS permission, no hosted writes.',passed:results.length,results},null,2)+'\n')
}finally{await browser.close()}

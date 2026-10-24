import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {setup,browser,base,rows,AxeBuilder,errors} from './localization-browser-fixtures.mjs'
const results=[];await mkdir('docs/screenshots/phase14',{recursive:true})
const routes=['/','/explore','/map','/surprise-me','/places/'+rows[0].slug,'/auth?mode=login','/auth?mode=register','/auth?mode=recovery','/auth/callback?error=access_denied','/my-discoveries','/profile','/admin/login','/admin','/privacy-policy','/terms-of-service','/not-a-real-page']
try{
 for(const language of ['en','ar-JO'])for(const width of [1366,390]){
  const {page,context}=await setup(width,language,false);await page.setViewportSize({width,height:900})
  for(const route of routes){try{
   await page.goto(base+route);await page.locator('h1').first().waitFor({timeout:15000});await page.waitForTimeout(350);await page.evaluate(()=>document.fonts.ready)
   assert.equal(await page.locator('html').getAttribute('dir'),language==='ar-JO'?'rtl':'ltr');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow')
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();const violations=axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))
   let map='not applicable';if(route==='/map'){try{await page.locator('.maplibregl-canvas').waitFor({timeout:15000});map='MapLibre canvas rendered'}catch{map='Map canvas not verified'}}
   results.push({language,width,route,finalPath:new URL(page.url()).pathname,status:violations.length?'FAIL':'PASS',violations,map})
   if(['/','/explore','/map','/auth?mode=register'].includes(route))await page.screenshot({path:`docs/screenshots/phase14/${route.replace(/[^a-z]/gi,'')||'home'}-${language}-${width}.png`,fullPage:false})
  }catch(e){results.push({language,width,route,status:'FAIL',reason:e.message.slice(0,300)})}}
  await context.close()
 }
}finally{await browser.close();await writeFile('docs/validation/phase14-browser.json',JSON.stringify({scope:'Real built React UI and Chromium; API fixtures; external map resources may load. No genuine user writes.',results,errors},null,2));console.log('Phase 14 routes: '+results.filter(r=>r.status==='PASS').length+' passed / '+results.length+'; '+errors.length+' browser errors');if(results.some(r=>r.status==='FAIL')||errors.length)process.exitCode=1}

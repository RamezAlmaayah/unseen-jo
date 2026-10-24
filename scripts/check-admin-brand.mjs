import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {fixture,browser,errors,AxeBuilder} from './admin-progressive-fixture.mjs'
import ar from '../src/i18n/locales/ar-JO.json' with {type:'json'}
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4190',results=[]
await mkdir('artifacts/admin-brand',{recursive:true})
const appearance=logo=>logo.evaluate(e=>{const img=e.querySelector('img'),word=e.querySelector('span'),s=getComputedStyle(word),r=img.getBoundingClientRect();return {asset:new URL(img.src).pathname,word:word.textContent,font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,lineHeight:s.lineHeight,color:s.color,imageWidth:r.width,imageHeight:r.height,direction:getComputedStyle(e).direction}})
try{
 for(const language of ['en','ar-JO'])for(const width of [1440,820,390]){
  const label=s=>language==='en'?s:ar[s]||s,{context,page,writes}=await fixture(width,language)
  await page.goto(base+'/');const publicLogo=page.locator('.site-header .brand');await publicLogo.waitFor();await publicLogo.locator('img').evaluate(img=>img.decode());await page.evaluate(()=>document.fonts.ready)
  const official=await appearance(publicLogo);await publicLogo.screenshot({path:`artifacts/admin-brand/public-${language}-${width}.png`})
  await page.goto(base+'/admin/places');await page.locator('.admin-workspace h1').waitFor()
  if(width<=760)await page.getByRole('button',{name:label('Open navigation'),exact:true}).click()
  const logo=page.locator('.admin-sidebar-brand');await logo.waitFor();await logo.locator('img').evaluate(img=>img.decode());await page.evaluate(()=>document.fonts.ready)
  assert.deepEqual(await appearance(logo),official,'Admin uses identical public symbol, wordmark typography and dimensions')
  assert.equal(await logo.getAttribute('href'),'/admin');assert.ok((await logo.getAttribute('aria-label')).includes(label('Overview')))
  assert.equal(await page.locator('.admin-brand-symbol').count(),0)
  assert.equal(await logo.locator('span').isVisible(),width>1000||width<=760)
  const box=await logo.boundingBox(),side=await page.locator('.admin-sidebar').boundingBox();assert.ok(box.x>=side.x&&box.x+box.width<=side.x+side.width+1)
  await page.screenshot({path:`artifacts/admin-brand/admin-${language}-${width}.png`})
  if(width>1000){
   await page.getByRole('button',{name:label('Collapse sidebar'),exact:true}).click();await page.waitForTimeout(250)
   assert.equal(await logo.locator('span').isVisible(),false);assert.equal((await logo.locator('img').boundingBox()).width,official.imageWidth)
   await page.screenshot({path:`artifacts/admin-brand/collapsed-${language}-${width}.png`})
   await page.getByRole('button',{name:label('Expand sidebar'),exact:true}).click();assert.equal(await logo.locator('span').isVisible(),true)
  }
  await page.keyboard.press('Tab');await logo.focus();assert.equal(await logo.evaluate(e=>document.activeElement===e),true);assert.notEqual(await logo.evaluate(e=>getComputedStyle(e).outlineStyle),'none')
  await logo.press('Enter');await page.waitForURL(base+'/admin');await page.locator('.admin-kpi').first().waitFor()
  if(width<=760){assert.equal(await page.locator('.admin-sidebar').getAttribute('aria-hidden'),'true');await page.getByRole('button',{name:label('Open navigation'),exact:true}).click()}
  await page.mouse.move(width-2,998)
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(scan.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[])
  assert.equal(writes.length,0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2))
  results.push({language,width,official,states:width>1000?'expanded, collapsed':width<=760?'mobile drawer':'automatic compact',keyboardNavigation:true,a11yViolations:0,status:'passed'});console.log(`PASS shared public/Admin logo ${language} ${width}`);await context.close()
 }
 assert.deepEqual(errors,[])
}catch(error){errors.push(error.message);throw error}finally{await browser.close();await writeFile('docs/validation/admin-brand.json',JSON.stringify({scope:'Actual production app and Chromium; intercepted authenticated Admin fixtures, no hosted writes or real owner session.',results,errors},null,2)+'\n')}

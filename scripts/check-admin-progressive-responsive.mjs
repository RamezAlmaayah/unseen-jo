import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {fixture,browser,errors,AxeBuilder} from './admin-progressive-fixture.mjs'
const results=[]
try{
 for(const [language,width] of [['en',820],['ar-JO',820],['en',390],['ar-JO',1440]]){
  const {context,page}=await fixture(width,language)
  for(const section of ['','places','media']){await page.goto('http://127.0.0.1:4190/admin'+(section?'/'+section:''));await page.locator('.admin-workspace h1').waitFor();await page.waitForTimeout(300);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(scan.violations.map(v=>({id:v.id,impact:v.impact})),[]);await page.screenshot({path:`artifacts/admin-progressive/responsive-${language}-${width}-${section||'overview'}.png`});results.push({language,width,section:section||'overview',status:'passed'})}await context.close()
 }
 // Controlled observer fixture: prove keyboard activation does not rely on a
 // physical scroll event, independently of the real-observer scroll tests.
 const {context,page}=await fixture();await page.addInitScript(()=>{window.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}}});await page.goto('http://127.0.0.1:4190/admin');await page.locator('.admin-kpi').first().waitFor();const host=page.locator('.admin-deferred-charts');assert.equal(await host.getAttribute('data-deferred'),'waiting');const button=host.getByRole('button');await button.focus();await button.press('Enter');assert.equal(await host.getAttribute('data-deferred'),'active');assert.equal(await host.evaluate(e=>e===document.activeElement),true);results.push({kind:'keyboard activation independent of observer, preserves focus',status:'passed'});await context.close();assert.deepEqual(errors,[])
}finally{await browser.close();await writeFile('docs/validation/admin-progressive-responsive.json',JSON.stringify({scope:'Synthetic authenticated fixtures, real Chromium/axe responsive checks; separate controlled observer for keyboard fallback',results,errors},null,2)+'\n')}

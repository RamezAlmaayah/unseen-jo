import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {setup,browser,base,rows,AxeBuilder,errors} from './localization-browser-fixtures.mjs'
const results=[]
try{
 for(const language of ['en','ar-JO'])for(const width of [1366,390]){
  const {page,context}=await setup(width,language,true)
  await page.route('**/rest/v1/place_categories*',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(rows.flatMap(p=>p.place_categories.map(c=>({place_id:p.id,category_id:c.category_id}))))}))
  await page.route('**/rest/v1/rpc/admin_overview',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({total:6,published:0,draft:6,archived:0,categories:4,review:6,coordinates:0,covers:6,recent:[]})}))
  await page.goto(base+'/admin');await page.locator('.admin-kpi').first().waitFor();assert.equal(await page.locator('.admin-kpi').count(),8)
  await page.locator('.admin-deferred-charts').scrollIntoViewIfNeeded();await page.locator('.admin-chart-panel').first().waitFor({timeout:20000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(scan.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[])
  await page.screenshot({path:`docs/screenshots/phase14/admin-${language}-${width}.png`,fullPage:false});results.push({language,width,status:'PASS',scope:'Authenticated Admin fixture; dashboard metrics/charts, responsive and axe; no hosted mutation'});await context.close()
 }
 assert.deepEqual(errors,[]);console.log('PASS modern Admin Dashboard: four bilingual desktop/mobile metrics/charts/accessibility groups')
}finally{await browser.close();await writeFile('docs/validation/phase14-admin-browser.json',JSON.stringify({results,errors},null,2))}

// Actual local React rendering, isolated API/Auth fixtures. No real account credentials.
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {setup,browser,rows,base,errors,AxeBuilder} from './localization-browser-fixtures.mjs'
import {reviewText} from '../src/features/admin/translationReviewModel.js'
const results=[],scans=[],requests=[]
async function check(name,fn){try{await fn();results.push({name,status:'passed'});console.log('PASS '+name)}catch(e){console.error('FAIL '+name);console.error('Page errors: '+JSON.stringify(errors));throw e}}
await mkdir('docs/screenshots/bilingual-review',{recursive:true})
try{
for(const lang of (process.env.REVIEW_INTERACTIONS_ONLY?[]:['en','ar-JO']))for(const width of [1440,820,390]){
 const {page,context}=await setup(width,lang,true)
 await check(`${lang} review queue, side-by-side source pairs, RTL and accessibility at ${width}px`,async()=>{
  await page.goto(base+'/admin/translations');await page.locator('.review-destinations button').nth(5).waitFor()
  assert.equal(await page.locator('.review-destinations button').count(),6)
  assert.equal(await page.locator('.review-pair').count(),7)
  assert.equal(await page.locator('.review-source input,.review-source textarea').count(),0)
  assert.equal(await page.locator('html').getAttribute('dir'),lang==='ar-JO'?'rtl':'ltr')
  assert.equal(await page.locator('.review-source').first().getAttribute('dir'),'ltr')
  assert.equal(await page.locator('.review-arabic').first().getAttribute('dir'),'rtl')
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2))
  await page.evaluate(()=>document.fonts.ready)
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();scans.push({lang,width,violations:scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});assert.equal(scan.violations.length,0,JSON.stringify(scans.at(-1)))
  await page.screenshot({path:`docs/screenshots/bilingual-review/${lang}-${width}.png`,fullPage:true})
 })
 await context.close()
}
const {page:p,context}=await setup(1440,'en',true),catalog=structuredClone(rows)
globalThis.debugReviewPage=p
let conflict=false
await p.route('**/rest/v1/places?**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(catalog)}))
await p.route('**/rest/v1/place_translations?**',async route=>{
 const req=route.request(),url=new URL(req.url()),id=url.searchParams.get('place_id')?.replace('eq.',''),place=catalog.find(p=>p.id===id),body=req.postDataJSON();requests.push({method:req.method(),path:url.pathname,body,version:url.searchParams.get('updated_at')})
 if(conflict)return route.fulfill({status:200,contentType:'application/json',body:'[]'})
 const old=place.place_translations[0],changed=Object.keys(body).some(k=>!['editorial_status','review_notes'].includes(k)&&body[k]!==old[k])
 const row={...old,...body,updated_at:new Date().toISOString()}
 if(changed){row.editorial_status='pending';row.reviewed_at=null;row.reviewed_by=null}
 place.place_translations=[row]
 return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([row])})
})
await p.goto(base+'/admin/translations');await p.locator('.review-destinations button').nth(5).waitFor()
await check('all six exact Arabic and English descriptions, location facts, source links and verification cautions render',async()=>{
 for(const row of catalog){await p.locator('.review-destinations button').filter({hasText:row.name}).click();assert.equal(await p.locator('#review-ar-description').inputValue(),reviewText(row.place_translations[0].description));assert.equal(await p.locator('.review-source').nth(1).locator('p').innerText(),reviewText(row.description));assert.ok((await p.locator('.review-evidence-grid').innerText()).includes(String(row.latitude)));assert.ok(await p.locator('.review-sources a').count()>0);assert.ok(await p.locator('.review-outstanding li').count()>1);assert.ok(await p.locator('.review-flags li').count()>0)}
})
await check('Arabic edits survive dashboard language switching and dirty destination navigation can be cancelled',async()=>{
 await p.locator('#review-ar-name').fill('اسم عربي غير محفوظ');await p.locator('.language-switcher').click();assert.equal(await p.locator('#review-ar-name').inputValue(),'اسم عربي غير محفوظ');await p.locator('.review-destinations button').first().click();await p.getByRole('dialog').waitFor();await p.getByRole('dialog').getByRole('button',{name:'إلغاء',exact:true}).click();assert.equal(await p.locator('#review-ar-name').inputValue(),'اسم عربي غير محفوظ');assert.equal(requests.length,0);await p.locator('.language-switcher').click()
})
await check('Arabic save updates only translation allowlisted fields with version protection',async()=>{
 await p.getByRole('button',{name:'Save Arabic independently',exact:true}).click();await p.locator('.review-result').waitFor();assert.equal(requests.length,1);assert.equal(requests[0].body.name,'اسم عربي غير محفوظ');assert.equal(requests[0].body.status,undefined);assert.equal(requests[0].body.approved_at,undefined);assert.equal(requests[0].body.editorial_status,'pending');assert.ok(requests[0].version.startsWith('eq.'));assert.equal(await p.locator('.review-source').first().locator('p').innerText(),catalog.at(-1).name)
})
await check('Needs Changes saves feedback, survives reload, and can return to Pending without approval',async()=>{
 await p.getByLabel('Reviewer note · required for Needs Changes',{exact:true}).fill('Compare the visitor cautions with the dated source.');await p.getByRole('button',{name:'Mark Needs Changes',exact:true}).click();await p.getByText('Translation feedback saved. No approval or publication was performed.',{exact:true}).waitFor();assert.equal(requests.at(-1).body.editorial_status,'needs_changes');await p.reload();await p.locator('.review-destinations button').nth(5).waitFor();await p.locator('.review-destinations button').last().click();assert.equal(await p.getByLabel('Reviewer note · required for Needs Changes',{exact:true}).inputValue(),'Compare the visitor cautions with the dated source.');await p.getByRole('button',{name:'Return to Pending Review',exact:true}).click();await p.getByText('Translation returned to Pending Review.',{exact:true}).waitFor();assert.equal(requests.at(-1).body.editorial_status,'pending');assert.ok(requests.every(r=>r.body.editorial_status!=='reviewed'))
})
await check('approval requires deliberate confirmation and cancelling makes no write',async()=>{
 const n=requests.length;await p.getByRole('button',{name:'Approve saved translation',exact:true}).click();await p.getByRole('dialog').waitFor();assert.ok((await p.getByRole('dialog').innerText()).includes('does not publish'));await p.getByRole('dialog').getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(requests.length,n)
})
await check('save conflict is visible and preserves unsaved Arabic',async()=>{
 conflict=true;await p.locator('#review-ar-name').fill('تعديل متعارض');await p.getByRole('button',{name:'Save Arabic independently',exact:true}).click();await p.getByRole('alert').waitFor();assert.ok((await p.getByRole('alert').innerText()).includes('Translation changed'));assert.equal(await p.locator('#review-ar-name').inputValue(),'تعديل متعارض')
})
await context.close()
assert.deepEqual(errors,[])
await writeFile('docs/validation/bilingual-review-browser.json',JSON.stringify({scope:'Local React and real browser rendering; synthetic Auth and isolated API state; zero hosted writes or approvals',passed:results.length,results,scans,requests},null,2)+'\n')
}catch(e){if(globalThis.debugReviewPage){console.error((await globalThis.debugReviewPage.locator('body').innerText()).slice(-3000));await globalThis.debugReviewPage.screenshot({path:'docs/screenshots/bilingual-review/failure.png',fullPage:true})}await writeFile('docs/validation/bilingual-review-browser-failure.json',JSON.stringify({results,errors,error:e.message},null,2));throw e}finally{await browser.close()}

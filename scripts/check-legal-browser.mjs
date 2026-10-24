// Production app in Chromium with isolated API fixtures; never writes to hosted Supabase.
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {setup,browser,base,errors,AxeBuilder} from './localization-browser-fixtures.mjs'
import {LEGAL_OPERATOR,privacySections,termsSections} from '../src/features/legal/content.js'
import {legalCopy} from '../src/features/legal/ui.js'
import {routeSeo} from '../src/seo/model.js'
const results=[]
await mkdir('docs/screenshots/legal',{recursive:true})
for(const list of [privacySections,termsSections]){assert.equal(new Set(list.map(s=>s.id)).size,list.length);for(const s of list){assert.equal(s.en.paragraphs.length,s.ar.paragraphs.length);assert.ok(s.ar.paragraphs.every(p=>/[\u0600-\u06ff]/.test(p)))}}
try{
 for(const language of ['en','ar-JO'])for(const width of [1366,768,390,320]){
  const {context,page}=await setup(width,language,false),ar=language==='ar-JO',c=legalCopy[ar?'ar':'en']
  for(const [path,key,list] of [['privacy-policy','privacy',privacySections],['terms-of-service','terms',termsSections]]){
   const response=await page.goto(`${base}/${path}`);assert.equal(response.status(),200);await page.locator('.legal-document').waitFor();await page.evaluate(()=>document.fonts.ready)
   assert.equal(await page.locator('h1').innerText(),c[key]);assert.equal(await page.locator('html').getAttribute('dir'),ar?'rtl':'ltr');assert.equal(await page.locator('html').getAttribute('lang'),language)
   assert.equal(await page.locator('.legal-document section').count(),list.length);assert.equal(await page.locator('.legal-toc a').count(),list.length)
   assert.equal(await page.locator('.legal-review-note,.legal-date span').count(),0)
   assert.doesNotMatch(await page.locator('.legal-page').innerText(),/\bdraft\b|owner.{0,10}review|legal review|required approval|lawyer.{0,20}approved|مسودة|مراجعة المالك|المراجعة القانونية/i)
   assert.ok((await page.locator('.legal-document').innerText()).includes(LEGAL_OPERATOR.name))
   const contacts=page.locator('.legal-document a[href^="mailto:"]');assert.ok(await contacts.count()>0)
   for(const contact of await contacts.all()){assert.equal(await contact.getAttribute('href'),'mailto:'+LEGAL_OPERATOR.email);assert.equal(await contact.innerText(),LEGAL_OPERATOR.email);assert.equal(await contact.locator('bdi').getAttribute('dir'),'ltr')}
   assert.ok(await page.locator('.legal-document bdi[dir="ltr"]').filter({hasText:LEGAL_OPERATOR.name}).count()>0)
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
   await page.waitForFunction(title=>document.title===title,`${c[key]} | Unseen Jo`)
   assert.equal(await page.locator('meta[name="description"]').count(),1);assert.equal(await page.locator('meta[name="robots"]').count(),1);assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/^index,/)
   const seo=routeSeo('/'+path,language,{},'https://travel.example.org');assert.equal(seo.canonical,'https://travel.example.org/'+path);assert.equal(routeSeo('/'+path,language).canonical,'')
   await page.locator(`.legal-toc a[href$="#${list[2].id}"]`).focus();await page.keyboard.press('Enter');await page.waitForFunction(id=>document.activeElement?.id===id,list[2].id)
   assert.equal(await page.locator('footer a[href="/privacy-policy"]').count(),1);assert.equal(await page.locator('footer a[href="/terms-of-service"]').count(),1)
   const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[])
   if(width===1366||width===390)await page.screenshot({path:`docs/screenshots/legal/${path}-${language}-${width}.png`,fullPage:true})
   results.push({path,language,width,anchors:'keyboard passed',seo:'passed',accessibility:'zero WCAG A/AA violations',overflow:false})
  }
  await page.goto(base+'/auth?mode=register');await page.locator('input[name="name"]').fill('Legal Review');await page.locator('input[name="email"]').fill('fixture@example.invalid')
  for(const path of ['privacy-policy','terms-of-service']){
   const link=page.locator(`form .legal-links a[href="/${path}"]`);await link.waitFor();assert.equal(await link.getAttribute('target'),'_blank');assert.equal(await page.evaluate(path=>{const a=document.querySelector(`form .legal-links a[href="/${path}"]`),b=document.querySelector('form button[type="submit"]');return !!(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING)},path),true)
  }
  const popupPromise=page.waitForEvent('popup');await page.locator('form .legal-links a[href="/terms-of-service"]').click();const popup=await popupPromise;await popup.locator('h1').waitFor();await popup.close();assert.equal(await page.locator('input[name="name"]').inputValue(),'Legal Review');assert.equal(await page.locator('input[name="email"]').inputValue(),'fixture@example.invalid')
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[])
  await page.goto(base+'/privacy-policy');await page.locator('.legal-page').waitFor();await page.locator('.language-switcher').click();await page.getByRole('heading',{name:ar?'Privacy Policy':'سياسة الخصوصية',exact:true}).waitFor();assert.equal(await page.locator('.legal-document section').count(),privacySections.length)
  results.push({language,width,registrationLinks:'before submit; new-tab content; form preserved',languageSwitch:'passed',registrationAccessibility:'passed'})
  await context.close()
 }
 assert.deepEqual(errors,[]);console.log(`PASS legal pages: ${results.length} route/layout/auth groups; paired paragraphs; English/Arabic, keyboard anchors, language switch, responsive, metadata and axe`)
}finally{await browser.close();await writeFile('docs/validation/legal-browser.json',JSON.stringify({base,scope:'Production Chromium; fixture APIs; no live account or email tests',results,errors},null,2)+'\n')}

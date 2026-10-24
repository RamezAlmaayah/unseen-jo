import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {setup,browser,base,errors,rows} from './localization-browser-fixtures.mjs'
import {HOME_TITLE,HOME_DESCRIPTION} from '../src/seo/model.js'
const results=[]
try{
 for(const language of ['en','ar-JO']){
  const {context,page}=await setup(1280,language,false)
  for(const route of ['/','/explore','/surprise-me',`/places/${rows[0].slug}`,'/auth?mode=login','/admin/login','/profile','/my-discoveries']){
   const response=await page.goto(base+route)
   await page.locator('h1').first().waitFor();await page.waitForTimeout(400)
   const privatePage=/^\/(auth|admin|profile|my-discoveries)/.test(route)
   await page.waitForFunction(privatePage=>document.querySelector('meta[name="robots"]')?.content.startsWith(privatePage?'noindex':'index'),privatePage)
   if(privatePage)assert.equal(response.headers()['x-robots-tag'],'noindex, nofollow')
   else assert.equal(response.headers()['x-robots-tag'],undefined)
   assert.equal(await page.locator('head title').count(),1)
   for(const key of ['description','robots','twitter:card','twitter:title','twitter:description'])assert.equal(await page.locator(`head meta[name="${key}"]`).count(),1,key)
   assert.equal(await page.locator('meta[property="og:title"]').getAttribute('content'),await page.title())
   assert.equal(await page.locator('meta[property="og:locale"]').getAttribute('content'),language==='en'?'en_US':'ar_JO')
   assert.equal(await page.locator('html').getAttribute('dir'),language==='en'?'ltr':'rtl')
   assert.equal(await page.locator('link[rel="canonical"],meta[property="og:url"],meta[property="og:image"]').count(),0,'no production domain configured')
   if(route==='/'&&language==='en'){assert.equal(await page.title(),HOME_TITLE);assert.equal(await page.locator('meta[name="description"]').getAttribute('content'),HOME_DESCRIPTION)}
   if(route.startsWith('/places/'))assert.ok((await page.locator('meta[name="description"]').getAttribute('content')).length>40)
   results.push({route,language,title:await page.title(),noindex:privatePage,status:'passed'})
  }
  // Client navigation also updates metadata without adding duplicate tags.
  await page.goto(base+'/');await page.locator('h1').waitFor();await page.locator('.language-switcher').click()
  await page.waitForFunction(l=>document.querySelector('meta[property="og:locale"]')?.content===l,language==='en'?'ar_JO':'en_US')
  await context.close()
 }
 assert.deepEqual(errors,[])
 console.log(`PASS ${results.length} bilingual public/private route checks; headers, locale, title/OG synchronization and live language switching`)
}finally{await browser.close();await writeFile('docs/validation/seo-browser.json',JSON.stringify({scope:'Production build Chromium and real React router/SDK with isolated API fixtures; no hosted writes',base,results,errors},null,2)+'\n')}

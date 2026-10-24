import assert from 'node:assert/strict'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const {default:AxeBuilder}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/@axe-core/playwright/dist/index.mjs')))
const root='supabase/templates/auth',manifest=JSON.parse(await readFile(root+'/manifest.json','utf8')),browser=await chromium.launch({headless:true}),results=[]
await mkdir('artifacts/auth-branding/emails',{recursive:true})
try{
 for(const template of manifest.templates)for(const locale of ['en','ar','bilingual']){
  const html=await readFile(`${root}/${template.kind}/${locale}.html`,'utf8')
  assert.equal(/<script|<link|<style|data:image|localhost|127\.0\.0\.1|position:|display:flex/i.test(html),false)
  const variables=[...new Set([...html.matchAll(/{{\s*\.(\w+)\s*}}/g)].map(m=>m[1]))].sort()
  assert.deepEqual(variables,[...template.variables].sort())
  const content=html.replaceAll('{{ .ConfirmationURL }}','https://example.invalid/verify?token=synthetic-preview-only&amp;type=email').replaceAll('{{ .SiteURL }}','https://example.invalid').replaceAll('{{ .NewEmail }}','preview@example.invalid').replaceAll('{{ .Token }}','123456')
  for(const width of [600,320]){
   const context=await browser.newContext({viewport:{width,height:900},colorScheme:'light'}),page=await context.newPage()
   await page.route(manifest.logoUrl,r=>r.fulfill({contentType:'image/png',path:'public/assets/branding/unseen-jo-email-logo-v1.png'}))
   await page.setContent(content)
   await page.locator('img').evaluate(i=>i.decode())
   assert.equal(await page.locator('img').getAttribute('alt'),'Unseen Jo logo')
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${template.kind}/${locale}/${width} overflow`)
   assert.equal(await page.locator('html').getAttribute('dir'),locale==='ar'?'rtl':'ltr')
   if(!template.kind.includes('reauthentication'))assert.ok(await page.getByRole('link').count()>=2)
   if(template.kind==='confirmation'&&width===320){const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(axe.violations.filter(v=>v.id!=='region').map(v=>v.id),[])}
   if(locale==='bilingual'||['confirmation','recovery','password_changed_notification'].includes(template.kind))await page.screenshot({path:`artifacts/auth-branding/emails/${template.kind}-${locale}-${width}.png`,fullPage:true})
   results.push({template:template.kind,locale,width,logo:'local fixture loaded',status:'passed'})
   await context.close()
  }
 }
 const fallback=await browser.newPage({viewport:{width:360,height:900},colorScheme:'dark'})
 await fallback.route(manifest.logoUrl,r=>r.abort())
 let body=await readFile(root+'/recovery/bilingual.html','utf8');body=body.replace(/<head>[\s\S]*?<\/head>/,'<head><title>Unseen Jo email preview</title></head>')
 await fallback.setContent(body);assert.ok((await fallback.locator('body').innerText()).includes('Unseen Jo'));assert.equal(await fallback.getByRole('link').first().getAttribute('href'),'{{ .ConfirmationURL }}')
 await fallback.screenshot({path:'artifacts/auth-branding/emails/recovery-blocked-images-dark.png',fullPage:true});await fallback.close()
 console.log(`PASS ${results.length} email renders; inline HTML, supported placeholders, English/Arabic, mobile, blocked-image/dark preference fallback`)
}finally{
 await browser.close();await writeFile('docs/validation/auth-email-branding.json',JSON.stringify({scope:'Chromium HTML previews with local logo fixture; Gmail-style head-stripped inline rendering and dark preference. Not real email delivery or Outlook desktop certification.',logoPubliclyHosted:false,hostedTemplatesUpdated:false,results},null,2)+'\n')
}

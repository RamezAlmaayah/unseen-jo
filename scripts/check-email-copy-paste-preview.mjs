import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const browser=await chromium.launch({headless:true}),errors=[]
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}})
 page.on('pageerror',e=>errors.push(e.message))
 await page.goto(pathToFileURL(join(process.cwd(),'docs/SUPABASE_EMAIL_PREVIEW.html')).href)
 assert.equal(await page.locator('iframe').count(),8)
 assert.equal(await page.getByRole('button',{name:'Copy full HTML Body',exact:true}).count(),8)
 for(const frame of page.frames().slice(1)){
  await frame.waitForFunction(()=>document.images[0]?.complete&&document.images[0]?.naturalWidth>0)
 }
 // Exercise the fallback copying UI when clipboard access is unavailable.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('fixture clipboard unavailable')}}}))
 await page.getByRole('button',{name:'Copy full HTML Body',exact:true}).first().click()
 assert.equal(await page.locator('#fallback').inputValue(),await readFile('supabase/templates/auth/invite/bilingual.html','utf8'))
 const markdown=await readFile('docs/SUPABASE_EMAIL_COPY_PASTE_READY.md','utf8')
 assert.equal((markdown.match(/```html\n/g)||[]).length,8)
 for(const name of ['invite','confirmation','recovery','magic_link','email_change','reauthentication','password_changed_notification','email_changed_notification'])assert.ok(markdown.includes(await readFile(`supabase/templates/auth/${name}/bilingual.html`,'utf8')))
 await page.screenshot({path:'artifacts/auth-branding/email-copy-paste-preview.png',fullPage:true})
 assert.deepEqual(errors,[])
 await writeFile('docs/validation/email-copy-paste-preview.json',JSON.stringify({allEightPreviewFramesLoaded:true,publicLogosLoaded:true,copyBodyMatchesOriginal:true,allEightFullBodiesPreserved:true,errors},null,2)+'\n')
 console.log('PASS eight preview frames and public logos loaded; Copy Body and all eight complete Markdown bodies match original files.')
}finally{await browser.close()}

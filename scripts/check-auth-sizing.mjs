import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
const modules=join(tmpdir(),'unseen-jo-browser-check/node_modules')
const {chromium}=await import(pathToFileURL(join(modules,'playwright/index.mjs')))
const {default:AxeBuilder}=await import(pathToFileURL(join(modules,'@axe-core/playwright/dist/index.mjs')))
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4184',stage=process.env.QA_SIZING_STAGE||'after',baseline=stage==='before'
const browser=await chromium.launch({headless:true}),results=[],errors=[]
let passed=false
const directory=`artifacts/auth-sizing/${stage}-${new URL(base).port}`
await mkdir(directory,{recursive:true})
try{
 for(const language of ['en','ar-JO'])for(const [width,height]of [[1366,768],[1280,720],[390,844],[320,740]].filter(([width])=>!process.env.QA_SIZING_MOBILE_ONLY||width<680)){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:width===320?'reduce':'no-preference'})
  await context.addInitScript(language=>{
   localStorage.setItem('unseen-jo-language',language);window.authSizingDocument=crypto.randomUUID()
   // Visual fixture only: render reset fields without submitting or creating a session.
   if(location.search==='?mode=reset')history.replaceState({usr:{recoveryVerified:true}},'')
  },language)
  await context.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',route=>{
   assert.equal(new URL(route.request().url()).pathname,'/auth/v1/settings','visual check must not perform account operations')
   return route.fulfill({contentType:'application/json',body:JSON.stringify({external:{google:false,email:true},mailer_autoconfirm:false})})
  })
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
  for(const mode of ['login','register','recovery','reset','confirmation','reset-invalid','callback','callback-error','callback-pkce']){
   const path=mode==='callback'?'/auth/callback':mode==='callback-error'?'/auth/callback?error=access_denied&error_code=otp_expired':mode==='callback-pkce'?'/auth/callback?code=visual-fixture':mode==='reset-invalid'?'/auth?mode=reset&invalid=1':`/auth?mode=${mode}`
   await page.goto(base+path);await page.locator('.auth-shell,.account-callback').waitFor();await page.waitForTimeout(750)
   const measured=await page.evaluate(()=>{
    const shell=document.querySelector('.auth-shell,.account-callback'),rect=shell.getBoundingClientRect()
    const visible=e=>e.getClientRects().length&&!e.closest('[inert]')&&getComputedStyle(e).visibility!=='hidden'
    const controls=[...shell.querySelectorAll('button,a,input')].filter(visible)
    const form=document.querySelector('.auth-form-content'),active=form||shell
    return {shellWidth:rect.width,shellHeight:rect.height,shellTop:rect.top,shellBottom:rect.bottom,contentHeight:active.getBoundingClientRect().height,documentHeight:document.documentElement.scrollHeight,horizontalOverflow:document.documentElement.scrollWidth>innerWidth,controlsBottom:Math.max(...controls.map(e=>e.getBoundingClientRect().bottom)),inputHeights:[...shell.querySelectorAll('input')].map(e=>e.getBoundingClientRect().height),clippedControls:controls.filter(e=>{const r=e.getBoundingClientRect();return r.left<rect.left-1||r.right>rect.right+1||r.top<rect.top-1||r.bottom>rect.bottom+1}).map(e=>e.textContent||e.name),direction:document.documentElement.dir}
   })
   if(!baseline){
    assert.equal(measured.direction,language==='ar-JO'?'rtl':'ltr')
    assert.equal(measured.horizontalOverflow,false,`${language} ${width} ${mode} overflow`)
    assert.deepEqual(measured.clippedControls,[],`${language} ${width} ${mode} clipped`)
    assert.ok(measured.inputHeights.every(h=>h>=44&&h<=46),'comfortable input height')
    if(width<680&&measured.shellBottom+24<=height)assert.ok(measured.documentHeight<=height+1,'no extra page scroll when the mobile card fits')
    if(width>=1280){assert.ok(measured.shellWidth<=960);assert.ok(measured.controlsBottom<=height,`${language} ${width} ${mode}: controls bottom ${measured.controlsBottom}>${height}`)}
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
    assert.deepEqual(axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],`${language} ${width} ${mode} accessibility`)
   }
   await page.screenshot({path:`${directory}/${language}-${width}-${mode}.png`,fullPage:true})
   results.push({language,width,height,mode,...measured})
  }
  // One continuous mounted shell, state and document through login/register/recovery.
  await page.goto(base+'/auth?mode=login');await page.waitForTimeout(750)
  const identity=await page.evaluate(()=>window.authSizingDocument)
  await page.locator('input[name="email"]').fill('visual@example.invalid')
  await page.locator(width>680?'.auth-welcome button':'.auth-mobile-switch button').click();await page.waitForTimeout(750)
  assert.ok(page.url().includes('mode=register'));assert.equal(await page.locator('input[name="email"]').inputValue(),'visual@example.invalid')
  await page.goBack();await page.waitForTimeout(750);await page.locator('.auth-forgot').click();await page.waitForTimeout(750)
  assert.ok(page.url().includes('mode=recovery'));assert.equal(await page.evaluate(()=>window.authSizingDocument),identity)
  assert.equal(await page.locator('input[name="email"]').inputValue(),'visual@example.invalid')
  await context.close();console.log(`PASS ${stage} ${language} ${width}×${height}: nine states and mode navigation`)
 }
 assert.deepEqual(errors,[]);passed=true
}catch(error){errors.push(error.message);throw error}finally{
 await browser.close();await mkdir('docs/validation',{recursive:true})
 await writeFile(`docs/validation/auth-sizing-${stage}-${new URL(base).port}.json`,JSON.stringify({base,stage,status:passed?'passed':'failed',scope:'Real Chromium layout/Motion/router; Auth settings fixture, empty sessions, reset visual state fixture; no account operations or hosted writes.',results,errors},null,2)+'\n')
}

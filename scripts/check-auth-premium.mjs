// UI/SDK acceptance using isolated Auth/REST fixtures. No real account writes or emails.
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
import ar from '../src/i18n/locales/ar-JO.json' with {type:'json'}
const modules=join(tmpdir(),'unseen-jo-browser-check/node_modules'),{chromium}=await import(pathToFileURL(join(modules,'playwright/index.mjs'))),{default:AxeBuilder}=await import(pathToFileURL(join(modules,'@axe-core/playwright/dist/index.mjs')))
const browser=await chromium.launch({headless:true}),base=process.env.QA_BASE_URL||'http://127.0.0.1:4184',results=[],errors=[]
for(const key of ['Check your inbox.','Continue as a guest','Continue to your profile','Email confirmed.','Password updated.','Welcome to your workspace.','Resend available in {{v0}}s','Your Unseen Jo account'])assert.ok(/[\u0600-\u06ff]/.test(ar[key]||''),'Arabic resource required: '+key)
const user={id:'00000000-0000-4000-8000-000000000901',email:'isolated@example.invalid',role:'authenticated',aud:'authenticated',email_confirmed_at:'2026-01-01',user_metadata:{full_name:'Test Explorer'}}
const token=['e30',Buffer.from(JSON.stringify({sub:user.id,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'isolated-fixture'].join('.'),session={access_token:token,refresh_token:'fixture',expires_in:3600,token_type:'bearer',user}
await mkdir('artifacts/auth-branding/acceptance',{recursive:true})
async function setup(language,width,allowed=false){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:width===320?'reduce':'no-preference'}),page=await context.newPage(),requests=[]
 page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(language=>localStorage.setItem('unseen-jo-language',language),language)
 await page.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{
  const r=route.request(),url=new URL(r.url()),path=url.pathname;requests.push({path,method:r.method()})
  const json=(body,status=200)=>route.fulfill({status,contentType:'application/json',headers:{'x-supabase-api-version':'2024-01-01','access-control-expose-headers':'content-range,x-supabase-api-version','content-range':'*/0'},body:r.method()==='HEAD'?'':JSON.stringify(body)})
  if(path.endsWith('/settings'))return json({external:{email:true,google:false},mailer_autoconfirm:false})
  if(path.endsWith('/token'))return r.postDataJSON().password==='Correct-Test12345'?json(session):json({code:'invalid_credentials',msg:'Invalid login credentials'},400)
  if(path.endsWith('/user'))return json(user)
  if(path.endsWith('/recover')||path.endsWith('/resend'))return json({})
  if(path.endsWith('/logout'))return route.fulfill({status:204})
  if(path.endsWith('/admin_cms_status'))return allowed?json({version:4}):json({code:'42501',message:'Administrator session required'},403)
  if(path.endsWith('/places')||path.endsWith('/categories'))return json([])
  throw Error('Unexpected fixture request '+path)
 })
 return {context,page,requests}
}
async function inspect(page){
 await page.waitForTimeout(750) // Evaluate contrast after the existing slide/fade settles.
 const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[])
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
}
try{
 for(const language of (process.env.QA_AUTH_LANGUAGE?[process.env.QA_AUTH_LANGUAGE]:['en','ar-JO']))for(const width of [1366,320]){
  const label=s=>language==='en'?s:ar[s]||s
  const f=await setup(language,width)
  await f.page.clock.install()
  await f.page.goto(base+'/auth?mode=login');await f.page.locator('input[name="email"]').fill(user.email);await f.page.locator('input[name="password"]').fill('Wrong-Test12345')
  await f.page.getByRole('button',{name:label('Show password'),exact:true}).click();assert.equal(await f.page.locator('input[name="password"]').getAttribute('type'),'text')
  await f.page.locator('input[name="password"]').press('Enter');await f.page.getByRole('alert').waitFor();assert.equal((await f.page.getByRole('alert').innerText()).trim(),label('Email or password is incorrect.'));await inspect(f.page)
  await f.page.getByRole('button',{name:label('Forgot password?'),exact:true}).click();await f.page.getByRole('heading',{name:label('Find your way back.'),exact:true}).waitFor();const recoveryEmail=f.page.getByRole('textbox',{name:label('Email address'),exact:true});await recoveryEmail.focus();await f.page.waitForTimeout(700);assert.equal(await recoveryEmail.evaluate(e=>e===document.activeElement),true,'sliding transition must not steal input focus');await recoveryEmail.press('Enter')
  await f.page.getByRole('heading',{name:label('Check your inbox.'),exact:true}).waitFor();assert.equal(f.requests.filter(r=>r.path.endsWith('/recover')).length,1)
  assert.equal(await f.page.locator('button:disabled').filter({hasText:language==='en'?'Resend':'إعادة الإرسال'}).count(),1)
  await inspect(f.page);await f.page.clock.fastForward(61000);await f.page.getByRole('button',{name:label('Send another email'),exact:true}).click();await f.page.getByRole('textbox',{name:label('Email address'),exact:true}).press('Enter');await f.page.getByRole('heading',{name:label('Check your inbox.'),exact:true}).waitFor();assert.equal(f.requests.filter(r=>r.path.endsWith('/recover')).length,2,'resend enabled after cooldown')
  await f.page.reload();await f.page.locator('form button[type="submit"]').waitFor();assert.equal(await f.page.locator('form button[type="submit"]').isDisabled(),true,'mail cooldown survives reload')
  await f.context.close()
  for(const allowed of [false,true]){
   const a=await setup(language,width,allowed)
   await a.page.goto(base+'/admin/login?returnTo=%2Fadmin%2Fplaces');await a.page.getByLabel(label('Email'),{exact:true}).fill(user.email);await a.page.getByLabel(label('Password'),{exact:true}).fill('Correct-Test12345');await a.page.getByLabel(label('Password'),{exact:true}).press('Enter')
   await a.page.locator(allowed?'.admin-sidebar':'.auth-feedback--error').waitFor()
   assert.equal(await a.page.locator('.admin-sidebar').count(),allowed?1:0)
   assert.ok(a.requests.some(r=>r.path.endsWith('/admin_cms_status')),'database role check required')
   if(!allowed){await inspect(a.page);await a.page.screenshot({path:`artifacts/auth-branding/acceptance/admin-denied-${language}-${width}.png`,fullPage:true})}
   else{await a.page.getByRole('button',{name:label('Admin profile'),exact:true}).count();assert.ok(a.page.url().endsWith('/admin/places'))}
   await a.context.close()
  }
  const recovery=await setup(language,width)
  await recovery.page.goto(base+'/admin/login');await recovery.page.getByRole('button',{name:label('Forgot password?'),exact:true}).click();await recovery.page.getByLabel(label('Email'),{exact:true}).fill(user.email);await recovery.page.locator('input[name="email"]').press('Enter');await recovery.page.getByRole('heading',{name:label('Check your inbox.'),exact:true}).waitFor();await inspect(recovery.page)
  await recovery.page.screenshot({path:`artifacts/auth-branding/acceptance/admin-recovery-${language}-${width}.png`,fullPage:true});await recovery.context.close()
  results.push({language,width,incorrectPassword:true,passwordVisibility:true,enterSubmission:true,mailCooldownAndReload:true,adminLoginAndRoleGuard:true,adminRecovery:true,accessibility:'passed'})
 }
 assert.deepEqual(errors,[]);console.log('PASS premium auth: incorrect password, visibility, Enter, cooldown, Admin login/denial/recovery, English/Arabic desktop/mobile accessibility')
}catch(error){errors.push(error.message);const page=browser.contexts().at(-1)?.pages().at(-1);if(page){await page.screenshot({path:'artifacts/auth-branding/acceptance/failure.png',fullPage:true});await writeFile('artifacts/auth-branding/acceptance/failure.txt',await page.locator('body').innerText())}throw error}finally{await browser.close();await writeFile('docs/validation/auth-premium-browser.json',JSON.stringify({scope:'Actual production React/SDK/Chromium with isolated Auth/REST fixtures. No real credentials, emails, account updates or permission changes.',base,results,errors},null,2)+'\n')}

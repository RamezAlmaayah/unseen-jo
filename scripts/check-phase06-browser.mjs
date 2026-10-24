import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
import ar from '../src/i18n/locales/ar-JO.json' with {type:'json'}
import {syntheticImage} from './synthetic-image-fixture.mjs'
const root=join(tmpdir(),'unseen-jo-browser-check/node_modules'),{chromium}=await import(pathToFileURL(join(root,'playwright/index.mjs'))),{default:AxeBuilder}=await import(pathToFileURL(join(root,'@axe-core/playwright/dist/index.mjs')))
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4184',browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=[],errors=[]
const snapshot=JSON.parse(await readFile('docs/validation/phase05-public-snapshot.json','utf8'))
await mkdir('artifacts/phase06',{recursive:true})
const id='00000000-0000-4000-8000-000000000601',id2='00000000-0000-4000-8000-000000000602',email='fixture@example.invalid'
const userFor=(uid=id)=>({id:uid,aud:'authenticated',role:'authenticated',email:uid===id?email:'second@example.invalid',email_confirmed_at:'2026-10-20T10:00:00Z',created_at:'2026-10-20T10:00:00Z',user_metadata:{full_name:uid===id?'Fixture Explorer':'Second Explorer'},app_metadata:{provider:'email',providers:['email']}})
const token=uid=>['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:uid,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'fixture-not-a-real-signature'].join('.')
const session=uid=>({access_token:token(uid),refresh_token:'fixture-refresh-token',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user:userFor(uid)})
async function setup(language,width,{authenticated=false,reduced=false,fail=false}={}){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),requests=[],profiles=new Map(),saves=new Map([[id,new Set()],[id2,new Set()]]),preferences=new Map()
 for(const uid of [id,id2])profiles.set(uid,{id:uid,display_name:uid===id?'Fixture Explorer':'Second Explorer',avatar_path:null,preferred_language:'en',updated_at:'2026-10-20T10:00:00.000Z'})
 let version=0
 page.on('pageerror',e=>errors.push(e.message))
 await page.addInitScript(({language,authenticated,session})=>{localStorage.setItem('unseen-jo-language',language);window.phase06Document=crypto.randomUUID();if(authenticated)localStorage.setItem('unseen-jo-user-auth',JSON.stringify(session))},{language,authenticated,session:session(id)})
 await page.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{
  const request=route.request(),url=new URL(request.url()),path=url.pathname,method=request.method();requests.push({path,method})
  const auth=request.headers().authorization||'';let uid=null;try{const sub=JSON.parse(Buffer.from(auth.split('.')[1],'base64url')).sub;if([id,id2].includes(sub))uid=sub}catch{/* Anonymous publishable key. */}
  let body
  const json=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)})
  if(path==='/auth/v1/settings')return json({external:{email:true,google:false},disable_signup:false,mailer_autoconfirm:false})
  if(path.endsWith('/account_privacy_requests'))return json(null)
  if(path==='/auth/v1/token'){
   if(fail)return route.abort('failed')
   const data=request.postDataJSON();if(url.searchParams.get('grant_type')==='pkce'){assert.ok(data.code_verifier?.length>40);return json(session(id))}if(data.password!=='FixturePassword123')return json({code:'invalid_credentials',msg:'Invalid login credentials'},400)
   return json(session(data.email==='second@example.invalid'?id2:id))
  }
  if(path==='/auth/v1/user'){
   if(!uid)return json({code:'bad_jwt',msg:'Not authenticated'},401)
   if(method==='PUT'){const data=request.postDataJSON();return json({...userFor(uid),...(data.email?{new_email:data.email}:{})})}
   return json(userFor(uid))
  }
  if(path==='/auth/v1/signup')return json({...userFor(),email_confirmed_at:null,identities:[{id:'fixture'}]})
  if(path==='/auth/v1/resend')return json({})
  if(path==='/auth/v1/recover')return json({})
  if(path==='/auth/v1/logout')return route.fulfill({status:204})
  if(path==='/auth/v1/verify'||path==='/auth/v1/token?grant_type=pkce')return json(session(id))
  if(path.endsWith('/profiles')){
   const target=url.searchParams.get('id')?.slice(3)
   if(uid!==target)return json(null,406)
   if(method==='PATCH'){
    if(url.searchParams.get('updated_at')?.slice(3)!==profiles.get(uid).updated_at)return json([])
    profiles.set(uid,{...profiles.get(uid),...request.postDataJSON(),updated_at:new Date(Date.now()+ ++version).toISOString()});return json([profiles.get(uid)])
   }
   return json(profiles.get(uid))
  }
  if(path.endsWith('/user_preferences'))return json(preferences.has(uid)?[preferences.get(uid)]:[])
  if(path.endsWith('/saved_places')){
   if(!uid)return json({code:'42501'},403)
   if(method==='POST'){const rows=request.postDataJSON();for(const row of Array.isArray(rows)?rows:[rows]){assert.equal(row.user_id,uid);saves.get(uid).add(row.place_id)}return route.fulfill({status:201})}
   if(method==='DELETE'){saves.get(uid).delete(url.searchParams.get('place_id')?.slice(3));return route.fulfill({status:204})}
   return json([...saves.get(uid)].map(place_id=>({place_id})))
  }
  if(path.endsWith('/rpc/uj_save_preferences')){
   assert.ok(uid);const data=request.postDataJSON(),old=preferences.get(uid)
   if((old?.updated_at||null)!==data.expected_version)return json({code:'40001',message:'Conflict'},409)
   const value={user_id:uid,discovery_settings:data.settings,updated_at:new Date(Date.now()+ ++version).toISOString()};preferences.set(uid,value);return json(value)
  }
  if(path.includes('/rpc/admin_'))return json({code:'42501',message:'Forbidden'},403)
  if(path.endsWith('/user_visited_places')||path.endsWith('/user_discovery_history'))return json([])
  if(path.endsWith('/categories'))body=snapshot.categories
  else if(path.endsWith('/places')){
   body=snapshot.rows;const slug=url.searchParams.get('slug')?.slice(3);if(slug)body=body.filter(p=>p.slug===slug)
   const ids=url.searchParams.get('id');if(ids?.startsWith('in.('))body=body.filter(p=>ids.includes(p.id))
  }else if(path.includes('/storage/v1/object/profile-avatars/')&&method==='POST')return json({Key:path.split('/object/')[1],Id:'fixture-avatar'})
  else if(path.includes('/storage/v1/object/sign/')&&method==='POST'){
   if(path.includes('/profile-avatars/'))return json({signedURL:'/object/sign/profile-avatars/'+path.split('/profile-avatars/')[1]+'?token=fixture'})
   const data=request.postDataJSON();body=data.paths?data.paths.map(path=>({path,signedURL:'/object/sign/place-images/'+path+'?token=fixture'})):{signedURL:'/object/sign/place-images/fixture?token=fixture'}
  }else if(path.includes('/storage/v1/'))return route.fulfill({status:200,contentType:'image/png',body:syntheticImage})
  else throw Error('Unhandled fixture endpoint '+path)
  return json(body)
 })
 return {context,page,requests,saves,profiles,preferences}
}
async function axe(page){await page.waitForTimeout(800);const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'no horizontal overflow')}
async function settle(page){await page.waitForTimeout(850)}
async function login(page,mail=email){await page.locator('input[name="email"]').fill(mail);await page.locator('input[name="password"]').fill('FixturePassword123');await page.locator('form button[type="submit"]').click();await page.waitForURL('**/profile');await page.getByRole('button',{name:'Save profile',exact:true}).waitFor()}
try{
 // Capture the original preview component in isolation; no historical production claim.
 if(base.includes(':4184')&&!process.env.QA_ACCOUNT_ONLY){
  const before='.phase06-before.html'
  await writeFile(before,`<html lang="en"><head><title>Previous account preview</title></head><body><div id="root"></div><script type="module" src="/.phase06-before.jsx"></script></body></html>`)
  await writeFile('.phase06-before.jsx',`import React from 'react';import{createRoot}from 'react-dom/client';import{BrowserRouter}from 'react-router';import './src/i18n/index.js';import './src/styles/global.css';import './src/styles/localization.css';import AccountPage from './scripts/fixtures/phase06-previous-account.jsx';createRoot(document.getElementById('root')).render(React.createElement(BrowserRouter,null,React.createElement(AccountPage,{mode:'login'})))`)
  try{const {context,page}=await setup('en',1366);await page.goto(base+'/'+before);await settle(page);if(await page.locator('.account-page').count())await page.screenshot({path:'artifacts/phase06/before-login-preview-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:900});await page.screenshot({path:'artifacts/phase06/before-login-preview-mobile.png',fullPage:true});await context.close()}finally{await unlink(before);await unlink('.phase06-before.jsx')}
 }
 for(const language of (process.env.QA_ACCOUNT_ONLY?[]:['en','ar-JO']))for(const width of [1366,820,390,320]){
  const {context,page,requests}=await setup(language,width),label=s=>language==='en'?s:ar[s]||s,start=performance.now()
  await page.goto(base+'/auth?mode=login');await page.locator('form button[type="submit"]:not([disabled])').waitFor();const usableMs=performance.now()-start;await settle(page)
  const original=await page.evaluate(()=>window.phase06Document),shell=await page.locator('.auth-shell').boundingBox(),initialRequests=requests.length
  await axe(page);await page.screenshot({path:`artifacts/phase06/login-${language}-${width}-${new URL(base).port}.png`,fullPage:true})
  await page.locator('input[name="email"]').fill('persist@example.invalid')
  await page.locator(width>680?'.auth-welcome button':'.auth-mobile-switch button').click()
  await page.waitForURL('**/auth?mode=register');await page.waitForTimeout(250)
  assert.equal(await page.locator('form:not([inert]) input[name="name"]').count(),1)
  await settle(page);assert.equal(await page.locator('input[name="email"]').inputValue(),'persist@example.invalid');assert.equal(await page.locator('h1').evaluate(e=>e===document.activeElement),true)
  const registered=await page.locator('.auth-shell').boundingBox();assert.equal(Math.round(shell.width),Math.round(registered.width));assert.ok(registered.height>=500&&registered.height<1000);assert.equal(await page.evaluate(()=>window.phase06Document),original);assert.equal(requests.length,initialRequests)
  await axe(page);await page.screenshot({path:`artifacts/phase06/register-${language}-${width}-${new URL(base).port}.png`,fullPage:true})
  await page.locator('form button[type="submit"]').click();await page.locator('input[name="name"][aria-invalid="true"]').waitFor();assert.ok(await page.locator('input[name="password"][aria-invalid="true"]').count());await axe(page)
  await page.locator('input[name="name"]').fill('Fixture Explorer');await page.locator('input[name="email"]').fill(email);await page.locator('input[name="password"]').fill('FixturePassword123');await page.locator('input[name="confirm-password"]').fill('DifferentPassword123');await page.locator('form button[type="submit"]').click();assert.ok(await page.locator('input[name="confirm-password"][aria-invalid="true"]').count())
  await page.locator('input[name="confirm-password"]').fill('FixturePassword123');await page.locator('form button[type="submit"]').click();await page.getByRole('status').filter({hasText:label('Check your inbox. If registration is available for this address, a confirmation link will arrive. Open it in this browser to finish signing up.')}).waitFor();assert.equal(requests.filter(r=>r.path==='/auth/v1/signup').length,1)
  await page.goBack();await settle(page);assert.ok(page.url().includes('mode=login'));await page.goForward();await settle(page);assert.ok(page.url().includes('mode=register'));assert.equal(await page.evaluate(()=>window.phase06Document),original)
  console.log(`PASS auth ${language} ${width}`);results.push({name:`guest ${language} ${width}`,scope:'Simulated Auth endpoint; real React/router/Motion/browser',usableMs:Math.round(usableMs),modeSwitchRequests:0,documentReloads:0,shellHeight:registered.height,status:'passed'});await context.close()
 }
 // Account workflows use a realistic API fixture, never real passwords or exported sessions.
 const {context,page,requests,saves,preferences}=await setup('en',1366)
 await page.goto(base+'/preferences');await page.locator('input[value="history"]').waitFor();await page.locator('label:has(input[value="history"])').click()
 await page.goto(base+'/explore');await page.locator('.preview-favorite').first().waitFor();await page.locator('.preview-favorite').first().click();const saved=await page.locator('.destination-card').first().getAttribute('data-place-id')
 await page.goto(base+'/auth?mode=login');await login(page);await settle(page);assert.ok(saves.get(id).has(saved));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('unseen-jo-guest-saves'))).then(v=>v.length),0)
 await page.getByLabel('Full name',{exact:true}).fill('Updated Fixture Explorer');await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.getByRole('status').filter({hasText:'Profile saved.'}).waitFor();await page.reload();await page.getByLabel('Full name',{exact:true}).waitFor();assert.equal(await page.getByLabel('Full name',{exact:true}).inputValue(),'Updated Fixture Explorer');await axe(page)
 await page.getByRole('button',{name:'Save preferences to my account',exact:true}).click();await page.getByRole('status').filter({hasText:'Discovery preferences saved to your account.'}).waitFor();assert.ok(preferences.get(id).discovery_settings.interests.includes('history'))
 await page.locator('input[type="file"]').setInputFiles({name:'avatar.png',mimeType:'image/png',buffer:syntheticImage});await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.locator('img.account-avatar').waitFor();assert.ok((await page.locator('img.account-avatar').getAttribute('src')).includes('/profile-avatars/'));await page.getByLabel('Remove profile photograph',{exact:true}).check();await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.locator('.account-avatar--empty').waitFor();assert.equal(requests.filter(r=>r.path.includes('/storage/v1/')&&r.method==='DELETE').length,0)
 const previousPreferences=preferences.get(id);preferences.set(id,{...previousPreferences,discovery_settings:{...previousPreferences.discovery_settings,interests:['culture']},updated_at:'2026-10-21T12:00:00.000Z'})
 await page.getByRole('button',{name:'Reload account details',exact:true}).click();await page.getByRole('button',{name:'Use account preferences',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Save preferences to my account',exact:true}).isDisabled(),true);await page.getByRole('button',{name:'Use account preferences',exact:true}).click();await page.getByRole('link',{name:'Edit discovery preferences',exact:true}).click();await page.locator('input[value="culture"]').waitFor();assert.equal(await page.locator('input[value="culture"]').isChecked(),true);assert.equal(await page.locator('input[value="history"]').isChecked(),false);await page.goto(base+'/profile');await page.getByRole('button',{name:'Save profile',exact:true}).waitFor()
 await page.getByRole('link',{name:/saved places/}).click();await page.locator('.personal-place').waitFor();await axe(page);await page.screenshot({path:'artifacts/phase06/account-saved-places-fixture.png',fullPage:true});await page.reload();await page.locator('.personal-place').waitFor();assert.equal(saves.get(id).size,1)
 await page.goto(base+'/profile');await page.getByRole('button',{name:'Save profile',exact:true}).waitFor();await page.getByLabel('Full name',{exact:true}).fill('UNSAVED retained draft');const other=await context.newPage();await other.goto('about:blank');await page.waitForTimeout(500);await page.bringToFront();await other.close();assert.equal(await page.getByLabel('Full name',{exact:true}).inputValue(),'UNSAVED retained draft')
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL(base+'/');assert.equal(await page.evaluate(()=>localStorage.getItem('unseen-jo-user-auth')),null)
 await page.goto(base+'/my-discoveries');assert.equal(await page.locator('.personal-place').count(),0,'account saves never leak to guest')
 await page.goto(base+'/auth?mode=login');await login(page,'second@example.invalid');await page.getByRole('link',{name:/saved places/}).click();assert.equal(await page.locator('.personal-place').count(),0,'second user cannot see first account saves')
 await page.goto(base+'/admin');await page.locator('input[type="email"]').waitFor();assert.equal(await page.locator('.admin-sidebar').count(),0,'public account session does not bypass Admin');assert.equal(await page.locator('.auth-admin-page').count(),1)
 results.push({name:'profile/save/refresh/guest merge/preferences/logout/account isolation/Admin guard/tab return',scope:'Simulated Auth/REST; real application browser',requests:requests.length,status:'passed'});await context.close()
 // Real SDK PKCE/OTP/implicit callback processing against simulated Auth responses.
 const callbacks=await setup('en',390)
 await callbacks.page.goto(base+'/auth?mode=register');await callbacks.page.locator('input[name="name"]').fill('Fixture Explorer');await callbacks.page.locator('input[name="email"]').fill(email);await callbacks.page.locator('input[name="password"]').fill('FixturePassword123');await callbacks.page.locator('input[name="confirm-password"]').fill('FixturePassword123');await callbacks.page.locator('form button[type="submit"]').click();await callbacks.page.getByRole('status').filter({hasText:'Check your inbox.'}).waitFor()
 await callbacks.page.goto(base+'/auth/callback?code=fixture&flow=signup');await callbacks.page.getByRole('heading',{name:'Email confirmed.',exact:true}).waitFor();await callbacks.page.getByRole('link',{name:'Continue to your profile',exact:true}).click();await callbacks.page.waitForURL('**/profile');await callbacks.page.getByRole('button',{name:'Save profile',exact:true}).waitFor();await axe(callbacks.page);await callbacks.context.close()
 const missing=await setup('en',390);await missing.page.goto(base+'/auth/callback?code=fixture&flow=signup');await missing.page.getByRole('heading',{name:'Finish signing in',exact:true}).waitFor();assert.equal(missing.requests.filter(r=>r.path==='/auth/v1/token').length,0);await axe(missing.page);await missing.page.screenshot({path:'artifacts/phase06/callback-cross-browser-signin.png',fullPage:true});await missing.page.reload();await missing.page.getByRole('heading',{name:'Open your confirmation email',exact:true}).waitFor();await missing.context.close()
 for(const format of ['token_hash','fragment']){
  const c=await setup('en',390),url=format==='token_hash'?base+'/auth/callback?token_hash=fixture&type=email':base+'/auth/callback#access_token='+token(id)+'&refresh_token=fixture&type=signup'
  await c.page.goto(url);await c.page.getByRole('heading',{name:'Email confirmed.',exact:true}).waitFor();await c.page.getByRole('link',{name:'Continue to your profile',exact:true}).click();await c.page.waitForURL('**/profile');await c.page.getByRole('button',{name:'Save profile',exact:true}).waitFor();await c.context.close()
 }
 results.push({name:'same-browser PKCE signup callback, missing-verifier fallback, bare-page refresh, token hash and implicit fragment',scope:'Real SDK/browser with simulated Auth verification responses; no genuine email callback claimed',status:'passed'})
 // Recovery, network errors, expired links, mobile keyboard and reduced motion.
 const resend=await setup('en',390);await resend.page.goto(base+'/auth?mode=confirmation');await resend.page.locator('input[name="email"]').fill(email);await resend.page.locator('form button[type="submit"]').click();await resend.page.getByRole('status').filter({hasText:'If confirmation is still required'}).waitFor();assert.equal(resend.requests.filter(r=>r.path==='/auth/v1/resend').length,1);await resend.context.close()
 const recovery=await setup('en',390,{reduced:true});await recovery.page.goto(base+'/auth?mode=recovery');await recovery.page.locator('input[name="email"]').fill(email);await recovery.page.locator('form button[type="submit"]').click();await recovery.page.getByRole('status').filter({hasText:'If an account uses this email'}).waitFor();await axe(recovery.page)
 await recovery.page.goto(base+'/auth/callback?code=fixture&flow=recovery');await recovery.page.waitForURL('**/auth?mode=reset');await recovery.page.locator('input[name="password"]').fill('NewFixturePassword456');await recovery.page.locator('input[name="confirm-password"]').fill('NewFixturePassword456');await recovery.page.locator('form button[type="submit"]').click();await recovery.page.getByRole('heading',{name:'Password updated.',exact:true}).waitFor();await recovery.page.getByRole('link',{name:'Continue to your profile',exact:true}).click();await recovery.page.waitForURL('**/profile');await recovery.page.goto(base+'/auth?mode=reset');assert.equal(await recovery.page.locator('input[type="password"]').count(),0);await axe(recovery.page)
 await recovery.page.goto(base+'/auth/callback?error=access_denied#error_description=private');await recovery.page.getByRole('alert').waitFor();assert.equal(new URL(recovery.page.url()).search,'');assert.equal(new URL(recovery.page.url()).hash,'');await axe(recovery.page);await recovery.context.close()
 const failed=await setup('en',390,{fail:true});await failed.page.goto(base+'/auth?mode=login');await failed.page.locator('input[name="email"]').fill(email);await failed.page.locator('input[name="password"]').fill('FixturePassword123');await failed.page.locator('form button[type="submit"]').click();await failed.page.getByRole('alert').filter({hasText:'The account service could not complete this request.'}).waitFor();assert.equal(await failed.page.locator('form button[type="submit"]').isEnabled(),true);await axe(failed.page);await failed.context.close()
 const keyboard=await setup('en',1366,{reduced:true});await keyboard.page.goto(base+'/auth?mode=login');await keyboard.page.locator('input[name="email"]').focus();await keyboard.page.keyboard.press('Tab');assert.equal(await keyboard.page.locator('input[name="password"]').evaluate(e=>e===document.activeElement),true);await keyboard.page.locator('.auth-welcome button').focus();await keyboard.page.keyboard.press('Enter');await keyboard.page.waitForURL('**mode=register');await settle(keyboard.page);await keyboard.page.keyboard.press('Tab');assert.equal(await keyboard.page.locator('input[name="name"]').evaluate(e=>e===document.activeElement),true);await keyboard.context.close()
 results.push({name:'recovery, expired callback scrubbing, direct reset guard, network failure, reduced motion',scope:'Simulated service; real browser',status:'passed'})
 assert.deepEqual(errors,[])
}catch(error){const p=browser.contexts().at(-1)?.pages()[0];if(p)await p.screenshot({path:'artifacts/phase06/failure.png',fullPage:true}).catch(()=>{});errors.push(error.message);throw error}finally{await browser.close();await writeFile(`docs/validation/phase06-browser-${new URL(base).port}${process.env.QA_ACCOUNT_ONLY?'-account':''}.json`,JSON.stringify({base,results,errors},null,2)+'\n')}

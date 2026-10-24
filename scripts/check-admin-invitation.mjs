// Auth HTTP is intercepted for successful callbacks; no invitations or real password changes.
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {acceptAuthCallback} from '../src/features/admin/authCallback.js'
const results=[]
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const browser=await chromium.launch({headless:true}), base=process.env.QA_BASE_URL||'http://127.0.0.1:4184',errors=[]
const user={id:'00000000-0000-4000-8000-000000000001',email:'invitee@example.test',email_confirmed_at:'2026-10-18T12:00:00Z',aud:'authenticated',role:'authenticated'}
const token=`${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`
const session={access_token:token,refresh_token:'fixture-refresh',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user}
const fragment=`#access_token=${token}&refresh_token=fixture-refresh&expires_in=3600&token_type=bearer&type=invite`
const requests=[]
async function page({expired=false}={}) {
  const p=await browser.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errors.push(e.message))
  await p.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async r=>{
    const path=new URL(r.request().url()).pathname,method=r.request().method();requests.push({path,method})
    if(path.endsWith('/logout'))return r.fulfill({status:204})
    if(path.endsWith('/recover'))return r.fulfill({status:200,contentType:'application/json',body:'{}'})
    if(path.endsWith('/user'))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)})
    if(path.endsWith('/verify')||path.endsWith('/token'))return r.fulfill({status:expired?403:200,contentType:'application/json',body:JSON.stringify(expired?{code:'otp_expired',message:'Expired test link'}:session)})
    if(path.endsWith('/admin_cms_status'))return r.fulfill({status:403,contentType:'application/json',body:JSON.stringify({code:'42501',message:'Administrator session required'})})
    throw new Error('Unexpected Auth test request: '+path)
  });return p
}
try {
 await check('real local invitation and recovery routes fail closed without a session',async()=>{
   const p=await browser.newPage();for(const path of ['/admin/accept-invite','/admin/recovery']){const r=await p.goto(base+path);assert.equal(r.status(),200);await p.getByRole('alert').waitFor();assert.equal(await p.getByLabel('New password',{exact:true}).count(),0)}await p.close()
 })
 await check('invalid invitation session fails closed (local fixture unless hosted probe explicitly enabled)',async()=>{
   const p=await browser.newPage();if(process.env.QA_ALLOW_HOSTED_NEGATIVE!=='1')await p.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',route=>route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({code:'bad_jwt',message:'Invalid fixture token'})}));const denied=p.waitForResponse(r=>r.url().endsWith('/auth/v1/user'));await p.goto(base+'/admin/accept-invite'+fragment);assert.ok((await denied).status()>=400);await p.getByRole('alert').waitFor();assert.equal(new URL(p.url()).hash,'');assert.equal(await p.getByLabel('New password',{exact:true}).count(),0);await p.close()
 })
 await check('standard invitation fragment establishes verified session, scrubs URL and survives reload',async()=>{
   const p=await page();await p.goto(base+'/admin/accept-invite'+fragment);await p.getByText(user.email,{exact:true}).waitFor();assert.equal(p.url(),base+'/admin/accept-invite');await p.reload();await p.getByLabel('New password',{exact:true}).waitFor();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.close()
 })
 await check('password confirmation blocks mismatch; successful Auth update signs out and grants no role',async()=>{
   const p=await page();await p.goto(base+'/admin/accept-invite'+fragment);await p.getByLabel('New password',{exact:true}).fill('Synthetic-Test-Only-123!');await p.getByLabel('Confirm password',{exact:true}).fill('Different-Test-Only-123!');const before=requests.filter(r=>r.method==='PUT').length;await p.getByRole('button',{name:'Save password and sign out'}).click();await p.getByText('Passwords must match.',{exact:true}).waitFor();assert.equal(requests.filter(r=>r.method==='PUT').length,before)
   await p.getByLabel('Confirm password',{exact:true}).fill('Synthetic-Test-Only-123!');await p.getByRole('button',{name:'Save password and sign out'}).click();await p.getByRole('heading',{name:'Password saved',exact:true}).waitFor();assert.equal(await p.evaluate(()=>localStorage.getItem('unseen-jo-admin-auth')),null);assert.ok(requests.some(r=>r.path.endsWith('/user')&&r.method==='PUT'));assert.ok(requests.some(r=>r.path.endsWith('/logout')));assert.ok(!requests.some(r=>r.path.includes('user_roles')));await p.close()
 })
 await check('custom invite token-hash callback exchanges exactly once under StrictMode',async()=>{
   const p=await page();const before=requests.filter(r=>r.path.endsWith('/verify')).length;await p.goto(base+'/admin/accept-invite?token_hash=fixture-only&type=invite');await p.getByLabel('New password',{exact:true}).waitFor();assert.equal(p.url(),base+'/admin/accept-invite');assert.equal(requests.filter(r=>r.path.endsWith('/verify')).length-before,1);await p.close()
 })
 await check('expired links and mismatched callback types fail closed without password fields',async()=>{
   for(const suffix of ['?token_hash=fixture-only&type=invite','#error=access_denied&error_code=otp_expired&error_description=untrusted','?token_hash=fixture-only&type=recovery']){const p=await page({expired:true});await p.goto(base+'/admin/accept-invite'+suffix);await p.getByRole('alert').waitFor();assert.equal(await p.getByLabel('New password',{exact:true}).count(),0);assert.equal(p.url(),base+'/admin/accept-invite');await p.close()}
 })
 await check('PKCE recovery delegates to official code exchange and strips query before exchange',async()=>{
   let calls=0,scrubbed=false
   const client={auth:{exchangeCodeForSession:async code=>{assert.ok(scrubbed);assert.equal(code,'fixture');calls++;return {data:{session},error:null}},getUser:async()=>({data:{user},error:null})}}
   const url=base+'/admin/recovery?code=fixture'
   await Promise.all([acceptAuthCallback(client,url,()=>{scrubbed=true}),acceptAuthCallback(client,url,()=>{})]);assert.equal(calls,1)
 })
 await check('same-browser recovery preserves real SDK PKCE verifier and exchanges code',async()=>{
   const p=await page();await p.goto(base+'/admin/login');await p.getByLabel('Email',{exact:true}).fill(user.email);await p.getByRole('button',{name:'Forgot password?',exact:true}).click();await p.getByRole('button',{name:'Send reset link',exact:true}).click();await p.getByRole('status').filter({hasText:'If this account exists'}).waitFor();const before=requests.filter(r=>r.path.endsWith('/token')).length;await p.goto(base+'/admin/recovery?code=fixture-recovery');await p.getByLabel('New password',{exact:true}).waitFor();assert.equal(requests.filter(r=>r.path.endsWith('/token')).length-before,1);assert.equal(p.url(),base+'/admin/recovery');await p.close()
 })
 await check('newly invited ordinary user remains denied CMS access',async()=>{
   const p=await page();await p.goto(base+'/admin/accept-invite'+fragment);await p.getByLabel('New password',{exact:true}).waitFor();await p.goto(base+'/admin');await p.getByRole('heading',{name:'Administrator access unavailable'}).waitFor();assert.equal(await p.getByRole('navigation',{name:'Administration'}).count(),0);await p.close();assert.deepEqual(errors,[])
 })
 await mkdir('docs/validation',{recursive:true});await writeFile('docs/validation/admin-invitation-tests.json',JSON.stringify({scope:process.env.QA_ALLOW_HOSTED_NEGATIVE==='1'?'Explicit opt-in negative hosted Auth probe; successful operations use fixtures.':'Local routes and intercepted Auth fixtures only. No hosted Auth probe, invitations, real passwords, roles or hosted settings changed.',passed:results.length,results,errors},null,2)+'\n')
}finally{await browser.close()}

// Genuine ordinary-account acceptance. Password generated in memory, never printed/exported.
// Run only for the explicitly authorized test mailbox. No Admin session is read.
import assert from 'node:assert/strict'
import {randomBytes} from 'node:crypto'
import {writeFile,access,mkdir} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const email=process.env.QA_TEST_EMAIL
if(email!=='ramezmayaa+unseenjo-phase06-20261020@gmail.com')throw Error('Set the authorized QA_TEST_EMAIL explicitly; this script creates a real ordinary test account.')
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4184',browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1366,height:900}}),page=await context.newPage(),password='Uj6!'+randomBytes(28).toString('base64url'),results=[]
await mkdir('artifacts/phase06',{recursive:true})
const report=async()=>writeFile('docs/validation/phase06-live-browser.json',JSON.stringify({scope:'Genuine hosted Supabase Auth and owner operations through a temporary browser. No exported credentials/session. Existing Admin remains untouched.',results},null,2)+'\n')
try{
 await page.goto(base+'/auth?mode=register');await page.locator('input[name="name"]').fill('Phase 06 Acceptance Explorer');await page.locator('input[name="email"]').fill(email);await page.locator('input[name="password"]').fill(password);await page.locator('input[name="confirm-password"]').fill(password)
 await page.locator('form button[type="submit"]').click();await page.getByRole('status').filter({hasText:'Check your inbox.'}).waitFor({timeout:30000})
 results.push({name:'Real registration accepted by Supabase; no session fabricated; email confirmation required',status:'passed'});await page.screenshot({path:'artifacts/phase06/live-email-confirmation-required.png',fullPage:true});await report()
 console.log('Real signup submitted. Awaiting private email confirmation. No password/token exported.')
 // Root verifies confirmation through a read-only hosted query before releasing this gate.
 let confirmed=false
 for(let i=0;i<1800;i++){try{await access('artifacts/phase06/continue-live-acceptance');confirmed=true;break}catch{await new Promise(resolve=>setTimeout(resolve,2000))}}
 if(!confirmed){results.push({name:'Private mailbox verification',status:'pending'});await report();process.exitCode=2}
 else{
  await page.goto(base+'/auth?mode=login');await page.locator('input[name="email"]').fill(email);await page.locator('input[name="password"]').fill(password);await page.locator('form button[type="submit"]').click();await page.waitForURL('**/profile',{timeout:30000});await page.getByRole('button',{name:'Save profile',exact:true}).waitFor({timeout:30000});results.push({name:'Real email-confirmed login and owner profile read',status:'passed'})
  await page.getByLabel('Full name',{exact:true}).fill('Phase 06 Verified Explorer');await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.getByRole('status').filter({hasText:'Profile saved.'}).waitFor();await page.reload();await page.getByLabel('Full name',{exact:true}).waitFor();assert.equal(await page.getByLabel('Full name',{exact:true}).inputValue(),'Phase 06 Verified Explorer');results.push({name:'Real profile update survives refresh',status:'passed'})
  await page.goto(base+'/explore');await page.locator('.preview-favorite').first().waitFor({timeout:45000});await page.locator('.preview-favorite').first().click();await page.waitForTimeout(1800);assert.equal(await page.locator('.preview-favorite').first().getAttribute('aria-pressed'),'true');await page.goto(base+'/my-discoveries');await page.locator('.saved-place-card').waitFor();await page.reload();await page.locator('.saved-place-card').waitFor();results.push({name:'Real saved destination appears in My Discoveries after refresh',status:'passed'})
  await page.goto(base+'/preferences');await page.getByRole('button',{name:'Save preferences to my account',exact:true}).waitFor();await page.getByRole('button',{name:'Save preferences to my account',exact:true}).click();await page.getByRole('status').filter({hasText:'Discovery preferences saved to your account.'}).waitFor();results.push({name:'Real owner preference RPC save',status:'passed'})
  await page.goto(base+'/admin');await page.locator('.admin-auth-shell input[type="email"]').waitFor();assert.equal(await page.locator('.admin-sidebar').count(),0);results.push({name:'Ordinary public session cannot enter Admin',status:'passed'})
  await page.goto(base+'/profile');await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL(base+'/');await page.goto(base+'/my-discoveries');assert.equal(await page.locator('.saved-place-card').count(),0);results.push({name:'Logout clears private account state; guest pages remain available',status:'passed'})
  await page.goto(base+'/auth?mode=login');await page.locator('input[name="email"]').fill(email);await page.locator('input[name="password"]').fill(password);await page.locator('form button[type="submit"]').click();await page.waitForURL('**/profile');await page.getByRole('button',{name:'Save profile',exact:true}).waitFor();await page.goto(base+'/my-discoveries');await page.locator('.saved-place-card').waitFor();results.push({name:'Real subsequent login restores account saved places',status:'passed'});await page.goto(base+'/profile');await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL(base+'/');await report();console.log('Genuine hosted ordinary-account acceptance passed; signed out.')
 }
}catch(error){results.push({name:'Genuine hosted acceptance',status:'failed',message:error.message.replace(/sb_[^\s]+/g,'[redacted]')});await report();throw Error('Genuine acceptance failed; see redacted report.')}finally{await context.close();await browser.close()}

import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {setup,browser,base,AxeBuilder,errors} from './localization-browser-fixtures.mjs'
import {privacyLabels} from '../src/features/account/privacyLabels.js'
const results=[],id='00000000-0000-4000-8000-000000000001'
try{
 for(const language of ['en','ar-JO'])for(const width of [1366,320]){
  const {page,context}=await setup(width,language,false),c=privacyLabels[language==='en'?'en':'ar'];let fail=true,writes=0,badExport=false,downloads=0
  page.on('download',()=>downloads++)
  await page.addInitScript(id=>{const expires_at=Math.floor(Date.now()/1000)+3600;localStorage.setItem('unseen-jo-user-auth',JSON.stringify({access_token:'e30.'+btoa(JSON.stringify({sub:id,exp:expires_at}))+'.fixture',refresh_token:'fixture',expires_at,token_type:'bearer',user:{id,email:'reviewer@example.test',role:'authenticated'}}))},id)
  await page.route('**/rest/v1/account_privacy_requests*',route=>route.fulfill({status:200,contentType:'application/json',body:'null'}))
  await page.route('**/rest/v1/rpc/uj_export_account_data',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({profile:{id:badExport?'another-identity':id},saved_places:[],avatar_inventory:[]})}))
  await page.route('**/functions/v1/account-privacy',route=>{writes++;assert.deepEqual(Object.keys(route.request().postDataJSON()).sort(),['confirm','password']);return route.fulfill({status:fail?403:200,contentType:'application/json',body:JSON.stringify(fail?{code:'identity'}:{request:{id:'fixture-request',status:'pending'}})})})
  await page.goto(base+'/profile');const panel=page.locator('.privacy-account');await panel.waitFor();assert.equal(await panel.locator('h2').innerText(),c.title)
  if(process.env.QA_PRIVACY_EXPECT_ACTIVE!=='1'){
   assert.equal(await panel.getAttribute('data-privacy-unavailable'),'true');assert.equal(await panel.locator('button,input,form').count(),0);assert.equal(writes,0)
   const audit=await new AxeBuilder({page}).include('.privacy-account').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[])
   results.push({language,width,productionControls:'unavailable',passwordCollection:false,requestSubmission:false,accessibility:'passed'});await context.close();continue
  }
  const downloadPromise=page.waitForEvent('download');await panel.getByRole('button',{name:c.download,exact:true}).click();const download=await downloadPromise,data=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(data.profile.id,id);assert.ok(!('access_token' in data));assert.equal(data.account.email,'reviewer@example.test')
  badExport=true;await panel.getByRole('button',{name:c.download,exact:true}).click();await panel.getByRole('alert').waitFor();assert.equal(downloads,1,'A mismatched export identity must never produce a download');badExport=false
  await panel.getByRole('button',{name:c.remove,exact:true}).click();assert.equal(await panel.locator('input[type=checkbox]').isChecked(),false);assert.equal(await panel.getByRole('button',{name:c.send,exact:true}).isDisabled(),true)
  await panel.locator('input[type=checkbox]').check();await panel.locator('input[autocomplete=current-password]').fill('FixturePassword123');await panel.getByRole('button',{name:c.send,exact:true}).click();await panel.getByRole('alert').waitFor();assert.equal(await panel.locator('input[autocomplete=current-password]').inputValue(),'');assert.equal(await panel.locator('.privacy-request-status').count(),0)
  const formAudit=await new AxeBuilder({page}).include('.privacy-account').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(formAudit.violations.map(v=>v.id),[])
  const toggle=panel.getByRole('button',{name:language==='en'?'Show password':'إظهار كلمة المرور',exact:true});await toggle.click();assert.equal(await panel.locator('input[autocomplete=current-password]').getAttribute('type'),'text');await panel.getByRole('button',{name:language==='en'?'Hide password':'إخفاء كلمة المرور',exact:true}).click()
  fail=false;await panel.locator('input[autocomplete=current-password]').fill('FixturePassword123');await panel.getByRole('button',{name:c.send,exact:true}).click();await panel.locator('.privacy-request-status').waitFor();assert.match(await panel.locator('.privacy-request-status').innerText(),new RegExp(c.pending.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.equal(writes,2)
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
  const axe=await new AxeBuilder({page}).include('.privacy-account').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[])
  results.push({language,width,download:true,confirmation:true,failureAndRetry:true,pendingNotDeleted:true,accessibility:'passed'});await context.close()
 }
 assert.deepEqual(errors,[]);console.log(process.env.QA_PRIVACY_EXPECT_ACTIVE==='1'?'PASS preserved privacy QA controls: four bilingual desktop/mobile fixture groups':'PASS production privacy unavailable: four bilingual desktop/mobile groups; no password collection or submission controls')
}finally{await browser.close();await writeFile('docs/validation/'+(process.env.QA_PRIVACY_EXPECT_ACTIVE==='1'?'account-privacy-browser-qa.json':'account-privacy-browser.json'),JSON.stringify({scope:'API fixtures only; no hosted requests or real account changes',results,errors},null,2))}

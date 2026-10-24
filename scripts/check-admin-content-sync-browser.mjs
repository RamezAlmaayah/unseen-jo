// All Supabase traffic is intercepted before navigation. Isolated browser
// contexts contain synthetic sessions; no real session, email or hosted write.
import assert from 'node:assert/strict'
import {mkdir,writeFile,readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
import {fixtureRows,manifest,fakeAdmin} from './content-sync-test-fixture.mjs'
import ar from '../src/i18n/locales/ar-JO.json' with {type:'json'}
const modules=join(tmpdir(),'unseen-jo-browser-check/node_modules'),{chromium}=await import(pathToFileURL(join(modules,'playwright/index.mjs'))),{default:AxeBuilder}=await import(pathToFileURL(join(modules,'@axe-core/playwright/dist/index.mjs')))
const browser=await chromium.launch({headless:true}),base=process.env.QA_BASE_URL||'http://127.0.0.1:4197',results=[],errors=[]
const user={id:fakeAdmin,email:'isolated@example.invalid',role:'authenticated',aud:'authenticated',email_confirmed_at:'2026-01-01',user_metadata:{}},token=['e30',Buffer.from(JSON.stringify({sub:fakeAdmin,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'synthetic-fixture'].join('.'),session={access_token:token,refresh_token:'synthetic-fixture',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user}
async function setup({language='en',width=1366,allowed=true,signedIn=true,url=base,failReview=false,conflict=false}={}){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:width<500?'reduce':'no-preference'}),page=await context.newPage(),rows=fixtureRows(),requests=[],writes=[],unexpected=[];let stamp=0
 page.on('pageerror',e=>errors.push(e.message));await context.addInitScript(({language,session,signedIn})=>{localStorage.setItem('unseen-jo-language',language);if(signedIn)localStorage.setItem('unseen-jo-admin-auth',JSON.stringify(session))},{language,session,signedIn})
 if(conflict)rows.find(p=>p.id===manifest.translations[0].id).place_translations[0].updated_at='2026-10-24T01:00:00.000001Z'
 await context.route('**/*',async route=>{
  const r=route.request(),u=new URL(r.url()),path=u.pathname;requests.push({path,method:r.method()})
  if(u.origin===new URL(url).origin)return route.continue()
  const json=(body,status=200)=>route.fulfill({status,contentType:'application/json',headers:{'x-supabase-api-version':'2024-01-01','content-range':'0-23/24'},body:JSON.stringify(body)})
  if(u.hostname!=='dkhwwvoplhfjccvjegty.supabase.co'){unexpected.push(u.origin+path);return route.abort()}
  if(path.endsWith('/auth/v1/user'))return signedIn?json(user):json({message:'No session'},401)
  if(path.endsWith('/admin_cms_status'))return allowed?json({version:4}):json({code:'42501',message:'Administrator session required'},403)
  if(path.endsWith('/places')&&r.method()==='GET')return json(rows)
  if(path.endsWith('/place_translations')&&r.method()==='PATCH'){
   const values=r.postDataJSON(),id=u.searchParams.get('place_id')?.slice(3),version=u.searchParams.get('updated_at')?.slice(3),row=rows.find(p=>p.id===id)?.place_translations.find(t=>t.locale==='ar-JO')
   assert.ok(allowed&&signedIn);assert.ok(id&&version);assert.equal(u.searchParams.get('locale'),'eq.ar-JO')
   if(failReview&&values.editorial_status==='reviewed')return json({code:'P0001',message:'Simulated review failure'},400)
   if(row?.updated_at!==version)return json([])
   Object.assign(row,values,{updated_at:`2026-10-24T00:00:01.${String(++stamp).padStart(6,'0')}Z`});if(values.editorial_status==='reviewed')row.reviewed_at=row.updated_at;else row.reviewed_at=null
   writes.push({id,values});return json([row])
  }
  unexpected.push(r.method()+' '+path);return route.abort()
 })
 return {context,page,rows,requests,writes,unexpected,label:s=>language==='en'?s:ar[s]||s,url}
}
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log('PASS '+name)}
async function preview(f){await f.page.goto(f.url+'/admin/content-sync');await f.page.getByRole('button',{name:f.label('Check hosted preview'),exact:true}).click();await f.page.getByRole('heading',{name:f.label('2. Review every proposed change')}).waitFor()}
async function select(f,slug){await f.page.locator('article.sync-proposal').filter({has:f.page.locator('label bdi',{hasText:new RegExp(slug)})}).getByRole('checkbox').check()}
async function confirm(f){await f.page.getByLabel(f.label('I reviewed the preview and want to synchronize this selected batch.'),{exact:true}).check();await f.page.getByRole('button',{name:f.label('Review batch confirmation'),exact:true}).click();await f.page.getByRole('dialog').waitFor()}
async function accessible(f){await f.page.waitForTimeout(350);assert.equal(await f.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal page overflow');const a=await new AxeBuilder({page:f.page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[])}
try{
 await mkdir('artifacts/content-sync/browser',{recursive:true})
 for(const language of ['en','ar-JO'])for(const width of [1366,390])await check(`${language} ${width}px: full preview, evidence, accessible layout, explicit confirmation and verified batch`,async()=>{
  const f=await setup({language,width});await preview(f);assert.equal(f.writes.length,0);assert.equal(await f.page.locator('.sync-proposals').first().locator('article.sync-proposal').count(),19);assert.equal(await f.page.getByRole('heading',{name:f.label('Excluded image candidates')}).count(),1)
  const downloading=f.page.waitForEvent('download');await f.page.getByRole('button',{name:f.label('Download fresh content snapshot'),exact:true}).click();const file=await downloading,raw=await readFile(await file.path(),'utf8'),snapshot=JSON.parse(raw);assert.equal(snapshot.destinations.length,24);assert.equal(snapshot.assessment.translations.length,19);assert.equal(snapshot.assessment.images.length,30);assert.ok(!/access_token|refresh_token|synthetic-fixture|reviewed_by|updated_by/.test(raw))
  await f.page.locator('.sync-image-group>summary').click();assert.equal(await f.page.locator('.sync-image-group>div>details').count(),30);await f.page.locator('.sync-image-group>div>details').first().locator('summary').first().click();await f.page.getByRole('link',{name:f.label('Recorded image source'),exact:true}).first().waitFor();await f.page.locator('.sync-image-group>summary').click()
  const p=f.page.locator('article.sync-proposal').filter({has:f.page.locator('label bdi',{hasText:'petra'})}).first();await p.locator('details').first().locator('summary').first().click();assert.equal(await p.locator('.sync-diff').count(),11);await accessible(f)
  await select(f,'^petra$');await confirm(f);await accessible(f);await f.page.keyboard.press('Escape');assert.equal(await f.page.getByRole('dialog').count(),0);assert.equal(f.writes.length,0)
  await f.page.getByRole('button',{name:f.label('Review batch confirmation'),exact:true}).click();await f.page.getByRole('button',{name:f.label('Synchronize this batch'),exact:true}).click();await f.page.getByRole('button',{name:f.label('Download detailed batch result'),exact:true}).waitFor();assert.equal(f.writes.length,2);assert.equal(f.writes[0].values.editorial_status,'pending');assert.equal(f.writes[1].values.editorial_status,'reviewed');assert.equal(await f.page.getByText(f.label('Applied and read back'),{exact:false}).count(),1)
  await accessible(f);await f.page.evaluate(()=>scrollTo(0,0));await f.page.screenshot({path:`artifacts/content-sync/browser/${language}-${width}.png`,fullPage:true})
  await f.page.getByRole('button',{name:f.label('Check hosted preview'),exact:true}).click();await f.page.getByText(f.label('Already applied — skipped'),{exact:true}).first().waitFor();assert.equal(f.writes.length,2)
  assert.deepEqual(f.unexpected,[]);assert.ok(f.writes.every(w=>!Object.hasOwn(w.values,'status')&&!Object.hasOwn(w.values,'reviewed_by')));await f.context.close()
 })
 await check('batch size three and repeated confirmation clicks do not repeat writes',async()=>{
  const f=await setup();await preview(f);await f.page.getByRole('button',{name:'Select eligible translations',exact:true}).click();await confirm(f);assert.equal(await f.page.getByRole('dialog').locator('li').count(),3)
  await f.page.getByRole('button',{name:'Synchronize this batch',exact:true}).evaluate(b=>{b.click();b.click()});await f.page.getByRole('button',{name:'Download detailed batch result',exact:true}).waitFor();const ids=new Set(f.writes.map(w=>w.id));assert.equal(ids.size,3);assert.ok(f.writes.length<=6);assert.deepEqual(f.unexpected,[]);await f.context.close()
 })
 await check('changed translation cannot be selected; partial review failure stops remainder',async()=>{
  const c=await setup({conflict:true});await preview(c);assert.equal(await c.page.getByText('Conflict — skipped',{exact:true}).count(),1);assert.equal(c.writes.length,0);await c.context.close()
  const f=await setup({failReview:true});await preview(f);await select(f,'^petra$');await select(f,'^jerash-archaeological-city$');await confirm(f);await f.page.getByRole('button',{name:'Synchronize this batch',exact:true}).click();await f.page.getByRole('button',{name:'Download detailed batch result',exact:true}).waitFor();assert.equal(f.writes.length,1);await f.page.getByText('Text saved; review pending or unverified',{exact:false}).waitFor();await f.page.getByText('Not attempted',{exact:false}).waitFor();assert.deepEqual(f.unexpected,[]);await f.context.close()
 })
 for(const signedIn of [false,true])await check(`Admin route denies ${signedIn?'ordinary account':'guest'} with no content mutation`,async()=>{
  const f=await setup({allowed:false,signedIn});await f.page.goto(base+'/admin/content-sync');await f.page.locator(signedIn?'.auth-feedback--error':'form').first().waitFor();assert.equal(await f.page.getByRole('button',{name:'Check hosted preview',exact:true}).count(),0);assert.equal(f.writes.length,0);assert.deepEqual(f.unexpected,[]);await f.context.close()
 })
 if(process.env.QA_PRODUCTION_URL)await check('production build hides execution and does not fetch the prepared package',async()=>{
  const f=await setup({url:process.env.QA_PRODUCTION_URL});await f.page.goto(f.url+'/admin/content-sync');await f.page.getByText('This tool is available only on a local development server. No synchronization is available in this build.',{exact:true}).waitFor();assert.equal(await f.page.getByRole('button',{name:'Check hosted preview',exact:true}).count(),0);assert.ok(!f.requests.some(r=>r.path.endsWith('phase14-admin-sync.json')));assert.equal(f.writes.length,0);assert.deepEqual(f.unexpected,[]);await f.context.close()
 })
 assert.deepEqual(errors,[])
}finally{await browser.close();await writeFile('docs/validation/admin-content-sync-browser.json',JSON.stringify({scope:'Playwright and axe; all Supabase requests intercepted with synthetic sessions/records',at:new Date().toISOString(),results,pageErrors:errors},null,2)+'\n')}

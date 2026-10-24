import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
import ar from '../src/i18n/locales/ar-JO.json' with {type:'json'}
import {syntheticImage} from './synthetic-image-fixture.mjs'
const root=join(tmpdir(),'unseen-jo-browser-check/node_modules'),{chromium}=await import(pathToFileURL(join(root,'playwright/index.mjs'))),{default:AxeBuilder}=await import(pathToFileURL(join(root,'@axe-core/playwright/dist/index.mjs')))
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4184',port=new URL(base).port,browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=[],errors=[]
const snapshot=JSON.parse(await readFile('docs/validation/phase05-public-snapshot.json','utf8')),places=snapshot.rows
const a='00000000-0000-4000-8000-000000000701',b='00000000-0000-4000-8000-000000000702'
const user=id=>({id,aud:'authenticated',role:'authenticated',email:id===a?'first@example.invalid':'second@example.invalid',email_confirmed_at:'2026-10-20T10:00:00Z',created_at:'2026-10-20T10:00:00Z',user_metadata:{full_name:'Fixture Explorer'},app_metadata:{provider:'email',providers:['email']}})
const session=id=>({access_token:['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:id,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'fixture-not-a-signature'].join('.'),refresh_token:'fixture-only',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:user(id)})
await mkdir('artifacts/phase07',{recursive:true})
async function setup(lang='en',width=1366,{authenticated=true,seed=0,reduced=false,hidden=null}={}){
 const context=await browser.newContext({viewport:{width,height:width<600?844:768},reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),requests=[],fail={visits:false,saves:false,history:false,clear:false}
 const saves=new Map([[a,[{place_id:places[0].id,created_at:'2026-10-01T10:00:00Z'},{place_id:places[1].id,created_at:'2026-10-02T10:00:00Z'}]],[b,[]]]),visits=new Map([[a,[]],[b,[]]]),history=new Map([[a,[]],[b,[]]])
 for(let i=0;i<seed;i++)history.get(a).push({event_id:`00000000-0000-4000-8000-${String(i+10).padStart(12,'0')}`,place_id:places[i%places.length].id,created_at:new Date(Date.UTC(2026,9,20,10,0,i)).toISOString()})
 page.on('pageerror',e=>errors.push(e.message))
 await context.addInitScript(({lang,authenticated,value})=>{localStorage.setItem('unseen-jo-language',lang);window.phase07Document=crypto.randomUUID();if(authenticated&&!localStorage.getItem('phase07-initialized')){localStorage.setItem('unseen-jo-user-auth',JSON.stringify(value));localStorage.setItem('phase07-initialized','yes')}},{lang,authenticated,value:session(a)})
 const json=(route,data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)})
 await context.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname,method=req.method();requests.push({path,method,query:url.search})
  let uid;try{uid=JSON.parse(Buffer.from((req.headers().authorization||'').split('.')[1],'base64url')).sub}catch{/* anonymous */}
  const body=()=>req.postDataJSON(),done=()=>route.fulfill({status:method==='POST'?201:204})
  if(path==='/auth/v1/settings')return json(route,{external:{email:true,google:false},disable_signup:false,mailer_autoconfirm:false})
  if(path==='/auth/v1/user')return json(route,user(uid))
  if(path==='/auth/v1/token')return json(route,session(body().email==='second@example.invalid'?b:a))
  if(path==='/auth/v1/logout')return done()
  if(path.endsWith('/profiles'))return json(route,{id:uid,display_name:'Fixture Explorer',avatar_path:null,preferred_language:lang,updated_at:'2026-10-20T10:00:00Z'})
  if(path.endsWith('/user_preferences'))return json(route,[])
  if(path.endsWith('/saved_places')){
   assert.ok([a,b].includes(uid));assert.equal(url.searchParams.get('user_id')||'eq.'+uid,'eq.'+uid)
   if(method==='GET')return json(route,saves.get(uid))
   if(fail.saves)return json(route,{code:'fixture_offline'},503)
   if(method==='DELETE'){saves.set(uid,saves.get(uid).filter(r=>'eq.'+r.place_id!==url.searchParams.get('place_id')));return done()}
   for(const row of Array.isArray(body())?body():[body()]){assert.equal(row.user_id,uid);if(!saves.get(uid).some(r=>r.place_id===row.place_id))saves.get(uid).push({place_id:row.place_id,created_at:new Date().toISOString()})}return done()
  }
  if(path.endsWith('/user_visited_places')){
   assert.ok([a,b].includes(uid));if(method==='GET')return json(route,visits.get(uid))
   if(fail.visits)return json(route,{code:'fixture_offline'},503)
   if(method==='DELETE'){visits.set(uid,visits.get(uid).filter(r=>'eq.'+r.place_id!==url.searchParams.get('place_id')));return done()}
   const row=body();assert.equal(row.user_id,uid);if(!visits.get(uid).some(r=>r.place_id===row.place_id))visits.get(uid).push({...row,created_at:new Date().toISOString()});return done()
  }
  if(path.endsWith('/user_discovery_history')){
   assert.ok([a,b].includes(uid));if(method==='POST'){if(fail.history)return json(route,{code:'fixture_offline'},503);const row=body();assert.equal(row.user_id,uid);if(!history.get(uid).some(r=>r.event_id===row.event_id))history.get(uid).push({...row,created_at:new Date().toISOString()});return done()}
   if(method==='DELETE'){if(fail.clear)return json(route,{code:'fixture_offline'},503);history.set(uid,[]);return done()}
   let rows=[...history.get(uid)].sort((a,b)=>b.created_at.localeCompare(a.created_at)||b.event_id.localeCompare(a.event_id));const cursor=url.searchParams.get('or')?.match(/created_at\.lt\.([^,]+),and\(created_at\.eq\.[^,]+,event_id\.lt\.([^)]+)/)
   if(cursor)rows=rows.filter(r=>r.created_at<cursor[1]||r.created_at===cursor[1]&&r.event_id<cursor[2]);return json(route,rows.slice(0,Number(url.searchParams.get('limit')||21)))
  }
  if(path.endsWith('/categories'))return json(route,snapshot.categories)
  if(path.endsWith('/places')){let rows=places.filter(p=>p.id!==hidden);const slug=url.searchParams.get('slug')?.slice(3);if(slug)rows=rows.filter(p=>p.slug===slug);const ids=url.searchParams.get('id');if(ids?.startsWith('in.('))rows=rows.filter(p=>ids.includes(p.id));return json(route,rows)}
  if(path.includes('/storage/v1/object/sign/')&&method==='POST'){const data=body();return json(route,data.paths?data.paths.map(path=>({path,signedURL:'/object/sign/place-images/'+path+'?token=fixture'})):{signedURL:'/object/sign/place-images/fixture?token=fixture'})}
  if(path.includes('/storage/v1/'))return route.fulfill({status:200,contentType:'image/png',body:syntheticImage})
  throw Error('Unhandled fixture endpoint '+path)
 })
 const label=s=>lang==='en'?s:ar[s]||s
 return {context,page,requests,saves,visits,history,fail,label}
}
async function check(name,fn){await fn();results.push({name,status:'passed',scope:'Real React/router/browser; intercepted Auth/REST fixtures, synthetic photograph'});console.log('PASS '+name)}
async function axe(page){await page.waitForTimeout(800);const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2))}
async function ready(page,tab){if(tab)await page.locator('#personal-panel-'+tab).waitFor();await page.locator((tab?'#personal-panel-'+tab+' ':'')+'.personal-place').first().waitFor()}
async function login(page,email='first@example.invalid'){await page.goto(base+'/auth?mode=login');await page.locator('input[name="email"]').fill(email);await page.locator('input[name="password"]').fill('FixturePassword123');await page.locator('form button[type="submit"]').click();await page.waitForURL('**/profile');await page.getByRole('button',{name:'Save profile',exact:true}).waitFor()}
try{
 if(!process.env.QA_PERSONAL_TAIL)await check('guest local save, refresh persistence, optional contextual login and merge without loss/duplicates',async()=>{
  const s=await setup('en',1366,{authenticated:false}),{page,context}=s
  await page.goto(base+'/explore');await page.locator('.preview-favorite').first().waitFor();const id=await page.locator('.destination-card').nth(2).getAttribute('data-place-id');await page.locator('.preview-favorite').first().click();await page.locator('.preview-favorite').nth(2).click()
  await page.goto(base+'/my-discoveries');await ready(page);assert.equal(await page.locator('.personal-place').count(),2);await page.reload();await ready(page);assert.equal(s.requests.filter(r=>r.path.endsWith('/user_visited_places')).length,0)
  await page.getByRole('tab',{name:/Visited Places/}).click();await page.getByRole('link',{name:'Sign In',exact:true}).first().click();assert.ok(page.url().includes('returnTo='));await page.locator('input[name="email"]').fill('first@example.invalid');await page.locator('input[name="password"]').fill('FixturePassword123');await page.locator('form button[type="submit"]').click();await page.waitForURL('**/my-discoveries?tab=visited')
  await page.getByRole('tab',{name:/Saved Places/}).click();await ready(page);assert.equal(s.saves.get(a).length,new Set([places[0].id,places[1].id,id]).size);assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('unseen-jo-guest-saves'))),[])
  const writes=s.requests.filter(r=>r.path.endsWith('/saved_places')&&r.method==='POST').length;await page.reload();await ready(page);assert.equal(s.requests.filter(r=>r.path.endsWith('/saved_places')&&r.method==='POST').length,writes);await axe(page);await context.close()
 })
 for(const lang of (process.env.QA_PERSONAL_TAIL?[]:['en','ar-JO']))for(const width of [1366,820,390,320])await check(`saved/visited/date/filter/keyboard/RTL/accessibility ${lang} ${width}`,async()=>{
  const s=await setup(lang,width,{reduced:width===320}),{page,label,context,requests}=s,start=performance.now()
  await page.goto(base+'/my-discoveries');await ready(page);await page.getByRole('button',{name:label('Mark as Visited'),exact:true}).first().waitFor();const usableMs=Math.round(performance.now()-start)
  assert.equal(requests.filter(r=>r.path.endsWith('/user_visited_places')).length,1);assert.equal(requests.filter(r=>r.path.endsWith('/user_discovery_history')).length,0)
  const cards=page.locator('.personal-place');assert.equal(await cards.count(),2)
  await page.getByLabel(label('Search your places')).fill('unlikelydestination');assert.equal(await cards.count(),0);await page.getByLabel(label('Search your places')).fill('')
  await page.getByLabel(label('Sort by')).selectOption('name');const titles=await cards.locator('h3').allTextContents();assert.deepEqual(titles,[...titles].sort((a,b)=>a.localeCompare(b,lang)))
  await page.getByLabel(label('Category'),{exact:true}).selectOption('nature');for(const id of await cards.evaluateAll(es=>es.map(e=>e.dataset.placeId)))assert.ok(places.find(p=>p.id===id).place_categories.some(c=>c.categories.slug==='nature'));await page.getByLabel(label('Category'),{exact:true}).selectOption('')
  const first=cards.first(),pid=await first.getAttribute('data-place-id');await first.getByRole('button',{name:label('Mark as Visited'),exact:true}).click();await first.getByLabel(label('Visit date (optional)')).fill('2026-10-01');await first.getByRole('button',{name:label('Save visit'),exact:true}).click();await first.getByRole('button',{name:label('Remove visited status'),exact:true}).waitFor();assert.equal(s.visits.get(a).find(v=>v.place_id===pid).visited_on,'2026-10-01')
  await axe(page);await page.screenshot({path:`artifacts/phase07/saved-${lang}-${width}-${port}.png`,fullPage:true})
  const marker=await page.evaluate(()=>window.phase07Document),count=requests.length;await page.getByLabel(label('Search your places')).fill('retained');const other=await context.newPage();await other.goto('about:blank');await page.waitForTimeout(600);await page.bringToFront();await other.close();assert.equal(await page.getByLabel(label('Search your places')).inputValue(),'retained');assert.equal(await page.evaluate(()=>window.phase07Document),marker);assert.equal(requests.length,count)
  await page.getByRole('tab',{name:new RegExp(label('Saved Places'))}).focus();await page.keyboard.press(lang==='en'?'ArrowRight':'ArrowLeft');await page.locator('#personal-panel-visited').waitFor();assert.ok(page.url().includes('tab=visited'));await page.getByLabel(label('Search your places')).fill('');await cards.first().waitFor();assert.equal(await cards.count(),1)
  await page.reload();await ready(page);assert.equal(await cards.count(),1);await axe(page);await page.screenshot({path:`artifacts/phase07/visited-${lang}-${width}-${port}.png`,fullPage:true})
  await page.getByRole('button',{name:label('Remove visited status'),exact:true}).click();await page.getByRole('heading',{name:label('No visited places yet'),exact:true}).waitFor();assert.equal(s.visits.get(a).length,0)
  results.push({name:`measure ${lang} ${width}`,usableMs,initialVisitsRequests:1,initialHistoryRequests:0,tabReturnRequests:0,documentReloads:0,scope:'Fixture timing, not hosted network performance'});await context.close()
 })
 await check('visit and save failures retain records/form state; retry works',async()=>{
  const s=await setup(),{page,context}=s;await page.goto(base+'/my-discoveries');await ready(page);const card=page.locator('.personal-place').first();await card.getByRole('button',{name:'Mark as Visited',exact:true}).click();await card.getByLabel('Visit date (optional)').fill('2026-10-02');s.fail.visits=true;await card.getByRole('button',{name:'Save visit',exact:true}).click();await page.getByRole('alert').waitFor();assert.equal(await card.getByLabel('Visit date (optional)').inputValue(),'2026-10-02');assert.equal(s.visits.get(a).length,0);s.fail.visits=false;await card.getByRole('button',{name:'Save visit',exact:true}).click();await card.getByRole('button',{name:'Remove visited status',exact:true}).waitFor()
  s.fail.saves=true;await card.getByRole('button',{name:'Remove from Saved Places',exact:true}).click();await page.getByRole('alert').waitFor();await ready(page);assert.equal(s.saves.get(a).length,2);assert.equal(await page.locator('.personal-place').count(),2);await context.close()
 })
 await check('successful recommendations recorded once; browsing is not tracked; history failure retry',async()=>{
  const s=await setup(),{page,context}=s;s.fail.history=true;await page.goto(base+'/discovery-result');await page.locator('.discovery-result-grid').waitFor();await page.getByText('This recommendation could not be added to your history.',{exact:false}).waitFor();assert.equal(s.history.get(a).length,0);s.fail.history=false;await page.getByRole('button',{name:'Retry',exact:true}).click();await page.waitForTimeout(500);assert.equal(s.history.get(a).length,1)
  await page.getByRole('button',{name:'Surprise Me Again',exact:true}).click();await page.waitForTimeout(700);assert.equal(s.history.get(a).length,2);assert.notEqual(s.history.get(a)[0].place_id,s.history.get(a)[1].place_id)
  await page.locator('a[href="/my-discoveries"]').first().click();await page.getByRole('tab',{name:'Discovery History',exact:true}).click();await ready(page,'history');assert.equal(await page.locator('.personal-place').count(),2);await axe(page)
  await page.locator('.personal-place h3 a').first().click();await page.locator('.place-details-page').waitFor();await page.waitForTimeout(300);assert.equal(s.history.get(a).length,2);await context.close()
 })
 await check('bounded history pages, clear cancellation/failure/retry and save preservation',async()=>{
  const s=await setup('en',1366,{seed:45}),{page,context}=s;await page.goto(base+'/my-discoveries?tab=history');await ready(page);assert.equal(await page.locator('.personal-place').count(),20)
  await page.getByRole('button',{name:'Load more recommendations'}).click();await page.waitForTimeout(300);assert.equal(await page.locator('.personal-place').count(),40);await page.getByRole('button',{name:'Load more recommendations'}).click();await page.waitForTimeout(300);assert.equal(await page.locator('.personal-place').count(),45)
  await page.getByRole('button',{name:'Clear discovery history',exact:true}).click();await axe(page);await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(s.history.get(a).length,45)
  await page.getByRole('button',{name:'Clear discovery history',exact:true}).click();s.fail.clear=true;await page.getByRole('button',{name:'Clear history',exact:true}).click();await page.getByRole('alert').waitFor();assert.equal(s.history.get(a).length,45);s.fail.clear=false;await page.getByRole('button',{name:'Clear history',exact:true}).click();await page.getByRole('heading',{name:'No recommendations recorded yet'}).waitFor();assert.equal(s.saves.get(a).length,2);await context.close()
 })
 for(const lang of ['en','ar-JO'])for(const width of [1366,390])await check(`history localized cards, save synchronization and accessibility ${lang} ${width}`,async()=>{
  const s=await setup(lang,width,{seed:3}),{page,context,label}=s
  await page.goto(base+'/my-discoveries?tab=history');await ready(page);assert.equal(await page.locator('.personal-place').count(),3);await axe(page);await page.screenshot({path:`artifacts/phase07/history-${lang}-${width}-${port}.png`,fullPage:true})
  const pid=places[2].id,card=page.locator(`.personal-place[data-place-id="${pid}"]`).first();await card.getByRole('button',{name:label('Save Place'),exact:true}).click();await card.getByRole('button',{name:label('Remove from Saved Places'),exact:true}).waitFor();assert.ok(s.saves.get(a).some(r=>r.place_id===pid))
  await page.goto(base+'/explore');await page.locator('.map-view-jumps button').first().click();await page.locator(`.destination-card[data-place-id="${pid}"] .preview-favorite[aria-pressed="true"]`).waitFor()
  await page.goto(base+'/places/'+places[2].slug);await page.getByRole('button',{name:label('Remove from My Discoveries'),exact:true}).waitFor();await page.getByRole('button',{name:label('Remove from My Discoveries'),exact:true}).click();await page.getByRole('button',{name:label('Add My Discoveries'),exact:true}).waitFor();assert.ok(!s.saves.get(a).some(r=>r.place_id===pid))
  await page.goto(base+'/my-discoveries');await ready(page);assert.equal(await page.locator('.personal-place').count(),2);await context.close()
 })
 await check('unavailable saved/visited records stay manageable without exposing private destination content',async()=>{
  const pid=places[0].id,s=await setup('en',1366,{hidden:pid}),{page,context}=s;s.visits.get(a).push({place_id:pid,visited_on:null,created_at:new Date().toISOString()})
  await page.goto(base+'/my-discoveries');await page.locator('.personal-unavailable').waitFor();assert.equal(await page.locator('.personal-place').count(),1);assert.ok(!(await page.locator('.personal-unavailable').textContent()).includes(places[0].name));await page.locator('.personal-unavailable').getByRole('button',{name:'Remove',exact:true}).click();await page.waitForTimeout(200);assert.ok(!s.saves.get(a).some(r=>r.place_id===pid))
  await page.getByRole('tab',{name:/Visited Places/}).click();await page.locator('#personal-panel-visited').waitFor();await page.locator('.personal-unavailable').getByRole('button',{name:'Remove',exact:true}).click();await page.getByRole('heading',{name:'No visited places yet',exact:true}).waitFor();assert.equal(s.visits.get(a).length,0);await context.close()
 })
 await check('logout and account switch isolate and restore favorites, visits and history; Admin session stays separate',async()=>{
  const s=await setup(),{page,context}=s;s.visits.get(a).push({place_id:places[0].id,visited_on:null,created_at:new Date().toISOString()});s.history.get(a).push({event_id:crypto.randomUUID(),place_id:places[0].id,created_at:new Date().toISOString()})
  await page.goto(base+'/my-discoveries?tab=visited');await ready(page);await page.goto(base+'/profile');await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL(base+'/');await page.goto(base+'/my-discoveries');await page.getByRole('heading',{name:'Your next discovery starts here'}).waitFor();assert.equal(await page.locator('.personal-place').count(),0)
  await login(page,'second@example.invalid');await page.goto(base+'/my-discoveries?tab=visited');await page.getByRole('heading',{name:'No visited places yet'}).waitFor();assert.equal(await page.locator('.personal-place').count(),0);await page.goto(base+'/my-discoveries?tab=history');await page.getByRole('heading',{name:'No recommendations recorded yet'}).waitFor()
  await page.goto(base+'/admin');await page.locator('.auth-admin-page .auth-shell').waitFor();assert.equal(await page.locator('.admin-sidebar').count(),0)
  await page.goto(base+'/profile');await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL(base+'/');await login(page)
  await page.goto(base+'/my-discoveries?tab=visited');await ready(page);assert.equal(await page.locator('.personal-place').count(),1);await page.getByRole('tab',{name:'Discovery History',exact:true}).click();await ready(page,'history');assert.equal(await page.locator('.personal-place').count(),1);assert.equal(s.saves.get(a).length,2);await context.close()
 })
 assert.deepEqual(errors,[])
}catch(e){const page=browser.contexts().at(-1)?.pages()[0];if(page)await page.screenshot({path:`artifacts/phase07/failure-${port}.png`,fullPage:true}).catch(()=>{});errors.push(e.stack);throw e}finally{await browser.close();await writeFile(`docs/validation/phase07-browser-${port}.json`,JSON.stringify({base,scope:'Isolated fixtures, no genuine account accepted or modified.',results,errors},null,2)+'\n')}

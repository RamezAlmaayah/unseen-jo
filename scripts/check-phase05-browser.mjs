import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
import ar from '../src/i18n/locales/ar-JO.json' with {type:'json'}
import {syntheticImage} from './synthetic-image-fixture.mjs'
import {rankDestinations,chooseRecommendation} from '../src/features/recommendations/engine.js'
const root=join(tmpdir(),'unseen-jo-browser-check/node_modules'),{chromium}=await import(pathToFileURL(join(root,'playwright/index.mjs'))),{default:AxeBuilder}=await import(pathToFileURL(join(root,'@axe-core/playwright/dist/index.mjs')))
const snapshot=JSON.parse(await readFile('docs/validation/phase05-public-snapshot.json','utf8')),browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=[],errors=[],base=process.env.QA_BASE_URL||'http://127.0.0.1:4190'
await mkdir('artifacts/phase05',{recursive:true})
const poll=async(fn)=>{for(let i=0;i<100;i++){if(await fn())return;await new Promise(r=>setTimeout(r,100))}throw Error('Expected browser state did not settle')}
async function setup(language,width,fixture=null){
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),requests=[],catalog={rows:[],categories:[],details:{}};page.on('pageerror',e=>errors.push(e.message))
 await page.addInitScript(language=>{localStorage.setItem('unseen-jo-language',language);navigator.geolocation.getCurrentPosition=()=>{throw Error('Recommendations must not silently request precise location')}},language)
 if(fixture)await page.addInitScript(()=>{const original=Date.now;window.phase05ClockOffset=0;Date.now=()=>original()+window.phase05ClockOffset})
 await page.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{
  const r=route.request(),u=new URL(r.url());requests.push({path:u.pathname,method:r.method(),query:Object.fromEntries(u.searchParams)})
  if(r.method()!=='GET'&&r.method()!=='HEAD'&&!u.pathname.includes('/storage/v1/object/sign/'))throw Error('Unexpected non-read operation '+u.pathname)
  if(!fixture){
   if(u.pathname.endsWith('/places')||u.pathname.endsWith('/categories')){const response=await route.fetch();assert.ok(response.ok(),'live catalog read succeeds');const rows=await response.json();if(u.pathname.endsWith('/categories'))catalog.categories=rows;else if(!u.searchParams.has('slug'))catalog.rows=rows;else for(const row of Array.isArray(rows)?rows:[rows])if(row)catalog.details[row.id]=row;return route.fulfill({response})}
   return route.continue()
  }
  if(u.pathname.endsWith('/places')&&fixture.fail)return route.abort('failed')
  let body
  if(u.pathname.endsWith('/categories'))body=snapshot.categories
  else if(u.pathname.endsWith('/places')){let rows=fixture.rows;const slug=u.searchParams.get('slug')?.replace('eq.','');if(slug)rows=rows.filter(r=>r.slug===slug);body=rows.filter(r=>r.status==='published'&&!r.is_demo)}
  else if(u.pathname.includes('/storage/v1/')&&r.method()==='POST'){const p=r.postDataJSON();body=p.paths?p.paths.map(path=>({path,signedURL:'/object/sign/place-images/'+path+'?token=fixture'})):{signedURL:'/render/image/sign/place-images/'+u.pathname.split('/place-images/')[1]+'?token=fixture'}}
  else if(u.pathname.includes('/storage/v1/'))return route.fulfill({status:200,contentType:'image/png',body:syntheticImage})
  else throw Error('Unexpected fixture read '+u.pathname)
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)})
 });return {context,page,requests,catalog}
}
const axe=async(page)=>{const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2))}
try{
 for(const language of (process.env.QA_LANGUAGES||'en,ar-JO').split(','))for(const width of (process.env.QA_WIDTHS||'1440,820,390').split(',').map(Number)){
  const label=s=>language==='en'?s:ar[s]||s,{context,page,requests,catalog}=await setup(language,width),start=performance.now()
  await page.goto(base+'/preferences');await page.locator('input[name="interests"][value="history"]').waitFor({state:'attached'})
  assert.equal(requests.filter(r=>r.path.endsWith('/places')).length,0,'preferences load categories only')
  for(const value of ['nature','history'])await page.locator(`label:has(input[name="interests"][value="${value}"])`).click()
  await page.locator('label:has(input[name="availableTime"][value="full-day"])').click();await axe(page)
  const clickStart=performance.now();await page.getByRole('button',{name:label('Show Me Places'),exact:true}).click();await page.waitForURL(base+'/discovery-result');await page.locator('.discovery-result-grid').waitFor({timeout:45000})
  const first=await page.locator('.destination-card').getAttribute('data-place-id')
  const preferences=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('unseen-jo-guest-preferences')).preferences)
  assert.ok(catalog.rows.length>=6,'current published catalog is available')
  const expected=chooseRecommendation(rankDestinations(catalog.rows,preferences,catalog.categories).ranked)
  assert.equal(first,expected.id,'selection follows ranked current catalog, without pinning an obsolete six-place result')
  const selectedRow=catalog.details[first];assert.ok(selectedRow,'selected place details were read from hosted Supabase')
  const usableMs=performance.now()-start,recommendationMs=performance.now()-clickStart;assert.equal(await page.locator('.result-demo-label').count(),0);assert.equal(await page.locator('html').getAttribute('dir'),language==='en'?'ltr':'rtl')
  assert.ok((await page.locator('.matching-reasons').innerText()).includes(label('Admission price is unavailable; budget suitability is unconfirmed.')))
  if(selectedRow.place_images.length){
   await page.waitForFunction(()=>{const img=document.querySelector('.destination-card__image img');return img?.complete&&img.naturalWidth>0},{},{timeout:45000})
   assert.ok(await page.locator('.destination-card__image img').getAttribute('srcset'))
  }else{
   assert.equal(await page.locator('.destination-card__image img').count(),0)
   assert.equal(await page.locator('.destination-card__image .asset-unavailable').count(),1,'missing approved photo uses neutral fallback')
  }
  await page.locator('.language-switcher').click();assert.equal(await page.locator('.destination-card').getAttribute('data-place-id'),first);await page.locator('.language-switcher').click();assert.equal(await page.locator('.destination-card').getAttribute('data-place-id'),first)
  if(selectedRow.place_images.length){await page.locator('.recommendation-credit summary').click();assert.ok((await page.locator('.recommendation-credit').innerText()).includes((selectedRow.place_images.find(i=>i.is_cover)||selectedRow.place_images[0]).attribution));await page.locator('.recommendation-credit summary').click()}else assert.equal(await page.locator('.recommendation-credit').count(),0)
  await axe(page);await page.screenshot({path:`artifacts/phase05/live-result-${language}-${width}.png`,fullPage:true})
  await page.locator('.preview-favorite').click();assert.equal(await page.locator('.preview-favorite').getAttribute('aria-pressed'),'true')
  const initialCandidateRequests=requests.filter(r=>r.path.endsWith('/places')&&!r.query.slug).length
  await page.getByRole('link',{name:label('Explore This Place'),exact:true}).click();await page.locator('.place-details-page').waitFor();await page.goBack();await page.locator('.discovery-result-grid').waitFor();assert.equal(await page.locator('.destination-card').getAttribute('data-place-id'),first);assert.equal(await page.locator('.preview-favorite').getAttribute('aria-pressed'),'true')
  await page.getByRole('button',{name:label('Surprise Me Again'),exact:true}).click();await poll(()=>page.locator('.destination-card').getAttribute('data-place-id').then(id=>id!==first));assert.equal(requests.filter(r=>r.path.endsWith('/places')&&!r.query.slug).length,initialCandidateRequests)
  const selected=await page.locator('.destination-card').getAttribute('data-place-id'),before=requests.filter(r=>r.path.endsWith('/places')||r.path.endsWith('/categories')).length,other=await context.newPage();await other.goto('about:blank');await page.waitForTimeout(500);await other.close();await page.bringToFront();assert.equal(await page.locator('.destination-card').getAttribute('data-place-id'),selected);assert.equal(requests.filter(r=>r.path.endsWith('/places')||r.path.endsWith('/categories')).length,before)
  await page.getByRole('link',{name:label('Edit Preferences'),exact:true}).click();await page.waitForURL(base+'/surprise-me');assert.equal(await page.locator('#surprise-availableTime').inputValue(),'full-day');assert.equal(await page.locator('input[value="history"]').isChecked(),true)
  await page.locator('.recommendation-limits summary').click();await page.getByLabel(label('Require a confirmed total trip cost within my budget'),{exact:true}).check();await axe(page)
  await page.getByRole('button',{name:label('Surprise Me'),exact:true}).click();await page.locator('.recommendation-empty').waitFor();assert.equal(await page.locator('.destination-card').count(),0);await axe(page)
  await page.getByRole('button',{name:label('Show alternatives with unverified essentials'),exact:true}).click();await page.locator('.recommendation-notice').waitFor();await page.locator('.discovery-result-grid').waitFor();assert.ok((await page.locator('.recommendation-notice').innerText()).includes(language==='en'?'Unverified':'غير مؤكد'))
  await page.getByRole('link',{name:label('Edit Preferences'),exact:true}).click();await page.locator('.recommendation-limits summary').click();assert.equal(await page.getByLabel(label('Require a confirmed total trip cost within my budget'),{exact:true}).isChecked(),true)
  await page.getByLabel(label('Require all selected interests'),{exact:true}).check();await page.getByLabel(label('Require a complete visit estimate within my time'),{exact:true}).check();await page.getByLabel(label('Available hours'),{exact:true}).fill('0.25')
  await page.getByRole('button',{name:label('Surprise Me'),exact:true}).click();await page.locator('.recommendation-empty').waitFor();assert.equal(await page.getByRole('button',{name:label('Show alternatives with unverified essentials'),exact:true}).count(),0)
  assert.equal(requests.some(r=>r.path.includes('admin_')||r.path.includes('/place_reviews')),false)
  results.push({scope:'genuine anonymous live Supabase, zero API mocking',language,width,usableJourneyMs:usableMs,recommendationMs,candidateRequests:initialCandidateRequests,checks:'preferences → real result → favorite → live details → retained result → diverse again → strict unknown → explicit alternative → impossible constraints; tab stability; four axe scans',status:'passed'});console.log('PASS live guest recommendation journey '+language+' '+width);await context.close()
 }
 // Reproducible error/empty/single/sparse states against actual schema snapshots.
 for(const kind of ['network','empty','single','sparse','expiry']){
  const rows=kind==='empty'?[]:kind==='single'?[snapshot.rows[0]]:kind==='sparse'?[{...snapshot.rows[0],latitude:null,longitude:null,duration_min_minutes:null,duration_max_minutes:null}]:snapshot.rows
  const fixture={rows,fail:kind==='network'},{context,page}=await setup('en',390,fixture);await page.goto(base+'/discovery-result')
  if(kind==='network'){await page.locator('.content-state--error').waitFor();fixture.fail=false;await page.getByRole('button',{name:'Try again',exact:true}).click();await page.locator('.discovery-result-grid').waitFor()}
  else if(kind==='expiry'){await page.locator('.discovery-result-grid').waitFor();fixture.rows=[];await page.evaluate(()=>{window.phase05ClockOffset=61000});await page.getByRole('button',{name:'Surprise Me Again',exact:true}).click();await page.locator('.recommendation-empty').waitFor();assert.equal(await page.locator('.destination-card').count(),0)}
  else if(kind==='empty'){await page.locator('.recommendation-empty').waitFor();assert.equal(await page.locator('.destination-card').count(),0)}
  else{await page.locator('.discovery-result-grid').waitFor();if(kind==='sparse')assert.ok((await page.locator('.recommendation-score').innerText()).includes('Not enough evidence'));await page.getByRole('button',{name:'Surprise Me Again',exact:true}).click();assert.equal(await page.locator('.destination-card').getAttribute('data-place-id'),rows[0].id)}
  await axe(page);results.push({scope:'intercepted fixture',kind,status:'passed'});console.log('PASS simulated '+kind);await context.close()
 }
 assert.deepEqual(errors,[])
}catch(error){for(const c of browser.contexts())for(const p of c.pages()){console.log(p.url(),p.viewportSize());console.log(await p.locator('body *').evaluateAll(es=>es.map(e=>({tag:e.tagName,cls:e.className,x:e.getBoundingClientRect().x,right:e.getBoundingClientRect().right})).filter(e=>e.right>innerWidth+2||e.x< -2).slice(0,20)));await p.screenshot({path:'artifacts/phase05/failure.png',fullPage:true})}errors.push(error.message);throw error}finally{await browser.close();await writeFile('docs/validation/'+(process.env.QA_BROWSER_REPORT||'phase05-browser.json'),JSON.stringify({base,results,errors},null,2)+'\n')}

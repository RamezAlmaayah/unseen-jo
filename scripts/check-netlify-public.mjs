// Genuine anonymous hosted reads through the locally built app. No real Admin
// context is used. All non-read Supabase operations are blocked before navigation.
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
import ar from '../src/i18n/locales/ar-JO.json' with {type:'json'}
import {createClient} from '@supabase/supabase-js'
import {loadEnv} from 'vite'
import {readSupabaseConfig} from '../src/lib/supabase/config.js'
import {createTourismRepository} from '../src/features/tourism/repository.js'
const modules=join(tmpdir(),'unseen-jo-browser-check/node_modules'),{chromium}=await import(pathToFileURL(join(modules,'playwright/index.mjs'))),{default:AxeBuilder}=await import(pathToFileURL(join(modules,'@axe-core/playwright/dist/index.mjs')))
// Refresh the inventory: historical seven-place fixtures are not a hosted baseline.
const config=readSupabaseConfig(loadEnv('production',process.cwd(),'VITE_'))
assert.equal(config.url,'https://dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(config.url,config.publishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>{
 const url=new URL(typeof input==='string'?input:input.url),method=init?.method||'GET'
 assert.equal(url.origin,config.url)
 assert.ok(['GET','HEAD'].includes(method)||method==='POST'&&url.pathname.startsWith('/storage/v1/object/sign/'),'Non-read operation blocked')
 return fetch(input,init)
}}})
const raw=await client.from('places').select('id,slug,name,status,place_images(id,storage_path,is_cover)').eq('status','published').eq('is_demo',false).order('slug')
assert.ifError(raw.error)
const qualified=await createTourismRepository(client).fetchPublishedPlaces(),goodIds=new Set(qualified.map(p=>p.id)),goodSlugs=new Set(qualified.map(p=>p.slug))
const good=raw.data.filter(p=>goodIds.has(p.id)),hidden=raw.data.filter(p=>!goodIds.has(p.id))
assert.equal(raw.data.length,24,'Unexpected inventory change: inspect before release')
assert.ok(good.length>0)
const catalog=raw.data.map(p=>({id:p.id,slug:p.slug,name:p.name,status:p.status,publicImageRows:p.place_images.length,eligible:goodIds.has(p.id)}))
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),base=process.env.QA_BASE_URL||'http://127.0.0.1:4195',results=[],errors=[],blocked=[]
const languages=['en','ar-JO']
const clean=s=>String(s).replace(/https?:\/\/\S+/g,'[URL omitted]')
async function photos(page,selector){const list=page.locator(selector);let decoded=0;for(let i=0;i<await list.count();i++){const image=list.nth(i);if(!await image.isVisible())continue;await image.scrollIntoViewIfNeeded();await page.waitForFunction(img=>img.complete&&img.naturalWidth>0,await image.elementHandle(),{timeout:30000});decoded++}assert.ok(decoded>0,'At least one real image must render');assert.equal(await page.locator('main .asset-unavailable').count(),0);return decoded}
async function links(page){const hrefs=await page.locator('main a[href^="/places/"]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));assert.ok(hrefs.length);assert.ok(hrefs.every(h=>goodSlugs.has(h.split('/')[2].split('?')[0])))}
try{
 await mkdir('artifacts/netlify/browser',{recursive:true})
 for(const [language,width]of[['en',1366],['ar-JO',390]].filter(([language])=>languages.includes(language))){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage(),label=s=>language==='en'?s:ar[s]||s
  await context.addInitScript(language=>{localStorage.setItem('unseen-jo-language',language);sessionStorage.setItem('unseen-jo-guest-preferences',JSON.stringify({preferences:{interests:['nature'],startingLocation:'amman',availableTime:'full-day',budget:'over-30',transportation:'car',travelGroup:'friends'},dirty:true}))},language)
  await context.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{const r=route.request(),path=new URL(r.url()).pathname;if(['GET','HEAD'].includes(r.method())||r.method()==='POST'&&path.startsWith('/storage/v1/object/sign/'))return route.continue();blocked.push({path,method:r.method()});return route.abort()})
  page.on('pageerror',e=>errors.push(clean(e.message)))
  await page.goto(base+'/');await page.waitForFunction(()=>document.querySelectorAll('.featured-card').length===3);await links(page);const homePhotos=await photos(page,'.featured-card img');results.push({language,width,route:'/',cards:3,realPhotos:homePhotos,status:'PASS'})
  await page.goto(base+'/explore');await page.waitForFunction(count=>document.querySelectorAll('.destination-card').length===count,good.length);if(width<1024)await page.getByRole('button',{name:label('List'),exact:true}).click();const ids=await page.locator('.destination-card').evaluateAll(es=>es.map(e=>e.dataset.placeId));assert.deepEqual(new Set(ids),goodIds);await links(page);const explorePhotos=await photos(page,'.destination-card__image img');assert.equal(explorePhotos,good.length)
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);results.push({language,width,route:'/explore',cards:good.length,realPhotos:explorePhotos,axeViolations:0,status:'PASS'})
  for(const p of hidden){await page.getByRole('searchbox',{name:label('Search destinations'),exact:true}).fill(p.name);await page.getByRole('heading',{name:label('No destinations match your search'),exact:true}).waitFor({timeout:15000});assert.equal(await page.locator('.destination-card').count(),0)}
  await page.getByRole('searchbox',{name:label('Search destinations'),exact:true}).fill('')
  results.push({language,width,route:'/explore?search',excludedSearches:hidden.length,status:'PASS'})
  await page.goto(base+'/map');const map=page.locator('.map-canvas').first();await map.scrollIntoViewIfNeeded();await page.waitForFunction(count=>document.querySelector('.map-canvas')?.dataset.markerCount===count,String(good.length),{timeout:45000});await page.waitForFunction(()=>document.querySelector('.map-canvas')?.dataset.mapReady==='true',{},{timeout:45000});assert.deepEqual(new Set(await page.locator('.destination-marker').evaluateAll(es=>es.map(e=>e.dataset.placeId))),goodIds)
  await page.locator('.destination-marker').first().click({force:true});await page.locator('.tourism-popup').waitFor();const popupPhotoCount=await photos(page,'.tourism-popup img');results.push({language,width,route:'/map',markers:good.length,mapReady:true,popupPhotos:popupPhotoCount,status:'PASS'})
  for(const p of good){await page.goto(base+'/places/'+p.slug);await page.locator('.photo-gallery').waitFor();const count=await photos(page,'.photo-gallery img');assert.ok(count>0);results.push({language,width,route:'/places/'+p.slug,realPhotos:count,status:'PASS'})}
  for(const p of hidden){await page.goto(base+'/places/'+p.slug);await page.getByRole('heading',{name:label('Place not found'),exact:true}).waitFor();assert.equal(await page.locator('.photo-gallery,.destination-card').count(),0)}
  results.push({language,width,route:'/places/(image-less)',unavailableDetails:hidden.length,status:'PASS'})
  await page.goto(base+'/discovery-result');await page.locator('.destination-card--large').waitFor({timeout:30000});const chosen=await page.locator('.destination-card--large').getAttribute('data-place-id');assert.ok(goodIds.has(chosen));const recommendationPhotos=await photos(page,'.destination-card--large img.asset-image');results.push({language,width,route:'/discovery-result',selectedFromQualifiedCatalog:true,realPhotos:recommendationPhotos,status:'PASS'})
  await page.screenshot({path:`artifacts/netlify/browser/result-${language}.png`,fullPage:false});await context.close();console.log('PASS live '+language+': Home, Explore, '+hidden.length+' excluded searches/details, map, '+good.length+' real galleries, recommendation')
 }
 assert.deepEqual(errors,[]);assert.deepEqual(blocked,[])
}catch(e){errors.push(clean(e.message));const page=browser.contexts().at(-1)?.pages().at(-1);if(page)await page.screenshot({path:'artifacts/netlify/browser/failure.png',fullPage:false});throw e}finally{await browser.close();await writeFile('docs/validation/netlify-public-browser.json',JSON.stringify({scope:'Actual production build in isolated Chromium; real anonymous hosted API/Storage reads, no API fixtures; all content/Auth mutations blocked',generatedAt:new Date().toISOString(),catalog,summary:{published:raw.data.length,eligible:good.length,excluded:hidden.length,publicImageRows:raw.data.reduce((n,p)=>n+p.place_images.length,0),hostedWrites:0},results,errors,blockedMutations:blocked},null,2)+'\n')}

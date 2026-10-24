import assert from 'node:assert/strict'
import {writeFile,mkdir} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const env=loadEnv('production',process.cwd(),'VITE_'),base=process.env.QA_BASE_URL||'http://127.0.0.1:4184',port=new URL(base).port
assert.equal(new URL(env.VITE_SUPABASE_URL).hostname,'dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
const {data,error}=await client.from('places').select('id').eq('status','published').eq('is_demo',false).order('slug');assert.ifError(error);assert.equal(data.length,6)
await mkdir('artifacts/phase07',{recursive:true})
const browser=await chromium.launch({headless:true}),results=[]
try{for(const [lang,width,height] of [['en',1366,768],['ar-JO',390,844]]){
 const context=await browser.newContext({viewport:{width,height}})
 await context.addInitScript(lang=>{localStorage.setItem('unseen-jo-language',lang);window.phase07Document=crypto.randomUUID()},lang)
 const page=await context.newPage(),requests=[];page.on('request',r=>{const u=new URL(r.url());if(u.hostname.endsWith('supabase.co'))requests.push({path:u.pathname,method:r.method()})})
 const start=performance.now();await page.goto(base+'/my-discoveries');await page.locator('.personal-empty').waitFor();const usableMs=Math.round(performance.now()-start);await page.waitForTimeout(700)
 const measures=await page.evaluate(()=>({resources:performance.getEntriesByType('resource').length,sameOriginTransferBytes:performance.getEntriesByType('resource').filter(r=>r.name.startsWith(location.origin)).reduce((n,r)=>n+r.transferSize,0),overflow:document.documentElement.scrollWidth>innerWidth}))
 await page.screenshot({path:`artifacts/phase07/after-empty-live-${lang}-${width}-${port}.png`,fullPage:true})
 await page.evaluate(ids=>localStorage.setItem('unseen-jo-guest-saves',JSON.stringify(ids)),data.map(p=>p.id));await page.reload();await page.locator('.personal-place').first().waitFor();assert.equal(await page.locator('.personal-place').count(),6)
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('.personal-place-photo img')).slice(0,2).every(i=>i.complete&&i.naturalWidth>0),{},{timeout:20000});await page.waitForTimeout(500)
 for(const card of await page.locator('.personal-place').all()){await card.scrollIntoViewIfNeeded();await card.locator('img').waitFor();await page.waitForFunction(id=>{const i=document.querySelector(`[data-place-id="${id}"] img`);return i?.complete&&i.naturalWidth>0},await card.getAttribute('data-place-id'),{timeout:20000})}
 await page.evaluate(()=>scrollTo(0,0))
 await page.screenshot({path:`artifacts/phase07/after-saved-live-${lang}-${width}-${port}.png`,fullPage:true})
 const marker=await page.evaluate(()=>window.phase07Document),before=requests.length,other=await context.newPage();await other.goto('about:blank');await page.waitForTimeout(5000);await page.bringToFront();await other.close();assert.equal(await page.evaluate(()=>window.phase07Document),marker)
 assert.equal(requests.length,before)
 const imageInfo=await page.locator('.personal-place-photo img').evaluateAll(es=>es.map(i=>({complete:i.complete,naturalWidth:i.naturalWidth,displayedWidth:Math.round(i.clientWidth),hasResponsiveSources:!!i.srcset})))
 assert.ok(!requests.some(r=>r.method!=='GET'&&!r.path.includes('/object/sign/')),'No hosted account/content writes')
 assert.ok(!requests.some(r=>r.path.endsWith('/user_discovery_history')||r.path.endsWith('/user_visited_places')))
 results.push({lang,width,height,scope:'Actual anonymous Supabase catalog and Storage. Favorites seeded locally only; no account simulated.',usableMs,...measures,tabReturnSupabaseRequests:requests.length-before,tabReturnDocumentReloads:0,imageInfo});await context.close()
}}finally{await browser.close();await writeFile(`docs/validation/phase07-live-browser-${port}.json`,JSON.stringify({base,results},null,2)+'\n')}
console.log(results)

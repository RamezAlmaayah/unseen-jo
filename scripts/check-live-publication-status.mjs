// Genuine anonymous hosted reads and local app renders. No fixture Auth/API.
import assert from 'node:assert/strict'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
import {readFile,writeFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {createTourismRepository} from '../src/features/tourism/repository.js'
const env=loadEnv('production',process.cwd(),'VITE_'),url=env.VITE_SUPABASE_URL
assert.equal(url,'https://dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(url,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),repo=createTourismRepository(client)
const plan=JSON.parse(await readFile('docs/evidence/automated-publishing/publication-plan.json','utf8')),rows=await repo.fetchPublishedPlaces(),results=[]
const denial=await client.rpc('admin_publish_localized_place',{target:plan.places[0].id,expected_updated_at:null,expected_translation_updated_at:null});assert.equal(denial.error?.code,'42501')
for(const p of plan.places){const live=rows.find(r=>r.id===p.id);results.push({id:p.id,slug:p.slug,publiclyReadable:!!live,source:'Actual anonymous published-place query'});if(live)assert.equal(live.slug,p.slug)}
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs'))),browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),renders=[],errors=[]
try{
 for(const language of ['en','ar-JO']){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(language=>localStorage.setItem('unseen-jo-language',language),language)
  for(const route of ['/','/explore','/map']){
   await page.goto((process.env.QA_BASE_URL||'http://127.0.0.1:4190')+route)
   await page.locator('h1').first().waitFor()
   if(route!=='/'){await page.locator('.map-canvas[data-map-ready="true"]').waitFor({timeout:45000});assert.equal(await page.locator('.destination-marker').count(),rows.filter(r=>r.latitude!==null&&r.longitude!==null).length)}
   assert.equal(await page.locator('html').getAttribute('lang'),language);renders.push({language,route,status:'passed',fixtureData:false})
  }
  await context.close()
 }
 assert.deepEqual(errors,[])
 await writeFile('docs/validation/live-publication-status.json',JSON.stringify({checkedAt:new Date().toISOString(),project:'dkhwwvoplhfjccvjegty',scope:'Actual hosted anonymous SDK and actual public browser API calls; no API/Auth interception',publishedCount:rows.length,results,renders,anonymousAtomicPublishDenied:true,errors},null,2)+'\n');console.log('Actual hosted published count: '+rows.length+'; '+renders.length+' bilingual live public renders passed')
}finally{await browser.close()}

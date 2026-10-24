import assert from 'node:assert/strict'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
import {imageVisible} from './image-visibility.mjs'
const root=join(tmpdir(),'unseen-jo-browser-check/node_modules'),{chromium}=await import(pathToFileURL(join(root,'playwright/index.mjs'))),{default:AxeBuilder}=await import(pathToFileURL(join(root,'@axe-core/playwright/dist/index.mjs')))
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=[],errors=[]
const env=loadEnv('production',process.cwd(),'VITE_'),client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
const published=await client.from('places').select('slug,updated_at,place_translations(locale,editorial_status,source_updated_at)').eq('status','published').eq('is_demo',false);assert.ifError(published.error)
try{
 for(const language of ['en','ar-JO']){
  const context=await browser.newContext({viewport:{width:language==='en'?1440:390,height:1000},deviceScaleFactor:language==='en'?1:2,reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(language=>localStorage.setItem('unseen-jo-language',language),language);await page.addInitScript(`window.imageVisible=${imageVisible.toString()}`)
  for(const slug of ['ajloun-forest','salt-historic','wadi-mujib','dana-reserve','iraq-al-amir','umm-qais']){
   await page.goto('http://127.0.0.1:4190/places/'+slug);await page.locator('.photo-gallery').waitFor();await page.waitForFunction(()=>[...document.querySelectorAll('.photo-gallery img')].filter(window.imageVisible).every(i=>i.complete&&i.naturalWidth>0),{},{timeout:45000})
   const currentArabic=published.data.find(p=>p.slug===slug)?.place_translations.some(t=>t.locale==='ar-JO'&&t.editorial_status==='reviewed'&&new Date(t.source_updated_at).getTime()===new Date(published.data.find(p=>p.slug===slug).updated_at).getTime()),expectedFallback=language==='ar-JO'&&!currentArabic
   assert.equal(await page.locator('html').getAttribute('lang'),language);assert.equal(await page.locator('html').getAttribute('dir'),language==='en'?'ltr':'rtl');assert.equal(await page.locator('.translation-notice').count(),expectedFallback?1:0)
   const images=await page.locator('.photo-gallery img').evaluateAll(images=>images.map(i=>({path:i.currentSrc?new URL(i.currentSrc).pathname:null,optimized:!!i.srcset,complete:i.complete,naturalWidth:i.naturalWidth})))
   assert.ok(images.every(i=>i.optimized&&i.path?.includes('/render/image/sign/')));assert.ok(images.every(i=>!i.path.includes('e02dd86c-a43b-43b1-8820-670115101f7f')))
   let accessibility
   if(slug==='ajloun-forest'){const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();accessibility=audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}));assert.deepEqual(accessibility,[])}
   results.push({language,slug,images,accessibility,translationFallback:expectedFallback,status:'passed'});console.log('PASS live '+language+' '+slug+' '+images.length+' responsive photos'+(expectedFallback?' — existing Arabic requires review':''))
  }
  await context.close()
 }
 assert.deepEqual(errors,[])
}finally{await browser.close();await writeFile('docs/validation/live-tourism-image-tests.json',JSON.stringify({scope:'Genuine anonymous hosted destinations, translations, signed image rendering and accessibility in Chromium; zero API interception or stored mutations',results,errors},null,2)+'\n')}

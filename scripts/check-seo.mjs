import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {HOME_TITLE,HOME_DESCRIPTION,productionOrigin,routeSeo,metaEntries} from '../src/seo/model.js'
import {seoPlugin} from './seo-vite-plugin.js'
const results=[]
function check(name,fn){fn();results.push({name,status:'passed'});console.log('PASS '+name)}
const source=await readFile('index.html','utf8'),built=await readFile('dist/index.html','utf8')
check('initial HTML has the requested homepage defaults and unique social tags',()=>{
 assert.ok(built.includes(HOME_TITLE)&&built.includes(HOME_DESCRIPTION))
 for(const key of ['description','robots','twitter:card','twitter:title','twitter:description'])assert.equal((built.match(new RegExp(`name="${key}"`,'g'))||[]).length,1,key)
 for(const key of ['og:type','og:title','og:description','og:site_name','og:locale','og:locale:alternate'])assert.equal((built.match(new RegExp(`property="${key}"`,'g'))||[]).length,1,key)
 assert.equal((built.match(/<title>/g)||[]).length,1)
 assert.ok(built.includes('lang="en"')&&built.includes('name="viewport"')&&built.includes('#164F3F'))
})
check('unset domain emits no fake canonical, og:url or social image URLs',()=>{
 const html=seoPlugin('').transformIndexHtml.handler(source)
 assert.ok(!/rel="canonical"|property="og:url"|property="og:image"|name="twitter:image"/.test(html))
})
check('configured origin generates absolute canonical and PNG tags in initial HTML without duplication',()=>{
 const plugin=seoPlugin('https://travel.example.org'),html=plugin.transformIndexHtml.handler(source)
 assert.ok(html.includes('https://travel.example.org/assets/branding/unseen-jo-social-preview.png'))
 assert.ok(html.includes('href="https://travel.example.org/"'))
 assert.equal(plugin.transformIndexHtml.handler(html),html)
})
check('invalid origins, local addresses and Supabase API origins are rejected',()=>{
 assert.equal(productionOrigin(''),'')
 for(const value of ['http://localhost:4184','https://127.0.0.1','https://localhost','https://unseen.local','https://user:pass@site.org','https://site.org/path','https://site.org?q=x','https://dkhwwvoplhfjccvjegty.supabase.co'])assert.throws(()=>productionOrigin(value))
})
check('private routes, unknown routes and samples are noindex; public routes remain indexable',()=>{
 for(const path of ['/admin','/admin/places','/auth','/auth/callback','/profile','/my-discoveries','/login','/register','/forgot-password','/discovery-result','/unknown']){const s=routeSeo(path,'en',{},'https://travel.example.org');assert.ok(s.robots.startsWith('noindex'));assert.equal(s.canonical,'')}
 for(const path of ['/','/explore','/map','/surprise-me','/preferences','/places/ajloun-forest'])assert.ok(routeSeo(path).robots.startsWith('index'))
 assert.ok(routeSeo('/places/petra','en',{},'','?sample=figma').robots.startsWith('noindex'))
})
check('Arabic locale, destination summaries and clean canonical paths are supported',()=>{
 const s=routeSeo('/places/petra','ar-JO',{title:'البتراء | Unseen Jo',description:'<p>مدينة أثرية في الأردن</p>'},'https://travel.example.org','?q=private')
 assert.equal(s.locale,'ar_JO');assert.equal(s.dir,'rtl');assert.equal(s.description,'مدينة أثرية في الأردن');assert.equal(s.canonical,'https://travel.example.org/places/petra');assert.ok(metaEntries(s).some(x=>x[1]==='twitter:image'))
})
const png=await readFile('public/assets/branding/unseen-jo-social-preview.png')
check('social preview is an actual 1200 by 630 PNG',()=>{assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);assert.equal(png.subarray(1,4).toString(),'PNG')})
await writeFile('docs/validation/seo-tests.json',JSON.stringify({results,typescript:'Not applicable: JavaScript/JSX project, no tsconfig or TypeScript compiler',socialImageBytes:png.length},null,2)+'\n')

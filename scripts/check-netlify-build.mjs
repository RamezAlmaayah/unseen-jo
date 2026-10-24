import assert from 'node:assert/strict'
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises'
import {join,relative} from 'node:path'
import {createHash} from 'node:crypto'
import {loadEnv} from 'vite'
import {netlifyConfig,NETLIFY_SAFETY_ENV} from './netlify-config.mjs'
import {privacyQaEnabled} from '../src/features/account/privacyAvailability.js'

const results=[]
function check(name,fn){fn();results.push({name,status:'PASS'});console.log('PASS '+name)}
const env=loadEnv('production',process.cwd(),'VITE_'),{effective,origin}=netlifyConfig(env)
check('production settings and unknown/privileged key inputs fail safely',()=>{
 for(const [key,value] of Object.entries(NETLIFY_SAFETY_ENV))assert.equal(effective[key],value)
 assert.throws(()=>netlifyConfig({...env,VITE_SERVICE_ROLE_KEY:'not-a-real-key'}))
 assert.throws(()=>netlifyConfig({...env,VITE_SUPABASE_PUBLISHABLE_KEY:'sb_secret_not_a_real_key'}))
 assert.throws(()=>netlifyConfig({...env,VITE_SITE_URL:'http://localhost:4184'}))
 assert.equal(privacyQaEnabled({DEV:false,VITE_PRIVACY_QA:'true'},'localhost'),false)
})
const redirects=await readFile('dist/_redirects','utf8'),headers=await readFile('dist/_headers','utf8'),html=await readFile('dist/index.html','utf8')
check('Drop artifact includes one non-forced SPA rewrite and security/private-route headers',()=>{
 assert.deepEqual(redirects.split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')),['/* /index.html 200'])
 for(const value of ['X-Content-Type-Options: nosniff','X-Frame-Options: DENY','Referrer-Policy: strict-origin-when-cross-origin','geolocation=(self)'])assert.ok(headers.includes(value))
 for(const route of ['admin','auth','profile','my-discoveries','login','register','forgot-password','discovery-result']){
  assert.ok(headers.includes(`/${route}\n  X-Robots-Tag: noindex, nofollow`));assert.ok(headers.includes(`/${route}/*\n  X-Robots-Tag: noindex, nofollow`))
 }
})
const files=[]
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await walk(path);else files.push(path)}}
await walk('dist')
check('output contains no environment files, source maps, server code, SQL or private credentials',()=>{
 for(const path of files){
  assert.ok(!/(^|[\\/])(?:\.env[^\\/]*|\.git|node_modules|supabase|docs|artifacts)(?:[\\/]|$)|\.(?:map|sql|pem|key)$/i.test(path),'Unexpected deployment file: '+path)
 }
})
let bytes=0
for(const path of files){const data=await readFile(path);bytes+=data.length
 if(!/\.(?:html|js|css|json|txt|md)$/.test(path))continue
 const text=data.toString('utf8')
 assert.ok(!/sb_secret_[A-Za-z0-9_-]+|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text),'Private credential detected in '+path)
 for(const match of text.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)){
  let claims;try{claims=JSON.parse(Buffer.from(match[1],'base64url'))}catch{continue}
  assert.ok(!['service_role','authenticated'].includes(claims.role),'Private JWT detected in '+path)
 }
}
results.push({name:'All text artifacts scanned for secret keys, private keys and private JWTs',status:'PASS'})
check('initial SEO contains no localhost/placeholder URLs and has the expected origin behavior',()=>{
 assert.ok(!/https?:\/\/(?:localhost|127\.0\.0\.1|[^"\s]*\.invalid)/.test(html))
 assert.equal((html.match(/rel="canonical"/g)||[]).length,origin?1:0)
 assert.equal((html.match(/property="og:image"/g)||[]).length,origin?1:0)
 assert.equal((html.match(/name="description"/g)||[]).length,1)
})
const png=await readFile('dist/assets/branding/unseen-jo-social-preview.png')
check('approved social image remains an actual 1200x630 PNG',()=>{assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630)})
const manifest=await Promise.all(files.map(async path=>({path:relative('dist',path).replaceAll('\\','/'),sha256:createHash('sha256').update(await readFile(path)).digest('hex')})))
await mkdir('docs/validation',{recursive:true})
await writeFile('docs/validation/netlify-build.json',JSON.stringify({checkedAt:new Date().toISOString(),results,files:files.length,bytes,siteOrigin:origin||null,configuration:{dataMode:effective.VITE_DATA_MODE,legalSource:effective.VITE_LEGAL_CONTENT_SOURCE,privacyQa:false,privatePrototype:false,project:'dkhwwvoplhfjccvjegty',keyType:'publishable (public by design; value omitted)'},manifest},null,2)+'\n')

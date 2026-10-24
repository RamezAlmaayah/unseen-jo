import assert from 'node:assert/strict'
import {readFile,readdir,writeFile} from 'node:fs/promises'
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(dir+'/'+e.name):dir+'/'+e.name))).flat()}
let checked=0
for(const path of [...await files('src'),...await files('dist')]){
 if(!/\.(js|jsx|ts|tsx|html|json)$/.test(path))continue
 const text=await readFile(path,'utf8');checked++
 assert.ok(!/SUPABASE_SERVICE_ROLE_KEY|sb_secret_[A-Za-z0-9_-]{10,}/.test(text),path+' contains a forbidden server credential reference')
 for(const token of text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[]){let payload;try{payload=JSON.parse(Buffer.from(token.split('.')[1],'base64url'))}catch{continue}assert.notEqual(payload.role,'service_role',path+' embeds a service role JWT')}
}
const edge=await readFile('supabase/functions/account-privacy/handler.js','utf8')
assert.ok(!/console\.(log|debug|info|error|warn)\s*\(/.test(edge),'No request/password/token logging in Edge handler')
await writeFile('docs/validation/privacy-source-security.json',JSON.stringify({status:'PASS',checked,scope:'Frontend source and built JS/HTML/JSON credential scan; handler logging source check. Does not verify external gateway/APM configuration.'},null,2))
console.log('PASS frontend/build credential boundary and Edge logging source checks ('+checked+' files)')

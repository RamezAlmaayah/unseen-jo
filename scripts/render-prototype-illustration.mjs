import {pathToFileURL} from 'node:url'
import {join,resolve} from 'node:path'
import {tmpdir} from 'node:os'
import {writeFile,readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs'))),b=await chromium.launch({headless:true})
try{const p=await b.newPage({viewport:{width:2400,height:1440},deviceScaleFactor:1});await p.goto(pathToFileURL(resolve('docs/evidence/private-prototype/aqaba-illustration.svg')).href);await p.screenshot({path:'docs/evidence/private-prototype/aqaba-illustration.png'});const bytes=await readFile('docs/evidence/private-prototype/aqaba-illustration.png');await writeFile('docs/evidence/private-prototype/illustration.json',JSON.stringify({localUrl:'/docs/evidence/private-prototype/aqaba-illustration.png',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),width:2400,height:1440,kind:'original_prototype_illustration',author:'Unseen Jo prototype artwork',rights:'Original repo-authored vector illustration rendered to PNG; no third-party imagery. Not a photograph or verified beach/entrance depiction.'},null,2)+'\n');console.log('Original Aqaba vector illustration rendered at 2400x1440')}finally{await b.close()}

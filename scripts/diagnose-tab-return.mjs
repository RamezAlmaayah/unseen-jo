// Isolated Auth/API fixture; exercises the real bundled Supabase client and React app.
import {setup,browser,base,errors} from './localization-browser-fixtures.mjs'
import {mkdir,writeFile} from 'node:fs/promises'
const report={scope:'Local real Chromium; fixture administrator API/Auth, no hosted writes',base,checks:[]}
try{
 const {page:p,context}=await setup(1440,'en',true)
 const requests=[];p.on('request',r=>{if(r.url().includes('.supabase.co/'))requests.push(new URL(r.url()).pathname)})
 await p.addInitScript(()=>{window.documentRun=crypto.randomUUID();window.returnMetrics={skeletons:0,workspaceRemovals:0};new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1&&(n.matches('.admin-skeleton')||n.querySelector('.admin-skeleton')))window.returnMetrics.skeletons++}).observe(document,{childList:true,subtree:true})})
 await p.goto(base+'/admin/translations');await p.locator('#review-ar-name').waitFor();await p.locator('#review-ar-name').fill('UNSAVED TAB RETURN PROBE')
 const before=await p.evaluate(()=>({run:window.documentRun,metrics:{...window.returnMetrics},visibility:document.visibilityState}))
 const n=requests.length,other=await context.newPage();await other.goto('data:text/html,<title>Other tab</title>Tab switching test');await other.bringToFront()
 const hidden=await p.evaluate(()=>document.visibilityState);await new Promise(r=>setTimeout(r,5000));await p.bringToFront();await p.waitForTimeout(1500)
 report.checks.push({trigger:'actual browser tab switch, 5 seconds',hidden,before,after:await p.evaluate(()=>({run:window.documentRun,metrics:{...window.returnMetrics},visibility:document.visibilityState})),name:await p.locator('#review-ar-name').inputValue(),requests:requests.slice(n)})
 // Headless Chromium can leave all targets visible; separately drive its standard
 // visibility event path, clearly recorded as a controlled browser event.
 await p.locator('#review-ar-name').fill('UNSAVED CONTROLLED RETURN PROBE');const m=requests.length
 await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}))})
 await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}));window.dispatchEvent(new Event('focus'))})
 await p.waitForTimeout(1500)
 report.checks.push({trigger:'controlled standard visibilitychange + focus path',name:await p.locator('#review-ar-name').inputValue(),requests:requests.slice(m),metrics:await p.evaluate(()=>window.returnMetrics)})
 report.errors=errors
 await mkdir('docs/validation',{recursive:true});await writeFile('docs/validation/tab-return-diagnosis.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2))
}finally{await browser.close()}

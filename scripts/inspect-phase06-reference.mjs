import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {mkdir} from 'node:fs/promises'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1100,height:900}})
await mkdir('artifacts/phase06/reference',{recursive:true})
try{await page.goto(pathToFileURL('C:/Users/Magic Systems/Downloads/WhatsApp Video 2026-10-20 at 7.08.16 PM.mp4').href);await page.waitForFunction(()=>document.querySelector('video')?.duration>0)
 const duration=await page.locator('video').evaluate(v=>{v.pause();return v.duration});console.log({duration})
 for(const time of [0.1,2,4,6,8,10,12].filter(t=>t<duration)){await page.locator('video').evaluate((v,t)=>{v.currentTime=t},time);await page.waitForTimeout(250);await page.locator('video').screenshot({path:`artifacts/phase06/reference/frame-${time}.png`})}
}finally{await browser.close()}

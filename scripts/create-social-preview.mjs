// Deterministic brand composition from the approved logo, rendered to a PNG.
import {readFile,mkdir} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const logo=(await readFile('public/assets/figma/preferences/brand-logo.png')).toString('base64')
const font=(await readFile('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).toString('base64')
const browser=await chromium.launch({headless:true})
try{
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1})
 await page.setContent(`<!doctype html><html><head><style>@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font})}*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#F1F9F7;font-family:Inter,Arial,sans-serif;color:#164F3F;overflow:hidden}.accent{position:absolute;top:65px;left:76px;width:56px;height:6px;background:#D66A4A;border-radius:8px}.copy{position:absolute;top:145px;left:76px;z-index:2}h1{font-size:80px;letter-spacing:-4px;line-height:1.05;margin:0 0 30px;font-weight:800}p{font-size:39px;line-height:1.3;letter-spacing:-1px;margin:0;font-weight:500}.line{width:92px;height:1px;background:#93baac;margin:35px 0 24px}.note{font-size:16px;letter-spacing:2px;text-transform:uppercase;font-weight:600}.panel{position:absolute;right:0;top:0;width:410px;height:630px;background:#164F3F;border-radius:180px 0 0 0;overflow:hidden}.circle{position:absolute;left:55px;top:128px;width:300px;height:300px;border-radius:50%;background:#fff;display:grid;place-items:center}.circle img{width:218px;height:207px;object-fit:contain}.ring{position:absolute;width:540px;height:540px;border:1px solid #B7E0D54D;border-radius:50%;top:300px;left:-70px}.ring.second{width:650px;height:650px;left:-125px;top:245px}.dot{position:absolute;width:14px;height:14px;border-radius:50%;background:#F4D58D;left:95px;bottom:77px}</style></head><body><div class="accent"></div><div class="copy"><h1>Unseen Jo</h1><p>Discover Jordan<br>Differently</p><div class="line"></div><div class="note">Your next discovery awaits</div></div><div class="panel"><div class="ring"></div><div class="ring second"></div><div class="circle"><img src="data:image/png;base64,${logo}" alt="Unseen Jo approved logo"></div><div class="dot"></div></div></body></html>`)
 await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluate(i=>i.decode())
 await mkdir('public/assets/branding',{recursive:true});await page.screenshot({path:'public/assets/branding/unseen-jo-social-preview.png'})
 console.log('Created 1200 x 630 Unseen Jo social PNG with the approved logo and brand palette.')
}finally{await browser.close()}

import {mkdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const browser=await chromium.launch({headless:true}),stage=process.env.AUTH_PREVIEW_STAGE||'before',dir=`artifacts/auth-branding/${stage}`
await mkdir(dir,{recursive:true})
try{for(const [name,path] of [['login','/auth?mode=login'],['register','/auth?mode=register'],['admin','/admin/login'],['recovery','/auth?mode=recovery']]){
 const page=await browser.newPage({viewport:{width:1366,height:768}})
 await page.goto('http://127.0.0.1:4184'+path);await page.locator('h1').waitFor();await page.waitForTimeout(800)
 await page.screenshot({path:`${dir}/${name}.png`,fullPage:true});await page.close()
}}finally{await browser.close()}

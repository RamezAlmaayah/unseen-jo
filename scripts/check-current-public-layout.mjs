// Current production UI contract. Real anonymous read-only requests; no demo fallback.
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
import {installMapFixture} from './map-test-helpers.mjs'
const root=join(tmpdir(),'unseen-jo-browser-check/node_modules'),{chromium}=await import(pathToFileURL(join(root,'playwright/index.mjs'))),{default:AxeBuilder}=await import(pathToFileURL(join(root,'@axe-core/playwright/dist/index.mjs')))
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4184',mode=process.argv[2]||'all',browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=[]
const routes=mode==='landing'?['/']:['/','/explore','/preferences','/surprise-me','/discovery-result','/places/ajloun-forest','/my-discoveries','/auth?mode=login','/auth?mode=register','/auth?mode=recovery','/auth?mode=reset','/auth?mode=confirmation','/auth/callback','/profile','/unknown']
await mkdir('artifacts/phase08/current-regressions',{recursive:true})
try{for(const lang of ['en','ar-JO'])for(const width of [1366,820,390]){
 const context=await browser.newContext({viewport:{width,height:768},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],writes=[]
 await context.addInitScript(lang=>localStorage.setItem('unseen-jo-language',lang),lang);await installMapFixture(page)
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method())&&!r.url().includes('/storage/v1/object/sign/'))writes.push(r.method()+' '+new URL(r.url()).pathname)})
 for(const route of routes){await page.goto(base+route);await page.locator('main').waitFor();await page.evaluate(()=>document.fonts.ready);if(route==='/explore'){await page.locator('.destination-card').first().waitFor({state:'attached',timeout:45000});if(!await page.locator('.destination-card').first().isVisible())await page.locator('.map-view-jumps button').first().click();await page.locator('.destination-card').first().waitFor()}if(route.startsWith('/places/'))await page.locator('.place-details-page').waitFor({timeout:45000});await page.waitForTimeout(150)
  assert.equal(await page.locator('html').getAttribute('dir'),lang==='en'?'ltr':'rtl');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),`${route} ${lang} ${width}: overflow`)
  const collisions=await page.locator('main input:not([type=hidden]),main select,main button').evaluateAll(nodes=>nodes.filter(e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width&&r.height&&c.visibility!=='hidden'&&(r.left< -2||r.right>innerWidth+2)}).map(e=>e.getAttribute('aria-label')||e.textContent));assert.deepEqual(collisions,[],`${route}: controls outside viewport`)
  if(route==='/'){await page.keyboard.press('Tab');assert.match(await page.locator(':focus').getAttribute('href'),/^#main/);await page.keyboard.press('Enter');assert.ok(await page.locator('main').evaluate(e=>e===document.activeElement||e.contains(document.activeElement)));assert.ok(await page.locator('.brand').count());const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(scan.violations.map(v=>v.id),[])}
  await page.screenshot({path:`artifacts/phase08/current-regressions/${mode}-${lang}-${width}-${route.replace(/[^a-z0-9]/gi,'-')}.png`,fullPage:true});results.push({route,lang,width,status:'passed',scope:'Real anonymous data, deterministic map tiles; no hosted writes'})
 }
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);await context.close()
}}finally{await browser.close();await writeFile(`docs/validation/phase08-current-${mode}.json`,JSON.stringify({results},null,2)+'\n')}
console.log(`PASS ${results.length} current ${mode} responsive route checks`)

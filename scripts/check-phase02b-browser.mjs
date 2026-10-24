import { installMapFixture } from './map-test-helpers.mjs'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || join(tmpdir(), 'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const live = process.env.QA_LIVE_URL || 'http://127.0.0.1:4182'
const demo = process.env.QA_BASE_URL || 'http://127.0.0.1:4183'
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] })
const checks = [], responsive = [], errors = []
await mkdir('artifacts/phase02b/screenshots', { recursive: true })
const check = async (name, fn) => { await fn(); checks.push({ name, status: 'passed' }); console.log(`PASS ${name}`) }
async function pageFor(options = {}) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', ...options })
  await installMapFixture(page)
  page.on('pageerror', e => errors.push(e.message))
  return page
}
async function geometry(page) {
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const g = await page.evaluate(() => ({ width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth,
    header: document.querySelector('.site-header').getBoundingClientRect().height,
    main: document.querySelector('main').getBoundingClientRect().width,
    heading: document.querySelector('h1') ? parseFloat(getComputedStyle(document.querySelector('h1')).fontSize) : 0,
    brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).length }))
  assert.equal(g.overflow, false); assert.ok(g.main <= 1200.1)
  assert.equal(g.header, g.width >= 768 ? 60 : 104); assert.ok(g.heading <= 44.1); assert.equal(g.brokenImages, 0)
  return g
}
try {
  const page = await pageFor()
  const liveRequests = [], demoRequests = [], unexpected = []
  page.on('request', r => { if (r.url().includes('.supabase.co/rest/')) liveRequests.push(r.url()); if (r.url().includes('/data/demo-destinations.json')) demoRequests.push(r.url()) })
  page.on('response', r => { if (r.status() >= 400) unexpected.push(`${r.status()} ${r.url()}`) })
  await check('real production Home shows published destinations without demo fallback', async () => {
    await page.goto(live)
    await page.locator('.featured-card').first().waitFor()
    assert.equal(await page.locator('.featured-card').count(), 3)
    assert.equal(demoRequests.length, 0)
  })
  await check('real Explore categories, published cards and cached navigation', async () => {
    await page.getByRole('link', { name: 'View all destinations', exact: true }).click()
    await page.waitForURL('**/explore')
    await page.locator('.destination-card').first().waitFor({state:'attached'})
    assert.equal(await page.locator('.category-pill').count(), 8)
    assert.equal(await page.locator('.destination-card').count(), 6)
    assert.equal(liveRequests.length, 2)
    await page.getByRole('button', { name: 'Nature', exact: true }).click()
    await page.getByRole('button', { name: 'Clear search and filters', exact: true }).first().click()
    assert.equal(await page.getByRole('button', { name: 'All', exact: true }).getAttribute('aria-pressed'), 'true')
    assert.equal(demoRequests.length, 0)
  })
  await check('real published slug is readable and unknown slugs remain unavailable', async () => {
    await page.goto(`${live}/places/ajloun-forest`);await page.locator('.photo-gallery').waitFor()
    for (const slug of ['phase02b-unknown']) {
      await page.goto(`${live}/places/${slug}`)
      await page.locator('.not-found-page').waitFor()
      assert.equal(await page.locator('.photo-gallery').count(), 0)
    }
    assert.equal(demoRequests.length, 0)
  })
  await check('live fixed demonstration stays labeled and temporary save works', async () => {
    await page.goto(live + '/discovery-result')
    await page.locator('.matching-reasons').waitFor()
    assert.ok((await page.locator('.result-demo-label').textContent()).includes('Fixed Figma sample'))
    await page.getByRole('button', { name: /Favorite Ajloun/ }).click()
    await page.getByRole('link', { name: 'Explore This Place', exact: true }).click()
    assert.ok(page.url().includes('sample=figma'))
    await page.locator('.photo-gallery').waitFor()
    assert.ok((await page.locator('.details-demo-note').textContent()).includes('Figma sample'))
    await page.getByRole('link', { name: 'My Discoveries', exact: true }).first().click()
    await page.locator('.saved-place-card').waitFor()
    assert.ok((await page.locator('.discoveries-demo-note').textContent()).includes('fixed Figma sample saves'))
    await page.reload(); await page.getByRole('heading', { name: 'Your next discovery starts here' }).waitFor()
  })
  await check('explicit empty-catalog fixture retains responsive UI and map slot (style fixture)', async () => {
    await page.route('https://dkhwwvoplhfjccvjegty.supabase.co/rest/v1/places**',r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}))
    for (const width of [1920,1440,1366,1024,768,390,375,320]) {
      await page.setViewportSize({ width, height: 900 })
      for (const route of ['/', '/explore', '/places/unknown', '/my-discoveries']) {
        await page.goto(live + route)
        if (route === '/' || route === '/explore') await page.getByRole('heading', { name: 'No published destinations available' }).waitFor()
        if (route.startsWith('/places')) await page.locator('.not-found-page').waitFor()
        const g = await geometry(page); responsive.push({ route, ...g })
      }
    }
    for (const [width,name] of [[1440,'desktop'],[375,'mobile']]) {
      await page.setViewportSize({width,height:900}); await page.goto(live+'/explore'); await page.getByRole('heading',{name:'No published destinations available'}).waitFor()
      await page.screenshot({path:`artifacts/phase02b/screenshots/live-empty-${name}.png`,fullPage:true})
    }
    assert.deepEqual(unexpected, [])
  })
  await page.close()

  // The following contexts intercept HTTP with synthetic records. These are UI
  // simulations, not remotely published tourism data or hosted integration.
  const mocked = await pageFor()
  const cats = [{id:'nature-id',slug:'nature',name:'Nature'},{id:'history-id',slug:'history',name:'History'}]
  const fixture = {id:'00000000-0000-4000-8000-000000000101',slug:'fixture-place',name:'Fixture Place',status:'published',is_demo:false,
    description:null,city:null,source_url:'https://example.com/source',verified_at:null,price_min_jod:null,price_max_jod:null,
    duration_min_minutes:null,duration_max_minutes:null,place_categories:[{categories:cats[0]}],place_images:[]}
  let fail = true
  await mocked.route('https://dkhwwvoplhfjccvjegty.supabase.co/rest/v1/**', async route => {
    if (fail) return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Injected test outage'})})
    const u=new URL(route.request().url()), data=u.pathname.endsWith('/categories')?cats:[fixture]
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)})
  })
  await check('simulated outage shows error and user retry recovers published cards', async () => {
    await mocked.goto(live+'/explore'); await mocked.getByRole('heading',{name:'Destinations unavailable'}).waitFor()
    fail=false; await mocked.getByRole('button',{name:'Try again',exact:true}).click(); await mocked.locator('.destination-card').waitFor()
    assert.ok((await mocked.locator('.destination-card').textContent()).includes('Cost unavailable'))
    assert.ok((await mocked.locator('.destination-card').textContent()).includes('Duration unavailable'))
    assert.equal(await mocked.locator('.destination-card img[src*=ajloun]').count(),0)
  })
  await check('simulated published search/category clearing and details with NULL information', async () => {
    await mocked.getByRole('searchbox',{name:'Search destinations'}).fill('missing')
    await mocked.getByRole('heading',{name:'No destinations match your search'}).waitFor()
    await mocked.getByRole('button',{name:'Clear search and filters',exact:true}).first().click()
    await mocked.getByRole('button',{name:'History',exact:true}).click(); assert.equal(await mocked.locator('.destination-card').count(),0)
    await mocked.getByRole('button',{name:'All',exact:true}).click()
    await mocked.getByRole('link',{name:'Fixture Place',exact:true}).click(); await mocked.locator('.place-details-page').waitFor()
    const text=await mocked.locator('.place-details-page').textContent()
    assert.ok(text.includes('Cost unavailable') && text.includes('Duration unavailable'))
    assert.ok(!text.includes('null JD') && !text.includes('undefined'))
    assert.equal(await mocked.getByRole('button',{name:'Get Directions'}).isDisabled(),true)
    await mocked.getByRole('button',{name:'Add My Discoveries',exact:true}).click()
    await mocked.getByRole('link',{name:'My Discoveries',exact:true}).first().click()
    await mocked.locator('.saved-place-card').waitFor()
    assert.ok((await mocked.locator('.saved-place-card').textContent()).includes('Cost unavailable'))
    for (const width of [1440,390,320]) { await mocked.setViewportSize({width,height:900}); responsive.push({route:'simulated/saved',...await geometry(mocked)}) }
  })
  await mocked.close()
  const demoPage=await pageFor()
  await check('explicit demo build has original cards and clear demo label',async()=>{
    await demoPage.goto(demo+'/explore');await demoPage.locator('.destination-card').first().waitFor()
    assert.equal(await demoPage.locator('.destination-card').count(),4)
    assert.ok((await demoPage.locator('.explore-demo-notice').textContent()).includes('Local demo'))
  })
  await demoPage.close()
  assert.deepEqual(errors,[])
  await writeFile('artifacts/phase02b/browser-tests.json',JSON.stringify({live,demo,passed:checks.length,checks,responsive,errors,scope:'Real six-destination published catalogue reads plus separately labeled intercepted empty/published/error UI fixtures.'},null,2)+'\n')
  console.log(`${checks.length} browser flow groups passed; ${responsive.length} responsive cases.`)
} finally {await browser.close()}

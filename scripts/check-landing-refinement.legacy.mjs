import { installMapFixture } from './map-test-helpers.mjs'
// Optional visual QA; uses the existing external Playwright installation.
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || join(tmpdir(), 'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4174'
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce', deviceScaleFactor: 1 })
  await installMapFixture(page)
page.setDefaultTimeout(30000)
const errors = [], failures = [], metrics = [], checkedRoutes = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`) })
page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failures.push(request.url()) })
await mkdir('artifacts/landing-refinement', { recursive: true })
await mkdir('docs/screenshots/landing-refinement', { recursive: true })
let baseline
try { baseline = JSON.parse(await readFile('artifacts/landing-refinement/before.json', 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
async function ready() {
  await page.evaluate(() => document.fonts.ready)
  await page.locator('img').evaluateAll(images => Promise.all(images.filter(image => image.getClientRects().length).map(image => image.decode().catch(() => {}))))
}
async function rect(selector) {
  return page.locator(selector).first().evaluate(element => { const r = element.getBoundingClientRect(), c = getComputedStyle(element); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height, fontSize: parseFloat(c.fontSize) } })
}
try {
  for (const [width, height] of [[1366, 768], [1440, 900], [1920, 1080], [1024, 768], [390, 844]]) {
    await page.setViewportSize({ width, height }); await page.goto(base); await ready()
    const values = {}
    for (const selector of ['.site-header', '.brand', '.navigation-link', '.landing-hero', '.landing-hero__title', '.landing-hero__description', '.landing-hero__actions .button', '.featured-section h2', '.featured-section__heading', '.featured-grid', '.featured-card', '.landing-promo']) values[selector] = await rect(selector)
    const state = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, images: [...document.images].every(image => image.complete && image.naturalWidth > 0), zoom: getComputedStyle(document.documentElement).zoom, dpr: devicePixelRatio }))
    assert.ok(state.scrollWidth <= width, `Horizontal overflow at ${width}`)
    assert.ok(state.images, `Broken image at ${width}`)
    assert.equal(state.dpr, 1)
    assert.equal(await page.locator('.featured-card').count(), 3)
    if (width >= 1024) {
      assert.equal(values['.site-header'].height, 60)
      assert.ok(values['.brand'].width >= 120 && values['.brand'].width <= 130)
      assert.ok(values['.navigation-link'].fontSize === 14)
      assert.ok(values['.landing-hero__title'].fontSize >= 40 && values['.landing-hero__title'].fontSize <= 44)
      assert.ok(values['.landing-hero__description'].fontSize >= 15 && values['.landing-hero__description'].fontSize <= 16)
      assert.equal(values['.landing-hero__actions .button'].fontSize, 15)
      assert.ok(values['.landing-hero__actions .button'].height >= 40 && values['.landing-hero__actions .button'].height <= 44)
      assert.ok(values['.featured-section h2'].fontSize >= 24 && values['.featured-section h2'].fontSize <= 28)
      assert.ok(values['.featured-card'].width >= 240 && values['.featured-card'].width <= 301)
      assert.ok(values['.featured-grid'].y < height - 150, `Not enough featured photography visible at ${width}x${height}`)
      // The original hero PNG and brand mark must not be stretched.
      assert.ok(await page.locator('.landing-hero__image, .site-header .brand img').evaluateAll(images => images.every(image => Math.abs(image.getBoundingClientRect().width / image.getBoundingClientRect().height - image.naturalWidth / image.naturalHeight) < 0.01)))
      const nav = await page.locator('.primary-navigation').boundingBox(), actions = await page.locator('.site-header__actions').boundingBox(), brand = values['.brand']
      assert.ok(brand.x + brand.width < nav.x && nav.x + nav.width < actions.x, `Navbar overlap at ${width}`)
    }
    metrics.push({ width, height, ...state, values })
    await page.screenshot({ path: `docs/screenshots/landing-refinement/after-${width}x${height}.png` })
    await page.screenshot({ path: `docs/screenshots/landing-refinement/after-full-${width}x${height}.png`, fullPage: true })
  }
  // The global refinement supersedes the Landing-only isolation contract.
  // Keep the existing route checks and require the shared compact header.
  await page.setViewportSize({ width: 1366, height: 768 })
  if (baseline?.others) {
    for (const route of Object.keys(baseline.others)) {
      await page.goto(base + route)
      await page.locator('h1').first().waitFor()
      if (route === '/explore') await page.locator('.destination-card').first().waitFor()
      if (route === '/discovery-result') await page.locator('.matching-reasons').waitFor()
      if (route.startsWith('/places/')) await page.locator('.photo-gallery').waitFor()
      await ready()
      assert.equal((await rect('.site-header')).height, 60, `Shared scale on ${route}`)
      checkedRoutes.push(route)
    }
  }
  await page.goto(base)
  await page.getByRole('link', { name: 'Start Exploring', exact: true }).click()
  await page.waitForURL(base + '/preferences')
  assert.equal((await rect('.site-header')).height, 60)
  await page.getByRole('checkbox', { name: 'Food', exact: true }).check()
  await page.getByRole('link', { name: 'Unseen Jo home', exact: true }).click()
  assert.equal((await rect('.site-header')).height, 60)
  await page.getByRole('link', { name: 'Explore Map', exact: true }).click()
  await page.waitForURL(base + '/map')
  assert.equal((await rect('.site-header')).height, 60)
  await page.getByRole('link', { name: 'Unseen Jo home', exact: true }).click()
  await page.getByRole('link', { name: 'View all demo destinations' }).click()
  await page.waitForURL(base + '/explore')
  await page.getByRole('link', { name: 'Unseen Jo home', exact: true }).click()
  await page.getByRole('link', { name: 'Surprise Me', exact: true }).click()
  await page.waitForURL(base + '/surprise-me')
  await page.getByRole('link', { name: 'Unseen Jo home', exact: true }).click()
  await page.getByRole('link', { name: 'Start Exploring', exact: true }).click()
  assert.ok(await page.getByRole('checkbox', { name: 'Food', exact: true }).isChecked())
  await page.goto(base)
  await ready()
  await page.keyboard.press('Tab')
  assert.equal(await page.locator(':focus').textContent(), 'Skip to content')
  await page.keyboard.press('Enter')
  assert.equal(await page.locator(':focus').getAttribute('id'), 'main-content')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(base)
  await page.waitForFunction(() => document.querySelector('.landing-hero__title')?.parentElement.style.opacity === '1')
  await page.locator('.landing-promo').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => document.querySelector('.promo-reveal')?.style.opacity === '1')
  await page.locator('.featured-card').first().hover()
  await page.waitForFunction(() => document.querySelector('.featured-card')?.style.transform.includes('translateY'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(base)
  assert.equal(await page.locator('.landing-hero__title').evaluate(element => getComputedStyle(element.parentElement).opacity), '1')
  assert.deepEqual(errors, []); assert.deepEqual(failures, [])
  await writeFile('artifacts/landing-refinement/browser-report.json', JSON.stringify({ base, metrics, checkedRoutes, errors, failures, baselineComparison: 'Historical Landing-only pixel isolation superseded by authorized global scale', checks: 'requested sizes, scale, imagery, proportions, overflow, shared compact routes, navigation, state, keyboard, motion/reduced motion passed' }, null, 2))
  console.log(`PASS: five requested viewports, ${checkedRoutes.length} shared-scale route checks, navigation/state/keyboard/motion, no console or asset errors.`)
} finally { await browser.close() }

import { installMapFixture } from './map-test-helpers.mjs'
// Optional browser verification using the existing external Playwright install.
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || join(tmpdir(), 'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4174'
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce', deviceScaleFactor: 1 })
  await installMapFixture(page)
page.setDefaultTimeout(30000)
const errors = [], failures = [], metrics = [], states = [], writes = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`) })
page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failures.push(request.url()) })
page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) writes.push(request.method()) })
await mkdir('artifacts/global-ui-scale/responsive', { recursive: true })
await mkdir('docs/screenshots/global-ui-scale', { recursive: true })
const routes = [
  ['landing', '/', '.landing-hero'], ['preferences', '/preferences', '.preferences-panel'],
  ['explore', '/explore', '.destination-card'], ['surprise', '/surprise-me', '.surprise-panel'],
  ['result', '/discovery-result', '.matching-reasons'], ['details', '/places/ajloun-forest', '.photo-gallery'],
  ['discoveries', '/my-discoveries', '.explorer-banner'], ['login', '/login', '.account-form-panel'],
  ['register', '/register', '.account-form-panel'], ['recovery', '/forgot-password', '.account-form-panel'],
  ['profile', '/profile', '.profile-settings'], ['not-found', '/unknown', '.not-found-page'], ['map', '/map', 'h1'],
]
async function ready() {
  await page.evaluate(() => { document.querySelectorAll('img[loading="lazy"]').forEach(image => { image.loading = 'eager' }); return document.fonts.ready })
  await page.locator('img').evaluateAll(images => Promise.all(images.filter(image => image.getClientRects().length).map(image => image.decode().catch(() => {}))))
}
async function inspect(name) {
  const data = await page.evaluate(() => {
    const visible = element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden'
    const out = { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight, dpr: devicePixelRatio, zoom: getComputedStyle(document.documentElement).zoom }
    out.images = [...document.images].filter(visible).every(image => image.complete && image.naturalWidth > 0)
    out.values = Object.fromEntries(['.site-header', '.site-header__inner', '.brand', '.navigation-link', 'main', 'h1', '.button', 'input:not([type="checkbox"]):not([type="radio"]), select', '.featured-card', '.featured-grid', '.preferences-panel', '.preference-choice--interest', '.destination-card', '.explore-map__image', '.surprise-hero', '.surprise-panel', '.discovery-result-grid', '.matching-reasons', '.photo-gallery', '.place-info-grid', '.saved-place-card', '.explorer-banner', '.account-field input'].filter(selector => [...document.querySelectorAll(selector)].some(visible)).map(selector => {
      const element = [...document.querySelectorAll(selector)].find(visible), r = element.getBoundingClientRect(), c = getComputedStyle(element)
      return [selector, { x: r.x, y: r.y + scrollY, width: r.width, height: r.height, font: parseFloat(c.fontSize) }]
    }))
    out.outsideControls = [...document.querySelectorAll('input, select, button, .button')].filter(visible).filter(element => { const r = element.getBoundingClientRect(); return r.width > 0 && (r.x < -1 || r.right > innerWidth + 1) }).map(element => element.getAttribute('aria-label') || element.textContent)
    out.excessiveText = [...document.querySelectorAll('h1,h2,h3,p,dd,label,legend,button,a')].filter(visible).filter(element => parseFloat(getComputedStyle(element).fontSize) > 44.1).map(element => element.textContent)
    out.smallText = [...document.querySelectorAll('p,dd,label,legend,button,a')].filter(visible).filter(element => !element.closest('.sr-only,.skip-link') && parseFloat(getComputedStyle(element).fontSize) < 12).map(element => element.textContent)
    return out
  })
  assert.ok(data.scrollWidth <= data.width, `${name}: overflow ${data.scrollWidth} at ${data.width}`)
  assert.ok(data.images, `${name}: broken images`)
  assert.equal(data.zoom, '1'); assert.equal(data.dpr, 1)
  assert.deepEqual(data.outsideControls, [], `${name}: controls outside viewport at ${data.width}`)
  assert.deepEqual(data.excessiveText, [], `${name}: oversized text at ${data.width}`)
  assert.deepEqual(data.smallText, [], `${name}: text below 12px at ${data.width}`)
  assert.equal(data.values['.site-header'].height, data.width >= 768 ? 60 : 104)
  assert.ok(data.values.main.width <= 1200.1)
  assert.ok(data.values['.brand'].width >= 120 && data.values['.brand'].width <= 130)
  if (data.values['.account-field input']) assert.equal(data.values['.account-field input'].height, 44)
  if (data.values['.button']) assert.ok(data.values['.button'].height >= 40 && data.values['.button'].height <= 64, `${name}: button height`)
  // Ensure card text cannot collide with its metadata at a narrower width.
  for (const card of await page.locator('.destination-card:visible, .saved-place-card:visible').all()) {
    const category = await card.locator('.destination-card__category, .saved-place-card__body p').boundingBox()
    const metadata = await card.locator('dl').boundingBox()
    assert.ok(category.y + category.height <= metadata.y + 1, `${name}: metadata collision at ${data.width}`)
  }
  return { name, ...data }
}
try {
  for (const [width, height] of [[1366, 768], [1440, 900], [1920, 1080], [1024, 768], [768, 1024], [390, 844], [375, 812]]) {
    await page.setViewportSize({ width, height })
    for (const [name, route, selector] of routes) {
      console.log('Checking', name, width)
      await page.goto(base + route); await page.locator(selector).first().waitFor()
      if (name === 'discoveries') {
        await page.getByRole('button', { name: 'Load Figma sample collection' }).click()
        await page.waitForFunction(() => document.querySelectorAll('.saved-place-card').length === 6)
      }
      await ready()
      const data = await inspect(name); metrics.push(data)
      const folder = width === 1366 || width === 375 ? 'docs/screenshots/global-ui-scale' : 'artifacts/global-ui-scale/responsive'
      await page.screenshot({ path: `${folder}/after-${name}-${width}.png` })
      await page.screenshot({ path: `${folder}/after-full-${name}-${width}.png`, fullPage: true })
    }
  }
  // Extra states at laptop/mobile sizes catch expanding errors and open controls.
  for (const [width, height] of [[1366, 768], [375, 812]]) {
    await page.setViewportSize({ width, height })
    await page.goto(base + '/explore'); await page.locator('.destination-card').first().waitFor()
    await page.getByRole('button', { name: 'Open Ajloun Forest demo details preview' }).click()
    await page.getByRole('dialog').waitFor(); await ready()
    const modal = await page.getByRole('dialog').boundingBox()
    assert.ok(modal.x >= 0 && modal.x + modal.width <= width)
    await page.screenshot({ path: `docs/screenshots/global-ui-scale/preview-dialog-${width}.png` }); await page.keyboard.press('Escape')
    await page.goto(base + '/places/ajloun-forest'); await page.locator('.photo-gallery').waitFor()
    await page.locator('.photo-gallery button').first().click(); await page.getByRole('dialog').waitFor()
    await page.screenshot({ path: `docs/screenshots/global-ui-scale/gallery-dialog-${width}.png` }); await page.keyboard.press('Escape')
    await page.goto(base + '/surprise-me'); await page.locator('.discovery-field summary').click()
    await page.getByRole('checkbox', { name: 'Nature', exact: true }).uncheck(); await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Surprise Me', exact: true }).click(); await page.getByRole('alert').waitFor()
    states.push(await inspect('surprise-invalid'))
    await page.screenshot({ path: `docs/screenshots/global-ui-scale/surprise-invalid-${width}.png`, fullPage: true })
    await page.goto(base + '/register'); await page.getByRole('button', { name: 'Create account', exact: true }).click()
    assert.equal(await page.locator('input[aria-invalid="true"]').count(), 4)
    states.push(await inspect('registration-invalid'))
    await page.screenshot({ path: `docs/screenshots/global-ui-scale/register-invalid-${width}.png`, fullPage: true })
    await page.goto(base + '/profile'); await page.getByRole('button', { name: 'Edit Profile', exact: true }).click()
    states.push(await inspect('profile-edit'))
    await page.screenshot({ path: `docs/screenshots/global-ui-scale/profile-edit-${width}.png`, fullPage: true })
    await page.goto(base + '/places/umm-qais'); await page.locator('.place-info-grid').waitFor(); await ready()
    states.push(await inspect('partial-place'))
    await page.goto(base + '/places/unknown-place'); await page.getByRole('heading', { name: 'Place not found', exact: true }).waitFor()
    states.push(await inspect('unknown-place'))
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.goto(base)
  await page.waitForFunction(() => document.querySelector('.landing-hero__title')?.parentElement.style.opacity === '1')
  await page.locator('.landing-promo').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => document.querySelector('.promo-reveal')?.style.opacity === '1')
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto(base)
  assert.equal(await page.locator('.landing-hero__title').evaluate(element => getComputedStyle(element.parentElement).opacity), '1')
  assert.deepEqual(errors, []); assert.deepEqual(failures, []); assert.deepEqual(writes, [])
  await writeFile('artifacts/global-ui-scale/browser-report.json', JSON.stringify({ base, metrics, states, errors, failures, writes }, null, 2))
  console.log(`PASS: ${metrics.length} page/viewport cases, ${states.length} extra states, normal scale, density, readable text, image/console health and motion.`)
} catch (error) { console.error('Browser diagnostics:', errors, failures); throw error } finally { await browser.close() }

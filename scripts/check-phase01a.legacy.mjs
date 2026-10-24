import { installMapFixture } from './map-test-helpers.mjs'
// Optional browser QA. Use an existing Playwright installation without adding
// a runtime dependency: set PLAYWRIGHT_MODULE to its absolute index.mjs path.
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const modulePath = process.env.PLAYWRIGHT_MODULE || join(tmpdir(), 'unseen-jo-browser-check/node_modules/playwright/index.mjs')
const { chromium } = await import(pathToFileURL(modulePath))
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  await installMapFixture(page)
const errors = [], failedRequests = [], metrics = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failedRequests.push(request.url()) })
page.on('response', response => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`) })
await mkdir('artifacts/phase01a', { recursive: true })
await mkdir('docs/screenshots/phase01a', { recursive: true })
const near = (actual, expected, name, tolerance = 1) => assert.ok(Math.abs(actual - expected) <= tolerance, `${name}: ${actual}, expected ${expected}`)

async function ready() {
  await page.evaluate(() => document.fonts.ready)
  await page.locator('img').evaluateAll(images => Promise.all(images.filter(image => image.getClientRects().length).map(image => image.decode().catch(() => {}))))
}
async function rect(selector) {
  return page.locator(selector).first().evaluate(element => {
    const r = element.getBoundingClientRect()
    return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height }
  })
}

try {
  await page.goto(base)
  await ready()
  await page.keyboard.press('Tab')
  assert.equal(await page.locator(':focus').textContent(), 'Skip to content')
  await page.keyboard.press('Enter')
  assert.equal(await page.locator(':focus').getAttribute('id'), 'main-content')
  assert.equal(await page.locator('.featured-card').count(), 3)
  // Authorized global compact scale; functional checks remain unchanged.
  near((await rect('.site-header')).height, 60, 'Header height')
  near((await rect('.brand img')).x, 144, 'Logo x')
  near((await rect('.navigation-link')).x, 581.81, 'Explore x')
  near((await rect('.landing-hero')).height, 360, 'Hero height')
  near((await rect('.landing-hero__actions')).y, 302.375, 'Hero button y')
  near((await rect('.featured-grid')).y, 502, 'Cards y')
  near((await rect('.featured-card')).width, 290, 'Card width')
  near((await rect('.featured-card')).height, 215.56, 'Card height')
  near((await rect('.landing-promo')).y, 749.56, 'Promo y')
  near((await rect('.landing-promo')).height, 144, 'Promo height')
  assert.equal(await page.getByRole('link', { name: 'View all demo destinations' }).getAttribute('href'), '/explore')
  await page.getByRole('link', { name: 'Start Exploring', exact: true }).click()
  await page.waitForURL('**/preferences')
  await ready()
  const panel = await rect('.preferences-panel')
  near(panel.x, 200, 'Preferences panel x')
  near(panel.y, 228, 'Preferences panel y')
  near(panel.width, 1040, 'Preferences panel width')
  near(panel.height, 724, 'Preferences panel height')
  near((await rect('.preference-location')).y, 286, 'Location y')
  near((await rect('.preference-choice--interest')).y, 384, 'Interest tile y')
  near((await rect('.preference-choice--interest')).width, 131.42, 'Interest tile width')
  near((await rect('.preference-choice--interest')).height, 84, 'Interest tile height')
  near((await rect('.preferences-submit')).y, 884, 'Submit y')

  await page.getByRole('combobox', { name: 'Starting location' }).selectOption('ajloun')
  const food = page.getByRole('checkbox', { name: 'Food', exact: true })
  await food.check()
  assert.ok(await food.isChecked())
  assert.ok(await page.getByRole('checkbox', { name: 'Nature', exact: true }).isChecked())
  await page.getByRole('checkbox', { name: 'Nature', exact: true }).uncheck()
  await page.getByRole('radio', { name: 'Full Day', exact: true }).check()
  assert.ok(!(await page.getByRole('radio', { name: '2 Hours', exact: true }).isChecked()))
  await page.getByRole('radio', { name: '10-30 JD', exact: true }).check()
  await page.getByRole('radio', { name: 'Friends', exact: true }).check()
  await page.getByRole('radio', { name: 'Walking/Nearby', exact: true }).check()
  // Native radio-keyboard navigation must update the controlled state.
  await page.getByRole('radio', { name: 'Full Day', exact: true }).focus()
  await page.keyboard.press('ArrowLeft')
  assert.ok(await page.getByRole('radio', { name: 'Half Day', exact: true }).isChecked())
  await page.getByRole('radio', { name: 'Half Day', exact: true }).focus()
  const focus = await page.locator(':focus').evaluate(element => getComputedStyle(element.parentElement.querySelector('.preference-choice__surface')).outlineStyle)
  assert.equal(focus, 'solid')
  await page.getByRole('link', { name: 'Back', exact: true }).click()
  await page.waitForURL(base + '/')
  await page.getByRole('link', { name: 'Start Exploring', exact: true }).click()
  await page.waitForURL('**/preferences')
  assert.equal(await page.getByRole('combobox').inputValue(), 'ajloun')
  assert.ok(await food.isChecked())
  assert.ok(await page.getByRole('radio', { name: 'Half Day', exact: true }).isChecked())
  assert.ok(await page.getByRole('radio', { name: 'Friends', exact: true }).isChecked())
  assert.ok(await page.getByRole('radio', { name: 'Walking/Nearby', exact: true }).isChecked())
  await page.getByRole('button', { name: 'Show Me Places', exact: true }).click()
  assert.ok((await page.getByRole('status').textContent()).includes('Preferences preview'))
  assert.ok((await page.getByRole('status').textContent()).includes('recommendations are coming'))
  assert.ok((await page.getByRole('status').textContent()).includes('Ajloun'))
  assert.ok((await page.getByRole('status').textContent()).includes('Food'))
  await page.screenshot({ path: 'docs/screenshots/phase01a/preferences-preview-1440.png', fullPage: true })
  await page.reload() // Documented in-memory state resets on full reload.
  await ready()
  assert.equal(await page.getByRole('combobox').inputValue(), 'amman')
  assert.ok(await page.getByRole('checkbox', { name: 'Nature', exact: true }).isChecked())
  assert.equal(await page.getByRole('status').count(), 0)
  for (const input of await page.getByRole('checkbox').all()) {
    await input.check()
    assert.ok(await input.isChecked())
    await input.uncheck()
    assert.ok(!(await input.isChecked()))
  }
  for (const group of await page.locator('.preference-group').all()) {
    for (const input of await group.getByRole('radio').all()) {
      await input.check()
      assert.ok(await input.isChecked())
      assert.equal(await group.locator('input:checked').count(), 1)
    }
  }
  for (const value of await page.getByRole('combobox').locator('option').evaluateAll(options => options.map(option => option.value))) {
    await page.getByRole('combobox').selectOption(value)
    assert.equal(await page.getByRole('combobox').inputValue(), value)
  }
  await page.reload()
  await ready()

  for (const width of [1440, 1366, 1024, 768, 390, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const [name, route] of [['landing', '/'], ['preferences', '/preferences']]) {
      await page.goto(base + route)
      await ready()
      const data = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        imagesLoaded: [...document.images].every(image => image.complete && image.naturalWidth > 0),
        h1: document.querySelector('h1').textContent,
        font: getComputedStyle(document.querySelector('h1')).fontFamily,
        buttonWeight: getComputedStyle(document.querySelector('.button')).fontWeight,
      }))
      assert.ok(data.scrollWidth <= width, `Horizontal overflow on ${name} at ${width}: ${data.scrollWidth}`)
      assert.ok(data.imagesLoaded, `Broken image on ${name} at ${width}`)
      const folder = [1440, 390, 375].includes(width) ? 'docs/screenshots/phase01a' : 'artifacts/phase01a'
      await page.screenshot({ path: `${folder}/${name}-${width}.png`, fullPage: true })
      metrics.push({ name, ...data })
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const [label, route] of [['Explore', '/explore'], ['Map', '/map'], ['My Discoveries', '/my-discoveries']]) {
    await page.getByRole('link', { name: label, exact: true }).click()
    await page.waitForURL(base + route)
    const heading = label === 'Explore' ? 'Explore Jordan differently.' : label === 'My Discoveries' ? 'Your Discoveries' : 'Your Jordan, mapped.'
    await page.waitForFunction(heading => document.querySelector('h1')?.textContent === heading, heading)
    assert.equal(await page.getByRole('link', { name: label, exact: true }).getAttribute('aria-current'), 'page')
    await page.reload()
    assert.equal(await page.locator('h1').textContent(), heading)
  }
  await page.goBack()
  await page.waitForURL(base + '/map')
  await page.goForward()
  await page.waitForURL(base + '/my-discoveries')
  await page.goto(base + '/unknown')
  assert.equal(await page.locator('h1').textContent(), 'Page not found')
  await page.getByRole('link', { name: 'Back to home', exact: true }).click()
  await page.waitForURL(base + '/')
  await page.getByRole('link', { name: 'Explore Map', exact: true }).click()
  await page.waitForURL(base + '/map')
  await page.locator('.tourism-map').waitFor()
  assert.equal(await page.locator('h1').textContent(), 'Your Jordan, mapped.')
  await page.getByRole('link', { name: 'Unseen Jo home', exact: true }).click()
  await page.waitForURL(base + '/')
  await page.getByRole('link', { name: 'Surprise Me', exact: true }).click()
  await page.waitForURL(base + '/surprise-me')
  assert.ok(await page.getByRole('button', { name: 'Search (coming later)' }).isDisabled())
  assert.equal(await page.getByRole('link', { name: 'Profile preview' }).getAttribute('href'), '/profile')

  // Exercise real motion separately from the settled/reduced-motion captures.
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(base)
  await page.waitForFunction(() => document.querySelector('.landing-hero__title')?.parentElement.style.opacity === '1')
  await page.locator('.landing-promo').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => document.querySelector('.promo-reveal')?.style.opacity === '1')
  await page.locator('.featured-card').first().hover()
  await page.waitForFunction(() => document.querySelector('.featured-card')?.style.transform.includes('translateY'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(base)
  assert.ok(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
  assert.equal(await page.locator('.landing-hero__title').evaluate(element => getComputedStyle(element.parentElement).opacity), '1')
  assert.equal(await page.locator('.promo-reveal').evaluate(element => getComputedStyle(element).opacity), '1')
  assert.deepEqual(errors, [])
  assert.deepEqual(failedRequests, [])
  await writeFile('artifacts/phase01a/browser-report.json', JSON.stringify({ base, metrics, errors, failedRequests, checks: 'routes, state persistence, inputs, keyboard, preview, geometry, responsive, images, motion and reduced motion passed' }, null, 2))
  console.log(`PASS: Phase 01A browser flow on ${base}; ${metrics.length} page/viewport checks; no console or asset-loading errors.`)
} finally {
  await browser.close()
}

import { installMapFixture } from './map-test-helpers.mjs'
// Optional Chromium QA: reuses the external Playwright installation from prior phases.
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || join(tmpdir(), 'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  await installMapFixture(page)
const errors = [], failures = [], writes = [], metrics = [], geometry = {}
let expectedFailure = false
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error' && !expectedFailure) errors.push(message.text()) })
page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED') && !expectedFailure) failures.push(request.url()) })
page.on('response', response => { if (response.status() >= 400 && !expectedFailure) failures.push(`${response.status()} ${response.url()}`) })
page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) writes.push(`${request.method()} ${request.url()}`) })
await mkdir('docs/screenshots/phase01c', { recursive: true })
await mkdir('artifacts/phase01c', { recursive: true })
async function ready() {
  await page.evaluate(() => document.fonts.ready)
  await page.locator('img').evaluateAll(images => Promise.all(images.filter(image => image.getClientRects().length).map(image => image.decode().catch(() => {}))))
}
async function waitCards(count) { await page.waitForFunction(count => document.querySelectorAll('.explore-grid .destination-card').length === count, count) }
async function rect(selector) { return page.locator(selector).first().evaluate(element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height } }) }
function near(actual, expected, name) { assert.ok(Math.abs(actual - expected) < 1.1, `${name}: ${actual} != ${expected}`) }
async function checkStorage() {
  assert.deepEqual(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) })), { local: [], session: [] })
}

try {
  await page.goto(base + '/my-discoveries')
  await page.getByRole('heading', { name: 'Your next discovery starts here' }).waitFor()
  await ready()
  await page.bringToFront();await page.screenshot({timeout:45000, path: 'docs/screenshots/phase01c/discoveries-empty-1440.png', fullPage: true })
  await page.getByRole('tab', { name: 'Visited', exact: true }).click()
  await page.getByRole('heading', { name: 'No visited places yet' }).waitFor()
  await page.bringToFront();await page.screenshot({timeout:45000, path: 'docs/screenshots/phase01c/discoveries-visited-1440.png', fullPage: true })
  await page.keyboard.press('ArrowLeft')
  assert.equal(await page.getByRole('tab', { name: 'Saved', exact: true }).getAttribute('aria-selected'), 'true')
  await page.getByRole('link', { name: 'Explore places', exact: true }).click()
  await waitCards(4)
  await page.getByRole('button', { name: 'Favorite Ajloun Forest (preview only)' }).click()
  await page.getByRole('link', { name: 'Ajloun Forest', exact: true }).click()
  await page.waitForURL(base + '/places/ajloun-forest')
  await page.getByRole('heading', { name: 'Ajloun Forest Experience' }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Remove from My Discoveries', exact: true }).getAttribute('aria-pressed'), 'true')
  // Phase 03 added sourced demo coordinates and destination-only external directions.
  assert.match(await page.getByRole('link', { name: /^Get Directions/ }).getAttribute('href'), /destination=32\.3835625%2C35\.7604375/)
  assert.equal(await page.locator('.photo-gallery img').count(), 3)
  assert.equal(await page.locator('.place-info-tile').count(), 6)
  await ready()
  for (const [selector, x, y, width, height] of [
    ['.photo-gallery', 144, 136, 1152, 296], ['.place-info-grid', 144, 564, 1152, 80],
    ['.details-map', 825.98, 668, 470, 463], ['.experience-card', 144, 852, 211.33, 187.78],
    ['.details-actions', 144, 1163, 1152, 44],
  ]) {
    const value = await rect(selector); geometry[selector] = value
    near(value.x, x, selector + ' x'); near(value.y, y, selector + ' y'); near(value.width, width, selector + ' width'); near(value.height, height, selector + ' height')
  }
  await page.locator('.photo-gallery button').first().click()
  await page.getByRole('dialog', { name: 'Ajloun Forest photo viewer' }).waitFor()
  await page.getByRole('button', { name: 'Next photo', exact: true }).click()
  assert.ok((await page.getByRole('dialog').textContent()).includes('2 of 3'))
  await page.keyboard.press('ArrowRight')
  assert.ok((await page.getByRole('dialog').textContent()).includes('3 of 3'))
  await page.keyboard.press('Escape')
  assert.equal(await page.getByRole('dialog').count(), 0)
  assert.equal(await page.locator(':focus').getAttribute('aria-label'), await page.locator('.photo-gallery button').first().getAttribute('aria-label'))
  await page.getByRole('link', { name: 'My Discoveries', exact: true }).click()
  await page.locator('.saved-place-card').waitFor()
  assert.equal(await page.locator('.saved-place-card').count(), 1)
  await page.getByRole('button', { name: 'Remove Ajloun Forest from temporary saves', exact: true }).click()
  await page.getByRole('heading', { name: 'Your next discovery starts here' }).waitFor()
  await page.getByRole('button', { name: 'Load Figma sample collection', exact: true }).click()
  await page.waitForFunction(() => document.querySelectorAll('.saved-place-card').length === 6)
  await ready()
  for (const [selector, x, y, width, height] of [
    ['.explorer-banner', 144, 216, 1152, 194], ['.explorer-badges img', 756, 232, 520, 140],
    ['.saved-place-card', 250, 486, 300, 226],
  ]) {
    const value = await rect(selector); geometry[selector] = value
    near(value.x, x, selector + ' x'); near(value.y, y, selector + ' y'); near(value.width, width, selector + ' width'); near(value.height, height, selector + ' height')
  }
  await page.getByRole('link', { name: 'View Umm Qais details', exact: true }).click()
  await page.waitForURL(base + '/places/umm-qais')
  await page.locator('.place-info-grid').waitFor()
  await page.getByRole('heading', { name: 'Umm Qais', exact: true }).waitFor()
  assert.equal(await page.locator('.place-info-tile--unavailable').count(), 4)
  assert.ok((await page.locator('.details-story').textContent()).includes('unavailable'))
  await page.getByRole('link', { name: 'Back to results' }).click(); await waitCards(4)
  assert.equal(await page.getByRole('button', { name: 'Favorite Ajloun Forest (preview only)' }).getAttribute('aria-pressed'), 'true')
  await page.getByRole('button', { name: 'Open Ajloun Forest demo details preview' }).click()
  await page.getByRole('dialog').getByRole('link', { name: 'View place details' }).click()
  await page.getByRole('heading', { name: 'Ajloun Forest Experience' }).waitFor()
  await page.reload()
  await page.getByRole('button', { name: 'Add My Discoveries', exact: true }).waitFor()
  await checkStorage()

  // Genuine dataset failure and missing image fixtures; no fake application delays.
  expectedFailure = true
  await page.route('**/data/demo-destinations.json', route => route.fulfill({ status: 503, body: 'unavailable fixture' }))
  await page.reload()
  await page.getByRole('heading', { name: 'Demo destinations unavailable' }).waitFor()
  await page.unroute('**/data/demo-destinations.json')
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await page.locator('.photo-gallery').waitFor()
  await page.route('**/assets/figma/details/ajloun-main.png', route => route.fulfill({ status: 404, body: '' }))
  // The same photograph now has responsive delivery URLs; fail every candidate
  // for this original so the existing unavailable-image assertion stays real.
  const responsive=JSON.parse(await (await import('node:fs/promises')).readFile('docs/validation/local-image-derivatives.json','utf8'))['/assets/figma/details/ajloun-main.png']
  for(const variant of responsive?.variants||[])await page.route('**'+variant.src,route=>route.fulfill({status:404,body:''}))
  await page.reload()
  await page.locator('.photo-gallery .asset-unavailable').waitFor()
  await page.unroute('**/assets/figma/details/ajloun-main.png')
  for(const variant of responsive?.variants||[])await page.unroute('**'+variant.src)
  await page.reload(); await page.locator('.photo-gallery img').first().waitFor(); await ready()
  expectedFailure = false
  await page.goto(base + '/places/unknown-place')
  await page.getByRole('heading', { name: 'Place not found', exact: true }).waitFor()
  await page.goto(base + '/unknown-route')
  await page.getByRole('heading', { name: 'Page not found', exact: true }).waitFor()
  await page.getByRole('link', { name: 'Back to home', exact: true }).click()
  await page.waitForURL(base + '/')

  // Account screens validate only and never create authentication state or writes.
  await page.goto(base + '/login')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  assert.equal(await page.locator('input[aria-invalid="true"]').count(), 2)
  assert.equal(await page.locator(':focus').getAttribute('name'), 'email')
  await page.getByLabel('Email address', { exact: true }).fill('invalid')
  await page.getByLabel('Password', { exact: true }).fill('DemoCheck42')
  await page.getByRole('button', { name: 'Show password', exact: true }).click()
  assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('type'), 'text')
  await page.getByRole('button', { name: 'Hide password', exact: true }).click()
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  assert.equal(await page.locator('input[aria-invalid="true"]').count(), 1)
  await page.getByLabel('Email address', { exact: true }).fill('preview@example.invalid')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  assert.ok((await page.getByRole('status').textContent()).includes('No session was created'))
  assert.equal(await page.getByLabel('Password', { exact: true }).inputValue(), '')
  await checkStorage()
  await page.getByRole('link', { name: 'Create an account', exact: true }).click()
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  assert.equal(await page.locator('input[aria-invalid="true"]').count(), 4)
  await page.bringToFront();await page.screenshot({timeout:45000, path: 'docs/screenshots/phase01c/register-validation-1440.png', fullPage: true })
  await page.getByLabel('Full name', { exact: true }).fill('Preview Explorer')
  await page.getByLabel('Email address', { exact: true }).fill('preview@example.invalid')
  await page.getByLabel('Password', { exact: true }).fill('short')
  await page.getByLabel('Confirm password', { exact: true }).fill('different')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  assert.equal(await page.locator('input[aria-invalid="true"]').count(), 2)
  await page.getByLabel('Password', { exact: true }).fill('DemoCheck42')
  await page.getByLabel('Confirm password', { exact: true }).fill('DemoCheck42')
  await page.getByRole('button', { name: 'Show confirm password', exact: true }).click()
  assert.equal(await page.getByLabel('Confirm password', { exact: true }).getAttribute('type'), 'text')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  assert.ok((await page.getByRole('status').textContent()).includes('No account was created'))
  await checkStorage()
  await page.getByRole('link', { name: 'Log in', exact: true }).click()
  await page.getByRole('link', { name: 'Forgot password?', exact: true }).click()
  await page.getByRole('button', { name: 'Request password reset', exact: true }).click()
  assert.equal(await page.locator('input[aria-invalid="true"]').count(), 1)
  await page.getByLabel('Email address', { exact: true }).fill('preview@example.invalid')
  await page.getByRole('button', { name: 'Request password reset', exact: true }).click()
  assert.ok((await page.getByRole('status').textContent()).includes('No reset email was sent'))
  await page.getByRole('link', { name: 'Return to login', exact: true }).click()
  await page.getByRole('link', { name: 'Profile preview', exact: true }).click()
  assert.ok(await page.getByRole('button', { name: 'Log out unavailable' }).isDisabled())
  await page.getByRole('button', { name: 'Edit Profile', exact: true }).click()
  await page.bringToFront();await page.screenshot({timeout:45000, path: 'docs/screenshots/phase01c/profile-edit-1440.png', fullPage: true })
  await page.getByLabel('Full name', { exact: true }).fill('')
  await page.getByRole('button', { name: 'Apply to preview', exact: true }).click()
  assert.equal(await page.locator('input[aria-invalid="true"]').count(), 1)
  await page.getByLabel('Full name', { exact: true }).fill('Demo Wanderer')
  await page.getByRole('checkbox', { name: 'Food', exact: true }).check()
  await page.getByRole('button', { name: 'Apply to preview', exact: true }).click()
  assert.equal(await page.locator('.profile-summary h2').textContent(), 'Demo Wanderer')
  await page.getByRole('link', { name: 'Edit discovery preferences', exact: true }).click()
  assert.ok(await page.getByRole('checkbox', { name: 'Food', exact: true }).isChecked())
  await page.getByRole('link', { name: 'Profile preview', exact: true }).click()
  assert.equal(await page.locator('.profile-summary h2').textContent(), 'Demo Wanderer')
  await page.getByRole('button', { name: 'Edit Profile', exact: true }).click()
  await page.getByLabel('Full name', { exact: true }).fill('Discarded draft')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  assert.equal(await page.locator('.profile-summary h2').textContent(), 'Demo Wanderer')
  await page.reload()
  assert.equal(await page.locator('.profile-summary h2').textContent(), 'Jordan Explorer')

  const routes = [['details', '/places/ajloun-forest', '.photo-gallery'], ['discoveries', '/my-discoveries', '.explorer-banner'], ['login', '/login', '.account-form-panel'], ['register', '/register', '.account-form-panel'], ['recovery', '/forgot-password', '.account-form-panel'], ['profile', '/profile', '.profile-settings'], ['not-found', '/not-a-route', '.not-found-page']]
  for (const width of [1440, 1366, 1024, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const [name, route, selector] of routes) {
      console.log('Checking',name,width)
      await page.goto(base + route)
      await page.locator(selector).waitFor()
      if (name === 'discoveries') { await page.getByRole('button', { name: 'Load Figma sample collection' }).click(); await page.waitForFunction(() => document.querySelectorAll('.saved-place-card').length === 6) }
      await ready()
      const data = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, images: [...document.images].every(image => image.complete && image.naturalWidth > 0) }))
      assert.ok(data.scrollWidth <= width, `Overflow on ${name} at ${width}: ${data.scrollWidth}`)
      assert.ok(data.images, `Broken images on ${name} at ${width}`)
      if (name === 'details') {
        const note = await rect('#directions-unavailable'), actions = await rect('.details-actions')
        assert.ok(note.y + note.height <= actions.y, `Directions notice overlaps actions at ${width}`)
      }
      // Detect text/control boxes extending outside their card or viewport.
      assert.equal(await page.locator('input, .button, .saved-place-card, .place-info-tile').evaluateAll(elements => elements.filter(element => { const r = element.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1) }).length), 0)
      metrics.push({ name, ...data })
      await page.bringToFront();await page.screenshot({timeout:45000, path: `${width === 1440 || width === 375 ? 'docs/screenshots/phase01c' : 'artifacts/phase01c'}/${name}-${width}.png`, fullPage: true })
    }
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(base + '/places/ajloun-forest')
  await page.waitForFunction(() => document.querySelector('.details-heading')?.style.opacity === '1')
  await page.locator('.experience-card').first().scrollIntoViewIfNeeded()
  await page.waitForFunction(() => document.querySelector('.experience-card')?.parentElement.style.opacity === '1')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(base + '/places/ajloun-forest')
  await page.locator('.details-heading').waitFor()
  assert.equal(await page.locator('.details-heading').evaluate(element => getComputedStyle(element).opacity), '1')
  assert.equal(await page.locator('.experience-card').first().evaluate(element => getComputedStyle(element.parentElement).opacity), '1')
  await checkStorage()
  assert.deepEqual(errors, []); assert.deepEqual(failures, []); assert.deepEqual(writes, [])
  await writeFile('artifacts/phase01c/browser-report.json', JSON.stringify({ base, geometry, metrics, errors, failures, writes, checks: 'shared reversible temporary saves, empty/visited/sample collection, gallery keyboard/dialog focus, missing data and images, dataset error/retry, unknown routes, account validation/toggles/no auth writes, editable demo profile/shared preferences, refresh resets, geometry, responsive, motion/reduced motion passed' }, null, 2))
  console.log(`PASS: Phase 01C on ${base}; ${metrics.length} page/viewport checks, zero unexpected console/request errors, zero write requests.`)
} catch (error) { console.error('Browser errors:', errors, failures); throw error } finally { await browser.close() }

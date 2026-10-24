import assert from 'node:assert/strict'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { demoCoordinates } from '../src/features/map/geography.js'
import { setDestinationView } from './map-test-helpers.mjs'
const qa = join(tmpdir(), 'unseen-jo-browser-check/node_modules')
const { chromium } = await import(pathToFileURL(join(qa, 'playwright/index.mjs')))
const { default: AxeBuilder } = await import(pathToFileURL(join(qa, '@axe-core/playwright/dist/index.mjs')))
const url = process.env.QA_BASE_URL || 'http://127.0.0.1:4185'
const out = 'docs/screenshots/phase03-quality'
await mkdir(out, { recursive: true })
await mkdir('artifacts/phase03-quality', { recursive: true })
const data = JSON.parse(await readFile('public/data/demo-destinations.json', 'utf8')).filter(p => p.showInExplore !== false)
assert.equal(data.length, 4)
assert.equal(data.find(p => p.id === 'ajloun-forest').image, null)
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] })
const results = [], errors = []
try {
  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', hasTouch: width < 1024 })
    const p = await context.newPage()
    p.on('pageerror', e => errors.push(e.message))
    const tiles = []
    p.on('response', r => { if (r.url().includes('openfreemap') && r.url().endsWith('.pbf') && r.status() === 200) tiles.push(r.url()) })
    await p.goto(url + '/explore')
    await p.locator('.destination-card').first().waitFor()
    // Every real demo card selects its own sourced point and focuses that marker.
    for (const place of data) {
      await setDestinationView(p, 'List')
      await p.getByRole('button', { name: `Locate ${place.name} on map`, exact: true }).click()
      await p.locator('[data-map-idle="true"]').waitFor({ timeout: 60000 })
      const marker = p.locator('.destination-marker[aria-pressed="true"]')
      assert.equal(await marker.getAttribute('data-place-id'), place.id)
      assert.equal(Number(await marker.getAttribute('data-latitude')), demoCoordinates[place.id].latitude)
      assert.equal(Number(await marker.getAttribute('data-longitude')), demoCoordinates[place.id].longitude)
      assert.equal(await p.locator('.destination-card--selected').getAttribute('data-place-id'), place.id)
      assert.equal(await p.locator('.tourism-popup h2').textContent(), place.name)
      assert.ok(Number(await p.locator('.map-canvas').getAttribute('data-map-zoom')) >= 12)
      const m = await marker.boundingBox(), map = await p.locator('.map-canvas').boundingBox()
      assert.ok(Math.abs(m.x + m.width / 2 - map.x - map.width / 2) < 3, 'selected marker is geographically centered horizontally')
      assert.ok(m.y >= map.y && m.y + m.height < map.y + map.height)
      const popup = await p.locator('.maplibregl-popup-content').boundingBox()
      assert.ok(popup.x >= map.x && popup.x + popup.width <= map.x + map.width && popup.y >= map.y && popup.y + popup.height <= map.y + map.height, 'popup fits map')
      assert.equal(await p.locator('.tourism-popup img').count(), 0)
      assert.equal(await p.getByRole('link', { name: 'Location source', exact: true }).getAttribute('href'), demoCoordinates[place.id].coordinateSource)
      await p.keyboard.press('Escape')
    }
    await p.getByRole('button', { name: 'Reset Jordan view', exact: true }).click()
    await p.locator('[data-map-idle="true"]').waitFor()
    const initialZoom = Number(await p.locator('.map-canvas').getAttribute('data-map-zoom'))
    await p.getByRole('button', { name: 'Show Wadi Mujib Adventure on map', exact: true }).click()
    await p.locator('[data-map-idle="true"]').waitFor()
    const visibleMarkers = await p.locator('.map-canvas').evaluate(host => {
      const b = host.getBoundingClientRect(), popup = host.querySelector('.maplibregl-popup-content').getBoundingClientRect()
      return [...host.querySelectorAll('.destination-marker')].filter(e => { const r = e.getBoundingClientRect(); return r.left >= b.left && r.right <= b.right && r.top >= b.top && r.bottom <= b.bottom && !(r.left + r.width / 2 < popup.right && r.left + r.width / 2 > popup.left && r.top + r.height / 2 < popup.bottom && r.top + r.height / 2 > popup.top) }).length
    })
    assert.ok(visibleMarkers >= 2, `screenshot contains multiple visible markers: ${visibleMarkers}`)
    assert.equal(await p.locator('.tourism-popup').count(), 1)
    assert.ok(tiles.length > 0, 'real geographic provider rendered')
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    const axe = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    assert.deepEqual(axe.violations.map(v => v.id), [])
    await p.evaluate(() => document.fonts.ready)
    await p.evaluate(() => scrollTo(0, 0))
    await p.screenshot({ path: `${out}/demo-${width}-viewport.png` })
    await setDestinationView(p, 'Map')
    await p.locator('.tourism-map').screenshot({ path: `${out}/demo-${width}-markers-popup.png` })
    await p.screenshot({ path: `${out}/demo-${width}-full.png`, fullPage: true })
    results.push({ width, height, selectedCardsTested: data.length, visibleMarkers, initialZoom, tileResponses: tiles.length, axeViolations: 0, status: 'passed' })
    console.log('PASS demo quality, real map, four card selections, multiple markers/popup, axe', width)
    await context.close()
  }
  assert.deepEqual(errors, [])
} finally {
  await writeFile('artifacts/phase03-quality/browser-results.json', JSON.stringify({ scope: 'Real local demo browser and OpenFreeMap provider; no database requests or writes.', results, errors }, null, 2) + '\n')
  await browser.close()
}

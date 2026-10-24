import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const manifest = JSON.parse(await readFile('src/data/figma-assets.json', 'utf8'))
assert.equal(new Set(manifest.map(a => a.screen)).size, 7, 'Inventory must cover seven Figma screens')
for (const asset of manifest) {
  assert.equal(asset.status, 'downloaded', `Missing Figma asset: ${asset.path}`)
  const bytes = await readFile(resolve('public', asset.path.slice(1)))
  assert.ok(bytes.length > 0, `Empty asset: ${asset.path}`)
  assert.equal(bytes.length, asset.bytes, `Size changed: ${asset.path}`)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, `Asset changed: ${asset.path}`)
  assert.ok(asset.placements.length > 0, `Missing layer association: ${asset.path}`)
  const ext = asset.format === 'jpeg' ? '.jpg' : `.${asset.format}`
  assert.ok(asset.path.endsWith(ext), `Wrong extension: ${asset.path}`)
}
async function checkRuntimeSources(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) await checkRuntimeSources(path)
    else if (/\.(jsx?|css|json)$/.test(path)) {
      const content = await readFile(path, 'utf8')
      assert.ok(!/https:\/\/www\.figma\.com\/api\/mcp\/asset\//.test(content), `Temporary Figma URL in ${path}`)
    }
  }
}
await checkRuntimeSources('src')
await checkRuntimeSources('public/data')
const destinations = JSON.parse(await readFile('public/data/demo-destinations.json', 'utf8'))
const knownPaths = new Set(manifest.map(asset => asset.path))
function checkDemoReferences(value) {
  if (typeof value === 'string' && value.startsWith('/assets/')) assert.ok(knownPaths.has(value), `Uninventoried demo asset: ${value}`)
  else if (Array.isArray(value)) value.forEach(checkDemoReferences)
  else if (value && typeof value === 'object') Object.values(value).forEach(checkDemoReferences)
}
checkDemoReferences(destinations)
assert.equal(new Set(destinations.map(place => place.id)).size, destinations.length, 'Duplicate destination records')
assert.ok(destinations.every(place => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(place.id)), 'Destination IDs must be route-safe slugs')
console.log(`PASS: ${manifest.length} local asset references, ${new Set(manifest.map(a => a.sha256)).size} unique originals; hashes, file types, layer associations, and runtime URL checks passed.`)

import assert from 'node:assert/strict'
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
import { PGlite } from '@electric-sql/pglite'
import { postgis } from '@electric-sql/pglite-postgis'
import { readSupabaseConfig } from '../src/lib/supabase/config.js'
import { resolveDataMode } from '../src/features/tourism/mode.js'
import { createTourismRepository } from '../src/features/tourism/repository.js'
import { filterPlaces, normalizePlace, placeHref, mapPreferenceCategories } from '../src/features/tourism/model.js'

const results = []
async function check(name, fn) { await fn(); results.push({ name, status: 'passed' }); console.log(`PASS ${name}`) }
const env = { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' }
const categories = [{ id: 'category-1', slug: 'nature', name: 'Nature' }, { id: 'category-2', slug: 'history', name: 'History' }]
const row = { id: '00000000-0000-4000-8000-000000000101', slug: 'test-place', name: 'Test Place', status: 'published', is_demo: false,
  description: null, city: null, price_min_jod: null, price_max_jod: null, duration_min_minutes: null, duration_max_minutes: null,
  latitude: null, longitude: null, place_categories: [{ categories: categories[0] }], place_images: [] }
const illustratedRow={...row,place_images:[{storage_path:`${row.id}/fixture.png`,alt_text:'Isolated approved public photo',is_cover:true,sort_order:0}]}
function harness({ places = [illustratedRow], categoryRows = categories, failure = false } = {}) {
  const requests = []
  let fail = failure
  const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (input, init) => {
      const url = new URL(input); requests.push({ url, init })
      if (fail) return new Response(JSON.stringify({ message: 'Injected network failure' }), { status: 503 })
      let data = url.pathname.endsWith('/categories') ? categoryRows : places
      if (url.searchParams.has('slug')) data = data.filter(p => `eq.${p.slug}` === url.searchParams.get('slug'))
      if (url.pathname.endsWith('/places')) {
        const offset = Number(url.searchParams.get('offset') || 0), limit = Number(url.searchParams.get('limit') || data.length)
        data = data.slice(offset, offset + limit)
      }
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
    } },
  })
  client.storage.from=()=>({createSignedUrls:async paths=>({data:paths.map(path=>({path,signedUrl:'https://example.supabase.co/'+path}))})})
  return { client, requests, recover: () => { fail = false } }
}

await check('public client configuration validates URL/key and rejects secrets', () => {
  assert.equal(readSupabaseConfig({}), null)
  assert.equal(readSupabaseConfig(env).url, env.VITE_SUPABASE_URL)
  for (const key of ['sb_secret_x', 'eyJhbGc.test.signature', 'service_role']) assert.throws(() => readSupabaseConfig({ ...env, VITE_SUPABASE_PUBLISHABLE_KEY: key }))
  assert.throws(() => readSupabaseConfig({ ...env, VITE_SUPABASE_URL: 'http://example.com' }))
})
await check('mode defaults: production live, explicit demo, development auto', () => {
  assert.equal(resolveDataMode({ ...env, PROD: true }), 'supabase')
  assert.equal(resolveDataMode({ PROD: true, VITE_DATA_MODE: 'demo' }), 'demo')
  assert.equal(resolveDataMode({}), 'demo')
  assert.equal(resolveDataMode(env), 'supabase')
  assert.equal(resolveDataMode({ ...env, PROD: true, VITE_DATA_MODE: 'auto' }), 'supabase')
  assert.throws(() => resolveDataMode({ PROD: true }))
  assert.throws(() => resolveDataMode({ VITE_DATA_MODE: 'supabase' }))
  assert.throws(() => resolveDataMode({ VITE_SUPABASE_URL: env.VITE_SUPABASE_URL }))
  assert.throws(() => resolveDataMode({ VITE_DATA_MODE: 'invalid' }))
})
await check('successful categories and published catalog use nested joins and public key', async () => {
  const h = harness(), repo = createTourismRepository(h.client)
  const data = await repo.fetchCatalog()
  assert.equal(data.destinations.length, 1); assert.equal(data.categories.length, 2)
  assert.equal(h.requests.length, 2)
  const request = h.requests.find(r => r.url.pathname.endsWith('/places'))
  assert.equal(request.url.searchParams.get('status'), 'eq.published')
  assert.equal(request.url.searchParams.get('is_demo'), 'eq.false')
  assert.ok(request.url.searchParams.get('select').includes('place_categories(categories('))
  assert.ok(request.url.searchParams.get('select').includes('place_images('))
  assert.equal(new Headers(request.init.headers).get('apikey'), env.VITE_SUPABASE_PUBLISHABLE_KEY)
})
await check('parallel callers deduplicate and reuse catalog; explicit invalidation refetches', async () => {
  const h = harness(), repo = createTourismRepository(h.client)
  await Promise.all([repo.fetchCatalog(), repo.fetchCatalog(), repo.fetchFeaturedDestinations()])
  assert.equal(h.requests.length, 2)
  await repo.fetchPlaceCategories('test-place'); await repo.fetchPlaceImages('test-place')
  assert.equal(h.requests.length, 2)
  repo.invalidate(); await repo.fetchCatalog(); assert.equal(h.requests.length, 4)
})
await check('empty published places stay empty with categories intact', async () => {
  const h = harness({ places: [] }), repo = createTourismRepository(h.client)
  assert.deepEqual(await repo.fetchPublishedPlaces(), [])
  assert.deepEqual(await repo.fetchFeaturedDestinations(), [])
  assert.equal((await repo.fetchCategories()).length, 2)
})
await check('name search and multi-category filtering; supported properties exclude unknowns', () => {
  const a = normalizePlace(row), b = normalizePlace({ ...row, id: 'second', slug: 'other', name: 'Other', city: 'Amman', price_min_jod: 0, price_max_jod: 5, duration_min_minutes: 30, duration_max_minutes: 60, suitable_groups: ['family'], place_categories: [{ categories: categories[1] }] })
  assert.equal(filterPlaces([a, b], { query: '  TEST ' }).length, 1)
  assert.equal(filterPlaces([a, b], { categorySlugs: ['nature', 'history'] }).length, 2)
  assert.equal(filterPlaces([a, b], { query: 'test', categorySlugs: ['history'] }).length, 0)
  assert.deepEqual(filterPlaces([a, b], { maxCost: 10, maxMinutes: 90, group: 'family', city: 'Amman' }).map(p => p.id), ['second'])
})
await check('valid, missing and malformed slugs; direct detail reads also enforce publication', async () => {
  const h = harness(), repo = createTourismRepository(h.client)
  assert.equal(await repo.fetchPublishedPlaceBySlug('../invalid'), null)
  assert.equal(h.requests.length, 0)
  assert.equal((await repo.fetchPublishedPlaceBySlug('test-place')).slug, 'test-place')
  assert.equal(h.requests[0].url.searchParams.get('status'), 'eq.published')
  assert.equal(await repo.fetchPublishedPlaceBySlug('does-not-exist'), null)
})
await check('missing optional values stay unknown; no fabricated demo cost or travel time', () => {
  const p = normalizePlace(row)
  assert.equal(p.costJod, null); assert.equal(p.costLabel, 'Cost unavailable')
  assert.equal(p.durationMinutes, null); assert.equal(p.travelLabel, null); assert.equal(p.image, null)
  assert.equal(p.latitude, null); assert.equal(p.details.description, null)
  assert.throws(() => normalizePlace({ ...row, price_min_jod: 'NaN' }))
  for (const status of ['draft', 'archived']) assert.throws(() => normalizePlace({ ...row, status }))
  assert.throws(() => normalizePlace({ ...row, is_demo: true }))
})
await check('default media does not reuse unverified Figma photos; approved mappings are exact', async () => {
  const h = harness({places:[row]}), repo = createTourismRepository(h.client)
  assert.deepEqual(await repo.fetchPublishedPlaces(), []) // Current policy excludes image-less destinations.
  const approved = [{ src: '/assets/figma/details/ajloun-main.png', alt: 'Test-only approved fixture' }]
  const testRepo = createTourismRepository(h.client, { media: { 'test-place': approved } })
  assert.deepEqual((await testRepo.fetchPlaceImages('test-place')), approved)
})
await check('private image URLs are signed in one batch; failed signing yields no unrelated image', async () => {
  const fixture = { ...row, place_images: [{ storage_path: `${row.id}/image.png`, alt_text: 'Test image', is_cover: true, sort_order: 0 }] }
  const h = harness({ places: [fixture] }); let calls = 0
  h.client.storage.from = bucket => ({ createSignedUrls: async (paths, ttl) => { calls++; assert.equal(bucket, 'place-images'); assert.equal(ttl, 300); return { data: paths.map(path => ({ path, signedUrl: 'https://example.supabase.co/signed.png' })), error: null } } })
  const repo = createTourismRepository(h.client)
  assert.equal((await repo.fetchPublishedPlaces())[0].image, 'https://example.supabase.co/signed.png'); assert.equal(calls, 1)
  h.client.storage.from = () => ({ createSignedUrls: async () => ({ data: null, error: new Error('denied') }) })
  repo.invalidate(); assert.deepEqual(await repo.fetchPublishedPlaces(), [])
})
await check('network failures propagate, are not cached and support retry', async () => {
  const h = harness({ failure: true }), repo = createTourismRepository(h.client)
  await assert.rejects(repo.fetchPublishedPlaces(), /could not be loaded/)
  h.recover(); assert.equal((await repo.fetchPublishedPlaces()).length, 1)
  assert.equal(h.requests.length, 2)
})
await check('malformed category payload fails visibly', async () => {
  const h = harness({ categoryRows: [{ slug: 'bad' }] })
  await assert.rejects(createTourismRepository(h.client).fetchCatalog(), /Invalid category/)
})
await check('catalog pagination reads beyond platform response limit without N+1', async () => {
  const places = Array.from({ length: 501 }, (_, i) => ({ ...illustratedRow, id: `fixture-${i}`, slug: `place-${i}` }))
  const h = harness({ places })
  assert.equal((await createTourismRepository(h.client).fetchPublishedPlaces()).length, 501)
  assert.equal(h.requests.length, 2)
})
await check('preference category mapping and live/demo routes keep distinct identities', () => {
  assert.deepEqual(mapPreferenceCategories(['nature'], categories), ['category-1'])
  assert.equal(placeHref(normalizePlace(row)), '/places/test-place')
  assert.equal(placeHref({ id: 'ajloun-forest', mode: 'demo-sample' }), '/places/ajloun-forest?sample=figma')
})
await check('draft content import executes twice, preserves edits and keeps unknowns NULL', async () => {
  const db = new PGlite({ extensions: { postgis } })
  try {
    await db.exec(await readFile('supabase/tests/bootstrap.sql', 'utf8'))
    for (const file of (await readdir('supabase/migrations')).filter(f => f.includes('_phase02a_') && f.endsWith('.sql')).sort()) await db.exec(await readFile(`supabase/migrations/${file}`, 'utf8'))
    const content = await readFile('supabase/content/phase02b-starter.sql', 'utf8')
    await db.exec(content)
    await db.exec("update public.places set name='Editorial change' where slug='ajloun-forest'")
    await db.exec(content)
    const data = (await db.query('select * from public.places')).rows
    assert.equal(data.length, 6); assert.ok(data.every(p => p.status === 'draft' && !p.is_demo))
    assert.equal(data.find(p => p.slug === 'ajloun-forest').name, 'Editorial change')
    assert.ok(data.every(p => ['latitude','longitude','price_min_jod','price_max_jod','duration_min_minutes','duration_max_minutes','verified_at'].every(k => p[k] == null)))
    assert.equal((await db.query('select count(*) n from public.place_categories')).rows[0].n, 10)
    assert.equal((await db.query('select count(*) n from auth.users')).rows[0].n, 0)
    assert.equal((await db.query('select count(*) n from public.place_images')).rows[0].n, 0)
  } finally { await db.close() }
})
await mkdir('artifacts/phase02b', { recursive: true })
await writeFile('artifacts/phase02b/local-tests.json', JSON.stringify({ scope: 'Local SDK requests use mocked HTTP; draft import uses disposable real PostgreSQL/PostGIS. Not remote integration.', passed: results.length, results }, null, 2) + '\n')
console.log(`${results.length} local grouped checks passed.`)

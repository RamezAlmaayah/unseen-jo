// Actual hosted SDK/HTTP checks. No session, privileged key or content publishing.
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { loadEnv } from 'vite'
import { createClient } from '@supabase/supabase-js'
import { readSupabaseConfig } from '../src/lib/supabase/config.js'
import { createTourismRepository } from '../src/features/tourism/repository.js'

const config = readSupabaseConfig(loadEnv('production', process.cwd(), 'VITE_'))
assert.equal(config?.url, 'https://dkhwwvoplhfjccvjegty.supabase.co')
const client = createClient(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
const repo = createTourismRepository(client)
const results = []
async function check(name, fn) { await fn(); results.push({ name, status: 'passed' }); console.log(`PASS ${name}`) }
await check('verified URL and enabled modern publishable key initialize public SDK', () => assert.ok(config.publishableKey.startsWith('sb_publishable_')))
await check('seven real active categories', async () => assert.equal((await repo.fetchCategories()).length, 7))
await check('real nested API returns six genuine published destinations', async () => {const rows=await repo.fetchPublishedPlaces();assert.equal(rows.length,6);assert.ok(rows.every(p=>p.mode==='supabase'&&p.databaseId));})
await check('unfiltered public query exposes published rows only', async () => {
  const { data, error } = await client.from('places').select('id,status').retry(false)
  assert.equal(error, null); assert.equal(data.length,6);assert.ok(data.every(p=>p.status==='published'))
})
await check('published slug is readable while draft queries stay hidden', async () => {assert.equal((await repo.fetchPublishedPlaceBySlug('ajloun-forest')).slug,'ajloun-forest');const r=await client.from('places').select('id').eq('status','draft');assert.equal(r.error,null);assert.deepEqual(r.data,[])})
await check('unknown and invalid slugs return null', async () => {
  assert.equal(await repo.fetchPublishedPlaceBySlug('phase02b-not-a-place'), null)
  assert.equal(await repo.fetchPublishedPlaceBySlug('../invalid'), null)
})
for (const table of ['profiles','user_roles','user_preferences','user_preference_categories','saved_places','recommendation_feedback','admin_audit_logs']) {
  await check(`public requests denied private ${table}`, async () => {
    const { error } = await client.from(table).select('*').retry(false)
    assert.equal(error?.code, '42501')
  })
}
await check('public category insert forbidden', async () => {
  const { error } = await client.from('categories').insert({ slug: 'phase02b-denied', name: 'Denied security check' }).retry(false)
  assert.equal(error?.code, '42501')
})
await check('public place updates forbidden', async () => {
  const { error } = await client.from('places').update({ name: 'Ajloun Forest Reserve' }).eq('slug', 'ajloun-forest').retry(false)
  assert.equal(error?.code, '42501')
})
await check('public place deletes forbidden', async () => {
  const { error } = await client.from('places').delete().eq('slug', 'phase02b-nonexistent').retry(false)
  assert.equal(error?.code, '42501')
})
await check('only rights-approved published image metadata is exposed under real RLS', async () => {
  const { data, error } = await client.from('place_images').select('*').retry(false)
  assert.equal(error, null);assert.equal(data.length,12);assert.ok(data.every(i=>i.approved_at&&i.source_url))
})
await mkdir('artifacts/phase02b', { recursive: true })
await writeFile('artifacts/phase02b/hosted-http-tests.json', JSON.stringify({ projectRef: 'dkhwwvoplhfjccvjegty', scope: 'Real hosted SDK/HTTP using modern publishable key. Current baseline is six published destinations and twelve approved images; draft and unapproved predicates stay hidden. Denied permission probes produce zero stored mutations.', passed: results.length, results }, null, 2) + '\n')
console.log(`${results.length} real hosted checks passed.`)

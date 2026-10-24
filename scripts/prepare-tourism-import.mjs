// Generates reviewed DML only. No network, schema/RLS changes or publishing.
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { isPlaceSlug } from '../src/features/tourism/model.js'

const manifest = JSON.parse(await readFile('supabase/content/jordan-starter.json', 'utf8'))
assert.equal(manifest.projectRef, 'dkhwwvoplhfjccvjegty')
assert.equal(new Set(manifest.places.map(p => p.slug)).size, manifest.places.length)
const literal = value => `'${value.replaceAll("'", "''")}'`
const vocabulary = ['nature', 'food', 'history', 'culture', 'adventure', 'photography', 'family']
const lines = ['-- Phase 02B draft content only; target dkhwwvoplhfjccvjegty.', '-- Idempotent: existing slugs/edits/publication are never overwritten.', '-- No destination images, Storage objects, accounts, activity or invented values.', 'begin;']
for (const place of manifest.places) {
  assert.ok(isPlaceSlug(place.slug) && place.name.trim() && place.description.trim())
  assert.ok(new URL(place.source_url).protocol === 'https:')
  assert.ok(place.categories.length && place.categories.every(c => vocabulary.includes(c)))
  lines.push(`with inserted as (
  insert into public.places(slug,name,description,status,is_demo,source_url,
    latitude,longitude,price_min_jod,price_max_jod,duration_min_minutes,duration_max_minutes,
    city,address,best_time_to_visit,transportation_notes,suitable_groups,verified_at,verified_by)
  values(${literal(place.slug)},${literal(place.name)},${literal(place.description)},'draft',false,${literal(place.source_url)},
    null,null,null,null,null,null,null,null,null,null,null,null,null)
  on conflict(slug) do nothing returning id
)
insert into public.place_categories(place_id,category_id)
select p.id,c.id from inserted p cross join public.categories c
where c.slug in (${place.categories.map(literal).join(',')}) on conflict do nothing;`)
}
lines.push('commit;')
await writeFile('supabase/content/phase02b-starter.sql', lines.join('\n') + '\n')
console.log(`Prepared ${manifest.places.length} draft destinations. Nothing published or sent remotely.`)

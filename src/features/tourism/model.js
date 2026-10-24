import {destinationSearchFields,matchesDestination} from '../search/destinationSearch.js'
export const isPlaceSlug = value => typeof value === 'string' && value.length <= 120 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)
export const placeHref = place => `/places/${place.slug || place.id}${place.mode === 'demo-sample' ? '?sample=figma' : ''}`
const nullableNumber = value => value == null ? null : Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : (() => { throw new Error('Invalid tourism number.') })()

export function validateCategories(rows) {
  if (!Array.isArray(rows) || rows.some(c => !c || !isPlaceSlug(c.slug) || typeof c.id !== 'string' || typeof c.name !== 'string' || !c.name.trim())) throw new Error('Invalid category response.')
  return rows.map(c => ({ id: c.id, slug: c.slug, name: c.name }))
}

export function normalizePlace(row, photos = []) {
  if (!row || !isPlaceSlug(row.slug) || typeof row.id !== 'string' || typeof row.name !== 'string' || !row.name.trim() || row.status!=='published' || row.is_demo !== false) throw new Error('Invalid published-place response.')
  const categories = validateCategories((row.place_categories ?? []).map(link => link.categories).filter(Boolean))
  const min = nullableNumber(row.price_min_jod), max = nullableNumber(row.price_max_jod)
  const durationMin = nullableNumber(row.duration_min_minutes), durationMax = nullableNumber(row.duration_max_minutes)
  const costLabel = min != null && max != null ? `${min === max ? min : `${min}–${max}`} JD` : min != null ? `From ${min} JD` : max != null ? `Up to ${max} JD` : 'Cost unavailable'
  const durationLabel = durationMin != null && durationMax != null ? `${durationMin === durationMax ? durationMin : `${durationMin}–${durationMax}`} min` : durationMin != null ? `From ${durationMin} min` : durationMax != null ? `Up to ${durationMax} min` : 'Duration unavailable'
  return {
    prototype:row.prototype,searchFields:destinationSearchFields(row),translations: row.place_translations || [], englishUpdatedAt: row.updated_at, address: row.address, id: row.id, databaseId: row.id, slug: row.slug, name: row.name, mode: 'supabase',
    categoryId: categories[0]?.slug ?? null, categoryIds: categories.map(c => c.slug), category: categories.map(c => c.name).join(' · ') || 'Uncategorized',
    categories, image: photos[0]?.src ?? null, imageDelivery:photos[0]?.delivery??null, alt: photos[0]?.alt ?? `${row.name}: destination image unavailable`, crop: 'cover',
    costJod: min != null && min === max ? min : null, priceMin: min, priceMax: max, costLabel,
    durationLabel, durationMin, durationMax, durationMinutes: durationMin != null && durationMax != null ? [durationMin, durationMax] : null,
    travelLabel:row.prototype?`~${row.prototype.planning.travelMinutes} min drive`:null, city: row.city ?? null, groups: row.suitable_groups ?? [],
    latitude: row.latitude ?? null, longitude: row.longitude ?? null,
    sourceUrl: row.source_url ?? null, verifiedAt: row.verified_at ?? null,
    details: { title: row.name, subtitle: categories.map(c => c.name).join(' · '), description: row.description,
      gallery: photos.length ? photos : null, bestTime: row.best_time_to_visit, groupLabel: row.suitable_groups?.join(' / '), transportLabel: row.transportation_notes,region:row.region,openingHours:row.opening_hours,activities:row.activities,visitorInformation:row.visitor_information },
  }
}

// Catalog filters are shared by repository calls and Explore; unknown values do
// not count as zero-cost, short visits, or suitable groups.
export function filterPlaces(places, { query = '', categorySlugs = [], city, maxCost, maxMinutes, group } = {}) {
  return places.filter(p => p.showInExplore !== false &&
    matchesDestination(p,query) &&
    (!categorySlugs.length || categorySlugs.some(slug => (p.categoryIds ?? [p.categoryId]).includes(slug))) &&
    (!city || p.city === city) && (maxCost == null || (p.priceMax != null && p.priceMax <= maxCost)) &&
    (maxMinutes == null || (p.durationMinutes != null && p.durationMinutes[1] <= maxMinutes)) && (!group || p.groups?.includes(group)))
}

export function mapPreferenceCategories(interests, categories) {
  return categories.filter(c => interests.includes(c.slug)).map(c => c.id)
}

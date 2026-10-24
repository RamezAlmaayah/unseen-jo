import { filterPlaces, isPlaceSlug, normalizePlace, validateCategories } from './model.js'
import { approvedTourismMedia } from '../../data/tourism-media.js'
import {catalogVersion} from './catalogEvents.js'
import {createImageDelivery} from './imageDelivery.js'
import {prototypeRow} from '../prototype/model.js'

export const PLACE_SELECT = 'id,slug,name,status,is_demo,description,city,address,region,opening_hours,activities,visitor_information,source_url,verified_at,updated_at,place_translations(*),price_min_jod,price_max_jod,duration_min_minutes,duration_max_minutes,best_time_to_visit,transportation_notes,suitable_groups,latitude,longitude,place_categories(categories(id,slug,name)),place_images(id,storage_path,alt_text,sort_order,is_cover,attribution,source_url)'
const PAGE_SIZE = 500
const TTL = 60_000
const MEDIA_TTL = 300
// Recommendations share the hydrated catalog so the cold path cannot bypass
// public image eligibility. Keep the export for existing SDK/test consumers.
export const RECOMMENDATION_SELECT=PLACE_SELECT

/** Public read-only repository. Dependency injection supports deterministic tests.
 * Catalog joins fetch relationships/images in one query per page, never per card.
 * Cached for one minute (shorter than signed media URLs); errors aren't cached.
 */
export function createTourismRepository(client, { now = Date.now, media = approvedTourismMedia, privatePrototype=false,owner=null } = {}) {
  if (!client) throw new Error('Public tourism data is not configured.')
  const cache = new Map(), signedMedia = new Map()
  const delivery=createImageDelivery(client,{now})
  function storedDelivery(image){
    if(!image.prototypeRenditions?.length)return typeof client.storage.from('place-images').createSignedUrl==='function'?delivery.forPath(image.storage_path):null
    return {sources:async widths=>{
      const variants=[...new Map(widths.map(width=>{const r=image.prototypeRenditions.find(r=>r.width>=width)||image.prototypeRenditions.at(-1);return [r.width,r]})).values()]
      return Promise.all(variants.map(async r=>({width:r.width,src:(await delivery.forPath(r.storagePath).original()).src})))
    },original:()=>delivery.forPath(image.storage_path).original()}
  }
  let version=catalogVersion()
  function clear(){cache.clear();signedMedia.clear();delivery.clear();version=catalogVersion()}
  function current(){if(version!==catalogVersion())clear()}
  function peek(key){current();const entry=cache.get(key);return entry&&entry.expires>now()?entry.value:undefined}
  function cached(key, read) {
    current()
    const entry = cache.get(key)
    if (entry && entry.expires > now()) return entry.promise
    const next={expires:now()+TTL}
    for(const [oldKey,old] of cache)if(old.expires<=now())cache.delete(oldKey)
    if(cache.size>=128)cache.delete(cache.keys().next().value)
    const promise = Promise.resolve().then(read).then(value=>{next.value=value;return value}).catch(error => { if (cache.get(key)?.promise === promise) cache.delete(key); throw error })
    next.promise=promise;cache.set(key,next)
    return promise
  }
  async function result(request) {
    // User-controlled retry: don't multiply requests/backoff invisibly.
    const { data, error } = await request.retry(false).abortSignal(AbortSignal.timeout(15_000))
    if (error) throw new Error('Tourism data could not be loaded. Check your connection and try again.')
    if (!Array.isArray(data)) throw new Error('Invalid tourism response.')
    return data
  }
  async function hydrate(rows) {
    const paths = [...new Set(rows.flatMap(p => (p.place_images ?? []).flatMap(i => [i.storage_path,...(i.prototypeRenditions||[]).map(r=>r.storagePath)])))]
    const signed = new Map(), missing=paths.filter(path=>!signedMedia.has(path)||signedMedia.get(path).expires<=now())
    if (missing.length) {
      // Reuse still-valid URLs across catalog/detail reads; sign under existing
      // Storage RLS. No transformation service or public bucket is introduced.
      const batch=Promise.resolve().then(()=>client.storage.from('place-images').createSignedUrls(missing,MEDIA_TTL)).then(({data,error})=>!error&&Array.isArray(data)?new Map(data.filter(i=>!i.error&&i.signedUrl).map(i=>[i.path,i.signedUrl])):new Map()).catch(()=>new Map())
      for(const path of missing){const entry={expires:now()+(MEDIA_TTL-30)*1000};entry.promise=batch.then(urls=>{const url=urls.get(path);if(!url&&signedMedia.get(path)===entry)signedMedia.delete(path);return url});signedMedia.set(path,entry)}
    }
    await Promise.all(paths.map(async path=>{const url=await signedMedia.get(path)?.promise;if(url)signed.set(path,url)}))
    if(privatePrototype)for(const [path,url]of signed)delivery.primeOriginal(path,url,signedMedia.get(path).expires)
    return rows.flatMap(row => {
      const local = media[row.slug] ?? []
      const stored = [...(row.place_images ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
        .filter(i => signed.has(i.storage_path)).map(i => ({kind:i.prototypeKind,src:signed.get(i.storage_path),alt:i.alt_text,attribution:i.attribution,sourceUrl:i.source_url,delivery:storedDelivery(i)}))
      const photos=local.length?local:stored
      // A saved image row is insufficient: anonymous Storage signing must also
      // succeed. No placeholder destination is exposed on any public surface.
      // Private Admin prototype previews retain their established behavior.
      return privatePrototype||photos.length?[normalizePlace(row,photos)]:[]
    })
  }
  const fetchCategories = () => cached('categories', async () => validateCategories(await result(client.from('categories').select('id,slug,name').eq('is_active', true).order('sort_order').order('slug'))))
  const fetchPublishedPlaces = () => cached('places', async () => {
    if(privatePrototype){
      const {data,error}=await client.rpc('admin_private_prototype_catalog')
      if(error)throw Error('Private prototype access could not be verified. Return to Admin and retry.')
      if(!Array.isArray(data)||!data.length||data.length>24)throw Error('Complete the 24-destination private prototype batch in Admin first.')
      return hydrate(data.map(prototypeRow))
    }
    const rows = []
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const page = await result(client.from('places').select(PLACE_SELECT).eq('status', 'published').eq('is_demo', false).order('slug').order('id').range(offset, offset + PAGE_SIZE - 1))
      rows.push(...page)
      if (page.length < PAGE_SIZE) break
    }
    return hydrate(rows)
  })
  async function fetchPublishedPlaceBySlug(slug) {
    current()
    if (!isPlaceSlug(slug)) return null
    if(privatePrototype)return (await fetchPublishedPlaces()).find(p=>p.slug===slug)??null
    const entry = cache.get('places')
    if (entry && entry.expires > now()) return (await entry.promise).find(p => p.slug === slug) ?? null
    return cached(`place:${slug}`, async () => (await hydrate(await result(client.from('places').select(PLACE_SELECT).eq('status', 'published').eq('is_demo', false).eq('slug', slug).limit(1))))[0] ?? null)
  }
  return {
    privateOwner:privatePrototype?owner:null,
    peekRecommendationCandidates:()=>peek('places'),
    fetchRecommendationCandidates:fetchPublishedPlaces,
    peekCatalog:()=>{const destinations=peek('places'),categories=peek('categories');return destinations!==undefined&&categories!==undefined?{destinations,categories}:undefined},
    peekPublishedPlaceBySlug:slug=>{const places=peek('places');return places!==undefined?places.find(p=>p.slug===slug)??null:peek(`place:${slug}`)},
    fetchCategories, fetchPublishedPlaces, fetchPublishedPlaceBySlug,
    fetchCatalog: async () => { const [destinations, categories] = await Promise.all([fetchPublishedPlaces(), fetchCategories()]); return { destinations, categories } },
    searchPlaces: async filters => filterPlaces(await fetchPublishedPlaces(), filters),
    // Schema has no featured flag: deterministic editorial preview, not ranking.
    fetchFeaturedDestinations: async (limit = 3) => (await fetchPublishedPlaces()).slice(0, limit),
    fetchPlaceCategories: async slug => (await fetchPublishedPlaceBySlug(slug))?.categories ?? [],
    fetchPlaceImages: async slug => (await fetchPublishedPlaceBySlug(slug))?.details.gallery ?? [],
    invalidate: clear,
  }
}

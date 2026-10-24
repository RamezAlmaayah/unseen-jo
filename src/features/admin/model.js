export const PAGE_SIZE = 20
export const emptyPlace = { name: '', slug: '', description: '', city: '', address: '', source_url: '', price_min_jod: '', price_max_jod: '', duration_min_minutes: '', duration_max_minutes: '', best_time_to_visit: '', transportation_notes: '', latitude: '', longitude: '', suitable_groups: [], primary_category_id: '' }
const numeric = ['price_min_jod','price_max_jod','duration_min_minutes','duration_max_minutes','latitude','longitude']
export function placePayload(form) {
  const p = Object.fromEntries(Object.keys(emptyPlace).map(k => [k, numeric.includes(k) ? (form[k] === '' || form[k] == null ? null : Number(form[k])) : Array.isArray(form[k]) ? form[k] : String(form[k] ?? '').trim() || null]))
  if (!p.name || p.name.length > 160) throw new Error('Enter a name of 1–160 characters.')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug || '') || p.slug.length > 120) throw new Error('Use a unique lowercase slug with letters, numbers and hyphens.')
  for (const key of numeric) if (p[key] !== null && !Number.isFinite(p[key])) throw new Error('Numeric values must be finite.')
  if ((p.latitude === null) !== (p.longitude === null)) throw new Error('Enter both coordinates or leave both blank.')
  if (p.latitude !== null && (p.latitude < -85.051129 || p.latitude > 85.051129 || Math.abs(p.longitude) > 180)) throw new Error('Coordinates must be valid WGS84 map coordinates.')
  for (const prefix of ['price','duration']) {
    const [min,max] = prefix === 'price' ? [p.price_min_jod,p.price_max_jod] : [p.duration_min_minutes,p.duration_max_minutes]
    if ((min !== null && (min < 0 || (prefix === 'duration' && (!Number.isInteger(min) || min === 0)))) || (max !== null && (max < 0 || (prefix === 'duration' && (!Number.isInteger(max) || max === 0))))) throw new Error('Prices must be nonnegative; durations must be positive whole minutes.')
    if (min !== null && max !== null && max < min) throw new Error('Maximum values must be at least the minimum.')
  }
  if (p.source_url && !safeHttps(p.source_url)) throw new Error('Source must be an HTTPS URL without credentials.')
  return { ...p, ...(form.id ? { id: form.id } : {}) }
}
export function safeHttps(value) { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password } catch { return false } }
export function safeAdminReturn(value) { return typeof value === 'string' && /^\/admin(?:\/|$)/.test(value) && !value.includes('\\') && !value.startsWith('/admin/login') && !value.startsWith('/admin/recovery') ? value : '/admin' }
export async function validateImage(file) {
  if (!file || file.size === 0 || file.size > 5 * 1024 * 1024) throw new Error('Select a non-empty image up to 5 MiB.')
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  const png = [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)
  const webp = String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP'
  const type = jpeg ? 'image/jpeg' : png ? 'image/png' : webp ? 'image/webp' : ''
  if (!type || file.type !== type) throw new Error('Only genuine JPEG, PNG and WebP raster files are accepted.')
  return { type, extension: jpeg ? 'jpg' : png ? 'png' : 'webp' }
}
export function backendError(error) {
  if (error?.code === '23503') return 'A linked record is unavailable. Reload categories or media before saving.'
  if (error?.code === '22P02') return 'A supplied value is invalid. Check the selected categories and numeric fields.'
  if (error?.code === '23514' && error.message?.includes('image_approval_evidence')) return 'Save a rights basis, at least 12 characters of evidence, attribution and an HTTPS image source before approval.'
  if (error?.code === '23514' && error.message?.includes('violates check constraint')) return 'Some values do not meet content rules. Check ranges, required fields, HTTPS sources and media rights evidence.'
  if (error?.code === '23505') return 'This slug or name already exists. Choose another.'
  if (error?.code === '40001') return 'Someone changed this record. Reload before saving; your unsaved values remain here.'
  if (error?.code === '42501' || error?.status === 401 || error?.status === 403) return 'Your administrator permission or session is no longer valid. Sign in again.'
  return error?.message || 'The request failed. Check your connection and retry.'
}

export {formatDateTime as formatDate} from '../../i18n/index.js'

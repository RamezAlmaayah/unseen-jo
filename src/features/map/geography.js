export const JORDAN_BOUNDS = [[34.85, 29.1], [39.35, 33.5]]
// Modest edge padding keeps the complete country visible without the old 220px vertical inset.
export const JORDAN_PADDING = { top: 64, bottom: 64, left: 24, right: 24 }
export function hasCoordinates(point) {
  return Number.isFinite(point?.latitude) && Number.isFinite(point?.longitude) &&
    Math.abs(point.latitude) <= 85.051129 && Math.abs(point.longitude) <= 180
}
export function distanceKm(a, b) {
  if (!hasCoordinates(a) || !hasCoordinates(b)) return null
  const rad = n => n * Math.PI / 180
  const dLat = rad(b.latitude - a.latitude), dLon = rad(b.longitude - a.longitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(Math.min(1, h)), Math.sqrt(Math.max(0, 1 - h)))
}
export function nearbyPlaces(places, origin, radius, sort = true) {
  if (!origin) return places
  if (!hasCoordinates(origin) || !Number.isFinite(radius) || radius <= 0) return []
  const found = places.map(p => ({ ...p, distanceKm: distanceKm(origin, p) })).filter(p => p.distanceKm != null && p.distanceKm <= radius)
  return sort ? found.sort((a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name)) : found
}
export function directionsUrl(place) {
  if (!hasCoordinates(place)) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${place.latitude},${place.longitude}`)}`
}

// GeoNames populated-place reference points, not GPS positions or entrances.
// CC BY 4.0. Reviewed 18 Oct 2026; see docs/COORDINATE_INVENTORY.md.
export const cityCenters = [
  { id: 'amman', name: 'Amman', latitude: 31.95522, longitude: 35.94503, source: 'https://www.geonames.org/250441/amman.html' },
  { id: 'irbid', name: 'Irbid', latitude: 32.55556, longitude: 35.85, source: 'https://www.geonames.org/248946/irbid.html' },
  { id: 'aqaba', name: 'Aqaba', latitude: 29.52667, longitude: 35.00778, source: 'https://www.geonames.org/250774/aqaba.html' },
]

// Local demonstration enrichment only. Never updates/publishes the database.
// UNESCO heritage-property reference point, not an arrival/entrance location.
export const demoCoordinates = {
  'ajloun-forest': { latitude: 32.3835625, longitude: 35.7604375,
    coordinateSource: 'https://international.visitjordan.com/wheretogo/ajloun/', coordinatePrecision: 'Tourism-board forest reserve reference pin; entrance and access not independently confirmed' },
  'wadi-mujib': { latitude: 31.4670625, longitude: 35.5731875,
    coordinateSource: 'https://international.visitjordan.com/wheretogo/wadi-mujib/', coordinatePrecision: 'Tourism-board Siq Trail reference pin; not a surveyed trail entrance or access guarantee' },
  'dana-reserve': { latitude: 30.6743125, longitude: 35.6083125,
    coordinateSource: 'https://international.visitjordan.com/wheretogo/dana-feynan/', coordinatePrecision: 'Tourism-board Dana reference pin; not a reserve boundary or verified arrival point' },
  'salt-historic': { latitude: 32 + 2 / 60 + 33.4 / 3600, longitude: 35 + 43 / 60 + 41.9 / 3600,
    coordinateSource: 'https://whc.unesco.org/en/list/689/', coordinatePrecision: 'Heritage-area reference point, not an entrance' },
  'iraq-al-amir': { latitude: 31.9195625, longitude: 35.7533125,
    coordinateSource: 'https://international.visitjordan.com/wheretogo/amman/', coordinatePrecision: 'Official tourism-board location pin; arrival point not independently confirmed' },
}
export function withDemoCoordinates(place) { return { ...place, ...demoCoordinates[place.id] } }

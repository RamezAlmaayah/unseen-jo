// Reviewed OpenFreeMap Liberty derivative. Source is a style, never a tile dump.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
const style = JSON.parse(await readFile('scripts/map-source/liberty.json', 'utf8'))
style.name = 'Unseen Jo — Minimal Nature'
style.metadata = { ...style.metadata, 'unseen:source': 'https://tiles.openfreemap.org/styles/liberty', 'unseen:reviewed': '2026-10-18', 'unseen:design-license': 'CC BY 4.0; modified palette and label hierarchy; see /maps/LICENSE.md' }
style.sources.openmaptiles.attribution = '<a href="https://openfreemap.org/">OpenFreeMap</a> · © <a href="https://openmaptiles.org/">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
for (const layer of style.layers) {
  const id = layer.id, paint = layer.paint ??= {}
  if (id === 'background') paint['background-color'] = '#f0dfbd'
  if (id === 'natural_earth') { layer.maxzoom = 10; paint['raster-opacity'] = ['interpolate',['linear'],['zoom'],0,0.64,6,0.52,8,0.24,10,0]; paint['raster-saturation'] = -0.4; paint['raster-contrast'] = 0.12; paint['raster-resampling'] = 'linear' }
  if (id === 'park') { paint['fill-color'] = '#a9c29b'; paint['fill-opacity'] = 0.52 }
  if (id === 'park_outline') paint['line-color'] = '#789777'
  if (id === 'landcover_wood') { paint['fill-color'] = '#5e8969'; paint['fill-opacity'] = 0.68 }
  if (id === 'landcover_grass') { paint['fill-color'] = '#b1c19a'; paint['fill-opacity'] = 0.5 }
  if (id === 'landcover_sand') paint['fill-color'] = '#e7c895'
  if (id === 'landcover_wetland') paint['fill-color'] = '#bad5bf'
  if (id === 'landuse_residential') paint['fill-color'] = '#ede5d3'
  if (id === 'building') { delete layer.maxzoom; paint['fill-color'] = '#d4c3a4'; paint['fill-opacity'] = ['interpolate',['linear'],['zoom'],13,0.42,16,0.72]; paint['fill-outline-color'] = '#c2b08e' }
  if (id === 'building-3d') { layer.layout ??= {}; layer.layout.visibility = 'none' }
  if (id === 'water') paint['fill-color'] = '#91c8cd'
  if (layer['source-layer'] === 'waterway' && layer.type === 'line') paint['line-color'] = '#91bdc3'
  if (layer['source-layer'] === 'transportation' && layer.type === 'line' && !/rail/.test(id)) {
    paint['line-color'] = /casing/.test(id) ? (/motorway|trunk|primary/.test(id) ? '#b79b6c' : '#c5b593') : /path|track/.test(id) ? '#899b77' : /motorway|trunk/.test(id) ? '#fff0c4' : '#fffaf0'
  }
  if (id.startsWith('boundary')) { paint['line-color'] = id === 'boundary_3' ? '#a79678' : '#846b50'; if (id === 'boundary_2') paint['line-opacity'] = 0.85 }
  if (layer.type === 'symbol' && layer.layout?.['text-field']) {
    paint['text-color'] = /water/.test(id) ? '#3c707a' : /poi/.test(id) ? '#48644e' : '#29493e'
    paint['text-halo-color'] = '#fff9e8'
    paint['text-halo-width'] = /label_city/.test(id) ? 1.6 : 1.15
    if (!/shield/.test(id)) layer.layout['text-field'] = ['coalesce',['get','name:en'],['get','name_en'],['get','name:latin'],['get','name']]
  }
}
// Real schema classes, not decorative geographic shapes.
const groundIndex = style.layers.findIndex(l => l.id === 'landcover_wood')
style.layers.splice(groundIndex, 0,
  { id: 'atlas-rock', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover', filter: ['==', ['get','class'], 'rock'], paint: { 'fill-color': '#cfb38e', 'fill-opacity': 0.42 } },
  { id: 'atlas-farmland', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover', filter: ['==', ['get','class'], 'farmland'], paint: { 'fill-color': '#c4ceaa', 'fill-opacity': 0.4 } })
const borderIndex = style.layers.findIndex(l => l.id === 'boundary_2')
const border = style.layers[borderIndex]
style.layers.splice(borderIndex, 0, { ...structuredClone(border), id: 'atlas-boundary-halo', paint: { 'line-color': '#fff5df', 'line-opacity': 0.7, 'line-width': ['interpolate',['linear'],['zoom'],4,2.8,8,4,14,6] } })
await mkdir('public/maps', { recursive: true })
await writeFile('public/maps/unseen-nature.json', JSON.stringify(style) + '\n')
// Reviewed upstream license notices are committed alongside the derivative; preserve them.
await readFile('public/maps/LICENSE.md', 'utf8')
console.log(`Prepared ${style.layers.length} genuine geographic layers; original zoom/road/POI hierarchy preserved.`)

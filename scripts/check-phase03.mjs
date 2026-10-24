import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { hasCoordinates, distanceKm, nearbyPlaces, directionsUrl, cityCenters, demoCoordinates } from '../src/features/map/geography.js'
import { locationError } from '../src/features/map/useLocation.js'
import { markerCategories } from '../src/features/map/categories.js'

const results=[]
function check(name, fn){fn();results.push({name,status:'passed'});console.log('PASS '+name)}
const a={id:'a',name:'A',latitude:31.95522,longitude:35.94503}
const b={id:'b',name:'B',...demoCoordinates['salt-historic']}
check('coordinates reject missing, strings, NaN, Infinity and out-of-map-range values',()=>{
  assert.ok(hasCoordinates(a));for(const v of [null,{}, {latitude:31,longitude:null},{latitude:NaN,longitude:35},{latitude:Infinity,longitude:35},{latitude:91,longitude:35},{latitude:31,longitude:181},{latitude:'31',longitude:35},{latitude:89,longitude:35}])assert.equal(hasCoordinates(v),false)
})
check('Haversine identity, symmetry and sourced Amman–Salt straight-line distance',()=>{
  assert.equal(distanceKm(a,a),0);assert.equal(distanceKm(a,b),distanceKm(b,a));assert.ok(distanceKm(a,b)>21&&distanceKm(a,b)<24);assert.equal(distanceKm(a,{}),null)
})
check('nearby filtering excludes missing locations, sorts, handles no matches and preserves original array',()=>{
  const input=[{...b,name:'Salt'},a,{id:'none',name:'Unknown'}]
  assert.deepEqual(nearbyPlaces(input,a,5).map(p=>p.id),['a']);assert.equal(nearbyPlaces(input,a,25).length,2)
  assert.equal(nearbyPlaces(input,{latitude:0,longitude:0},1).length,0)
  assert.equal(nearbyPlaces(input,null,25),input);assert.equal(nearbyPlaces(input,a,0).length,0)
  assert.equal(input[0].distanceKm,undefined);assert.equal(nearbyPlaces(input,a,25)[0].distanceKm,0)
})
check('directions contain destination only and never generate travel times or unknown points',()=>{
  assert.equal(directionsUrl({}),null);const u=new URL(directionsUrl(a));assert.equal(u.searchParams.get('destination'),'31.95522,35.94503');assert.equal(u.searchParams.has('origin'),false)
})
check('all seven actual categories have custom marker configuration',()=>{
  for(const slug of ['nature','food','history','culture','adventure','photography','family'])assert.ok(markerCategories[slug]?.Icon&&/^#[a-f0-9]{6}$/i.test(markerCategories[slug].color))
})
check('manual city centres have primary source provenance and map-valid points',()=>{
  assert.equal(cityCenters.length,3);assert.ok(cityCenters.every(c=>hasCoordinates(c)&&c.source.startsWith('https://www.geonames.org/')))
})
check('demo points are limited to sourced locations, never invented for missing reserves',()=>{
  assert.equal(Object.keys(demoCoordinates).length,5);assert.equal(demoCoordinates['ajloun-forest'].latitude,32.3835625)
  assert.ok(Object.values(demoCoordinates).every(p=>hasCoordinates(p)&&p.coordinateSource&&p.coordinatePrecision))
})
check('all geolocation failure codes offer a manual fallback',()=>{for(const code of [1,2,3,99])assert.match(locationError(code),/city/)})
const style=JSON.parse(await readFile('public/maps/unseen-nature.json','utf8'))
check('custom style retains real vector/terrain/roads/POI/label sources and attribution',()=>{
  assert.equal(style.layers.find(l=>l.id==='building').maxzoom,undefined,'flat buildings remain visible at street zoom');
  assert.equal(style.layers.find(l=>l.id==='atlas-rock')['source-layer'],'landcover');
  assert.equal(style.version,8);assert.equal(style.sources.openmaptiles.url,'https://tiles.openfreemap.org/planet');assert.ok(style.sources.ne2_shaded)
  for(const id of ['water','landcover_wood','park','road_motorway','road_minor','highway-name-minor','label_city','poi_r1','natural_earth'])assert.ok(style.layers.some(l=>l.id===id))
  assert.ok(style.sources.openmaptiles.attribution.includes('OpenStreetMap'));assert.ok(style.metadata['unseen:design-license'].includes('CC BY 4.0'))
  assert.equal(style.layers.find(l=>l.id==='water').paint['fill-color'],'#91c8cd');assert.equal(style.layers.find(l=>l.id==='background').paint['background-color'],'#f0dfbd')
})
await mkdir('artifacts/phase03',{recursive:true});await writeFile('artifacts/phase03/unit-tests.json',JSON.stringify({scope:'Local mathematical, configuration and provenance assertions; not GPS/provider integration.',passed:results.length,results},null,2)+'\n')

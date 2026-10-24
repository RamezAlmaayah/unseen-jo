import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {PbfReader} from 'pbf'
import {VectorTile} from '@mapbox/vector-tile'
import {setup,browser,base} from './localization-browser-fixtures.mjs'
const metadata=await(await fetch('https://tiles.openfreemap.org/planet')).json(),place=metadata.vector_layers.find(v=>v.id==='place');assert.equal(place.fields['name:ar'],'String')
// Real provider tile intersecting northern Jordan; do not infer translated names from filenames or mocks.
const tileUrl=metadata.tiles[0].replace('{z}','6').replace('{x}','38').replace('{y}','26'),bytes=new Uint8Array(await(await fetch(tileUrl)).arrayBuffer()),tile=new VectorTile(new PbfReader(bytes)),names=[]
for(let i=0;i<(tile.layers.place?.length||0);i++){const p=tile.layers.place.feature(i).properties;if(p['name:ar'])names.push({name:p.name,arabic:p['name:ar']})}
assert.ok(names.length>0)
try{for(const width of [1440,820,390]){const {context,page}=await setup(width,'ar-JO',false);await page.goto(base+'/map');await page.locator('[data-map-language="ar-JO"]').waitFor({timeout:45000});await page.locator('.map-canvas[data-map-idle="true"]').waitFor({timeout:45000});await page.waitForTimeout(1200);await page.screenshot({path:`docs/screenshots/phase04l/ar-JO-map-${width}.png`,fullPage:true,timeout:60000});await context.close()}}finally{await browser.close()}
await writeFile('docs/validation/phase04l-map-language.json',JSON.stringify({source:'OpenFreeMap live TileJSON and decoded vector tile, plus real rendered MapLibre',tileUrl,arabicFieldAvailable:true,observedNames:names,screenshots:[1440,820,390],limitations:'Not every feature has name:ar; native/English provider fallback remains possible.'},null,2)+'\n');console.log('PASS live Arabic provider fields and three rendered map viewports')

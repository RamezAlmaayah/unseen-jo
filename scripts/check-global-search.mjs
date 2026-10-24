import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {PGlite} from '@electric-sql/pglite'
import {normalizeSearch,matchesDestination,destinationSearchFields,searchTokens} from '../src/features/search/destinationSearch.js'
import {searchPattern} from '../src/features/search/adminSearch.js'
import {normalizePlace,filterPlaces} from '../src/features/tourism/model.js'
import {localizeDestination} from '../src/i18n/destinations.js'
import {filterPersonalPlaces} from '../src/features/personal/model.js'
const db=new PGlite(),results=[]
const snapshot=JSON.parse(await readFile('docs/validation/phase05-public-snapshot.json','utf8')),places=snapshot.rows.map(r=>normalizePlace(r)),check=async(name,fn)=>{await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
try{
 await check('Unicode Arabic folding, diacritics, tatweel, whitespace and case normalize consistently',async()=>{
  assert.equal(normalizeSearch('  أُمّ  قَيْـس '),'ام قيس');assert.equal(normalizeSearch('آ إ أ ٱ ى ئ ة ؤ'),'ا ا ا ا ي ي ه و');assert.equal(normalizeSearch('WaDi-MUJIB'),'wadi mujib')
 })
 await check('public and saved searches retain bilingual source names across display-language changes',async()=>{
  for(const lang of ['en','ar-JO'])for(const [q,slug] of [['Ajloun','ajloun-forest'],['عجلون','ajloun-forest'],['Wadi Mujib','wadi-mujib'],['وادي الموجب','wadi-mujib'],['أُمّ قيس','umm-qais']]){
   const localized=places.map(p=>localizeDestination(p,lang));assert.ok(filterPlaces(localized,{query:q}).some(p=>p.slug===slug));assert.ok(filterPersonalPlaces(localized,{query:q},lang).some(p=>p.slug===slug))
  }
 })
 await check('category/city/region/partial matching composes with filters and never expands the saved subset',async()=>{
  const synthetic={id:'one',name:'Original English',city:'Example City',region:'Northern Region',categories:[{slug:'nature',name:'Nature'}],categoryIds:['nature'],priceMax:null}
  assert.ok(matchesDestination(synthetic,'NORTHERN'));assert.ok(matchesDestination(synthetic,'طبيعة'));assert.equal(filterPlaces([synthetic],{query:'Example',categorySlugs:['history']}).length,0)
  assert.equal(filterPlaces([synthetic],{query:'Example',maxCost:1}).length,0);assert.equal(filterPersonalPlaces([places[0]],{query:'Umm Qais'}).length,0)
 })
 await check('unreviewed/stale translation fields never become a public search index',async()=>{
  const raw={name:'Public',slug:'public',updated_at:'2026-10-21',place_translations:[{name:'Secret pending name',editorial_status:'pending',source_updated_at:'2026-10-21'},{name:'Stale private translation',editorial_status:'reviewed',source_updated_at:'2026-10-20'}]}
  assert.equal(matchesDestination(raw,'Secret pending'),false);assert.equal(matchesDestination(raw,'Stale private'),false);assert.ok(matchesDestination(raw,'Secret pending',{includeUnreviewed:true}));assert.ok(!destinationSearchFields(raw).some(s=>s.includes('Secret')))
 })
 await check('literal hostile punctuation has no wildcard/regex meaning; empty and no-result states are deterministic',async()=>{
  for(const q of ['%_', '.*', '()|', '"\\', 'no-such-destination', "');drop table places;--"])assert.equal(filterPlaces(places,{query:q}).length,0,q)
  assert.equal(filterPlaces(places,{query:'   '}).length,6);assert.equal(searchTokens('a '.repeat(500)).length,12)
 })
 await check('generated Arabic server patterns execute in real PostgreSQL without unsafe interpolation',async()=>{
  for(const [input,query] of [['أُمّ قيس','ام'],['عَجْلُـون','عجلون'],['مُحْمِيَّة','محميه'],['UPPERCASE','uppercase'],['شمال الأردن','الاردن']]){
   const pattern=searchPattern(searchTokens(query)[0]),r=await db.query('select $1 ~* $2 as matched',[input,pattern]);assert.equal(r.rows[0].matched,true)
  }
  const r=await db.query('select $1 ~* $2 as matched',['irrelevant',searchPattern('ajloun')]);assert.equal(r.rows[0].matched,false)
 })
}finally{await db.close();await writeFile('docs/validation/search-unit.json',JSON.stringify({scope:'Pure model tests and real disposable PostgreSQL regex evaluation; no hosted writes',results},null,2)+'\n')}

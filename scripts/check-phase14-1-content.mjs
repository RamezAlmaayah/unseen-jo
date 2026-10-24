// Content-integrity checks against local proposals and read-only snapshots.
import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const json=async p=>JSON.parse(await readFile(p,'utf8')),b=await json('docs/validation/phase14-1-content-baseline.json'),p=await json('supabase/content/phase14-1-arabic-review.json'),m=await json('docs/content/phase14-1-media-plan.json'),results=[]
const check=(name,test)=>{test();results.push({name,status:'PASS'});console.log('PASS '+name)},hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex')
check('all 24 Published IDs/slugs and their relationships remain represented',()=>{
 assert.equal(b.places.length,24);assert.equal(new Set(b.places.map(p=>p.id)).size,24);assert.equal(new Set(b.places.map(p=>p.slug)).size,24)
 for(const d of b.places){assert.equal(d.status,'published');assert.equal(d.is_demo,false);assert.ok(b.relationships.some(r=>r.place_id===d.id));assert.ok(d.description.length>=80);assert.ok(d.latitude>=29&&d.latitude<=33.6&&d.longitude>=34.8&&d.longitude<=39.4);assert.equal(d.price_min_jod,null);assert.equal(d.price_max_jod,null)}
})
check('exactly 18 pending and one stale Arabic proposal; five already-current rows excluded',()=>{
 assert.equal(p.places.length,19);assert.equal(p.places.filter(r=>r.hostedState.editorial_status==='pending').length,18);assert.deepEqual(p.places.filter(r=>!r.hostedState.current).map(r=>r.slug),['wadi-mujib'])
 assert.equal(new Set(p.places.map(r=>r.id)).size,19)
 for(const row of p.places){const source=b.places.find(r=>r.id===row.id),t=b.translations.find(r=>r.place_id===row.id);assert.equal(row.slug,source.slug);assert.equal(row.expectedEnglishUpdatedAt,source.updated_at);assert.equal(row.expectedTranslationUpdatedAt,t.updated_at);assert.equal(row.englishSha256,hash(Object.fromEntries(p.fields.map(k=>[k,source[k]??null]))));assert.equal('status' in row.arabic,false);assert.equal('editorial_status' in row.arabic,false)}
})
check('complete bilingual field coverage, null parity, readable Arabic and retained paragraphs',()=>{
 for(const row of p.places){
  for(const key of p.fields){assert.ok(Object.hasOwn(row.arabic,key),row.slug+':'+key);if(row.english[key]==null)assert.equal(row.arabic[key],null,row.slug+': null '+key);else{assert.ok(typeof row.arabic[key]==='string'&&row.arabic[key].length>0);assert.match(row.arabic[key],/[\u0621-\u064a]/)}}
  assert.equal(row.arabic.description.split('\n\n').length,row.english.description.split('\n\n').length);assert.ok(row.arabic.description.length>200);assert.ok(row.reviewRequirements.length)
 }
 const mujib=p.places.find(r=>r.slug==='wadi-mujib');assert.match(mujib.arabic.description,/18/);assert.match(mujib.arabic.description,/2026/);assert.doesNotMatch(mujib.arabic.visitor_guidance,/١٧|٢١|٢٣|دينار/,'out-of-parity legacy fees not copied into guidance')
})
check('no replacement characters, executable HTML, credentials or unsafe source URLs in proposals',()=>{
 const raw=JSON.stringify(p);assert.doesNotMatch(raw,/\ufffd|<script|javascript:|sb_secret_|service_role|access_token|refresh_token/i)
 for(const row of p.places)for(const s of row.sources){const u=new URL(s.url);assert.equal(u.protocol,'https:');assert.equal(u.username,'');assert.equal(u.password,'')}
})
check('all 17 missing public covers have a matching existing private, evidenced photo',()=>{
 const missing=b.places.filter(d=>!b.images.some(i=>i.place_id===d.id&&i.is_cover&&i.approved_at));assert.equal(missing.length,17)
 for(const d of missing){const cover=m.images.find(i=>i.placeId===d.id&&i.isCover);assert.ok(cover,d.slug);assert.ok(cover.existingImageId);assert.equal(cover.currentHostedApproval,null);assert.equal(cover.currentMetadataCheck.status,'MATCH');assert.match(cover.license,/^CC BY(?:-SA)? [234]/);assert.ok(cover.author&&cover.attribution.includes(cover.licenseUrl))}
 assert.equal(m.images.length,30);assert.equal(m.images.reduce((n,p)=>n+p.renditions.length,0),120);assert.equal(m.excluded.length,4)
 for(const photo of m.images){assert.equal(photo.ownerApprovalRequired,true);assert.ok(photo.existingStoragePath.startsWith(photo.placeId+'/'));assert.ok(photo.currentMetadataCheck.originalMatches);assert.equal(photo.derivativeLicence,photo.license);assert.ok(photo.renditions.every(r=>r.width<=photo.originalWidth))}
})
await writeFile('docs/validation/phase14-1-content-tests.json',JSON.stringify({scope:'Local evidence/proposal integrity; semantic Arabic review is separately documented; no hosted writes',results},null,2)+'\n')

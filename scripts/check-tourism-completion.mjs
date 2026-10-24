import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {completionIds,importResearchedMedia} from '../src/features/admin/contentMediaImport.js'
import {placePayload} from '../src/features/admin/model.js'
import {hasCoordinates} from '../src/features/map/geography.js'
import {normalizePlace,filterPlaces} from '../src/features/tourism/model.js'
const content=JSON.parse(await readFile('supabase/content/phase04-completion.json','utf8'))
const media=JSON.parse(await readFile('docs/evidence/content-completion/media-import.json','utf8'))
const results=[],check=async(name,fn)=>{await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
await check('six canonical IDs/slugs, existing categories and draft-only research package',()=>{
 assert.equal(content.places.length,6);assert.equal(new Set(content.places.map(p=>p.id)).size,6)
 for(const p of content.places){assert.equal(p.id,completionIds[p.slug]);assert.equal(p.name.length>3,true);assert.ok(p.categories.includes(p.primary_category));assert.ok(p.categories.every(c=>['nature','history','culture','adventure'].includes(c)));assert.ok(p.expected_updated_at)}
 assert.equal(content.status,'draft')
})
await check('descriptions and sourced coordinate fields validate without demo prices or invented review flags',()=>{
 for(const p of content.places){assert.ok(p.description.length>=80);assert.ok(p.sources.includes(p.source_url));assert.equal(p.location_kind,'approximate_center');assert.match(p.coordinate_note,/not|rather than/i);assert.ok(hasCoordinates(p));assert.ok(p.latitude>=29&&p.latitude<=33.6&&p.longitude>=34.8&&p.longitude<=39.4);assert.equal(p.price_min_jod,null);assert.equal(p.price_max_jod,null);assert.equal(p.suitable_groups,null);placePayload({...p,primary_category_id:null});if(p.duration_min_minutes)assert.match(p.description,/editorial/i);assert.equal(p.verified_by,undefined)}
})
await check('selected originals and derivatives have exact byte fingerprints and rights metadata',async()=>{
 const {createHash}=await import('node:crypto')
 for(const p of media.photos){assert.ok(completionIds[p.slug]);assert.ok(p.width>=1600);for(const[path,hash]of [[p.path,p.sha256],[p.uploadPath,p.uploadSha256]]){const b=await readFile(path);assert.equal(b[0],255);assert.equal(b[1],216);assert.equal(createHash('sha256').update(b).digest('hex'),hash)}assert.ok(p.uploadBytes<=5242880);assert.ok(p.alt.length>15);assert.ok(p.author&&p.license&&p.licenseUrl&&p.revision);assert.match(p.identityReview,/Visually inspected/);assert.equal(p.storagePath,null);assert.match(p.approval,/not yet imported/)}
 assert.equal(media.photos.filter(p=>p.isCover).length,5);assert.equal(media.photos.find(p=>p.slug==='ajloun-forest').isCover,false)
})
function fixture(){
 const rows=Object.fromEntries(content.places.map(p=>[p.id,{...p,status:'draft',place_images:[]}]))
 const protectedImage={id:'existing-test-image',alt_text:'um.jfif',storage_path:'test-preserved.jpg',approved_at:null,is_cover:false}
 rows[completionIds['umm-qais']].place_images.push(protectedImage)
 const writes=[]
 const client={supabaseUrl:'https://dkhwwvoplhfjccvjegty.supabase.co',auth:{getUser:async()=>({data:{user:{email_confirmed_at:'2026-01-01'}}})},rpc:async()=>({data:true,error:null})}
 const repo={getPlace:async id=>structuredClone(rows[id]),upload:async(id,file)=>{const path=`${id}/${file.name}`;writes.push(path);rows[id].place_images.push({id:path,storage_path:path,alt_text:file.name,approved_at:null});return path},updateImage:async(image,fields)=>{Object.assign(rows[image.storage_path.split('/')[0]].place_images.find(i=>i.id===image.id),fields)},signedImages:async images=>images.map(i=>({...i,url:'https://example.invalid/private-image.jpg'}))}
 const fetchFile=async path=>path.startsWith('/docs/')?new Response(await readFile(path.slice(1))):new Response('fixture bytes')
 return{rows,protectedImage,client,repo,fetchFile,writes}
}
await check('genuine-session guard refuses wrong project and denied admin before writes',async()=>{
 const f=fixture();f.client.supabaseUrl='https://unrelated.supabase.co';await assert.rejects(importResearchedMedia(f.client,f.repo,media,f.fetchFile),/project/);assert.equal(f.writes.length,0)
 f.client.supabaseUrl='https://dkhwwvoplhfjccvjegty.supabase.co';f.client.rpc=async()=>({error:{message:'denied'}});await assert.rejects(importResearchedMedia(f.client,f.repo,media,f.fetchFile),/permission/);assert.equal(f.writes.length,0)
})
await check('preflight rejects altered canonical draft and untrusted file path before mutation',async()=>{
 const f=fixture();f.rows[completionIds['umm-qais']].status='published';await assert.rejects(importResearchedMedia(f.client,f.repo,media,f.fetchFile),/draft/);assert.equal(f.writes.length,0)
 const g=fixture(),altered=structuredClone(media);altered.photos[0].localUrl='/arbitrary-path';await assert.rejects(importResearchedMedia(g.client,g.repo,altered,g.fetchFile),/path/);assert.equal(g.writes.length,0)
})
await check('private media import associates sources and cover choices but never approves/publishes/deletes',async()=>{
 const f=fixture(),before=structuredClone(f.protectedImage);const result=await importResearchedMedia(f.client,f.repo,media,f.fetchFile)
 assert.equal(result.results.length,media.photos.length);assert.equal(result.published,false);assert.equal(result.rightsApproved,false);assert.deepEqual(f.rows[completionIds['umm-qais']].place_images[0],before)
 for(const p of Object.values(f.rows)){assert.equal(p.status,'draft');for(const i of p.place_images){assert.equal(i.approved_at,null);if(i.id!==before.id)assert.ok(i.source_url&&i.license_evidence&&i.attribution)}}
})
await check('rerun skips already-associated canonical sources without duplicate uploads',async()=>{
 const f=fixture();await importResearchedMedia(f.client,f.repo,media,f.fetchFile);const count=f.writes.length;const result=await importResearchedMedia(f.client,f.repo,media,f.fetchFile);assert.equal(f.writes.length,count);assert.ok(result.results.every(r=>r.status==='already associated'))
})
await check('checksum mismatch fails before upload; partial metadata failure is preserved and blocks blind retry',async()=>{
 const f=fixture();await assert.rejects(importResearchedMedia(f.client,f.repo,media,async()=>new Response('wrong')),/size/);assert.equal(f.writes.length,0)
 const g=fixture();g.repo.updateImage=async()=>{throw Error('metadata failure')};await assert.rejects(importResearchedMedia(g.client,g.repo,media,g.fetchFile),/metadata failure/);assert.equal(g.writes.length,1);await assert.rejects(importResearchedMedia(g.client,g.repo,media,g.fetchFile),/reconciliation/);assert.equal(g.writes.length,1)
})
await check('public adapters accept completed field shapes and category filters without publishing live drafts',()=>{
 for(const p of content.places){const row={...p,status:'published',is_demo:false,place_categories:p.categories.map(slug=>({categories:{id:slug,slug,name:slug}}))};const adapted=normalizePlace(row,[]);assert.equal(adapted.slug,p.slug);assert.equal(adapted.latitude,p.latitude);assert.equal(adapted.costLabel,'Cost unavailable');assert.equal(filterPlaces([adapted],{categorySlugs:[p.primary_category]}).length,1);assert.throws(()=>normalizePlace({...row,status:'draft'}))}
})
await writeFile('docs/validation/tourism-completion-tests.json',JSON.stringify({scope:'Research-data invariants and simulated private-media import; does not prove hosted Storage or factual truth',passed:results.length,results},null,2)+'\n')

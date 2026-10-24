import {completionIds} from './contentMediaImport.js'
import {notifyPublicCatalogChange} from '../tourism/catalogEvents.js'
import {phase08EvidenceIssues} from './phase08Freshness.js'
const targetProject='https://dkhwwvoplhfjccvjegty.supabase.co'
export const phase08Slugs=['petra','wadi-rum','jerash-archaeological-city','amman-citadel','amman-roman-theatre','madaba-st-georges-church','mount-nebo','al-maghtas-baptism-site','karak-castle','shobak-castle','quseir-amra','um-er-rasas','azraq-wetland-reserve','shaumari-wildlife-reserve','pella-tabaqat-fahl','umm-al-jimal','little-petra-siq-al-barid','aqaba-marine-reserve']
const protectedIds=new Set(Object.values(completionIds)),protectedSlugs=new Set(Object.keys(completionIds)),check=(ok,message)=>{if(!ok)throw Error(message)},same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null)
export const digest=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('')
const encode=value=>new TextEncoder().encode(JSON.stringify(value)),checked=response=>{if(response.error)throw Error(response.error.message||'Authorized request failed');return response.data}
// Hosted PostgreSQL extra_float_digits=0 serializes float8 using 15 significant
// digits. Binary float8 read-back was checked against the submitted coordinates.
// Canonicalize only these two numeric fields, never bilingual text or evidence.
export const matchesImportedField=(key,actual,expected)=>['latitude','longitude'].includes(key)?typeof actual==='number'&&Number.isFinite(actual)&&typeof expected==='number'&&Number.isFinite(expected)&&actual.toPrecision(15)===expected.toPrecision(15):same(actual,expected)
export async function validatePhase08Package(manifest){
 check(manifest?.projectRef==='dkhwwvoplhfjccvjegty'&&manifest.batchId==='phase08-lite-20261021','Unexpected project or research batch.')
 const {packageSha256,...payload}=manifest;check(await digest(encode(payload))===packageSha256,'The research package checksum does not match.')
 check(manifest.places?.length===18&&new Set(manifest.places.map(p=>p.slug)).size===18&&manifest.places.every(p=>phase08Slugs.includes(p.slug)),'The package must contain exactly the 18 researched new destinations.')
 for(const p of manifest.places){
  check(!p.english.id&&p.english.slug===p.slug&&!protectedSlugs.has(p.slug),'Existing identities cannot be supplied for this import.')
  check(p.english.name?.trim()&&p.english.description?.length>=200&&/\p{Script=Arabic}/u.test(p.arabic.name)&&/\p{Script=Arabic}/u.test(p.arabic.description),'Complete bilingual identity and descriptions are required: '+p.slug)
  check(!/lorem ipsum|\bundefined\b|TODO|TBD/.test(p.english.description+p.arabic.description),'Unfinished placeholder text: '+p.slug)
  check(p.category_ids?.length&&p.category_ids.includes(p.english.primary_category_id),'Active categories are required: '+p.slug)
  check(Number.isFinite(p.english.latitude)&&p.english.latitude>=29&&p.english.latitude<=33.5&&Number.isFinite(p.english.longitude)&&p.english.longitude>=34.8&&p.english.longitude<=39.5,'Coordinates are outside the Jordan research area: '+p.slug)
  check(p.location_kind==='approximate_center'&&p.coordinateSource?.startsWith('https://')&&p.evidence?.sources?.length,'Source and geographic qualification are required: '+p.slug)
  check(p.evidence.importBatch===manifest.batchId&&p.contentHash===await digest(encode({english:p.english,arabic:p.arabic,category_ids:p.category_ids,evidence:p.evidence})),'Content evidence changed: '+p.slug)
 }
 check(new Set(manifest.photos.map(p=>p.id)).size===manifest.photos.length,'Duplicate photograph identities.')
 for(const p of manifest.photos){
  check(phase08Slugs.includes(p.slug)&&p.identityStatus==='visually checked'&&p.rightsEligible===true,'Unverified photograph cannot be imported: '+p.id)
  check(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(p.page)&&/^https:\/\/creativecommons\.org\//.test(p.licenseUrl)&&/^CC BY(?:-SA)? [234](?:\.\d)?$/.test(p.license)&&p.author&&p.attribution&&p.licenseEvidence,'Incomplete image rights: '+p.id)
  check(/^\/docs\/evidence\/phase08\/(originals|upload)\/[a-z0-9-]+\.jpg$/.test(p.localUrl)&&/^[a-f0-9]{64}$/.test(p.uploadSha256)&&p.uploadBytes>0&&p.uploadBytes<=5242880,'Invalid prepared photograph path or size: '+p.id)
 }
 return true
}
async function actor(client){check(client.supabaseUrl===targetProject,'Unexpected Supabase project.');const result=await client.auth.getUser();check(!result.error&&result.data.user?.email_confirmed_at,'Sign in with a confirmed administrator account.');checked(await client.rpc('admin_cms_status'));return result.data.user.id}
export async function inspectPhase08(client,manifest){
 await validatePhase08Package(manifest);await actor(client)
 const slugs=manifest.places.flatMap(p=>[p.slug,...(p.aliasSlugs||[])]),names=manifest.places.flatMap(p=>[p.english.name,...(p.aliasNames||[])]),arabic=manifest.places.map(p=>p.arabic.name)
 const responses=await Promise.all([client.from('places').select('id,slug,name,status').in('slug',slugs),client.from('places').select('id,slug,name,status').in('name',names),client.from('place_translations').select('place_id,name,places(id,slug,name,status)').eq('locale','ar-JO').in('name',arabic),client.from('categories').select('id,is_active').in('id',[...new Set(manifest.places.flatMap(p=>p.category_ids))])])
 const [bySlug,byName,translated,categories]=responses.map(checked),rows=[...new Map([...bySlug,...byName,...translated.map(t=>t.places).filter(Boolean)].map(r=>[r.id,r])).values()]
 check(manifest.places.every(p=>p.category_ids.every(id=>categories.some(c=>c.id===id&&c.is_active))),'A selected category is missing or inactive. Refresh the package.')
 return manifest.places.map(p=>{const exact=rows.filter(r=>r.slug===p.slug),other=rows.filter(r=>r.slug!==p.slug&&((p.aliasSlugs||[]).includes(r.slug)||r.name===p.english.name||(p.aliasNames||[]).includes(r.name)||translated.some(t=>t.place_id===r.id&&t.name===p.arabic.name)));return {slug:p.slug,existing:exact[0]||null,duplicate:exact.length>1||other.length>0,duplicateIds:other.map(r=>r.id),readiness:p.criticalBlockers.length?'blocked':'requires explicit review attestation'}})
}
export async function runPhase08Import(client,repo,manifest,{publish=false,attested=false,fetchFile=fetch,onStep=()=>{}}={}){
 await validatePhase08Package(manifest);check(!publish||attested,'Explicit review attestation is required before recording approvals and publishing.')
 const user=await actor(client),preflight=await inspectPhase08(client,manifest),report={batchId:manifest.batchId,packageSha256:manifest.packageSha256,startedAt:new Date().toISOString(),executor:'Current authorized administrator session; research is machine-prepared, publication attestation is explicitly supplied by the operator',results:[]}
 let changed=false;const subscription=client.auth.onAuthStateChange?.((event,session)=>{if(event==='SIGNED_OUT'||session?.user?.id!==user)changed=true})?.data?.subscription
 const assertActor=()=>check(!changed,'Account changed. The next operation was stopped.')
 const write=async task=>{assertActor();return task()}
 try{for(const plan of manifest.places){
  const result={slug:plan.slug,id:null,status:'blocked',media:[],warnings:[],steps:[]},step=message=>{result.steps.push(message);onStep({slug:plan.slug,message})}
  try{
   assertActor();const initial=preflight.find(r=>r.slug===plan.slug);check(!initial.duplicate,'An existing destination has the same identity under another slug; no changes made.')
   let id=initial.existing?.id,place
   if(id){check(!protectedIds.has(id),'Original destination protected.');place=await repo.getPlace(id);result.id=id;if(place.status==='published'){result.status='already published';report.results.push(result);continue}check(place.status==='draft','Existing non-draft destination preserved.');const review=place.review||place.place_reviews?.[0];const recoverable=!review?.notes&&!place.verified_at&&place.created_by===user&&place.place_translations.some(t=>t.locale==='ar-JO'&&t.editorial_status==='pending');check(recoverable||review?.notes&&JSON.parse(review.notes).importBatch===manifest.batchId&&JSON.parse(review.notes).contentHash===plan.contentHash,'Existing draft has no matching import provenance; it was preserved.');check(Object.entries(plan.english).every(([key,value])=>matchesImportedField(key,place[key],value)),'English content changed after import; no text was overwritten.');const ar=place.place_translations.find(t=>t.locale==='ar-JO');check(ar&&Object.entries(plan.arabic).every(([key,value])=>same(ar[key],value)),'Arabic changed after import; no text was overwritten.');if(recoverable)await write(()=>client.from('place_reviews').upsert({place_id:id,location_kind:plan.location_kind,coordinate_source:plan.coordinateSource,claims_reviewed:false,location_reviewed:false,notes:JSON.stringify({...plan.evidence,contentHash:plan.contentHash})},{onConflict:'place_id'}).then(checked))}
   else{
    try{id=await write(()=>repo.applyQuickEdit({english:plan.english,arabic:plan.arabic,category_ids:plan.category_ids,images:[]},null,false))}catch(e){throw Error('Create did not complete unambiguously. Reload package status before retrying; existing slugs are never overwritten. '+e.message)}
    check(id&&!protectedIds.has(id),'Unexpected destination identity.');result.id=id;place=await repo.getPlace(id);check(place.slug===plan.slug&&place.status==='draft','Draft read-back failed.')
    await write(()=>client.from('place_reviews').upsert({place_id:id,location_kind:plan.location_kind,coordinate_source:plan.coordinateSource,claims_reviewed:false,location_reviewed:false,notes:JSON.stringify({...plan.evidence,contentHash:plan.contentHash})},{onConflict:'place_id'}).then(checked));step('Created bilingual draft and saved source provenance without approvals')
   }
   result.id=id
   for(const photo of manifest.photos.filter(p=>p.slug===plan.slug)){
    try{
     const response=await fetchFile(photo.localUrl,{cache:'no-store'});check(response.ok,'Prepared photograph is unavailable.');const bytes=await response.arrayBuffer();check(bytes.byteLength===photo.uploadBytes&&await digest(bytes)===photo.uploadSha256,'Prepared photograph bytes changed.')
     const path=`${id}/phase08-${photo.uploadSha256}.jpg`,existing=checked(await client.from('place_images').select('*').eq('place_id',id).eq('storage_path',path));check(existing.length<=1,'Duplicate stored image path.')
     let image=existing[0]
     if(!image){
      const upload=await write(()=>client.storage.from('place-images').upload(path,new Blob([bytes],{type:'image/jpeg'}),{contentType:'image/jpeg',upsert:false,cacheControl:'31536000'}))
      // A duplicate object or ambiguous upload is safe only if bytes read back exactly.
      if(upload.error&&!/exist|duplicate|resource/i.test(upload.error.message))throw Error(upload.error.message)
      const stored=checked(await client.storage.from('place-images').download(path));check(await digest(await stored.arrayBuffer())===photo.uploadSha256,'Stored photograph differs from the prepared bytes; no approval performed.')
      const cover=photo.isCover&&!place.place_images.some(i=>i.is_cover)
      try{image=checked(await write(()=>client.from('place_images').insert({place_id:id,storage_path:path,alt_text:photo.altEn+' — '+photo.altAr,source_url:photo.page,attribution:photo.attribution,license_basis:'licensed',license_evidence:photo.licenseEvidence,is_cover:cover,sort_order:photo.index}).select('*')))[0]}catch(e){const saved=checked(await client.from('place_images').select('*').eq('place_id',id).eq('storage_path',path));if(!saved[0])throw e;image=saved[0]}
     }
     check(image.source_url===photo.page&&image.attribution===photo.attribution&&image.license_evidence===photo.licenseEvidence,'Existing image evidence changed; metadata preserved.')
     result.media.push({photoId:photo.id,imageId:image.id,storagePath:path,approved:!!image.approved_at});step('Associated verified bytes privately: '+photo.id)
    }catch(e){result.warnings.push(photo.id+': '+e.message)}
   }
   place=await repo.getPlace(id);const fullArabic=place.place_translations.find(t=>t.locale==='ar-JO');check(Object.entries(plan.english).every(([key,value])=>matchesImportedField(key,place[key],value))&&fullArabic&&Object.entries(plan.arabic).every(([key,value])=>same(fullArabic[key],value)),'Bilingual read-back did not match. No publication performed.');result.status='draft'
   const blockers=[...plan.criticalBlockers,...result.warnings];if(!place.place_images.some(i=>i.is_cover))blockers.push('No linked cover image.')
   if(!same(place.place_categories.map(c=>c.category_id).sort(),[...plan.category_ids].sort()))blockers.push('Category associations changed after preparation; they were preserved.')
   const expectedCover=manifest.photos.find(p=>p.slug===plan.slug&&p.isCover);if(expectedCover&&!place.place_images.some(i=>i.is_cover&&i.storage_path===`${id}/phase08-${expectedCover.uploadSha256}.jpg`))blockers.push('The selected cover differs from the reviewed package; it was preserved.');result.publicationBlockers=blockers
   if(publish&&!blockers.length){
    const expired=phase08EvidenceIssues(manifest,plan);check(!expired.length,expired.join(' '))
    for(const photo of manifest.photos.filter(p=>p.slug===plan.slug)){const image=place.place_images.find(i=>i.storage_path===`${id}/phase08-${photo.uploadSha256}.jpg`);check(image,'Prepared media association missing.');if(!image.approved_at)await write(()=>repo.approveImage(image))}
    await write(()=>repo.reviewPlace(place,{location_kind:plan.location_kind,coordinate_source:plan.coordinateSource,location_reviewed:true,claims_reviewed:true,notes:JSON.stringify({...plan.evidence,contentHash:plan.contentHash,approvalMethod:'Explicit administrator batch attestation; original research and content prepared by automated checks',packageSha256:manifest.packageSha256})}))
    place=await repo.getPlace(id);check(Object.entries(plan.english).every(([key,value])=>matchesImportedField(key,place[key],value)),'English changed during review; publication stopped.');let translation=place.place_translations.find(t=>t.locale==='ar-JO')
    if(translation.source_updated_at!==place.updated_at){translation=checked(await write(()=>client.from('place_translations').update({source_updated_at:place.updated_at}).eq('place_id',id).eq('locale','ar-JO').eq('updated_at',translation.updated_at).select('*')))[0];check(translation,'Translation version changed. Reload before approval.')}
    check(Object.entries(plan.arabic).every(([key,value])=>same(translation[key],value)),'Arabic changed during review; publication stopped.')
    if(translation.editorial_status!=='reviewed')translation=await write(()=>repo.reviewTranslation(translation))
    const issues=await repo.publicationIssues(id);check(!issues.length,'Backend publication blockers: '+issues.join('; '))
    await write(()=>repo.publishLocalized(place,translation));place=await repo.getPlace(id);check(place.status==='published'&&place.place_translations.some(t=>t.locale==='ar-JO'&&t.editorial_status==='reviewed'&&t.source_updated_at===place.updated_at),'Publication read-back failed.');result.status='published';step('Published through the existing guarded bilingual RPC')
   }
  }catch(e){result.error=e.message;if(result.id){try{const current=await repo.getPlace(result.id);result.status=current.status==='published'?'published':'draft'}catch{result.status='read-back required'}}onStep({slug:plan.slug,message:'Needs attention: '+e.message})}
  report.results.push(result)
 }
 }finally{subscription?.unsubscribe();repo.invalidate();notifyPublicCatalogChange()}
 report.completedAt=new Date().toISOString();return report
}

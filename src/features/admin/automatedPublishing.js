import {completionIds} from './contentMediaImport.js'
const englishFields=['name','description','city','address','source_url','latitude','longitude','price_min_jod','price_max_jod','duration_min_minutes','duration_max_minutes','best_time_to_visit','transportation_notes','suitable_groups','primary_category_id']
const arabicFields=['name','description','city','address','best_time_to_visit','transportation_notes','visitor_guidance']
const check=(condition,message)=>{if(!condition)throw Error(message)}
const equal=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null)
const digest=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('')
export async function runAutomatedPublishing(client,repo,manifest,fetchFile=fetch,onStep=()=>{}){
 check(client.supabaseUrl==='https://dkhwwvoplhfjccvjegty.supabase.co'&&manifest.projectRef==='dkhwwvoplhfjccvjegty','Unexpected publishing project.')
 check(Array.isArray(manifest.places)&&manifest.places.length===6&&new Set(manifest.places.map(p=>p.id)).size===6&&manifest.places.every(p=>completionIds[p.slug]===p.id),'Only the six existing destinations are allowed.')
 check(Date.now()-Date.parse(manifest.preparedAt)>=0&&Date.now()-Date.parse(manifest.preparedAt)<24*3600000,'Research package expired. Refresh source and licence checks before publishing.')
 check(/^[a-f0-9]{64}$/.test(manifest.evidenceSha256),'Evidence fingerprint is missing.')
 const evidenceBytes=new TextEncoder().encode(JSON.stringify({places:manifest.places,photos:manifest.photos}))
 check(await digest(evidenceBytes)===manifest.evidenceSha256,'Evidence package changed. Rebuild it before publishing.')
 const auth=await client.auth.getUser();check(!auth.error&&auth.data.user?.email_confirmed_at,'A real confirmed administrator session is required.')
 const permission=await client.rpc('admin_cms_status');check(!permission.error,'A real current administrator permission is required.')
 let sessionChanged=false
 const subscription=client.auth.onAuthStateChange?.((event,session)=>{if(event==='SIGNED_OUT'||session?.user?.id!==auth.data.user.id)sessionChanged=true})?.data.subscription
 const assertActor=()=>check(!sessionChanged,'Administrator session changed. Batch stopped before the next write.')
 const write=async(method,...args)=>{assertActor();return repo[method](...args)}
 const report={startedAt:new Date().toISOString(),project:manifest.projectRef,performedBy:'Automated checks executed through the current authorized administrator account; not personal field-by-field review',evidenceSha256:manifest.evidenceSha256,results:[]}
 try{for(const plan of manifest.places){
  const result={id:plan.id,slug:plan.slug,steps:[],status:'blocked'}
  const step=name=>{result.steps.push(name);onStep({slug:plan.slug,step:name})}
  try{
   assertActor()
   check(Number.isFinite(Date.parse(plan.evidenceRetrievedAt))&&Date.now()-Date.parse(plan.evidenceRetrievedAt)>=0&&Date.now()-Date.parse(plan.evidenceRetrievedAt)<24*3600000,'Source or licence retrieval is stale for this destination. Rebuilding a plan alone cannot refresh evidence.')
   check(!plan.criticalBlockers?.length,'Unresolved critical research blocker: '+plan.criticalBlockers?.join('; '))
   check(plan.checks?.englishMatchesResearchedPackage&&plan.checks?.bilingualComplete&&plan.checks?.coordinateVerifiedAsReference,'Mandatory content evidence is incomplete.')
   let place=await repo.getPlace(plan.id)
   check(place.id===plan.id&&place.slug===plan.slug,'Destination identity changed.')
   check(englishFields.every(k=>equal(place[k],plan.expectedEnglish[k])),'English source changed after research. Refresh this destination evidence; no content was overwritten.')
   if(place.status==='published'){result.status='already published';report.results.push(result);continue}
   check(place.status==='draft','Only existing drafts can be published.')
   check(Object.entries(plan.expectedReview||{}).every(([k,v])=>equal(place.review?.[k],v)),'Editorial review notes changed after research. Existing review history was preserved.')
   let translation=place.place_translations?.find(t=>t.locale==='ar-JO')
   check(translation?.editorial_status!=='needs_changes','Outstanding translation feedback must be resolved in the evidence package before publishing.')
   check(!translation||arabicFields.every(k=>equal(translation[k],(plan.expectedArabic||plan.arabic)[k])),'Arabic changed after research. Translation history is preserved; refresh consistency checks.')
   const photos=manifest.photos.filter(p=>p.slug===plan.slug&&p.verification?.eligible)
   check(photos.some(p=>p.isCover),'No eligible identified cover image.')
   step('Saved bilingual content and geographic reference match the research package')
   for(const photo of photos){
    check(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(photo.page)&&/^https:\/\//.test(photo.licenseUrl)&&/^(CC BY(?:-SA)? [234](?:\.\d)?|CC0|Public domain)$/.test(photo.license)&&photo.author&&photo.attribution&&photo.licenseEvidence,'Incomplete image rights evidence.')
    check(photo.localUrl===`/${photo.uploadPath}`&&/^\/docs\/evidence\/(content-completion|automated-publishing)\/(?:[a-zA-Z0-9_./-]+)\.jpg$/.test(photo.localUrl)&&!photo.localUrl.includes('..'),'Unexpected local media path.')
    const response=await fetchFile(photo.localUrl,{cache:'no-store'});check(response.ok,'Prepared image unavailable: '+photo.id)
    const bytes=await response.arrayBuffer();check(bytes.byteLength===photo.uploadBytes&&await digest(bytes)===photo.uploadSha256,'Prepared photograph checksum changed: '+photo.id)
    place=await repo.getPlace(plan.id);const matches=place.place_images.filter(i=>i.source_url===photo.page)
    check(matches.length<=1,'Duplicate media source requires reconciliation: '+photo.id)
    let image=matches[0]
    if(!image){
     check(!place.place_images.some(i=>i.alt_text===`${photo.id}.jpg`&&!i.source_url),'An ambiguous previous upload needs reconciliation before retrying.')
     const path=await write('upload',plan.id,new File([bytes],`${photo.id}.jpg`,{type:'image/jpeg'}));place=await repo.getPlace(plan.id);image=place.place_images.find(i=>i.storage_path===path);check(image,'Uploaded image metadata unavailable. Inspect private orphan maintenance; no blind retry.')
     await write('updateImage',image,{alt_text:photo.alt,source_url:photo.page,attribution:photo.attribution,license_basis:photo.licenseBasis,license_evidence:photo.licenseEvidence,is_cover:photo.isCover&&!place.place_images.some(i=>i.id!==image.id&&i.is_cover),sort_order:photo.index})
     place=await repo.getPlace(plan.id);image=place.place_images.find(i=>i.storage_path===path)
    }
    check(image.license_basis===photo.licenseBasis&&image.attribution?.includes(photo.author)&&image.attribution?.includes(photo.license)&&image.license_evidence?.includes(photo.sha256),'Existing image evidence does not match the checked source; it was preserved unmodified.')
    const signed=(await repo.signedImages([image]))[0];check(signed?.url,'Authorized image preview unavailable.')
    const stored=await fetchFile(signed.url);check(stored.ok&&await digest(await stored.arrayBuffer())===photo.uploadSha256,'Stored image bytes differ from the inspected photograph.')
    if(!image.approved_at)await write('approveImage',image)
    step('Verified image identity, stored bytes, attribution and saved-rights approval: '+photo.id)
   }
   place=await repo.getPlace(plan.id)
   check(englishFields.every(k=>equal(place[k],plan.expectedEnglish[k])),'English changed during media processing. Refresh research before review.')
   check(Object.entries(plan.expectedReview||{}).every(([k,v])=>equal(place.review?.[k],v)),'Editorial review notes changed during processing. Existing review history was preserved.')
   translation=place.place_translations?.find(t=>t.locale==='ar-JO')
   check(!translation||arabicFields.every(k=>equal(translation[k],(plan.expectedArabic||plan.arabic)[k])),'Arabic changed during media processing. The new text was preserved.')
   check(translation?.editorial_status!=='needs_changes','Outstanding translation feedback blocks automatic review.')
   const notes=JSON.stringify({method:'Automated primary-source and bilingual consistency checks; account is the authorized executor, not a personal reviewer',evidenceSha256:manifest.evidenceSha256,preparedAt:manifest.preparedAt,sources:plan.sources,conclusions:plan.sourceConclusions,coordinateQualification:plan.coordinateQualification})
   await write('reviewPlace',place,{location_kind:plan.locationKind,coordinate_source:plan.coordinateSource,claims_reviewed:true,location_reviewed:true,notes})
   place=await repo.getPlace(plan.id);translation=place.place_translations?.find(t=>t.locale==='ar-JO')
   check(!translation||arabicFields.every(k=>equal(translation[k],(plan.expectedArabic||plan.arabic)[k])),'Arabic changed before source-version synchronization; no text was overwritten.')
   if(!translation||translation.source_updated_at!==place.updated_at||arabicFields.some(k=>!equal(translation[k],plan.arabic[k])))translation=await write('saveTranslation',place,plan.arabic,translation)
   if(translation.editorial_status!=='reviewed')translation=await write('reviewTranslation',translation)
   step('Recorded automated source provenance and independently checked Arabic through the real session')
   check((await repo.publicationIssues(plan.id)).length===0,'Backend publication requirements remain unresolved.')
   await write('publishLocalized',place,translation)
   place=await repo.getPlace(plan.id);translation=place.place_translations.find(t=>t.locale==='ar-JO')
   check(place.status==='published'&&translation?.editorial_status==='reviewed'&&translation.source_updated_at===place.updated_at,'Post-publication bilingual state did not verify.')
   result.status='published';step('Backend published English and current reviewed Arabic atomically')
  }catch(e){result.blocker=e.message;onStep({slug:plan.slug,step:'Blocked: '+e.message})}
  report.results.push(result)
 }
 }finally{subscription?.unsubscribe()}
 report.completedAt=new Date().toISOString();return report
}

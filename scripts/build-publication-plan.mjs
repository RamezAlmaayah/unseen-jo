import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const read=async p=>JSON.parse(await readFile(p,'utf8')),baseline=await read('docs/validation/automation-before.json'),content=await read('supabase/content/phase04-completion.json'),media=await read('docs/evidence/automated-publishing/media-package.json'),http=await read('docs/evidence/automated-publishing/primary-source-retrievals.json')
const enFields=['name','description','city','address','source_url','latitude','longitude','price_min_jod','price_max_jod','duration_min_minutes','duration_max_minutes','best_time_to_visit','transportation_notes','suitable_groups','primary_category_id']
const arFields=['name','description','city','address','best_time_to_visit','transportation_notes','visitor_guidance']
const conclusions={
 'ajloun-forest':'JTB supports woodland, spring flowers and separate guided/community trails. UNESCO indexed programme record corroborates the 2025 wider biosphere designation. The reserve reference is not a surveyed entrance; historical campsite photography is gallery-only.',
 'salt-historic':'UNESCO supports the yellow-limestone late-Ottoman urban core, shared hospitality traditions, 2021 inscription and stairways. District access is not a universal museum ticket. UNESCO DMS coordinates convert to the saved reference point.',
 'wadi-mujib':'JTB supports the Adventure Center/Siq route and weather-dependent water access. RSCN 2026 lists activity-specific duration and fees; older 2025 age guidance is explicitly dated. No current opening, swimming safety or single reserve price is guaranteed.',
 'dana-reserve':'JTB and RSCN support the reserve, village and varied itineraries. RSCN 2026 separates trail packages and transfers. Species totals and universal accessibility were intentionally omitted. The Dana village reference is not every trailhead.',
 'iraq-al-amir':'JTB supports the area, nearby second-century-BCE Qasr El-Abd and cooperative context. The area, palace and cooperative are distinct stops. Ticket scope, opening and cave/step-free access remain unavailable rather than invented.',
 'umm-qais':'JTB and the Ministry support Gadara, the Ottoman village and museum. Official operating-hour pages differ, so no fixed hours are claimed. Eligibility-based fees remain dated evidence. The saved point is a site-area reference.'
}
const places=baseline.places.map(p=>{
 const prepared=content.places.find(c=>c.id===p.id),t=baseline.translations.find(t=>t.place_id===p.id)
 if(!prepared||!t)throw Error('Missing bilingual source '+p.slug)
 const sameEnglish=['name','description','city','address','latitude','longitude','transportation_notes'].every(k=>p[k]===prepared[k])
 const review=baseline.reviews.find(r=>r.place_id===p.id)||{}
 const expectedArabic=Object.fromEntries(arFields.map(k=>[k,t[k]??null]))
 const publicationArabic={...expectedArabic}
 if(p.slug==='umm-qais')publicationArabic.visitor_guidance=publicationArabic.visitor_guidance?.replace(/[^.]*um\.jfif[^.]*\./g,'').replace(/[^.]*UTM[^.]*\./g,'').trim()
 const bilingualComplete=!!t.name&&t.description?.length>=80&&arFields.every(k=>!p[k]||!!t[k])&&/[\u0600-\u06ff]/.test(t.description)
 const direct=http.records.filter(r=>prepared.sources.includes(r.url)&&r.status===200&&!/Request Rejected|Just a moment/i.test(r.title||'')).map(r=>r.url)
 return {id:p.id,slug:p.slug,expectedReview:Object.fromEntries(['notes','reviewed_at','reviewed_by','location_kind','coordinate_source','claims_reviewed','location_reviewed'].map(k=>[k,review[k]??null])),expectedEnglish:Object.fromEntries(enFields.map(k=>[k,p[k]??null])),expectedArabic,arabic:publicationArabic,sources:prepared.sources,coordinateSource:prepared.coordinate_source,locationKind:'approximate_center',coordinateQualification:prepared.coordinate_note,sourceConclusions:conclusions[p.slug],sourceChannels:{directHttp:direct,webAssisted:prepared.sources.filter(url=>!direct.includes(url))},checks:{englishMatchesResearchedPackage:sameEnglish,bilingualComplete,coordinateVerifiedAsReference:p.slug==='salt-historic'?Math.abs(p.latitude-(32+2/60+33.4/3600))<1e-9&&Math.abs(p.longitude-(35+43/60+41.9/3600))<1e-9:http.records.some(r=>r.coordinateMatches?.includes(p.slug)),translationConsistency:'Machine semantic comparison of the complete Arabic and English descriptions, plus an independent structural/qualification check. No claim of human review.',optionalUnknownsPreserved:p.price_min_jod===null&&p.price_max_jod===null},criticalBlockers:[]}
})
for(const p of places)if(!p.checks.englishMatchesResearchedPackage||!p.checks.bilingualComplete||!p.checks.coordinateVerifiedAsReference)p.criticalBlockers.push('Prepared content or geographic evidence is incomplete')
const web=await read('docs/evidence/automated-publishing/web-source-cross-checks.json')
for(const p of places){const times=[...http.records.filter(r=>p.sources.includes(r.url)).map(r=>Date.parse(r.retrievedAt)),...media.photos.filter(photo=>photo.slug===p.slug).map(photo=>Date.parse(photo.verification.retrievedAt))];if(p.sourceChannels.webAssisted.length)times.push(Date.parse(web.checkedOn+'T00:00:00Z'));p.evidenceRetrievedAt=new Date(Math.min(...times)).toISOString()}
const evidenceRetrievedAt=new Date(Math.min(...places.map(p=>Date.parse(p.evidenceRetrievedAt)))).toISOString()
const manifest={evidenceRetrievedAt,projectRef:'dkhwwvoplhfjccvjegty',preparedAt:new Date().toISOString(),preparedBy:'Automated primary-source research, original writing consistency checks and photographic evidence checks; no personal administrator attestation',maxAgeHours:24,places,photos:media.photos}
manifest.evidenceSha256=createHash('sha256').update(JSON.stringify({places,photos:media.photos})).digest('hex')
await writeFile('docs/evidence/automated-publishing/publication-plan.json',JSON.stringify(manifest,null,2)+'\n')
console.log('Six scoped publication plans prepared; '+places.filter(p=>p.criticalBlockers.length===0).length+' pass content/reference checks. Real CMS authorization still required.')

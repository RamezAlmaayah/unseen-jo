export const CONTENT_SYNC_PROJECT='https://dkhwwvoplhfjccvjegty.supabase.co'
export const translationFields=['name','description','city','region','address','best_time_to_visit','transportation_notes','opening_hours','activities','visitor_information','visitor_guidance']
export const destinationFields=['id','slug','status','updated_at','name','description','city','region','address','source_url','is_demo','latitude','longitude','primary_category_id','price_min_jod','price_max_jod','duration_min_minutes','duration_max_minutes','suitable_groups','best_time_to_visit','transportation_notes','opening_hours','activities','visitor_information','verified_at']
export const localContentSyncEnabled=(env,hostname)=>env?.DEV===true&&['127.0.0.1','localhost','[::1]'].includes(hostname)
export const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',typeof bytes==='string'?new TextEncoder().encode(bytes):bytes))).map(n=>n.toString(16).padStart(2,'0')).join('')
export const same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null)
// Preserve all six fractional digits; Date.parse would lose microsecond conflicts.
export function sameVersion(a,b){const canonical=s=>{const m=typeof s==='string'&&/^(\d{4}-\d\d-\d\d)[T ](\d\d:\d\d:\d\d)(?:\.(\d{1,6}))?(?:Z|\+00(?::?00)?)$/.exec(s);return m?`${m[1]}T${m[2]}.${(m[3]||'').padEnd(6,'0')}Z`:null};const left=canonical(a),right=canonical(b);return !!left&&!!right&&left===right}
export function syncError(error){return String(error?.message||error||'Synchronization failed.').replace(/Bearer\s+\S+|sb_(?:secret|publishable)_\S+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/gi,'[redacted]').replace(/((?:access_token|refresh_token|token|apikey|password)=)[^\s&#]+/gi,'$1[redacted]').slice(0,500)}
const assert=(condition,message)=>{if(!condition)throw Error(message)}
export function validateContentSyncPackage(p){
 assert(p?.version===1&&p.projectRef==='dkhwwvoplhfjccvjegty'&&p.batchId==='phase14-1-owner-approved','Unexpected content synchronization package.')
 for(const [key,count,id]of [['destinations',24,'id'],['translations',19,'id'],['images',30,'imageId']])assert(p[key]?.length===count&&new Set(p[key].map(r=>r[id])).size===count,'Package identities or counts are invalid.')
 assert(new Set(p.destinations.map(d=>d.slug)).size===24,'Duplicate destination slug.')
 for(const t of p.translations){assert(p.destinations.some(d=>d.id===t.id&&d.slug===t.slug)&&t.locale==='ar-JO','Translation destination mismatch.');assert(Object.keys(t.arabic).length===translationFields.length&&translationFields.every(k=>Object.hasOwn(t.arabic,k)),'Unexpected Arabic fields.');assert(t.arabic.description?.length>=80&&/\p{Script=Arabic}/u.test(t.arabic.name),'Incomplete Arabic proposal.')}
 for(const i of p.images)assert(p.destinations.some(d=>d.id===i.placeId&&d.slug===i.slug)&&i.baseline.id===i.imageId&&i.baseline.place_id===i.placeId&&i.baseline.storage_path===`${i.placeId}/phase08-${i.rights.uploadSha256}.jpg`,'Image mapping is invalid.')
 assert(p.excluded?.length===4&&p.excluded.every(e=>!p.images.some(i=>i.photoId===e.id)),'Excluded image present in selected mappings.')
 return p
}
export function rightsUsable(image){const r=image.rights;try{const u=new URL(r.licenseUrl),s=new URL(r.source);return r.eligible===true&&r.identityStatus==='visually checked'&&r.originStatus==='MATCH'&&!!r.author&&/^CC BY(?:-SA)? [234](?:\.\d)?$/.test(r.license)&&u.protocol==='https:'&&u.hostname==='creativecommons.org'&&s.protocol==='https:'&&s.hostname==='commons.wikimedia.org'&&!u.username&&!u.password&&!s.username&&!s.password&&/^[a-f0-9]{64}$/.test(r.uploadSha256)}catch{return false}}
export function destinationProblems(p,rows){
 if(rows.length!==24||new Set(rows.map(d=>d.id)).size!==24)return ['The destination collection changed. Refresh the package before continuing.']
 const problems=[]
 for(const expected of p.destinations){const row=rows.find(d=>d.id===expected.id);if(!row||destinationFields.some(k=>k.endsWith('_at')&&expected[k]?!sameVersion(row[k],expected[k]):!same(row[k],expected[k])))problems.push(expected.slug)}
 return problems
}
export function translationState(plan,place){
 const matches=(place?.place_translations||[]).filter(t=>t.locale==='ar-JO'&&t.place_id===plan.id)
 if(matches.length!==1)return {state:'conflict',reason:'Translation missing or duplicated.'}
 const row=matches[0],desired=translationFields.every(k=>same(row[k],plan.arabic[k])),current=sameVersion(row.source_updated_at,place.updated_at)
 if(desired&&current&&row.editorial_status==='reviewed')return {state:'already_applied',row,changes:[]}
 if(!sameVersion(place.updated_at,plan.expectedEnglishUpdatedAt)||!sameVersion(row.updated_at,plan.expectedTranslationUpdatedAt))return {state:'conflict',row,reason:'The saved translation or English version changed.'}
 if(!translationFields.every(k=>same(row[k],plan.baseline[k]))||!same(row.editorial_status,plan.baseline.editorial_status)||!sameVersion(row.source_updated_at,plan.baseline.source_updated_at))return {state:'conflict',row,reason:'Saved Arabic differs from the approved baseline.'}
 return {state:'ready',row,changes:translationFields.filter(k=>!same(row[k],plan.arabic[k]))}
}
export function inspectContentSync(p,rows){
 validateContentSyncPackage(p)
 const problems=destinationProblems(p,rows)
 const translations=p.translations.map(t=>({id:t.id,slug:t.slug,...translationState(t,rows.find(d=>d.id===t.id))}))
 const images=p.images.map(i=>{
  const matches=(rows.find(d=>d.id===i.placeId)?.place_images||[]).filter(r=>r.id===i.imageId||r.storage_path===i.baseline.storage_path),row=matches[0]
  if(!rightsUsable(i))return {photoId:i.photoId,state:'excluded',reason:'Publication rights or destination identity evidence is incomplete.'}
  if(matches.length!==1||Object.keys(i.baseline).filter(k=>k!=='updated_at').some(k=>!same(row?.[k],i.baseline[k])))return {photoId:i.photoId,state:'conflict',reason:'Image mapping or saved rights metadata changed.'}
  if(row.approved_at)return {photoId:i.photoId,state:'already_applied',reason:'Already associated and approved.'}
  if(!sameVersion(row.updated_at,i.baseline.updated_at))return {photoId:i.photoId,state:'conflict',reason:'The image version changed.'}
  return {photoId:i.photoId,state:'blocked',reason:'Existing published-image guards do not support approval of these saved rows without changing status.'}
 })
 return {checkedAt:new Date().toISOString(),problems,translations,images}
}

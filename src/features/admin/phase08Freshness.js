const DAY=86400000
export const isRecentEvidence=(value,now=Date.now())=>Number.isFinite(Date.parse(value))&&now>=Date.parse(value)&&now-Date.parse(value)<DAY
// Rebuilding preparedAt cannot renew source or licence evidence. Each prepared
// destination/file needs its own successful, matching, recent revalidation.
export function phase08EvidenceIssues(manifest,plan,now=Date.now()){
 const issues=[]
 if(!isRecentEvidence(manifest.preparedAt,now))issues.push('Phase 08 package build is missing or expired.')
 const record=manifest.revalidation?.records?.find(r=>r.slug===plan.slug)
 if(!record||record.status!=='verified'||record.contentHash!==plan.contentHash||!isRecentEvidence(record.checkedAt,now)||!record.sources?.length||record.sources.some(s=>s.status!=='verified'||!isRecentEvidence(s.checkedAt,now)||!/^https:\/\//.test(s.url)||!/^[a-f0-9]{64}$/.test(s.evidenceSha256||'')))issues.push('Source verification is missing or expired for this destination.')
 for(const photo of manifest.photos.filter(p=>p.slug===plan.slug)){
  const license=manifest.revalidation?.licenses?.find(i=>i.photoId===photo.id)
  if(!license?.eligibleMetadataUnchanged||!license.originalSha1Unchanged||license.originalSha256!==photo.sha256||!license.revision||!/^[a-f0-9]{64}$/.test(license.responseSha256||'')||!isRecentEvidence(license.checkedAt,now))issues.push('Image licence verification is missing or expired. '+photo.id)
 }
 return issues
}

export const completionIds=Object.freeze({
 'ajloun-forest':'6f3ca842-ebdf-42a3-a590-987ae577e759',
 'salt-historic':'189dc346-58af-42b5-b2da-c862c95f0fca',
 'wadi-mujib':'0a905153-1e27-44b0-a2d8-3f9b8cf6b089',
 'dana-reserve':'a6b63635-d609-411d-86e2-ccd2ec0bd6af',
 'iraq-al-amir':'4ec8a105-00a5-4f4b-b410-dbf864343826',
 'umm-qais':'066dbed9-ca25-421e-8187-00fbc78fcda3'
})
const check=(value,message)=>{if(!value)throw Error(message)}
export async function importResearchedMedia(client,repo,manifest,fetchFile=fetch,onStep=()=>{}){
 check(client.supabaseUrl==='https://dkhwwvoplhfjccvjegty.supabase.co','Unexpected Supabase project.')
 check(manifest.projectRef==='dkhwwvoplhfjccvjegty'&&Array.isArray(manifest.photos)&&manifest.photos.length>0&&manifest.photos.length<=20,'Invalid media package.')
 const auth=await client.auth.getUser();check(!auth.error&&auth.data.user?.email_confirmed_at,'A confirmed signed-in account is required.')
 const access=await client.rpc('admin_cms_status');check(!access.error,'Administrator permission is required.')
 const photos=manifest.photos
 const seen=new Set(),covers=new Set()
 for(const p of photos){
  check(completionIds[p.slug]&&p.id===`${p.slug}-${p.index}`&&!seen.has(p.id),'Unexpected or duplicate photograph.');seen.add(p.id)
  check(p.localUrl===`/docs/evidence/content-completion/${p.uploadPath.includes('/variants/')?'variants':'originals'}/${p.id}.jpg`,'Unexpected local image path.')
  check(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(p.page)&&/^https:\/\//.test(p.licenseUrl),'Missing canonical rights source.')
  check(['licensed','public_domain'].includes(p.licenseBasis)&&p.attribution&&p.licenseEvidence&&p.alt&&/^[a-f0-9]{64}$/.test(p.uploadSha256),'Incomplete reviewed image metadata.')
  if(p.isCover){check(!covers.has(p.slug),'Multiple proposed covers.');covers.add(p.slug)}
 }
 // Preflight all current rows before the first write. Existing originals/metadata are never deleted.
 for(const [slug,id]of Object.entries(completionIds)){
  const p=await repo.getPlace(id);check(p.id===id&&p.slug===slug&&p.status==='draft',`Expected draft unavailable: ${slug}`)
 }
 const results=[]
 for(const photo of photos){
  const id=completionIds[photo.slug],current=await repo.getPlace(id)
  check(current.status==='draft'&&current.slug===photo.slug,'Destination changed during import. Stop and inspect.')
  const existing=current.place_images?.filter(i=>i.source_url===photo.page)||[]
  check(!current.place_images?.some(i=>i.alt_text===`${photo.id}.jpg`&&!i.source_url),'A previous upload needs metadata reconciliation in the editor before retrying.')
  check(existing.length<=1,'Duplicate existing media sources require manual reconciliation.')
  if(existing.length){const row={id:photo.id,status:'already associated',imageId:existing[0].id,storagePath:existing[0].storage_path};results.push(row);onStep(row);continue}
  const response=await fetchFile(photo.localUrl,{cache:'no-store'});check(response.ok,`Local file unavailable: ${photo.id}`)
  const bytes=await response.arrayBuffer();check(bytes.byteLength===photo.uploadBytes,`Image size changed: ${photo.id}`)
  const sha=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('')
  check(sha===photo.uploadSha256,`Image checksum changed: ${photo.id}`)
  // Do not retry ambiguous upload failures automatically. The normal CMS orphan review handles them.
  const path=await repo.upload(id,new File([bytes],`${photo.id}.jpg`,{type:'image/jpeg'}))
  const loaded=await repo.getPlace(id),image=loaded.place_images?.find(i=>i.storage_path===path)
  check(image,'Upload linking could not be confirmed; inspect the normal media/orphan view before retrying.')
  const coverAvailable=!loaded.place_images.some(i=>i.is_cover&&i.id!==image.id)
  await repo.updateImage(image,{alt_text:photo.alt,source_url:photo.page,attribution:photo.attribution,license_basis:photo.licenseBasis,license_evidence:photo.licenseEvidence,sort_order:photo.index,is_cover:photo.isCover&&coverAvailable})
  const signed=await repo.signedImages([{...image,storage_path:path}]);check(signed[0]?.url,'Private signed preview unavailable.')
  const preview=await fetchFile(signed[0].url);check(preview.ok,'Private image retrieval failed; inspect the uploaded record.')
  const row={id:photo.id,status:'uploaded privately; awaiting saved-rights approval',imageId:image.id,storagePath:path}
  results.push(row);onStep(row)
 }
 return {project:manifest.projectRef,results,published:false,rightsApproved:false}
}

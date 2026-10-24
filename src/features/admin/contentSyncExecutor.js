import {CONTENT_SYNC_PROJECT,translationFields,destinationFields,inspectContentSync,translationState,destinationProblems,same,sameVersion,syncError} from './contentSyncModel.js'
import {notifyPublicCatalogChange} from '../tourism/catalogEvents.js'
const imageFields=['id','place_id','storage_path','alt_text','is_cover','sort_order','source_url','attribution','license_basis','license_evidence','updated_at','approved_at']
const rowFields=['place_id','locale',...translationFields,'updated_at','source_updated_at','editorial_status','reviewed_at']
const projection=`${destinationFields.join(',')},place_translations(${rowFields.join(',')}),place_images(${imageFields.join(',')}),place_categories(category_id)`
const fail=(message,code='SYNC_STOP')=>{const e=Error(message);e.code=code;throw e}
const pick=(row,keys)=>Object.fromEntries(keys.map(k=>[k,row[k]??null]))
const sorted=(rows,key)=>[...(rows||[])].sort((a,b)=>String(a[key]).localeCompare(String(b[key])))
// Shared existing Admin client only. There is deliberately no upload, insert,
// delete, status/English edit, role, service-role or SQL mutation capability.
export function createContentSyncAdapter(client,repo,{allowExecution=()=>false}={}){
 async function checked(query){const {data,error}=await query.retry(false).abortSignal(AbortSignal.timeout(20000));if(error){if(['42501','401','403','PGRST301','PGRST303'].includes(error.code))fail('Administrator session required.','SYNC_AUTH');fail(syncError(error),'SYNC_REQUEST')}return data}
 return {
  async authorize(expected){
   if(client.supabaseUrl?.replace(/\/$/,'')!==CONTENT_SYNC_PROJECT)fail('Unexpected Supabase project.','SYNC_AUTH')
   const {data,error}=await client.auth.getUser();if(error||!data?.user?.id||expected&&expected!==data.user.id)fail('Administrator session changed. Refresh the preview.','SYNC_AUTH')
   await checked(client.rpc('admin_cms_status'));return data.user.id
  },
  watchActor(actor,onChange){return client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||session?.user?.id&&session.user.id!==actor)onChange()}).data.subscription},
  async readCatalog(){const rows=await checked(client.from('places').select(projection).order('slug').limit(25));return rows.map(row=>({...pick(row,destinationFields),place_translations:(row.place_translations||[]).map(t=>pick(t,rowFields)),place_images:(row.place_images||[]).map(i=>pick(i,imageFields)),place_categories:(row.place_categories||[]).map(c=>pick(c,['category_id']))}))},
  async saveTranslation(plan,row){
   if(!allowExecution())fail('Content synchronization is available only in local development.')
   const values=Object.fromEntries(translationFields.map(k=>[k,plan.arabic[k]??null]))
   const rows=await checked(client.from('place_translations').update({...values,source_updated_at:plan.expectedEnglishUpdatedAt,editorial_status:'pending'}).eq('place_id',plan.id).eq('locale','ar-JO').eq('updated_at',row.updated_at).select(rowFields.join(',')))
   if(rows?.length!==1)fail('Translation version conflict. No overwrite was performed.','SYNC_CONFLICT');return rows[0]
  },
  async reviewTranslation(row){if(!allowExecution())fail('Content synchronization is available only in local development.');return repo.reviewTranslation(row)},
  invalidate(){repo.invalidate();notifyPublicCatalogChange()}
 }
}
export async function inspectSync(adapter,manifest){const actor=await adapter.authorize(),snapshot=await adapter.readCatalog();return {...inspectContentSync(manifest,snapshot),actor,snapshot}}
export async function runContentSyncBatch(adapter,manifest,preview,{ids,confirmed=false,shouldStop=()=>false,onProgress=()=>{}}={}){
 if(!confirmed)fail('Explicit batch confirmation is required.')
 if(!Array.isArray(ids)||ids.length<1||ids.length>5||new Set(ids).size!==ids.length||ids.some(id=>!manifest.translations.some(t=>t.id===id)))fail('Select one to five distinct prepared translations.')
 if(preview.problems.length)fail('The destination collection changed. Refresh the package before continuing.')
 const report={batchId:manifest.batchId,projectRef:manifest.projectRef,previewCheckedAt:preview.checkedAt,startedAt:new Date().toISOString(),kind:'authenticated Admin translation batch; no image or status writes',results:ids.map(id=>{const plan=manifest.translations.find(t=>t.id===id),shown=preview.translations.find(t=>t.id===id);return {id,slug:plan.slug,expectedEnglishVersion:plan.expectedEnglishUpdatedAt,expectedArabicVersion:shown?.row?.updated_at,fieldsChanged:shown?.changes||[],previousEditorialStatus:shown?.row?.editorial_status,status:'not_attempted',textSaved:false,reviewVerified:false}}),images:preview.images.map(i=>({...i})),verification:'not_run',warnings:[]}
 let actorChanged=false,subscription,stop=false
 const snapshotReport=()=>structuredClone(report)
 const assertActor=async()=>{if(actorChanged||shouldStop())fail('Batch stopped. Refresh the preview before continuing.');await adapter.authorize(preview.actor)}
 onProgress(snapshotReport())
 try{
  await assertActor();subscription=adapter.watchActor(preview.actor,()=>{actorChanged=true})
  for(const result of report.results){
   if(stop||shouldStop()){result.status='not_attempted';continue}
   const plan=manifest.translations.find(p=>p.id===result.id)
   try{
    await assertActor()
    const rows=await adapter.readCatalog(),problems=destinationProblems(manifest,rows)
    if(problems.length)fail('The destination collection changed. No further writes were performed.')
    const place=rows.find(p=>p.id===plan.id),state=translationState(plan,place),shown=preview.translations.find(t=>t.id===plan.id)
    if(state.state==='already_applied'){result.status='already_applied';result.reviewVerified=true;continue}
    if(state.state!=='ready'||shown?.state!=='ready'||!sameVersion(state.row.updated_at,shown.row.updated_at))fail('Translation version conflict. Refresh the preview.','SYNC_CONFLICT')
    let row=state.row
    if(state.changes.length||!sameVersion(row.source_updated_at,place.updated_at)){
     await assertActor();result.status='saving_text';onProgress(snapshotReport())
     row=await adapter.saveTranslation(plan,row);result.textSaved=true;result.savedVersion=row.updated_at
    }
    // No automatic replay after network ambiguity. A committed text save may
    // remain pending if cancellation, revocation or review failure follows.
    await assertActor();result.status='reviewing';onProgress(snapshotReport())
    await adapter.reviewTranslation(row)
    const verified=(await adapter.readCatalog()).find(p=>p.id===plan.id)
    if(!verified||translationState(plan,verified).state!=='already_applied')fail('The saved review could not be verified. Reload before retrying.','SYNC_UNKNOWN')
    result.status='applied';result.reviewVerified=true;result.verifiedVersion=verified.place_translations.find(t=>t.locale==='ar-JO').updated_at
   }catch(error){
    result.status=result.textSaved?'saved_pending_or_unverified':error.code==='SYNC_CONFLICT'?'conflict':error.code==='SYNC_AUTH'?'authorization_failed':'failed_or_unverified'
    result.error=syncError(error);stop=true
   }finally{onProgress(snapshotReport())}
  }
  try{
   await assertActor();const after=await adapter.readCatalog()
   const baselinePreserved=destinationProblems(manifest,after).length===0
   const mediaPreserved=preview.snapshot.every(before=>{const row=after.find(p=>p.id===before.id);return row&&same(sorted(before.place_images,'id'),sorted(row.place_images,'id'))&&same(sorted(before.place_categories,'category_id'),sorted(row.place_categories,'category_id'))})
   const unrelatedTranslationsPreserved=preview.snapshot.filter(p=>!ids.includes(p.id)).every(before=>same(sorted(before.place_translations,'locale'),sorted(after.find(p=>p.id===before.id)?.place_translations,'locale')))
   const batchIds=new Set(report.results.filter(r=>r.status==='applied'||r.status==='already_applied').map(r=>r.id))
   const reviewsVerified=manifest.translations.filter(t=>batchIds.has(t.id)).every(t=>translationState(t,after.find(p=>p.id===t.id)).state==='already_applied')
   report.preservation={destinationRecords:after.length,destinationsUnchanged:baselinePreserved,imagesAndCategoriesUnchanged:mediaPreserved,unselectedTranslationsUnchanged:unrelatedTranslationsPreserved,successfulReviewsReadBack:reviewsVerified}
   report.verification=baselinePreserved&&mediaPreserved&&unrelatedTranslationsPreserved&&reviewsVerified?'passed':'failed'
   if(report.verification==='failed')report.warnings.push('Final preservation or review verification failed. Stop and inspect; do not overwrite concurrent changes.')
  }catch(e){report.verification='unavailable';report.warnings.push(syncError(e))}
 }catch(e){report.warnings.push(syncError(e));report.verification='unavailable'}finally{subscription?.unsubscribe();adapter.invalidate()}
 report.completedAt=new Date().toISOString();onProgress(snapshotReport());return report
}

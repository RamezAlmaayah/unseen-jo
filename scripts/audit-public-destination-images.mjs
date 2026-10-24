// Read-only anonymous audit. Never logs/stores keys, sessions or signed URLs.
import assert from 'node:assert/strict'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {createClient} from '@supabase/supabase-js'
import {loadEnv} from 'vite'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {pathToFileURL} from 'node:url'
const env=loadEnv('production',process.cwd(),'VITE_'),project='dkhwwvoplhfjccvjegty'
assert.equal(new URL(env.VITE_SUPABASE_URL).hostname,project+'.supabase.co')
const client=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
const snapshot=JSON.parse(await readFile('artifacts/image-removal/before.json','utf8')).snapshot
const {data:places,error}=await client.from('places').select('id,slug,name,status,updated_at,place_images(id,storage_path,alt_text,is_cover,sort_order)').eq('status','published').eq('is_demo',false).order('slug');assert.ifError(error)
const allImages=snapshot.images.filter(i=>places.some(p=>p.id===i.place_id)),{data:signed,error:signError}=await client.storage.from('place-images').createSignedUrls(allImages.map(i=>i.storage_path),300);assert.ifError(signError)
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs'))),browser=await chromium.launch({headless:true})
const page=await browser.newPage(),results=[]
try{
 for(let start=0;start<allImages.length;start+=3)await Promise.all(allImages.slice(start,start+3).map(async image=>{
  const item=signed.find(s=>s.path===image.storage_path),publicRow=places.find(p=>p.id===image.place_id)?.place_images.find(i=>i.id===image.id),object=snapshot.storage.find(o=>o.name===image.storage_path)
  const record={id:image.id,placeId:image.place_id,path:image.storage_path,isCover:image.is_cover,approved:!!image.approved_at,approvalAt:image.approved_at,publicRecordVisible:!!publicRow,storagePresent:!!object,publicSignAllowed:!!item?.signedUrl&&!item.error}
  assert.equal(!!publicRow,!!image.approved_at,'Approval/RLS mismatch for '+image.id)
  if(!record.publicSignAllowed){record.result='not_public';results.push(record);return}
  try{const response=await fetch(item.signedUrl,{signal:AbortSignal.timeout(25000)}),bytes=Buffer.from(await response.arrayBuffer()),mime=response.headers.get('content-type')||''
   record.http=response.status;record.mime=mime;record.bytes=bytes.length;record.sha256=createHash('sha256').update(bytes).digest('hex')
   if(response.ok&&mime.startsWith('image/')){const decoded=await page.evaluate(async data=>{try{const b=await(await fetch(data)).blob(),image=await createImageBitmap(b);const result={width:image.width,height:image.height};image.close();return result}catch{return null}},`data:${mime};base64,${bytes.toString('base64')}`);record.decoded=decoded;record.result=decoded?.width>0&&decoded?.height>0?'working':'invalid_image'}else record.result='broken'
  }catch{record.result='unavailable'}
  results.push(record)
 }))
}finally{await browser.close()}
results.sort((a,b)=>a.id.localeCompare(b.id))
const destinations=places.map(p=>{const images=results.filter(i=>i.placeId===p.id),working=images.filter(i=>i.approved&&i.publicRecordVisible&&i.result==='working');return {id:p.id,slug:p.slug,name:p.name,status:p.status,expectedUpdatedAt:p.updated_at,imageRecords:images.length,approvedImages:images.filter(i=>i.approved).length,approvedCover:images.some(i=>i.approved&&i.isCover),workingPublicImages:working.length,workingCover:working.some(i=>i.isCover),images:images.map(i=>i.id),action:working.length?'keep_published':'archive_required',reason:working.length?null:images.some(i=>i.approved)?'Approved images failed public image validation.':'No approved public image; existing uploads remain private.'}})
const result={projectRef:project,checkedAt:new Date().toISOString(),scope:'Genuine anonymous Data API and Storage reads plus Chromium decoding of downloaded bytes; no hosted writes, credentials or signed URLs stored',summary:{publishedChecked:places.length,withWorkingImages:destinations.filter(p=>p.workingPublicImages>0).length,withoutWorkingImages:destinations.filter(p=>!p.workingPublicImages).length,imagesChecked:results.length,workingApprovedImages:results.filter(i=>i.result==='working').length,approvedBrokenImages:results.filter(i=>i.approved&&i.result!=='working').length,unapprovedPubliclyReadable:results.filter(i=>!i.approved&&i.publicSignAllowed).length,archivedByThisTask:0,hostedWrites:0},destinations,images:results}
assert.equal(result.summary.unapprovedPubliclyReadable,0)
await mkdir('docs/validation',{recursive:true});await writeFile('docs/validation/public-destination-image-audit.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result.summary));for(const p of destinations)console.log(p.action+' '+p.name+' — '+p.workingPublicImages+' working public images')

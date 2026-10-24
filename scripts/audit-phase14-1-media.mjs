// Read-only origin checks. Writes evidence locally only; no Supabase calls.
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const read=async p=>JSON.parse(await readFile(p,'utf8')),m=await read('docs/evidence/phase08/import-package.json'),a=await read('docs/evidence/phase08/media-acquisition.json'),dir='docs/evidence/phase14-1',results=[]
await mkdir(dir,{recursive:true})
const hash=b=>createHash('sha256').update(b).digest('hex')
for(let start=0;start<a.photos.length;start+=8){
 const photos=a.photos.slice(start,start+8),url=new URL('https://commons.wikimedia.org/w/api.php')
 url.search=new URLSearchParams({action:'query',format:'json',titles:photos.map(p=>'File:'+p.title).join('|'),prop:'imageinfo|revisions',iiprop:'url|size|extmetadata|sha1',rvprop:'ids|content',rvslots:'main'})
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'UnseenJo/1.0 (read-only release evidence audit)'}})
  if(!response.ok)throw Error('HTTP '+response.status)
  const raw=await response.text(),data=JSON.parse(raw);if(data.error)throw Error(data.error.info)
  const evidenceFile=`${dir}/commons-${start}.json`;await writeFile(evidenceFile,raw)
  for(const p of photos){
   const old=(await read(p.metadataFile)).rows.find(r=>r.title==='File:'+p.title),page=Object.values(data.query?.pages||{}).find(r=>r.title==='File:'+p.title),image=page?.imageinfo?.[0],text=page?.revisions?.[0]?.slots?.main?.['*']||''
   const same=!!image&&['Artist','LicenseShortName','LicenseUrl','Credit','AttributionRequired','Restrictions'].every(k=>(image.extmetadata?.[k]?.value||'')===(old.extmetadata?.[k]?.value||''))
   const originalMatches=hash(await readFile(p.originalPath))===p.sha256&&image?.sha1===p.sha1,warnings=/\{\{\s*(?:delete|copyvio|no permission|npd|nld)\b/i.test(text)
   results.push({photoId:p.id,slug:p.slug,source:p.page,checkedAt:new Date().toISOString(),metadataUnchanged:same,originalMatches,rightsWarning:warnings,revision:page?.revisions?.[0]?.revid,evidenceFile,responseSha256:hash(raw),selected:m.photos.some(i=>i.id===p.id),status:same&&originalMatches&&!warnings?'MATCH':'REVIEW_REQUIRED',cmsApproval:'not granted by this audit'})
  }
 }catch(e){for(const p of photos)results.push({photoId:p.id,slug:p.slug,source:p.page,checkedAt:new Date().toISOString(),selected:m.photos.some(i=>i.id===p.id),status:'NOT_VERIFIED',error:e.message})}
 console.log('CHECKED Commons batch '+start)
}
await writeFile('docs/validation/phase14-1-media-origin.json',JSON.stringify({scope:'Current Commons file metadata and original-byte comparison; underlying-work/identity exclusions and owner approval remain separate. No content or approvals changed.',results},null,2)+'\n')
console.log(JSON.stringify({checked:results.length,match:results.filter(r=>r.status==='MATCH').length,unverified:results.filter(r=>r.status!=='MATCH').length}))

import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const manifest=JSON.parse(await readFile('docs/evidence/content-completion/media-import.json','utf8')),results=[]
const dir='docs/evidence/automated-publishing';await mkdir(dir,{recursive:true})
const strip=s=>(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').trim()
for(const photo of manifest.photos){
 const url=new URL('https://commons.wikimedia.org/w/api.php');url.search=new URLSearchParams({action:'query',format:'json',titles:'File:'+photo.title.replace(/^File:/,''),prop:'imageinfo|revisions',iiprop:'url|size|extmetadata|sha1',rvprop:'ids|content',rvslots:'main'})
 const result={id:photo.id,page:photo.page,retrievedAt:new Date().toISOString(),checkMethod:'Live Commons file-page metadata plus local original and prepared-byte hashes; machine check, no administrator signature'}
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'UnseenJoEvidenceCheck/1.0'}});if(!response.ok)throw Error('Commons HTTP '+response.status)
  const data=await response.json(),page=Object.values(data.query.pages)[0],info=page.imageinfo?.[0];if(!info)throw Error('Image missing')
  const m=info.extmetadata||{},wiki=page.revisions?.[0]?.slots?.main?.['*']||'',original=await readFile(photo.path),prepared=await readFile(photo.uploadPath)
  Object.assign(result,{revision:page.revisions?.[0]?.revid,author:strip(m.Artist?.value),license:strip(m.LicenseShortName?.value),licenseUrl:strip(m.LicenseUrl?.value),width:info.width,height:info.height,originalSha1Matches:createHash('sha1').update(original).digest('hex')===info.sha1,originalSha256Matches:createHash('sha256').update(original).digest('hex')===photo.sha256,preparedSha256Matches:createHash('sha256').update(prepared).digest('hex')===photo.uploadSha256,hasLicenseWarning:/\{\{\s*(?:delete|copyvio|no permission|npd|nld|disputed|permission pending)\b/i.test(wiki),hasAiWarning:/AI-generated|generative AI|Edited with Google AI/i.test(wiki),restrictions:strip(m.Restrictions?.value),identity:photo.identityReview,quality:photo.qualityNote})
  result.eligible=result.originalSha1Matches&&result.originalSha256Matches&&result.preparedSha256Matches&&result.license===photo.license&&!result.hasLicenseWarning&&!result.hasAiWarning&&!result.restrictions&&Math.max(result.width,result.height)>=1600
  await writeFile(dir+'/'+photo.id+'-commons.json',JSON.stringify({retrievedAt:result.retrievedAt,url:url.href,page,info},null,2)+'\n')
 }catch(e){result.error=e.message;result.eligible=false}
 results.push(result);console.log(`${result.eligible?'CHECKED':'BLOCKED'} ${photo.id} ${result.error||result.license}`)
 await writeFile(dir+'/photo-verification.json',JSON.stringify({results},null,2)+'\n')
}
// New candidate for Ajloun: do not label as a cover before visual inspection.
const candidate=JSON.parse(await readFile('docs/evidence/content-completion/ajloun-42-file-page.json','utf8'))
try{const url=new URL(candidate.imageinfo[0].url);url.search='';const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Download '+r.status);const b=Buffer.from(await r.arrayBuffer());if(createHash('sha1').update(b).digest('hex')!==candidate.imageinfo[0].sha1)throw Error('Candidate changed');await writeFile(dir+'/ajloun-forest-candidate.jpg',b);console.log('Downloaded Ajloun candidate for visual inspection')}catch(e){console.log('Ajloun candidate: '+e.message)}

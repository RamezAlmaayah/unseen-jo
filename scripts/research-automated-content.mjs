import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const content=JSON.parse(await readFile('supabase/content/phase04-completion.json','utf8'))
const dir='docs/evidence/automated-publishing';await mkdir(dir,{recursive:true})
const urls=[...new Set(content.places.flatMap(p=>p.sources))],records=[]
for(const url of urls){
 const retrievedAt=new Date().toISOString()
 try{
  const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'UnseenJoEvidenceCheck/1.0 (source verification)'}}),bytes=Buffer.from(await r.arrayBuffer()),type=r.headers.get('content-type')||'',html=type.includes('html')?bytes.toString('utf8'):''
  const mapTargets=[...html.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)].map(m=>({latitude:Number(m[1]),longitude:Number(m[2])}))
  const matchedSlugs=content.places.filter(p=>p.coordinate_source===url&&mapTargets.some(t=>Math.abs(t.latitude-p.latitude)<0.000001&&Math.abs(t.longitude-p.longitude)<0.000001)).map(p=>p.slug)
  const record={url,finalUrl:r.url,retrievedAt,status:r.status,type,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g,' ').trim()||null,mapTargets,coordinateMatches:matchedSlugs}
  // PDFs are existing official operator evidence, not invented opening schedules.
  if(type.includes('pdf')&&r.ok){const file=url.includes('Dana')?'dana-2026.pdf':url.includes('2026')?'mujib-2026.pdf':'mujib-2025.pdf';await writeFile(dir+'/'+file,bytes);record.savedAs=file}
  records.push(record);console.log(`${r.status} ${url} coordinates=${matchedSlugs.join(',')}`)
 }catch(e){records.push({url,retrievedAt,error:e.message});console.log('UNAVAILABLE '+url+' '+e.message)}
 await writeFile(dir+'/primary-source-retrievals.json',JSON.stringify({retrievedBy:'Automated HTTP retrieval; not personal administrator review',records},null,2)+'\n')
}

import {readFile,writeFile} from 'node:fs/promises'
const dir='docs/evidence/phase08',index=JSON.parse(await readFile(dir+'/source-index.json','utf8')),out=[]
const strip=s=>s.replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ').trim()
for(const source of index.filter(r=>r.ok&&r.mapLinks?.length)){
 const html=await(await fetch(source.url,{signal:AbortSignal.timeout(25000)})).text()
 for(const match of html.matchAll(/(?:href|src)=["']([^"']*(?:google\.[^"']*\/maps|goo\.gl\/maps|maps\.app\.goo\.gl)[^"']*)["']/g)){
  const url=match[1].replaceAll('&amp;','&').replaceAll('&#64;','@'),prefix=html.slice(Math.max(0,match.index-1600),match.index),heads=[...prefix.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/g)]
  const context=strip(prefix).slice(-650),heading=strip(heads.at(-1)?.[1]||'')
  out.push({source:source.url,heading,context,url})
 }
}
const wanted=/St\.?\s*George|Nebo|Pella|Quseir|Amra|Shobak|Azraq|Little Petra|Al.Barid|Citadel|Roman Theatre|Petra Visitor|Shaumari|Baptism|Umm.el.Jimal/i
for(const row of out.filter(r=>wanted.test(r.heading)||/edutravel/.test(r.source)&&wanted.test(r.context))){
 try{const response=await fetch(row.url,{redirect:'follow',signal:AbortSignal.timeout(20000)});row.resolvedUrl=response.url;const m=response.url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);if(m)row.point={latitude:Number(m[1]),longitude:Number(m[2])};console.log(JSON.stringify({heading:row.heading,context:row.context.slice(-140),point:row.point,url:row.resolvedUrl.slice(0,100)}))}catch(e){row.error=e.message}
}
await writeFile(dir+'/geography-links.json',JSON.stringify({retrievedAt:new Date().toISOString(),qualification:'Map targets supplied by named official page sections. Reference points only; no surveyed entrance or public access guarantee.',rows:out},null,2)+'\n')

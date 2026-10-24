// Public Commons metadata only; never reads Supabase credentials or writes hosted data.
import {mkdir,writeFile} from 'node:fs/promises'
const directory='docs/evidence/content-completion'
await mkdir(directory,{recursive:true})
const queries={ajloun:'"Ajloun Forest"',salt:'"As-Salt"',mujib:'"Wadi Mujib"',dana:'"Dana Biosphere"',iraq:'"Qasr al-Abd"',umm:'"Umm Qais"'}
for(const [key,query] of Object.entries(queries)){
 const url=new URL('https://commons.wikimedia.org/w/api.php')
 url.search=new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:'12',prop:'imageinfo',iiprop:'url|size|extmetadata|sha1'})
 const response=await fetch(url,{headers:{'User-Agent':'UnseenJoContentResearch/1.0 (public tourism photo licence review)'}})
 if(!response.ok)throw Error(`${key}: ${response.status}`)
 const data=await response.json()
 const rows=Object.values(data.query?.pages||{}).map(p=>({title:p.title,...p.imageinfo?.[0]}))
 await writeFile(`${directory}/${key}-commons-candidates.json`,JSON.stringify({accessed:'2026-10-19',api:url.href,rows},null,2)+'\n')
 console.log(key,JSON.stringify(rows.map(p=>({title:p.title,size:p.size,w:p.width,h:p.height,description:p.extmetadata?.ImageDescription?.value?.slice(0,190),author:p.extmetadata?.Artist?.value?.replace(/<[^>]+>/g,''),license:p.extmetadata?.LicenseShortName?.value,gps:[p.extmetadata?.GPSLatitude?.value,p.extmetadata?.GPSLongitude?.value]}))))
}

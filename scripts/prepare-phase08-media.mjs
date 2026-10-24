import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const dir='docs/evidence/phase08',selection={
 petra:['Al-Khazneh 2, Petra, Jordan.jpg','Al Khazneh 02.jpg'],
 'wadi-rum':['Jordan, Wadi Rum Desert, Infinite Spaces.jpg','Jordan, Wadi Rum Desert, Khor al Ajram 2.jpg'],
 'jerash-archaeological-city':['Jerash Oval Plaza 003.JPG','Jerash Oval Plaza 020.jpg'],
 'amman-citadel':['Temple of Hercules - Amman citadel.jpg'],
 'amman-roman-theatre':['Roman theater of Amman 01.jpg','Amman Amphitheater 18.JPG'],
 'madaba-st-georges-church':['Jordan, Madaba. (Mosaic map photo at Greek Orthodox Church of Saint George) DSCN0901.jpg','The Madaba Map, part of a floor mosaic in the early Byzantine church of Saint George depicting the Holy Land in the 6th century AD, Madaba, Jordan (33798342833).jpg'],
 'mount-nebo':['Memorial Church of Moses, Mount Nebo, Jordan (26804136468).jpg','Inside the Basilica, the Memorial Church of Moses, Mount Nebo, Jordan.jpg'],
 'al-maghtas-baptism-site':['Bethany (5).JPG','Jordan Baptism site BW 3.JPG'],
 'karak-castle':['Kerak BW 1.JPG','Karak Castle 2.jpg'],
 'shobak-castle':['Montreal Castle 04.jpg','Montreal Castle 05.jpg'],
 'quseir-amra':['Quseir Amra 18.jpg','Quseir Amra 20.jpg'],
 'um-er-rasas':['Umm ar-Rasas Arcs.jpg','Umm ar-Rasas.jpg'],
 'azraq-wetland-reserve':['Azraq Wetland Reserve, May 2017.jpg','Azraq Wetland Reserve 36.jpg'],
 'shaumari-wildlife-reserve':['Shaumari Wildlife Reserve 43.jpg','Shaumari Wildlife Reserve 55.jpg'],
 'pella-tabaqat-fahl':['Pella, Jordan (33383216993).jpg'],
 'umm-al-jimal':['Umm al-Jamal 10.jpg','Umm al-Jamal 05.jpg','Umm el-Jimal.jpg'],
 'little-petra-siq-al-barid':['Columned Chamber Siq al-Barid Jordan1502.jpg','Little Petra, Jordan - 49785122391.jpg'],
 'aqaba-marine-reserve':['Aqaba Marine Park, Jordan.jpg']
}
await mkdir(dir+'/originals',{recursive:true});await mkdir(dir+'/previews',{recursive:true})
let rateLimited=false;const pause=ms=>new Promise(r=>setTimeout(r,ms));
const hash=(bytes,algo='sha256')=>createHash(algo).update(bytes).digest('hex'),strip=s=>(s||'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").trim(),photos=[],errors=[]
for(const [slug,titles]of Object.entries(selection)){
 const data=JSON.parse(await readFile(dir+'/commons/'+slug+'.json','utf8'))
 for(const [i,title]of titles.entries()){
  const id=`${slug}-${i+1}`,row=data.rows.find(r=>r.title==='File:'+title),path=dir+'/originals/'+id+'.jpg'
  try{
   if(!row)throw Error('Selected metadata unavailable')
   const meta=row.extmetadata||{},license=strip(meta.LicenseShortName?.value),author=strip(meta.Artist?.value),licenseUrl=strip(meta.LicenseUrl?.value).replace(/^http:/,'https:')
   if(!/^CC BY(?:-SA)? [234](?:\.\d)?$/.test(license)||!licenseUrl.startsWith('https://creativecommons.org/')||!author)throw Error('Complete compatible licence and author evidence required')
   if(/\{\{\s*(?:delete|copyvio|no permission|npd|nld)\b/i.test(row.wikitext||''))throw Error('Unresolved Commons rights warning')
   if(!/\.(?:jpe?g)$/i.test(new URL(row.url).pathname)||row.width<1600||row.height<900)throw Error('Insufficient raster quality')
   let bytes;try{bytes=await readFile(path)}catch{if(rateLimited)throw Error('Deferred after repeated host rate limit; no further download attempted');let response=await fetch(row.url,{signal:AbortSignal.timeout(60000),headers:{'User-Agent':'UnseenJo/1.0 (licensed original preservation)'}});if(response.status===429){const delay=Math.max(90000,(Number(response.headers.get('retry-after'))||0)*1000);console.log('Host requested a pause; waiting',delay,'ms before one retry');await pause(delay);response=await fetch(row.url,{signal:AbortSignal.timeout(60000),headers:{'User-Agent':'UnseenJo/1.0 (licensed original preservation)'}});if(response.status===429)rateLimited=true}if(!response.ok)throw Error('Original download HTTP '+response.status);bytes=Buffer.from(await response.arrayBuffer());if(hash(bytes,'sha1')!==row.sha1)throw Error('Original SHA-1 mismatch');await writeFile(path,bytes);await pause(15000)}
   if(hash(bytes,'sha1')!==row.sha1)throw Error('Saved original differs from Commons metadata')
   photos.push({id,slug,index:i+1,isCover:i===0,title,page:row.descriptionurl,originalUrl:row.url,revision:row.revision,author,license,licenseUrl,credit:strip(meta.Credit?.value),attributionRequired:meta.AttributionRequired?.value!=='false',sourceCreditHtml:meta.Credit?.value||'',width:row.width,height:row.height,bytes:bytes.length,sha1:row.sha1,sha256:hash(bytes),originalPath:path,metadataFile:`${dir}/commons/${slug}.json`,retrievedAt:row.metadataRetrievedAt||data.retrievedAt,identityStatus:'awaiting visual inspection',approval:'not imported or CMS approved'})
   console.log('ORIGINAL',id,bytes.length,license)
  }catch(e){errors.push({id,slug,title,error:e.message});console.log('BLOCKED',id,e.message)}
 }
}
await writeFile(dir+'/media-acquisition.json',JSON.stringify({retrievedAt:new Date().toISOString(),photos,errors},null,2)+'\n')

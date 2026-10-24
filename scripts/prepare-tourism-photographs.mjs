import {mkdir,writeFile,readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const base='docs/evidence/content-completion',directory=`${base}/originals`
await mkdir(directory,{recursive:true})
const selected={
 'ajloun-forest':['Ajlun Reserve 1.jpg'],
 'salt-historic':['Old as-salt jordan 2024 (9).jpg','Old as-salt jordan 2024 (10).jpg','Old as-salt jordan 2024 (11).jpg'],
 'wadi-mujib':['Wadi Mujib2.jpeg','Wadi Mujib5.jpeg'],
 'dana-reserve':['Dana Reserve 04.jpg','Dana Reserve 06.jpg','Dana Reserve 07.jpg'],
 'iraq-al-amir':['View of Qasr Al-Abd, Amman.jpg','20100923 iraq el amir43.JPG','Qasr Al-Abd Interior.jpg'],
 'umm-qais':['Umm Qais (West Theater).jpg','UmmQaisjordan2025 (17).jpg','UmmQaisjordan2025 (31).jpg']
}
const strip=s=>(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').trim()
const records=[]
for(const [slug,titles] of Object.entries(selected))for(const [index,title]of titles.entries()){
 const api=new URL('https://commons.wikimedia.org/w/api.php');api.search=new URLSearchParams({action:'query',format:'json',titles:`File:${title}`,prop:'imageinfo|revisions',iiprop:'url|size|extmetadata|sha1',rvprop:'ids|content',rvslots:'main'})
 const r=await fetch(api);if(!r.ok)throw Error(`Metadata ${r.status}`)
 const data=await r.json(),page=Object.values(data.query.pages)[0],info=page.imageinfo?.[0],wikitext=page.revisions?.[0]?.slots?.main?.['*']||''
 if(!info||!/image\/(jpeg|png|webp)/.test(info.mime||'image/jpeg')||info.size>5242880)throw Error(`Unsupported original ${title}`)
 if(/AI-generated|generative AI|Edited with Google AI/i.test(wikitext))throw Error(`AI alteration flag: ${title}`)
 const m=info.extmetadata,license=strip(m.LicenseShortName?.value)
 if(!/^(CC BY(?:-SA)? [234](?:\.\d)?|CC0|Public domain)$/.test(license))throw Error(`Unreviewed licence ${title}: ${license}`)
 const url=new URL(info.url);if(url.hostname!=='upload.wikimedia.org'||url.protocol!=='https:')throw Error('Unexpected download host');url.search=''
 const file=`${slug}-${index+1}.jpg`,path=`${directory}/${file}`
 let bytes;try{bytes=await readFile(path)}catch{
  await new Promise(resolve=>setTimeout(resolve,3000))
  let original=await fetch(url)
  if(original.status===429){await new Promise(resolve=>setTimeout(resolve,30000));original=await fetch(url)}
  if(!original.ok){console.log(`UNAVAILABLE ${original.status}: ${title}`);continue}
  bytes=Buffer.from(await original.arrayBuffer());await writeFile(path,bytes)
 }
 if(bytes[0]!==255||bytes[1]!==216||bytes.length!==info.size)throw Error(`Invalid JPEG ${title}`)
 const sha1=createHash('sha1').update(bytes).digest('hex');if(sha1!==info.sha1)throw Error(`Checksum mismatch ${title}`)
 await writeFile(`${base}/${slug}-${index+1}-file-page.json`,JSON.stringify({accessed:'2026-10-19',api:api.href,page,info},null,2)+'\n')
 const record={slug,index:index+1,title,page:info.descriptionurl,revision:page.revisions[0].revid,originalUrl:url.href,author:strip(m.Artist?.value),license,licenseUrl:strip(m.LicenseUrl?.value),description:strip(m.ImageDescription?.value),credit:strip(m.Credit?.value),width:info.width,height:info.height,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),path,localUrl:`/docs/evidence/content-completion/originals/${file}`,isCover:index===0,identityReview:'pending visual inspection',approval:'awaiting authenticated admin saved-evidence review',storagePath:null}
 records.push(record);await writeFile(`${base}/selected-images.json`,JSON.stringify(records,null,2)+'\n');console.log(`${slug} ${index+1}: ${info.width}x${info.height}, ${bytes.length} bytes, ${license}, ${record.author}`)
}
await writeFile(`${base}/selected-images.json`,JSON.stringify(records,null,2)+'\n')

import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const base='docs/evidence/content-completion'
const photos=JSON.parse(await readFile(`${base}/selected-images.json`,'utf8'))
const alt={
 'ajloun-forest-1':'Canvas-sided campsite cabins among trees and wildflowers at Ajlun Reserve, photographed in 2005.',
 'salt-historic-1':'Turquoise wooden doors beside stone buildings on a stepped street in old As-Salt.',
 'salt-historic-2':'Yellow-stone buildings, balconies and a public square in old As-Salt.',
 'salt-historic-3':'Al-Khader Street stairs between stone buildings in old As-Salt.',
 'wadi-mujib-1':'Wide view over the dry hills and deeply cut valley of Wadi Mujib.',
 'wadi-mujib-2':'Layered valley walls and winding tracks in the Wadi Mujib landscape.',
 'dana-reserve-1':'Pale sandstone formations and shrubs in Dana Biosphere Reserve.',
 'dana-reserve-2':'Rounded sandstone outcrops above a wooded valley in Dana Biosphere Reserve.',
 'dana-reserve-3':'Rocky slopes and a broad mountain valley in Dana Biosphere Reserve.',
 'iraq-al-amir-1':'Large stone blocks and column remains at Qasr El-Abd near Iraq Al-Amir.',
 'umm-qais-1':'Dark stone seating and arches of the West Theatre at Umm Qais, overlooking green countryside.'
}
for(const p of photos){
 const key=`${p.slug}-${p.index}`,variantPath=`${base}/variants/${key}.jpg`,variant=await readFile(variantPath),original=await readFile(p.path)
 p.id=key;p.alt=alt[key];if(!p.alt)throw Error(`Uninspected photo ${key}`)
 p.identityReview='Visually inspected; named subject and author provenance checked against file-page record and destination context. Not an entrance-location survey.'
 p.qualityNote=p.slug==='ajloun-forest'?'Historical campsite scene (2005), not current accommodation evidence; gallery candidate only. A current forest cover remains blocked by source download rate limits.':p.slug==='wadi-mujib'?'Landscape view of the wider wadi, not a photograph of the Siq water trail.':'Original rendered and inspected; no visible watermark. Final responsive crops require administrator preview.'
 p.isCover=({'salt-historic':2,'dana-reserve':3,'wadi-mujib':1,'iraq-al-amir':1,'umm-qais':1}[p.slug])===p.index
 p.uploadPath=variant.length<original.length?variantPath:p.path
 const bytes=await readFile(p.uploadPath)
 p.uploadBytes=bytes.length;p.uploadSha256=createHash('sha256').update(bytes).digest('hex')
 p.localUrl='/'+p.uploadPath
 p.modifications=p.uploadPath===variantPath?'Resized without upscaling to at most 2000 pixels on the long edge; JPEG recompressed at quality 88; metadata stripped. Responsive display cropping may apply.':'Original file unchanged; responsive display cropping may apply.'
 p.licenseUrl ||= 'https://commons.wikimedia.org/wiki/Template:PD-self'
 p.licenseUrl=p.licenseUrl.replace(/^http:\/\//,'https://')
 p.attribution=`${p.title.replace(/^File:/,'')} — ${p.author}. ${p.license}. Source: ${p.page} Licence: ${p.licenseUrl}. ${p.modifications}`
 p.licenseBasis=/Public domain|CC0/.test(p.license)?'public_domain':'licensed'
 p.licenseEvidence=`Source file page reviewed 2026-10-19, revision ${p.revision}. ${p.author}; ${p.license}; ${p.licenseUrl}. Author's ${p.credit.includes('Own work')?'own-work declaration':'source/permission record'} retained in ${p.id}-file-page.json. ${p.slug==='umm-qais'?'Wikimedia public VRT permission confirmation ticket 2019101510004511. ':''}Original SHA-256 ${p.sha256}. ${p.modifications}`
 p.approval='Sourced and visually reviewed; not yet imported or approved through authenticated CMS'
}
await writeFile(`${base}/selected-images.json`,JSON.stringify(photos,null,2)+'\n')
await writeFile(`${base}/media-import.json`,JSON.stringify({projectRef:'dkhwwvoplhfjccvjegty',accessedOn:'2026-10-19',photos},null,2)+'\n')
console.log(`${photos.length} inspected photos prepared; ${photos.filter(p=>p.isCover).length} proposed covers. Originals preserved; smaller originals retained when recompression was larger.`)

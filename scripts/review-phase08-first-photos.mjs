import {readFile,writeFile} from 'node:fs/promises'
const path='docs/evidence/phase08/visual-review.json',review=JSON.parse(await readFile(path,'utf8'))
const checked={
 'wadi-rum-1':['Broad desert plain and sandstone mountains in Wadi Rum.','سهل صحراوي وجبال من الحجر الرملي في وادي رم.','Recognisable sandstone desert landscape, matches Commons caption; no visible watermark.'],
 'wadi-rum-2':['A shaded rocky valley between sandstone cliffs in Wadi Rum.','وادٍ صخري مظلل بين جروف الحجر الرملي في وادي رم.','Distinct canyon landscape; source identifies Khor al Ajram, not a generic unrelated desert.'],
 'jerash-archaeological-city-1':['The Oval Plaza and its columns in ancient Jerash.','الساحة البيضاوية وأعمدتها في مدينة جرش الأثرية.','Recognisable Oval Plaza and curved colonnade, no visible watermark.'],
 'jerash-archaeological-city-2':['Ancient columns and ruins in Jerash.','أعمدة وأطلال أثرية في جرش.','Colonnaded archaeological area consistent with file identity; distinct view.'],
 'amman-citadel-1':['Columns of the Temple of Hercules at Amman Citadel.','أعمدة معبد هرقل في جبل القلعة بعمّان.','Recognisable Hercules temple columns and architrave, no visible watermark.'],
 'amman-roman-theatre-1':['Amman Roman Theatre and the surrounding city viewed from above.','المدرج الروماني في عمّان والمدينة المحيطة به من الأعلى.','Theatre seating and stage visible from Citadel side; no entrance claim.'],
 'amman-roman-theatre-2':['The seating and stage of Amman Roman Theatre.','المقاعد والمسرح في المدرج الروماني بعمّان.','Frontal theatre view, recognisable subject, distinct photograph.'],
 'mount-nebo-1':['Carved architectural fragments displayed at Mount Nebo.','قطع معمارية منحوتة معروضة في جبل نيبو.','Interior display, not a church facade or original floor mosaic. Commons location supports attribution; gallery only pending stronger cover.'],
 'al-maghtas-baptism-site-1':['Archaeological baptism pools and protective shelters at Al-Maghtas.','أحواض معمودية أثرية ومظلات حماية في موقع المغطس.','Pool/shelter arrangement matches east-bank archaeological site and file caption, no modern church claim.']
}
for(const [id,[altEn,altAr,note]]of Object.entries(checked))review.photos[id]={status:'visually checked',altEn,altAr,note}
review.photos['mount-nebo-1'].galleryOnly=true
review.photos['madaba-st-georges-church-1']={status:'identity qualification required',note:'The photograph shows a wall-mounted map display or reproduction, not the surviving original mosaic floor. Excluded from import until its exact exhibit identity and suitable caption are established.'}
await writeFile(path,JSON.stringify(review,null,2)+'\n')

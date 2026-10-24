import {readFile,writeFile} from 'node:fs/promises'
const path='docs/evidence/phase08/visual-review.json',review=JSON.parse(await readFile(path,'utf8'))
const checked={
 'al-maghtas-baptism-site-2':['A modern church and bell tower at the Baptism Site.','كنيسة حديثة وبرج أجراس في موقع المغطس.','Modern commemorative church, not the ancient baptism pools; source context matches the site.'],
 'karak-castle-1':['Karak Castle above the hillside and surrounding town.','قلعة الكرك فوق السفح والمدينة المحيطة بها.','Recognisable long fortress above town; wide view matches source identity.'],
 'karak-castle-2':['Stone towers and defensive walls of Karak Castle.','أبراج حجرية وأسوار دفاعية في قلعة الكرك.','Distinct fortress exterior, matches caption, no visible watermark.'],
 'shobak-castle-1':['Stone arches and ruins inside Shobak Castle.','أقواس وأطلال حجرية داخل قلعة الشوبك.','Castle interior ruins match the Montreal Castle source; no visitor entrance claim.'],
 'shobak-castle-2':['Stone walls and vaulted remains at Shobak Castle.','جدران حجرية وبقايا مقببة في قلعة الشوبك.','Distinct interior ruins consistent with source, no visible watermark.'],
 'quseir-amra-1':['A painted vaulted interior at Quseir Amra.','داخل مقبب مزين بالرسوم في قصير عمرة.','Interior wall paintings match source context; bright skylight glare reduces cover suitability, gallery only.'],
 'quseir-amra-2':['Wall and vault paintings inside Quseir Amra.','رسوم جدارية ورسوم على القبو داخل قصير عمرة.','Recognisable decorated vault, detailed view suitable as interior cover; no exterior architecture implied.'],
 'um-er-rasas-1':['Arches and stone ruins at Um er-Rasas.','أقواس وأطلال حجرية في أم الرصاص.','Archaeological ruins match individual file caption; not a mosaic-floor photograph.'],
 'um-er-rasas-2':['Stone building remains at Um er-Rasas.','بقايا مبانٍ حجرية في أم الرصاص.','Distinct wider ruins view, agrees with file-level identity.'],
 'azraq-wetland-reserve-1':['Water, reeds and birds at Azraq Wetland Reserve.','مياه وقصب وطيور في محمية الأزرق المائية.','Wetland pool scene supports file location; no wildlife-sighting guarantee or claim about current water levels.']
}
for(const [id,[altEn,altAr,note]]of Object.entries(checked))review.photos[id]={status:'visually checked',altEn,altAr,note}
review.photos['quseir-amra-1'].galleryOnly=true;review.photos['quseir-amra-2'].cover=true
await writeFile(path,JSON.stringify(review,null,2)+'\n')

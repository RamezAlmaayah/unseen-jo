import {readFile,writeFile} from 'node:fs/promises'
const phrases={
 'Previous package — original six destinations':'الحزمة السابقة — الوجهات الست الأصلية',
 'This older package has expired. It is separate from Phase 08 and its evidence has not been renewed.':'انتهت صلاحية هذه الحزمة القديمة. وهي مستقلة عن المرحلة 08، ولم تُجدد أدلتها.',
 'Source and licence checks':'فحوص المصادر والتراخيص',
 'Revalidation required':'يلزم إعادة التحقق',
 'Prepared for review':'مُعدّة للمراجعة',
 'Phase 08 package build is missing or expired.':'حزمة المرحلة 08 غير متاحة أو انتهت صلاحيتها.',
 'Source verification is missing or expired for this destination.':'التحقق من مصادر هذه الوجهة غير متاح أو انتهت صلاحيته.',
 'Image licence verification is missing or expired.':'التحقق من ترخيص الصورة غير متاح أو انتهت صلاحيته.'
}
for(const lang of ['en','ar-JO']){const path='src/i18n/locales/'+lang+'.json',data=JSON.parse(await readFile(path,'utf8'));for(const [en,ar]of Object.entries(phrases))data[en]=lang==='en'?en:ar;await writeFile(path,JSON.stringify(data,null,2)+'\n')}

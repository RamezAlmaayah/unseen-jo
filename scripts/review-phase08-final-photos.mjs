import {readFile,writeFile} from 'node:fs/promises'
const path='docs/evidence/phase08/visual-review.json',review=JSON.parse(await readFile(path,'utf8'))
const checked={
 'madaba-st-georges-church-2':['A surviving section of the Madaba mosaic map in St George’s Church.','جزء باقٍ من خارطة مادبا الفسيفسائية في كنيسة القديس جاورجيوس.','Original mosaic tesserae and map inscription visible; unlike the excluded reproduction display.'],
 'mount-nebo-2':['The worship area inside the Memorial Church of Moses at Mount Nebo.','موضع الصلاة داخل كنيسة النبي موسى التذكارية في جبل نيبو.','Church interior, altar, benches and stonework visible; caption supports Mount Nebo identity. Visitors are incidental to the architectural view.'],
 'azraq-wetland-reserve-2':['Birds on a wetland pool at Azraq Wetland Reserve.','طيور على بركة مائية في محمية الأزرق.','Distinct wetland view; bird species and present-day water levels are not inferred.'],
 'shaumari-wildlife-reserve-1':['An Arabian oryx in a managed enclosure at Shaumari Wildlife Reserve.','مها عربي في حظيرة مدارة داخل محمية الشومري للأحياء البرية.','White oryx in reserve enclosure matches source caption; not a claim of wild unrestricted access or guaranteed sightings.'],
 'shaumari-wildlife-reserve-2':['A bird in an enclosure at Shaumari Wildlife Reserve.','طائر داخل حظيرة في محمية الشومري للأحياء البرية.','Visible enclosure and bird; species not independently established, so generic accurate caption retained.'],
 'pella-tabaqat-fahl-1':['Excavated stone remains and the surrounding settlement at Pella.','بقايا حجرية أثرية والعمران المحيط بطبقة فحل.','Archaeological area matches file-level Pella location; no exact gate or particular monument asserted.'],
 'umm-al-jimal-1':['A historical interpretation display at Umm Al-Jimal.','عرض تفسيري تاريخي في أم الجمال.','Indoor timeline display, not the basalt ruins. Gallery only.'],
 'umm-al-jimal-2':['An interpretation panel about Umm Al-Jimal and empire.','لوحة تفسيرية عن أم الجمال والإمبراطوريات.','Photograph of a museum-style panel, not site architecture; gallery only.'],
 'umm-al-jimal-3':['Basalt arches and stone ruins of the West Church at Umm Al-Jimal.','أقواس بازلتية وأطلال حجرية للكنيسة الغربية في أم الجمال.','Original photograph directly viewed: recognisable basalt arches and ruins match Bashar Tabbah’s West Church file, licensed CC BY-SA 4.0 with public VRT permission record. No watermark.'],
 'little-petra-siq-al-barid-1':['A rock-cut columned chamber at Little Petra.','حجرة ذات أعمدة منحوتة في الصخر في البترا الصغيرة.','Recognisable Siq Al-Barid columned chamber matches individual source caption.'],
 'little-petra-siq-al-barid-2':['Rock-cut rooms along the canyon at Little Petra.','حجرات منحوتة في الصخر على امتداد الممر في البترا الصغيرة.','Distinct canyon and carved-room view, agrees with source identity.']
}
for(const [id,[altEn,altAr,note]]of Object.entries(checked))review.photos[id]={status:'visually checked',altEn,altAr,note}
for(const id of ['madaba-st-georges-church-2','mount-nebo-2','umm-al-jimal-3'])review.photos[id].cover=true
for(const id of ['umm-al-jimal-1','umm-al-jimal-2'])review.photos[id].galleryOnly=true
for(const id of ['umm-al-jimal-1','umm-al-jimal-2'])review.photos[id]={...review.photos[id],status:'underlying display rights unresolved',note:review.photos[id].note+' The photograph is predominantly a modern interpretation panel with third-party text/photos; reuse evidence for that underlying material is not established. Excluded from the upload/approval package.'}
review.photos['aqaba-marine-reserve-1']={status:'identity qualification required',note:'A south-coast beach and jetty are visible. Commons names Aqaba Marine Park, but the exact beach and its relationship to current reserve boundaries are not independently resolved; exclude rather than imply a verified legal arrival point.'}
await writeFile(path,JSON.stringify(review,null,2)+'\n')

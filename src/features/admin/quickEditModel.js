import {emptyPlace,placePayload,safeHttps} from './model.js'
export const quickTextFields=['name','description','city','region','address','opening_hours','activities','visitor_information','best_time_to_visit','transportation_notes']
export function initialQuickEdit(place){
 const translation=place.place_translations?.find(t=>t.locale==='ar-JO')||{}
 return {english:{...emptyPlace,...place},arabic:{...translation},category_ids:place.place_categories?.map(c=>c.category_id)||[],images:[...(place.place_images||[])].sort((a,b)=>Number(b.is_cover)-Number(a.is_cover)||a.sort_order-b.sort_order),review:{...place.review}}
}
export function quickPayload(form,confirmed=new Set()){
 for(const image of form.images)if(image.source_url&&!safeHttps(image.source_url))throw Error('Image source must be an HTTPS URL without credentials.')
 if(form.review.coordinate_source&&!safeHttps(form.review.coordinate_source))throw Error('Coordinate source must be an HTTPS URL without credentials.')
 const english={...placePayload(form.english)}
 for(const key of ['region','opening_hours','activities','visitor_information'])english[key]=form.english[key]||null
 const arabic=Object.fromEntries([...quickTextFields,'visitor_guidance'].map(key=>[key,form.arabic[key]||null]))
 const images=form.images.map((image,index)=>Object.fromEntries([['id',image.id||null],['storage_path',image.storage_path],['sort_order',index],['is_cover',!!image.is_cover],...['alt_text','attribution','source_url','license_basis','license_evidence'].map(key=>[key,image[key]||null]),['rights_confirmed',confirmed.has(image.storage_path)]]))
 return {english,arabic,images,category_ids:form.category_ids,review:{location_kind:form.review.location_kind||null,coordinate_source:form.review.coordinate_source||null,notes:form.review.notes||null}}
}
export function editQuickImage(form,path,changes){return {...form,images:form.images.map(image=>image.storage_path===path?{...image,...changes,approved_at:null}:image)}}
export function imagesOnlyChanged(form,place){
 try{const current=quickPayload(form),original=quickPayload(initialQuickEdit(place));return ['english','arabic','review'].every(key=>JSON.stringify(current[key])===JSON.stringify(original[key]))&&JSON.stringify([...current.category_ids].sort())===JSON.stringify([...original.category_ids].sort())}catch{return false}
}
// Autosaves must never restore or imply a human attestation.
export function privateQuickPayload(form){
 return {english:Object.fromEntries([...Object.keys(emptyPlace),'id','updated_at','region','opening_hours','activities','visitor_information'].map(key=>[key,form.english[key]??null])),arabic:Object.fromEntries([...quickTextFields,'visitor_guidance'].map(key=>[key,form.arabic[key]??null])),category_ids:[...form.category_ids],images:form.images.map(({rights_confirmed:_ignored,...image})=>image),review:{...form.review}}
}

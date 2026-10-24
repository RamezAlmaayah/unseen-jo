import i18n,{isArabic,tx,formatNumber} from './index.js'
const translatedFields=['name','description','city','address','best_time_to_visit','transportation_notes','region','opening_hours','activities','visitor_information']
export function resolveTranslation(place,language='ar-JO',preview=false){
 const row=(place.place_translations||place.translations||[]).find(t=>t.locale===language)
 const current=row&&new Date(row.source_updated_at).getTime()===new Date(place.updated_at||place.englishUpdatedAt).getTime()
 const prototype=place.prototype?.visibility==='private'&&row?.editorial_status==='prototype'
 return {row,status:prototype?'prototype':!row?'missing':!current?'stale':row.editorial_status==='reviewed'?'reviewed':row.editorial_status==='needs_changes'?'needs_changes':'pending',usable:!!row&&(prototype||preview||current&&row.editorial_status==='reviewed')}
}
export function localizedRawPlace(place,language,preview=false){
 if(language!=='ar-JO')return {...place,translationStatus:'original',translationFallback:false}
 const state=resolveTranslation(place,language,preview),result={...place,translationStatus:state.status,translationFallback:!state.usable}
 for(const field of translatedFields)if(state.usable){if(state.row[field])result[field]=state.row[field];else if(place[field])result.translationFallback=true}
 if(state.usable)result.visitor_guidance=state.row.visitor_guidance
 return result
}
export function placeDisplayName(place){return localizedRawPlace(place,i18n.language,true).name||tx('Untitled destination')}
export function localizeDestination(place,language){
 const result={...place,details:{...place.details},categories:place.categories?.map(c=>({...c,name:tx(c.name)})),category:tx(place.category)}
 if(language==='ar-JO'&&place.mode==='supabase'){
  const raw=localizedRawPlace({prototype:place.prototype,name:place.name,description:place.details?.description,city:place.city,address:place.address,best_time_to_visit:place.details?.bestTime,transportation_notes:place.details?.transportLabel,region:place.details?.region,opening_hours:place.details?.openingHours,activities:place.details?.activities,visitor_information:place.details?.visitorInformation,translations:place.translations,englishUpdatedAt:place.englishUpdatedAt},language)
  Object.assign(result,{name:raw.name,city:raw.city,translationFallback:raw.translationFallback,translationStatus:raw.translationStatus})
  Object.assign(result.details,{title:raw.name,description:raw.description,bestTime:raw.best_time_to_visit,transportLabel:raw.transportation_notes,visitorGuidance:raw.visitor_guidance,region:raw.region,openingHours:raw.opening_hours,activities:raw.activities,visitorInformation:raw.visitor_information})
 }
 if(language==='ar-JO'&&place.mode!=='supabase'){
  for(const key of ['name','category','alt','costLabel','durationLabel','travelLabel'])if(result[key])result[key]=tx(result[key])
  for(const key of ['title','subtitle','description','bestTime','groupLabel','transportLabel'])if(result.details[key])result.details[key]=tx(result.details[key])
  result.details.experiences=place.details?.experiences?.map(e=>({...e,title:tx(e.title),description:tx(e.description),alt:tx(e.alt)}))
 }
 if(isArabic()&&place.mode==='supabase'){
  if(place.prototype)result.travelLabel=`نحو ${formatNumber(place.prototype.planning.travelMinutes)} دقيقة بالسيارة`
  const cost=place.priceMin!=null&&place.priceMax!=null?`${place.priceMin===place.priceMax?formatNumber(place.priceMin):`${formatNumber(place.priceMin)}–${formatNumber(place.priceMax)}`} د.أ.`:place.priceMin!=null?`ابتداءً من ${formatNumber(place.priceMin)} د.أ.`:place.priceMax!=null?`حتى ${formatNumber(place.priceMax)} د.أ.`:tx('Cost unavailable')
  result.costLabel=cost
  result.durationLabel=place.durationMinutes?`${formatNumber(place.durationMinutes[0])}–${formatNumber(place.durationMinutes[1])} دقيقة`:tx(place.durationLabel)
  result.category=result.categories?.map(c=>c.name).join(' · ')||tx(place.category)
  result.details.subtitle=result.category
  if(place.groups?.length)result.details.groupLabel=place.groups.map(group=>tx(group.charAt(0).toUpperCase()+group.slice(1))).join(' / ')
 }
 return result
}

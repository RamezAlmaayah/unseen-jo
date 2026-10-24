import arabic from '../../i18n/locales/ar-JO.json' with {type:'json'}
// Public naming aliases, never destination results or a demo fallback.
// Jordan Tourism Board: https://ar.visitjordan.com/wheretogo/wadi-mujib/
export const destinationAliases={'wadi-mujib':['Wadi Mujib','وادي الموجب','محمية الموجب للمحيط الحيوي']}
export const SEARCH_LIMIT=160
export function normalizeSearch(value){return String(value??'').normalize('NFKC').replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/gu,'').replace(/[أإآٱ]/g,'ا').replace(/[ىئ]/g,'ي').replace(/ؤ/g,'و').replace(/ة/g,'ه').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ')}
export const searchTokens=query=>normalizeSearch(String(query??'').slice(0,SEARCH_LIMIT)).split(' ').filter(Boolean).slice(0,12)
export function destinationSearchFields(place,{includeUnreviewed=false}={}){
 const stamp=place.updated_at||place.englishUpdatedAt
 const translations=(place.place_translations||place.translations||[]).filter(t=>includeUnreviewed||place.prototype?.visibility==='private'&&t.editorial_status==='prototype'||t.editorial_status==='reviewed'&&stamp&&new Date(t.source_updated_at).getTime()===new Date(stamp).getTime())
 const categories=place.categories||(place.place_categories||[]).map(c=>c.categories).filter(Boolean)
 return [...(place.searchFields||[]),place.name,place.slug,place.city,place.region,place.description,place.details?.description,place.details?.region,place.category,
  ...categories.flatMap(c=>[c.name,c.slug,arabic[c.name]]),...translations.flatMap(t=>[t.name,t.city,t.region]),...(destinationAliases[place.slug]||[])].filter(v=>typeof v==='string')
}
export function matchesDestination(place,query,options){
 if(!String(query??'').trim())return true
 const tokens=searchTokens(query);if(!tokens.length)return false
 const text=normalizeSearch(destinationSearchFields(place,options).join(' '))
 return tokens.every(token=>text.includes(token))
}
export const matchingAliasSlugs=query=>Object.entries(destinationAliases).filter(([,aliases])=>searchTokens(query).every(t=>normalizeSearch(aliases.join(' ')).includes(t))).map(([slug])=>slug)

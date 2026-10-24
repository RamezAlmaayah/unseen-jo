import {matchesDestination} from '../search/destinationSearch.js'
export function validVisitDate(value, today = new Date()) {
 if (!value) return true
 const parsed = new Date(`${value}T12:00:00Z`)
 const localToday = [today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-')
 return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(+parsed) && parsed.toISOString().slice(0,10) === value && value >= '1900-01-01' && value <= localToday
}
export function filterPersonalPlaces(places, {query='',category='',sort='recent',dates={}} = {}, language='en') {
 return places.filter(p=>matchesDestination(p,query)&&(!category||(p.categoryIds||[p.categoryId]).includes(category)))
  .sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,language):String(dates[b.id]||'').localeCompare(String(dates[a.id]||''))||a.name.localeCompare(b.name,language))
}
export const personalError='Your changes could not be synchronized. Check your connection and try again. Your existing records have been kept.'

// Display-only projection. Never infer hours, prices or access from narrative text.
export const visitorProse=value=>typeof value==='string'?value.replace(/\\n/g,'\n').trim():''
export function visitorBullets(value,language='en'){
 const paragraphs=visitorProse(value).split(/\n+/).map(s=>s.trim()).filter(Boolean)
 return typeof Intl.Segmenter==='function'?paragraphs.flatMap(p=>[...new Intl.Segmenter(language,{granularity:'sentence'}).segment(p)].map(s=>s.segment.trim()).filter(Boolean)):paragraphs
}
export function visitorDuration(min,max,language='en'){
 const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0
 if(!valid(min)&&!valid(max))return null
 const ar=language==='ar-JO',number=n=>new Intl.NumberFormat(ar?'ar-JO':'en-JO',{maximumFractionDigits:1}).format(n)
 const hours=['','ساعة واحدة','ساعتان','ثلاث ساعات','أربع ساعات','خمس ساعات','ست ساعات','سبع ساعات','ثماني ساعات','تسع ساعات','عشر ساعات']
 const part=(n,oblique=false)=>{
  const h=Math.floor(n/60),m=n%60,parts=[]
  if(h)parts.push(ar?(h===2&&oblique?'ساعتين':hours[h]||`${number(h)} ساعة`):`${number(h)} ${h===1?'hour':'hours'}`)
  if(m||!h)parts.push(ar?`${number(m)} دقيقة`:`${number(m)} ${m===1?'minute':'minutes'}`)
  return parts.join(ar?' و':' ')
 }
 if(valid(min)&&valid(max)){
  if(min===max)return part(min)
  if(!ar&&min%60===0&&max%60===0)return `${number(min/60)}–${number(max/60)} hours`
  if(!ar&&min<60&&max<60)return `${number(min)}–${number(max)} minutes`
  return `${part(min)}${ar?' إلى ':' – '}${part(max,true)}`
 }
 return valid(min)?`${ar?'من':'From'} ${part(min,true)}`:`${ar?'حتى':'Up to'} ${part(max,true)}`
}
const shortValue=value=>value.length<=72&&!/[\n\r]|https?:\/\//.test(value)
export function visitorInformation(place,language='en'){
 const details=place.details||{},live=place.mode==='supabase',cards=[],notes=[]
 const duration=visitorDuration(place.durationMin??place.durationMinutes?.[0],place.durationMax??place.durationMinutes?.[1],language)
 cards.push({id:'duration',title:'Visit Duration',icon:'clock',value:duration||(!live?place.durationLabel:null),support:duration?'Planning estimate':null})
 cards.push({id:'admission',title:'Admission Fee',icon:'ticket',value:live?(place.priceMin!=null||place.priceMax!=null?place.costLabel:null):place.costLabel||`${place.costJod} JD`})
 if(place.prototype){const p=place.prototype.planning;cards.push({id:'budget',title:'Day Budget',icon:'ticket',value:new Intl.NumberFormat(language).format(p.budgetMin)+'–'+new Intl.NumberFormat(language).format(p.budgetMax)+(language==='ar-JO'?' د.أ.':' JOD'),support:'Excludes intercity travel'});cards.push({id:'access',title:'Accessibility',icon:'route',value:p.accessibility[language==='ar-JO'?'ar':'en']})}
 const hours=visitorProse(details.openingHours),season=visitorProse(details.bestTime),transport=visitorProse(details.transportLabel),information=visitorProse(details.visitorInformation)
 cards.push({id:'hours',title:'Opening Hours',icon:'calendar',value:hours?(shortValue(hours)?hours:'See opening notes'):null,note:hours&&!shortValue(hours)?'hours':null})
 if(hours&&!shortValue(hours))notes.push({id:'hours',title:'Opening Hours',text:hours})
 if(season){cards.push({id:'season',title:'Best Time to Visit',icon:'sun',value:shortValue(season)?season:'See seasonal guidance',support:'Guidance; confirm current conditions',note:'season'});notes.push({id:'season',title:'Best Time to Visit',text:season})}
 if(transport){cards.push({id:'transport',title:'Getting There',icon:'route',value:shortValue(transport)?transport:'Plan your arrival',note:'transport'});notes.push({id:'transport',title:'Getting There',text:transport})}
 if(information)notes.push({id:'visitor',title:'Visitor information',text:information})
 return {cards,notes}
}

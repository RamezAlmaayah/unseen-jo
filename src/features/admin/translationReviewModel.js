// Review prompts are heuristics and editorial questions, never factual clearance.
export const translationFields = [
 ['name','Destination name',160], ['description','Description',20000],
 ['city','City',100], ['address','Location description',500],
 ['best_time_to_visit','Best time to visit',1000],
 ['transportation_notes','Transportation notes',2000],
 ['visitor_guidance','Visitor information and source cautions',6000],
]
export const reviewStatusLabels = {pending:'Pending Review',reviewed:'Approved',needs_changes:'Needs Changes'}
export const reviewText = value => String(value||'').replace(/\\n/g,'\n')
const prompts = {
 'ajloun-forest': ['description','Check that the wider UNESCO biosphere designation is distinct from the forest reserve, and that activities and access are not guaranteed.'],
 'salt-historic': ['visitor_guidance','Keep district access separate from individual museum tickets. The suggested visit duration is editorial advice.'],
 'wadi-mujib': ['visitor_guidance','Check trail names, resident eligibility, dated fees and the older minimum-age guidance. A listed season does not guarantee opening.'],
 'dana-reserve': ['visitor_guidance','Keep entry fees, guided packages and transfer costs distinct. Dana village, Wadi Dana and Feynan are different itineraries.'],
 'iraq-al-amir': ['description','Keep the wider area, Qasr El-Abd and the cooperative distinct. Ticket scope and accessibility remain uncertain.'],
 'umm-qais': ['visitor_guidance','Preserve the uncertainty about opening hours, ticket eligibility and museum inclusion. The original test image remains unapproved.'],
}
const numbers = s => (String(s||'').replace(/[٠-٩]/g,n=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(n))).replace(/\u066b/g,'.').replace(/\u066c/g,'').match(/\d+(?:[.,]\d+)?/g)||[]).sort()
export function translationFlags(place,form,source={}) {
 const flags=[]
 const add=(field,message)=>flags.push({field,message})
 for(const [key] of translationFields){
  const english=key==='visitor_guidance'?source.visitor_evidence:place[key],arabic=String(form[key]||'').trim()
  if(english&&!arabic)add(key,'Arabic is missing for an available English source field.')
  if(arabic&&!/[\u0600-\u06ff]/.test(arabic))add(key,'This field has no Arabic script. Check that it is translated.')
  if(english&&arabic&&['description','visitor_guidance'].includes(key)&&JSON.stringify(numbers(english))!==JSON.stringify(numbers(arabic)))add(key,'Numeric expressions differ. Check dates, fees, ages and durations; written-out numbers may explain the difference.')
 }
 if(form.source_updated_at&&new Date(form.source_updated_at).getTime()!==new Date(place.updated_at).getTime())add('description','The English source changed. Compare every Arabic field before submitting it again.')
 if(prompts[place.slug])add(...prompts[place.slug])
 return flags
}

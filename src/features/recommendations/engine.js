import {cityCenters,distanceKm,hasCoordinates} from '../map/geography.js'
import {isPlaceSlug} from '../tourism/model.js'

export const DEFAULT_WEIGHTS=Object.freeze({interest:40,time:20,budget:15,distance:15,suitability:10})
export function weightPercentages(weights=DEFAULT_WEIGHTS){const total=Object.keys(DEFAULT_WEIGHTS).reduce((sum,key)=>sum+weights[key],0);return Object.fromEntries(Object.keys(DEFAULT_WEIGHTS).map(key=>[key,Math.round(weights[key]*100/total)]))}
const finite=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0
const range=(min,max)=>finite(min)&&finite(max)&&max<min?{min:null,max:null}:{min:finite(min)?min:null,max:finite(max)?max:null}
const strictKeys=['interest','time','budget','location','transport','group']
export function normalizePreferences(input={},categories=[]){
 input=input&&typeof input==='object'?input:{}
 const allowed=new Set(categories.map(c=>c.slug)),interests=[...new Set((Array.isArray(input.interests)?input.interests:[]).filter(s=>allowed.has(s)))].sort()
 const number=value=>['string','number'].includes(typeof value)&&String(value).trim()!==''&&Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null
 const customBudget=number(input.totalBudget),customHours=number(input.hoursAvailable)
 const cap=customBudget??({free:0,'under-10':10,'10-30':30,'jod:20':20}[input.budget]??null)
 const minutes=customHours!=null?customHours*60:({'30-min':30,'2-hours':120,'4-hours':240,'half-day':240,'full-day':480}[input.availableTime]??null)
 // Existing attributed city references only; no geocoding or silent GPS access.
 const origin=cityCenters.find(c=>c.id===input.startingLocation)||null
 return {interests,budget:cap,budgetExclusive:customBudget==null&&input.budget==='under-10',minutes,origin,locationSelected:!!input.startingLocation,transport:['car','public','walking'].includes(input.transportation)?input.transportation:null,group:['solo','friends','family','couple'].includes(input.travelGroup)?input.travelGroup:null,strict:Object.fromEntries(strictKeys.map(k=>[k,input.strict?.[k]===true]))}
}
export function preferenceSignature(p){return JSON.stringify(p)}

// Accepts the existing public raw projection or its validated tourism model.
export function extractFeatures(p){
 p=p&&typeof p==='object'?p:{}
 const normalized=p.mode==='supabase'
 return {id:p.id,slug:p.slug,name:p.name,status:normalized&&p.status==null?'published':p.status,isDemo:normalized&&p.is_demo==null?false:p.is_demo,active:p.is_active!==false,
  categories:[...new Set((normalized?(Array.isArray(p.categoryIds)?p.categoryIds:[]):(Array.isArray(p.place_categories)?p.place_categories:[]).map(l=>l?.categories?.slug)).filter(s=>typeof s==='string'&&isPlaceSlug(s)))],
  duration:range(normalized?p.durationMin:p.duration_min_minutes,normalized?p.durationMax:p.duration_max_minutes),
  admission:range(normalized?p.priceMin:p.price_min_jod,normalized?p.priceMax:p.price_max_jod),
  latitude:p.latitude,longitude:p.longitude,groups:Array.isArray(normalized?p.groups:p.suitable_groups)?(normalized?p.groups:p.suitable_groups):[],
  // Current schema has no structured, verified total-trip costs or transport modes.
  privatePrototype:p.prototype?.visibility==='private',totalCost:p.prototype?.visibility==='private'?p.prototype.planning.budgetMax:null,transportModes:p.prototype?.visibility==='private'?p.prototype.planning.transportModes:null}
}
export function eligibility(f,p,{allowUnknown=false}={}){
 const failures=[],unknown=[]
 if(f.status!=='published'||f.isDemo!==false||!f.active||typeof f.id!=='string'||!f.id.trim()||typeof f.name!=='string'||!f.name.trim()||!isPlaceSlug(f.slug))failures.push('invalid')
 if(p.budget!=null&&f.admission.min!=null&&(p.budgetExclusive?f.admission.min>=p.budget:f.admission.min>p.budget))failures.push('budget_exceeded')
 if(p.minutes!=null&&f.duration.min!=null&&f.duration.min>p.minutes)failures.push('time_exceeded')
 if(p.strict.interest&&p.interests.length&&!p.interests.every(c=>f.categories.includes(c)))failures.push('interest_required')
 if(p.strict.location&&(!p.origin||!hasCoordinates(f)))failures.push('location_required')
 if(p.strict.time){if(p.minutes==null||f.duration.max==null)unknown.push('time_unknown');else if(f.duration.max>p.minutes)failures.push('time_exceeded')}
 if(p.strict.budget){if(p.budget==null||f.totalCost==null)unknown.push('total_unknown');else if(f.totalCost>p.budget)failures.push('budget_exceeded')}
 if(p.strict.transport&&(!p.transport||!f.transportModes?.includes(p.transport)))unknown.push('transport_unknown')
 if(p.strict.group&&(!p.group||!f.groups.includes(p.group)))unknown.push('group_unknown')
 return {eligible:!failures.length&&(allowUnknown||!unknown.length),failures:[...new Set(failures)],unknown}
}
export function scoreFeatures(f,p,weights=DEFAULT_WEIGHTS){
 if(Object.values(weights).some(w=>!finite(w))||Object.keys(DEFAULT_WEIGHTS).some(k=>!finite(weights[k]))||!Object.values(weights).some(w=>w>0))throw Error('Invalid recommendation weights.')
 const dimensions=[],add=(id,weight,active,quality=null,coverage=quality==null?0:1)=>{if(active&&weight>0)dimensions.push({id,weight,quality,coverage})}
 const matches=p.interests.filter(c=>f.categories.includes(c))
 add('interest',weights.interest,!!p.interests.length,f.categories.length?matches.length/p.interests.length:null)
 const durationKnown=f.duration.max!=null||f.duration.min!=null
 const time=durationKnown?(f.duration.max!=null?Math.min(1,p.minutes/Math.max(1,f.duration.max)):0.5):null
 add('time',weights.time,p.minutes!=null,time,f.duration.max==null&&durationKnown?0.5:time==null?0:1)
 const costKnown=f.admission.max!=null||f.admission.min!=null,max=f.admission.max
 const budget=costKnown?(max!=null?(p.budgetExclusive?max<p.budget:max<=p.budget)?1:Math.min(0.99,(p.budget||0)/Math.max(1,max)):0.5):null
 add('budget',weights.budget,p.budget!=null,budget,max==null&&costKnown?0.5:budget==null?0:1)
 const km=p.origin?distanceKm(p.origin,f):null
 add('distance',weights.distance,p.locationSelected,km==null?null:1/(1+km/50))
 add('transport',weights.suitability/2,!!p.transport,f.transportModes?.length?Number(f.transportModes.includes(p.transport)):null)
 add('group',weights.suitability/2,!!p.group,f.groups.includes(p.group)?1:null)
 const active=dimensions.reduce((s,d)=>s+d.weight,0),known=dimensions.reduce((s,d)=>s+d.weight*d.coverage,0),earned=dimensions.reduce((s,d)=>s+d.weight*d.coverage*(d.quality??0),0)
 const coverage=active?known/active:0,quality=known?earned/known:0
 return {score:Math.round(100*(active?earned/active:0)),coverage,quality,scoreSupported:coverage>=0.5&&dimensions.filter(d=>d.coverage>0).length>=2,dimensions,matches,distanceKm:km,weights}
}
export function explain(f,p,s){
 const reasons=[];const add=(id,key,values=[],fits=false)=>reasons.push({id,key,values,fits})
 if(p.interests.length)add('interest',s.matches.length?'Matches your interests: {{v0}}':'No recorded category matches your selected interests.',s.matches.length?[s.matches]:[],s.matches.length>0)
 else add('interest','No interests selected; ranking uses the other available preferences.')
 if(f.privatePrototype){
  add('prototype','Private prototype: operational values and suitability tags include synthetic planning data.')
  if(p.minutes!=null)add('time',f.duration.max<=p.minutes?'The prototype visit duration fits your available time.':'The prototype visit may need more time.',[],f.duration.max<=p.minutes)
  if(p.budget!=null)add('budget',f.totalCost<=p.budget?'The prototype day budget fits your amount; intercity travel is excluded.':'The prototype day budget may exceed your amount.',[],f.totalCost<=p.budget)
  if(s.distanceKm!=null)add('distance','Approximately {{v0}} km in a straight line from your selected city reference.',[Math.round(s.distanceKm)],true)
  if(p.transport)add('transport',f.transportModes.includes(p.transport)?'The prototype transport scenario matches your selection.':'The prototype transport scenario differs from your selection.',[],f.transportModes.includes(p.transport))
  if(p.group)add('group',f.groups.includes(p.group)?'The prototype group scenario matches your selection.':'Choose another group scenario for this activity.',[],f.groups.includes(p.group))
  return reasons
 }
 if(p.minutes!=null){if(f.duration.max!=null&&f.duration.max<=p.minutes)add('time','The estimated visit duration fits your available time.',[],true);else add('time',f.duration.min!=null||f.duration.max!=null?'Only part of the estimated visit range may fit your time.':'Visit duration is unavailable; time suitability is unconfirmed.')}
 if(p.budget!=null){const d=s.dimensions.find(d=>d.id==='budget');add('budget',d?.quality===1?'Recorded admission is within your amount; other trip costs are unknown.':f.admission.min==null&&f.admission.max==null?'Admission price is unavailable; budget suitability is unconfirmed.':'The admission range is incomplete or may exceed your amount.')}
 add('total','Your total trip cost cannot be verified from admission alone.')
 if(s.distanceKm!=null)add('distance','Approximately {{v0}} km in a straight line from your selected city reference.',[Math.round(s.distanceKm)],true)
 else if(p.locationSelected)add('distance','Distance is unavailable for this starting location.')
 add('arrival','Location pins are geographic references, not confirmed entrances. No route time is implied.')
 if(p.transport)add('transport','Transport suitability is unverified; check arrival arrangements.')
 if(p.group)add('group',f.groups.includes(p.group)?'The recorded group tag matches; check age, activity and access restrictions.':'Suitability for your travel group is unverified.',[],f.groups.includes(p.group))
 add('hours','Confirm opening hours, seasonal access and activity safety before departure.')
 return reasons
}
export function rankDestinations(rows,input,categories,options={}){
 const preferences=normalizePreferences(input,categories),ranked=[],relaxed=[],excluded={}
 for(const row of rows){const features=extractFeatures(row),check=eligibility(features,preferences),soft=eligibility(features,preferences,{allowUnknown:true});
  for(const key of [...check.failures,...check.unknown])excluded[key]=(excluded[key]||0)+1
  if(!check.eligible&&!soft.eligible)continue
  const scored=scoreFeatures(features,preferences,options.weights),item={id:features.id,slug:features.slug,features,...scored,reasons:explain(features,preferences,scored),uncertainRequirements:check.unknown}
  ;(check.eligible?ranked:relaxed).push(item)
 }
 const order=(a,b)=>b.score-a.score||b.coverage-a.coverage||a.slug.localeCompare(b.slug,'en')||a.id.localeCompare(b.id,'en')
 return {preferences,signature:preferenceSignature(preferences),ranked:ranked.sort(order),relaxed:relaxed.sort(order),excluded}
}
export function diversityPool(ranked){if(!ranked.length)return [];const best=ranked[0],interest=best.dimensions.find(d=>d.id==='interest')?.quality??0;return ranked.filter(r=>r.score>=best.score-8&&(r.dimensions.find(d=>d.id==='interest')?.quality??0)>=interest).slice(0,3)}
export function chooseRecommendation(ranked,history=[]){
 const pool=diversityPool(ranked);if(!pool.length)return null
 const last=history.at(-1),choices=pool.length>1?pool.filter(r=>r.id!==last):pool
 return [...choices].sort((a,b)=>history.filter(id=>id===a.id).length-history.filter(id=>id===b.id).length||ranked.indexOf(a)-ranked.indexOf(b))[0]
}

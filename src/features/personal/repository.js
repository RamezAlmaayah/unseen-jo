import {getUserClient} from '../account/client.js'
import {uuid} from '../account/model.js'
import {validVisitDate} from './model.js'
const checked=r=>{if(r.error)throw r.error;return r.data}
export async function loadVisits(user) {
 const client=await getUserClient(),rows=[]
 for(let start=0;;start+=500){const page=checked(await client.from('user_visited_places').select('place_id,visited_on,created_at').eq('user_id',user).order('place_id').range(start,start+499));rows.push(...page);if(page.length<500)return rows}
}
export async function saveVisit(user,place,date,remove=false){
 if(!uuid(place)||!validVisitDate(date))throw Error('Invalid visit.')
 const client=await getUserClient()
 // Repeated marks never overwrite a date. To change it, remove and mark the visit again.
 return checked(await (remove?client.from('user_visited_places').delete().eq('user_id',user).eq('place_id',place):client.from('user_visited_places').upsert({user_id:user,place_id:place,visited_on:date||null},{onConflict:'user_id,place_id',ignoreDuplicates:true})))
}
export async function loadHistory(user,cursor=null){
 const client=await getUserClient()
 let query=client.from('user_discovery_history').select('event_id,place_id,created_at').eq('user_id',user).order('created_at',{ascending:false}).order('event_id',{ascending:false}).limit(21)
 if(cursor)query=query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},event_id.lt.${cursor.event_id})`)
 const rows=checked(await query)
 return {rows:rows.slice(0,20),more:rows.length>20}
}
export async function recordDiscovery(user,event,place){
 if(!uuid(place)||!uuid(event))throw Error('Invalid recommendation.')
 const client=await getUserClient()
 checked(await client.from('user_discovery_history').upsert({user_id:user,event_id:event,place_id:place},{onConflict:'user_id,event_id',ignoreDuplicates:true}))
}
export async function deleteHistory(user){
 const client=await getUserClient();checked(await client.from('user_discovery_history').delete().eq('user_id',user))
}

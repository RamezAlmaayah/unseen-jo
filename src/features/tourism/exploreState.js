// Per-tab public view preferences only. Never store destination rows, Auth,
// administrator edits, GPS coordinates or a location permission decision.
const prefix='unseen-jo-public-view-v1:'
export function readExploreState(key){
 if(!key)return {}
 try{
  const raw=sessionStorage.getItem(prefix+key);if(!raw||raw.length>6000)return {}
  const value=JSON.parse(raw);if(value.version!==1)return {}
  const state={query:typeof value.query==='string'?value.query.slice(0,160):'',categories:Array.isArray(value.categories)?value.categories.filter(v=>typeof v==='string'&&/^[a-z0-9-]{1,80}$/.test(v)).slice(0,20):[],selectedId:typeof value.selectedId==='string'?value.selectedId.slice(0,80):null,view:value.view==='list'?'list':'map',scroll:Number.isFinite(value.scroll)?Math.max(0,Math.min(value.scroll,100000)):0}
  if(value.attributes&&typeof value.attributes==='object')state.attributes={city:typeof value.attributes.city==='string'?value.attributes.city.slice(0,100):'',group:['solo','couple','friends','family'].includes(value.attributes.group)?value.attributes.group:'',maxCost:Number.isFinite(value.attributes.maxCost)&&value.attributes.maxCost>=0?value.attributes.maxCost:null,maxMinutes:Number.isFinite(value.attributes.maxMinutes)&&value.attributes.maxMinutes>=0?value.attributes.maxMinutes:null}
  const c=value.camera
  if(c&&[c.latitude,c.longitude,c.zoom,c.bearing,c.pitch].every(Number.isFinite)&&Math.abs(c.latitude)<=85&&Math.abs(c.longitude)<=180&&c.zoom>=3&&c.zoom<=18&&c.pitch===0)state.camera=c
  return state
 }catch{return {}}
}
export function saveExploreState(key,patch){if(!key)return;try{sessionStorage.setItem(prefix+key,JSON.stringify({...readExploreState(key),...patch,version:1}))}catch{/* In-memory state remains usable with storage disabled. */}}

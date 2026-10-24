// Only an invalidation signal crosses tabs. No rows, user data or tokens.
let version=0,channel
const listeners=new Set()
const emit=()=>{version++;listeners.forEach(fn=>fn())}
function connect(){if(!channel&&typeof window!=='undefined'&&typeof BroadcastChannel!=='undefined'){channel=new BroadcastChannel('unseen-jo-public-catalog');channel.onmessage=e=>{if(e.data?.type==='invalidate')emit()}}}
export const catalogVersion=()=>version
export function subscribeCatalogChanges(fn){connect();listeners.add(fn);return()=>listeners.delete(fn)}
export function notifyPublicCatalogChange(){connect();emit();channel?.postMessage({type:'invalidate'})}

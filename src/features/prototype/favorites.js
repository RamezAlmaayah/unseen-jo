const listeners=new Set(),key=owner=>'unseen-jo-private-prototype-saves:'+owner
export const subscribePrivateSaves=fn=>{listeners.add(fn);const storage=()=>fn();globalThis.addEventListener?.('storage',storage);return()=>{listeners.delete(fn);globalThis.removeEventListener?.('storage',storage)}}
export function privateSavesSnapshot(owner){if(!owner)return '[]';try{const value=globalThis.localStorage?.getItem(key(owner));return value||'[]'}catch{return '[]'}}
export function privateSavedIds(snapshot){try{const values=JSON.parse(snapshot);return Array.isArray(values)?values.filter(v=>typeof v==='string'&&/^[a-f0-9-]{36}$/i.test(v)):[]}catch{return []}}
export function togglePrivateSave(owner,id){const ids=privateSavedIds(privateSavesSnapshot(owner)),next=ids.includes(id)?ids.filter(v=>v!==id):[...ids,id];globalThis.localStorage.setItem(key(owner),JSON.stringify(next));listeners.forEach(fn=>fn())}

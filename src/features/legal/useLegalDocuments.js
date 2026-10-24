import {useEffect,useState,useCallback} from 'react'
import {legalSource,canRegisterWithLegal} from './model.js'
import {readPublishedLegal,readRegistrationLegal} from './repository.js'
let channel
const listeners=new Set()
function connect(){if(!channel&&typeof BroadcastChannel!=='undefined'){channel=new BroadcastChannel('unseen-jo-legal-publication');channel.onmessage=e=>{if(e.data?.type==='refresh')listeners.forEach(fn=>fn())}}}
export function notifyLegalPublication(){connect();listeners.forEach(fn=>fn());channel?.postMessage({type:'refresh'})}
export function useLegalDocuments(key=null,enabled=true){
 const source=legalSource(import.meta.env),[attempt,setAttempt]=useState(0),[state,setState]=useState({status:'loading',documents:{},revision:null})
 const refresh=useCallback(()=>setAttempt(n=>n+1),[])
 useEffect(()=>{if(!enabled||source!=='supabase')return;connect();listeners.add(refresh);window.addEventListener('focus',refresh);const visible=()=>{if(!document.hidden)refresh()};document.addEventListener('visibilitychange',visible);return()=>{listeners.delete(refresh);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visible)}},[enabled,source,refresh])
 useEffect(()=>{if(!enabled||source!=='supabase')return;let active=true;const request=key?readPublishedLegal(key).then(revision=>({revision,documents:{}})):readRegistrationLegal().then(documents=>({documents,revision:null}));request.then(value=>{if(active)setState({...value,status:'ready',attempt,key})}).catch(()=>{if(active)setState({status:'error',documents:{},revision:null,attempt,key})});return()=>{active=false}},[source,key,enabled,attempt])
 return {source,...(source==='invalid'?{status:'error',documents:{},revision:null}:state.attempt===attempt&&state.key===key?state:{status:'loading',documents:{},revision:null}),refresh}
}
export async function requireRegistrationLegal(source){if(source==='static')return;if(source!=='supabase'||!canRegisterWithLegal(source,await readRegistrationLegal()))throw Error('Registration is paused until approved legal documents are available.')}

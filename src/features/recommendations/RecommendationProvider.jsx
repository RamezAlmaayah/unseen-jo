import {useCallback,useState} from 'react'
import {chooseRecommendation,diversityPool} from './engine.js'
import {RecommendationContext} from './context.js'
import {useUserAuth} from '../account/context.js'

// Diversity state remains in memory; presentation UUIDs deduplicate separate account history writes.
export default function RecommendationProvider({children}){
 const {user}=useUserAuth(),owner=user?.id||'guest'
 const [stored,setSession]=useState({owner,signature:'',selected:null,history:[]})
 const session=stored.owner===owner?stored:{signature:'',selected:null,history:[]}
 const select=useCallback((signature,ranked,again=false)=>{const eventId=crypto.randomUUID();setSession(previous=>{
  const current=previous.owner===owner?previous:{signature:'',selected:null,history:[]}
  const same=current.signature===signature
  if(same&&!again&&diversityPool(ranked).some(r=>r.id===current.selected))return current
  const history=same?current.history:[],next=chooseRecommendation(ranked,history)
  return {owner,signature,selected:next?.id||null,eventId,history:next?[...history,next.id].slice(-30):history}
 })},[owner])
 return <RecommendationContext.Provider value={{session,select}}>{children}</RecommendationContext.Provider>
}

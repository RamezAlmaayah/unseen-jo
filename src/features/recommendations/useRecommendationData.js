import {useCallback,useEffect,useState} from 'react'
import {getRepository,currentDataMode} from '../tourism/useTourism.js'
import {subscribeCatalogChanges} from '../tourism/catalogEvents.js'
async function liveRepository(){
 const state=currentDataMode()
 if(state.error)throw Error(state.error)
 if(state.mode!=='supabase')throw Error('Recommendations require the live Supabase data mode. Demo destinations are not ranked.')
 return getRepository()
}

export function useRecommendationData(onlyCategories=false){
 const [attempt,setAttempt]=useState(0),[data,setData]=useState({status:'loading',rows:[],categories:[]})
 useEffect(()=>subscribeCatalogChanges(()=>setAttempt(n=>n+1)),[])
 useEffect(()=>{let active=true;liveRepository().then(async repo=>{
  const [rows,categories]=await Promise.all([onlyCategories?[]:repo.fetchRecommendationCandidates(),repo.fetchCategories()])
  if(active)setData({status:'ready',rows,categories,privatePrototype:!!repo.privateOwner})
 }).catch(error=>{if(active)setData({status:'error',rows:[],categories:[],error:error.message})});return()=>{active=false}},[attempt,onlyCategories])
 const retry=useCallback(async()=>{setData({status:'loading',rows:[],categories:[]});try{(await liveRepository()).invalidate()}catch{/* load reports configuration errors */}setAttempt(n=>n+1)},[])
 const revalidate=useCallback(async()=>{
  try{const repo=await liveRepository(),[rows,categories]=await Promise.all([repo.fetchRecommendationCandidates(),repo.fetchCategories()]);setData(current=>current.rows===rows&&current.categories===categories?current:{status:'ready',rows,categories});return {rows,categories}}
  catch(error){setData({status:'error',rows:[],categories:[],error:error.message});return null}
 },[])
 return {...data,retry,revalidate}
}

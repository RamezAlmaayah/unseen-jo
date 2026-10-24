import {useCallback,useEffect,useRef,useState} from 'react'
import {useUserAuth} from '../account/context.js'
import {PersonalContext} from './context.js'
import {loadVisits,saveVisit,loadHistory,recordDiscovery,deleteHistory} from './repository.js'
import {personalError} from './model.js'
const empty=id=>({id,visits:[],visitsStatus:'idle',history:[],historyStatus:'idle',more:false,error:'',notice:'',recordError:false,pending:[]})

export default function PersonalDiscoveriesProvider({children}){
 const {user}=useUserAuth(),id=user?.id||null
 // Mask old data immediately while keeping public routes and Auth callbacks mounted.
 const [state,setState]=useState(()=>empty(id))
 const registry=useRef(new Map())
 const getScope=useCallback(()=>{if(!registry.current.has(id))registry.current.set(id,{id,active:true,operations:new Map(),recorded:new Set(),attempted:new Set()});return registry.current.get(id)},[id])
 const active=state.id===id?state:empty(id)
 useEffect(()=>{const scope=getScope();scope.active=true;const cache=registry.current;queueMicrotask(()=>{if(scope.active)setState(previous=>previous.id===id?previous:empty(id))});return()=>{scope.active=false;cache.delete(id)}},[getScope,id])
 const update=useCallback((owner,fn)=>{if(owner.active)setState(previous=>owner.active?fn(previous.id===owner.id?previous:empty(owner.id)):previous)},[])
 const visits=useCallback((force=false)=>{
  const scope=getScope();if(!id||!scope.active)return Promise.resolve()
  if(scope.operations.has('visits'))return scope.operations.get('visits')
  if(scope.visitsLoaded&&!force)return Promise.resolve()
  update(scope,s=>({...s,visitsStatus:s.visitsStatus==='ready'?'ready':'loading',error:'',pending:[...s.pending,'visits']}))
  const op=loadVisits(id).then(rows=>{scope.visitsLoaded=true;update(scope,s=>({...s,visits:rows,visitsStatus:'ready'}))}).catch(()=>update(scope,s=>({...s,visitsStatus:scope.visitsLoaded?'ready':'error',error:personalError}))).finally(()=>{scope.operations.delete('visits');update(scope,s=>({...s,pending:s.pending.filter(v=>v!=='visits')}))})
  scope.operations.set('visits',op);return op
 },[id,getScope,update])
 const history=useCallback((cursor=null,force=false)=>{
  const scope=getScope();if(!id||!scope.active)return Promise.resolve()
  if(scope.operations.has('history'))return scope.operations.get('history')
  if(scope.historyLoaded&&!force&&!cursor)return Promise.resolve()
  const revision=scope.historyRevision||0
  update(scope,s=>({...s,historyStatus:s.historyStatus==='ready'?'ready':'loading',error:'',pending:[...s.pending,'history']}))
  const op=loadHistory(id,cursor).then(page=>{if(revision!==(scope.historyRevision||0))return;scope.historyLoaded=true;update(scope,s=>({...s,history:cursor?[...new Map([...s.history,...page.rows].map(r=>[r.event_id,r])).values()]:page.rows,more:page.more,historyStatus:'ready'}))}).catch(()=>update(scope,s=>({...s,historyStatus:scope.historyLoaded?'ready':'error',error:personalError}))).finally(()=>{scope.operations.delete('history');update(scope,s=>({...s,pending:s.pending.filter(v=>v!=='history')}))})
  scope.operations.set('history',op);return op
 },[id,getScope,update])
 const markVisit=useCallback(async(place,date='',remove=false)=>{
  const scope=getScope(),key='visit:'+place;if(!scope.active||!id||scope.operations.has(key))return false
  const op=(async()=>{update(scope,s=>({...s,error:'',notice:'',pending:[...s.pending,key]}));try{
   await saveVisit(id,place,date,remove)
   update(scope,s=>({...s,visits:remove?s.visits.filter(v=>v.place_id!==place):s.visits.some(v=>v.place_id===place)?s.visits:[{place_id:place,visited_on:date||null,created_at:new Date().toISOString()},...s.visits],notice:remove?'Visited status removed.':'Visit saved. Visits are self-reported.'}));return scope.active
  }catch{update(scope,s=>({...s,error:personalError}));return false}finally{scope.operations.delete(key);update(scope,s=>({...s,pending:s.pending.filter(v=>v!==key)}))}})()
  scope.operations.set(key,op);return op
 },[id,getScope,update])
 const record=useCallback((event,place)=>{
  const scope=getScope(),key='record:'+event;if(!scope.active||!id||!event||scope.recorded.has(event))return Promise.resolve()
  if(scope.operations.has(key))return scope.operations.get(key)
  scope.attempted.add(event)
  const op=recordDiscovery(id,event,place).then(()=>{scope.recorded.add(event);scope.historyLoaded=false;scope.historyRevision=(scope.historyRevision||0)+1;update(scope,s=>({...s,history:[],historyStatus:'idle',recordError:false}))}).catch(()=>update(scope,s=>({...s,recordError:true}))).finally(()=>scope.operations.delete(key))
  scope.operations.set(key,op);return op
 },[id,getScope,update])
 const clear=useCallback(async()=>{
  const scope=getScope();if(!scope.active||!id||scope.operations.has('clear'))return false
  const op=(async()=>{update(scope,s=>({...s,pending:[...s.pending,'clear'],error:'',notice:''}));try{
   // Finish writes before clearing so an already-presented recommendation cannot reappear.
   await Promise.all([...scope.operations].filter(([k])=>k.startsWith('record:')).map(([,p])=>p));await deleteHistory(id)
   for(const event of scope.attempted)scope.recorded.add(event)
   scope.historyRevision=(scope.historyRevision||0)+1;scope.historyLoaded=true
   update(scope,s=>({...s,history:[],historyStatus:'ready',more:false,notice:'Discovery history cleared.'}));return scope.active
  }catch{update(scope,s=>({...s,error:personalError}));return false}finally{scope.operations.delete('clear');update(scope,s=>({...s,pending:s.pending.filter(v=>v!=='clear')}))}})()
  scope.operations.set('clear',op);return op
 },[id,getScope,update])
 return <PersonalContext.Provider value={{...active,loadVisits:visits,loadHistory:history,markVisit,record,clear}}>{children}</PersonalContext.Provider>
}

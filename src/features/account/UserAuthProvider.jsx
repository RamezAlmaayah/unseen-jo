import {useCallback,useEffect,useRef,useState} from 'react'
import {getUserClient} from './client.js'
import {AuthContext} from './context.js'
import {accountError} from './model.js'

export default function UserAuthProvider({children}){
 const [state,setState]=useState({status:'restoring',user:null,error:''})
 const identity=useRef(null),epoch=useRef(0),mounted=useRef(false)
 const verify=useCallback(async(session)=>{
  const id=session?.user?.id||null
  if(id&&identity.current===id)return
  const turn=++epoch.current;identity.current=null
  setState({status:id?'restoring':'guest',user:null,error:''})
  if(!id)return
  try{
   const client=await getUserClient(),{data,error}=await client.auth.getUser()
   if(turn!==epoch.current||!mounted.current)return
   if(error||!data.user)throw error||Error('No verified session')
   identity.current=data.user.id;setState({status:'authenticated',user:data.user,error:''})
  }catch(error){if(turn===epoch.current&&mounted.current)setState({status:'error',user:null,error:accountError(error)})}
 },[])
 useEffect(()=>{
  mounted.current=true;let subscription,disposed=false
  getUserClient().then(async client=>{
   if(disposed)return
   subscription=client.auth.onAuthStateChange((event,session)=>{
    if(event==='INITIAL_SESSION')return
    // Never await Supabase methods inside its auth lock callback.
    if(event==='SIGNED_OUT'){identity.current=null;++epoch.current;setState({status:'guest',user:null,error:''})}
    else if(event==='USER_UPDATED'&&identity.current===session?.user?.id)setState({status:'authenticated',user:session.user,error:''})
    else queueMicrotask(()=>{if(!disposed)void verify(session)})
   }).data.subscription
   const {data,error}=await client.auth.getSession()
   if(!disposed){if(error)throw error;await verify(data.session)}
  }).catch(error=>{if(!disposed)setState({status:'error',user:null,error:accountError(error)})})
  // These are lifecycle/identity guards, not DOM refs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return ()=>{disposed=true;mounted.current=false;++epoch.current;identity.current=null;subscription?.unsubscribe()}
 },[verify])
 const signOut=useCallback(async()=>{const client=await getUserClient();const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;identity.current=null;++epoch.current;setState({status:'guest',user:null,error:''})},[])
 return <AuthContext.Provider value={{...state,signOut}}>{children}</AuthContext.Provider>
}

// Same-user revalidation never tears down the editor. Identity changes and
// failed permission checks still clear private UI; no private cache is shared.
export function createAdminAccessController(client,{now=Date.now,cooldown=30000}={}) {
 let snapshot={access:client?'checking':'unconfigured',user:null},identity=null,generation=0,inFlight=null,lastVerified=-Infinity,disposed=false
 const listeners=new Set()
 const publish=(access,user=null)=>{
  if(snapshot.access===access&&snapshot.user?.id===user?.id&&snapshot.user?.email===user?.email)return
  snapshot={access,user};listeners.forEach(fn=>fn())
 }
 function clear(access='signedout'){generation++;identity=null;inFlight=null;lastVerified=-Infinity;publish(access)}
 function verify({force=false}={}){
  if(!client||disposed)return Promise.resolve(snapshot)
  if(inFlight)return inFlight
  if(!force&&snapshot.access==='allowed'&&now()-lastVerified<cooldown)return Promise.resolve(snapshot)
  const epoch=generation
  const request=(async()=>{
   try{
    const {data,error}=await client.auth.getUser()
    if(disposed||epoch!==generation)return snapshot
    if(error||!data.user){clear('signedout');return snapshot}
    if(identity&&identity!==data.user.id)publish('checking')
    identity=data.user.id
    const user=data.user,permission=await client.rpc('admin_cms_status')
    if(disposed||epoch!==generation||identity!==user.id)return snapshot
    lastVerified=now();publish(permission.error?'denied':'allowed',permission.error?null:user)
   }catch{if(!disposed&&epoch===generation){lastVerified=-Infinity;publish('denied')}}
   return snapshot
  })()
  inFlight=request
  void request.finally(()=>{if(inFlight===request)inFlight=null})
  return request
 }
 function authChanged(event,session){
  if(disposed)return
  if(event==='SIGNED_OUT'||!session?.user){clear();return}
  if(identity!==session.user.id){generation++;identity=session.user.id;inFlight=null;lastVerified=-Infinity;publish('checking')}
  // Supabase may emit SIGNED_IN again on visibility recovery. Never call Auth
  // methods inside its callback/lock, and coalesce focus/auth/interval checks.
  queueMicrotask(()=>{if(!disposed)void verify()})
 }
 return {getSnapshot:()=>snapshot,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)},verify,authChanged,
  start:()=>{
   disposed=false
   const subscription=client?.auth.onAuthStateChange(authChanged).data.subscription
   const focus=()=>{void verify()},timer=setInterval(()=>{void verify({force:true})},60000)
   if(typeof window!=='undefined')window.addEventListener('focus',focus)
   void verify()
   return()=>{disposed=true;generation++;inFlight=null;subscription?.unsubscribe();clearInterval(timer);if(typeof window!=='undefined')window.removeEventListener('focus',focus)}
  },
 }
}

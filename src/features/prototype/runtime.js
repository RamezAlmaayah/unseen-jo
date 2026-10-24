import {notifyPublicCatalogChange} from '../tourism/catalogEvents.js'
export const prototypeBuild=()=>import.meta.env?.DEV&&import.meta.env.VITE_PRIVATE_PROTOTYPE==='true'&&typeof location!=='undefined'&&['127.0.0.1','localhost','[::1]'].includes(location.hostname)
let activeOwner=null,checkedAt=0,clientPromise,subscription,request,generation=0
export const prototypeOwner=()=>activeOwner
export const prototypeActive=()=>prototypeBuild()&&!!activeOwner
export async function prototypeAccess(){
 if(!prototypeBuild())return null
 const client=await (clientPromise??=import('../admin/client.js').then(m=>m.getAdminClient()))
 if(!subscription)subscription=client.auth.onAuthStateChange((event,session)=>{
  if(event==='SIGNED_OUT'||activeOwner&&session?.user?.id!==activeOwner){generation++;activeOwner=null;checkedAt=0;request=null;notifyPublicCatalogChange()}
 }).data.subscription
 if(activeOwner&&Date.now()-checkedAt<30000)return {client,owner:activeOwner}
 if(request)return request
 const ticket=generation
 request=(async()=>{
  const {data}=await client.auth.getSession();if(!data.session){activeOwner=null;return null}
  const user=await client.auth.getUser();if(user.error||!user.data.user?.email_confirmed_at){activeOwner=null;return null}
  const access=await client.rpc('admin_cms_status');if(access.error){activeOwner=null;return null}
  if(ticket!==generation)return null
  const changed=activeOwner!==user.data.user.id;activeOwner=user.data.user.id;checkedAt=Date.now();if(changed)notifyPublicCatalogChange();return {client,owner:activeOwner}
 })().finally(()=>{request=null})
 return request
}

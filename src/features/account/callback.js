import {safeReturn} from './model.js'
const pending=new WeakMap()
// Callback credentials are consumed once (including React StrictMode), then scrubbed.
export function consumeUserCallback(client,href,replace){
 if(pending.get(client)?.href===href)return pending.get(client).operation
 const operation=(async()=>{
  const url=new URL(href),hash=new URLSearchParams(url.hash.slice(1)),type=url.searchParams.get('type')||hash.get('type')
  // Preserve the optional SDK flow selector before removing callback credentials.
  // Otherwise overlapping PKCE flows could read the wrong legacy verifier.
  const flowId=url.searchParams.get('sb_flow_id')
  const returnTo=safeReturn(url.searchParams.get('returnTo'))
  replace('/auth/callback')
  if(url.searchParams.has('error')||hash.has('error')){
   const code=url.searchParams.get('error_code')||hash.get('error_code')
   throw {code:code==='otp_expired'?'otp_expired':(url.searchParams.get('error')||hash.get('error'))==='access_denied'?'access_denied':'invalid_callback'}
  }
  let result
  if(url.searchParams.has('code'))result=await client.auth.exchangeCodeForSession(url.searchParams.get('code'),flowId?{flowId}:undefined)
  else if(url.searchParams.has('token_hash')&&['signup','email','magiclink','recovery','email_change'].includes(type))result=await client.auth.verifyOtp({token_hash:url.searchParams.get('token_hash'),type})
  else if(hash.has('access_token')&&hash.has('refresh_token')&&['signup','magiclink','recovery','email_change'].includes(type))result=await client.auth.setSession({access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token')})
  else if(!url.search&&!url.hash){
   const {data}=await client.auth.getSession()
   if(data?.session){const verified=await client.auth.getUser();if(!verified.error&&verified.data.user?.email_confirmed_at)return {status:'already_signed_in',returnTo}}
   return {status:'no_link',returnTo}
  }else throw {code:'invalid_callback'}
  if(result.error?.code==='pkce_code_verifier_not_found')return {status:'signin_required',returnTo,recovery:type==='recovery'||url.searchParams.get('flow')==='recovery'}
  if(result.error)throw result.error
  const {data,error}=await client.auth.getUser()
  if(error||!data.user?.email_confirmed_at)throw error||{code:'email_not_confirmed'}
  return {status:'verified',recovery:type==='recovery'||result.data?.redirectType==='recovery',returnTo}
 })()
 pending.set(client,{href,operation});return operation
}

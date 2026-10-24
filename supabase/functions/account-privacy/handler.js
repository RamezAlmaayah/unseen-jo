// Pure handler with injected clients for isolated security tests. Never logs request bodies.
export function privacyHandler({createClient,url,key,serviceKey,origins}){
 return async request=>{
  const origin=request.headers.get('origin'),headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'}
  if(origin&&!origins.includes(origin))return new Response('{}',{status:403,headers})
  if(origin)headers['Access-Control-Allow-Origin']=origin
  headers['Access-Control-Allow-Headers']='authorization, apikey, content-type, x-client-info'
  headers['Access-Control-Allow-Methods']='POST, OPTIONS'
  const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers})
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers})
  if(request.method!=='POST')return reply(405,{code:'method'})
  try{
   const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]
   if(!token)return reply(401,{code:'session'})
   const opts={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}},client=createClient(url,key,opts)
   const {data,error}=await client.auth.getUser(token)
   if(error||!data?.user?.email)return reply(401,{code:'session'})
   const reader=request.body?.getReader();if(!reader)return reply(400,{code:'invalid'})
   const chunks=[];let size=0
   for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();return reply(413,{code:'invalid'})}chunks.push(value)}
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
   let input;try{input=JSON.parse(new TextDecoder().decode(bytes))}catch{return reply(400,{code:'invalid'})}
   if(!input||Array.isArray(input)||typeof input!=='object')return reply(400,{code:'invalid'})
   if(Object.keys(input).some(k=>!['password','confirm'].includes(k))||input.confirm!==true||typeof input.password!=='string'||!input.password||input.password.length>128)return reply(400,{code:'invalid'})
   // Reauthentication verifies the known account, never an email/ID supplied by the browser.
   // Fail closed for MFA until a complete factor challenge is supported here.
   if(data.user.factors?.some(f=>f.status==='verified'))return reply(403,{code:'manual_identity'})
   const fresh=await client.auth.signInWithPassword({email:data.user.email,password:input.password})
   try{
    if(fresh.error||fresh.data?.user?.id!==data.user.id)return reply(403,{code:'identity'})
    const admin=createClient(url,serviceKey,opts),r=await admin.rpc('uj_request_account_deletion',{target:data.user.id})
    if(r.error||!r.data?.id)return reply(503,{code:'unavailable'})
    return reply(200,{request:r.data})
   }finally{await client.auth.signOut({scope:'local'}).catch(()=>{})}
  }catch{return reply(503,{code:'unavailable'})}
 }
}

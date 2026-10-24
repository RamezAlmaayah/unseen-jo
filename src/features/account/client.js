import {readSupabaseConfig} from '../../lib/supabase/config.js'
let promise
// Public tourism stays anonymous; the established Admin session remains independent.
export function getUserClient(){
 return promise??=import('@supabase/supabase-js').then(({createClient})=>{
  const config=readSupabaseConfig(import.meta.env)
  if(!config)throw Error('Account service is unavailable.')
  return createClient(config.url,config.publishableKey,{auth:{storageKey:'unseen-jo-user-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,flowType:'pkce'}})
 })
}

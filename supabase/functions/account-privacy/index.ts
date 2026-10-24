import {createClient} from 'npm:@supabase/supabase-js@2.118.0'
import {privacyHandler} from './handler.js'
const required=(name:string)=>{const value=Deno.env.get(name);if(!value)throw Error('Missing server configuration');return value}
Deno.serve(privacyHandler({createClient,url:required('SUPABASE_URL'),key:required('SUPABASE_ANON_KEY'),serviceKey:required('SUPABASE_SERVICE_ROLE_KEY'),origins:required('PRIVACY_ALLOWED_ORIGINS').split(',').map(v=>v.trim()).filter(Boolean)}))

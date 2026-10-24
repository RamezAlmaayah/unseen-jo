import {readSupabaseConfig} from '../src/lib/supabase/config.js'
import {productionOrigin} from '../src/seo/model.js'

export const NETLIFY_SAFETY_ENV=Object.freeze({
 VITE_DATA_MODE:'supabase',VITE_PRIVATE_PROTOTYPE:'false',
 VITE_PRIVACY_QA:'false',VITE_LEGAL_CONTENT_SOURCE:'static',
 VITE_MAP_STYLE_URL:'/maps/unseen-nature.json',
})
const allowed=new Set([...Object.keys(NETLIFY_SAFETY_ENV),'VITE_SITE_URL','VITE_SUPABASE_URL','VITE_SUPABASE_PUBLISHABLE_KEY'])
export function netlifyConfig(env){
 // Some existing components read import.meta.env as an object. Reject unknown
 // public variables rather than accidentally shipping a misnamed private key.
 if(Object.keys(env).some(k=>k.startsWith('VITE_')&&!allowed.has(k)))throw Error('Unknown VITE_ variable. Review the public environment allowlist before building.')
 const effective={...env,...NETLIFY_SAFETY_ENV},config=readSupabaseConfig(effective)
 if(!config||config.url!=='https://dkhwwvoplhfjccvjegty.supabase.co')throw Error('Netlify build requires the existing Unseen Jo project and its publishable key.')
 return {effective,origin:productionOrigin(effective.VITE_SITE_URL||'')}
}

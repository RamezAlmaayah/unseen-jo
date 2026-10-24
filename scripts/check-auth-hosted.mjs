// Read-only genuine hosted checks. No signup, recovery send, password update or email.
import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
const e=loadEnv('production',process.cwd(),'VITE_'),url=e.VITE_SUPABASE_URL
assert.equal(url,'https://dkhwwvoplhfjccvjegty.supabase.co')
const response=await fetch(url+'/auth/v1/settings',{headers:{apikey:e.VITE_SUPABASE_PUBLISHABLE_KEY}});assert.equal(response.status,200)
const settings=await response.json();assert.equal(settings.external.email,true);assert.equal(settings.mailer_autoconfirm,false)
const client=createClient(url,e.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
const denied=await client.rpc('admin_cms_status');assert.equal(denied.error?.code,'42501')
const logoUrl=url+'/storage/v1/object/public/brand-assets/unseen-jo-email-logo-v1.png',logo=await fetch(logoUrl)
await writeFile('docs/validation/auth-hosted-inspection.json',JSON.stringify({at:new Date().toISOString(),scope:'Read-only actual Supabase settings, anonymous Admin RPC denial, public branding URL request',project:'dkhwwvoplhfjccvjegty',emailEnabled:settings.external.email,signupEnabled:!settings.disable_signup,confirmationRequired:!settings.mailer_autoconfirm,enabledSocialProviders:Object.keys(settings.external).filter(k=>!['email','phone','anonymous_users'].includes(k)&&settings.external[k]),anonymousAdminDenied:denied.error.code,hostedTemplateReadAvailable:false,hostedTemplatesUpdated:false,logoUrl,logoHttpStatus:logo.status,logoVisible:logo.ok,realEmailDeliveryTested:false},null,2)+'\n')
console.log(`PASS hosted email/signup settings and Admin guard; public branding logo status ${logo.status} (upload pending)`)

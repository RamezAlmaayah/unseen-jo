import { createClient } from '@supabase/supabase-js'
import { readSupabaseConfig } from '../../lib/supabase/config.js'
let client
// Separate session/storage key: public tourism requests always remain anonymous.
export function getAdminClient() {
  const config = readSupabaseConfig(import.meta.env)
  if (!config) throw new Error('Supabase public configuration is missing.')
  return client ??= createClient(config.url, config.publishableKey, {
    // Dedicated callback pages consume invitation fragments and PKCE recovery codes
    // explicitly, before checking roles. Keep PKCE for app-initiated recovery.
    auth: { storageKey: 'unseen-jo-admin-auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' },
  })
}

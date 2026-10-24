import { createClient } from '@supabase/supabase-js'
import { readSupabaseConfig } from './config.js'

let client

// Public data only. No persistent user session is enabled in Phase 02B.
export function getSupabaseClient() {
  const config = readSupabaseConfig(import.meta.env)
  if (!config) return null
  client ??= createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return client
}

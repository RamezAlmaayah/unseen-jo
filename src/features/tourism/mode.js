import { readSupabaseConfig } from '../../lib/supabase/config.js'

// Auto never falls back after a failed request or an empty live response.
export function resolveDataMode(env = {}) {
  const requested = env.VITE_DATA_MODE?.trim() || (env.PROD ? 'supabase' : 'auto')
  if (!['demo', 'supabase', 'auto'].includes(requested)) throw new Error('VITE_DATA_MODE must be demo, supabase or auto.')
  if (requested === 'demo') return 'demo'
  const configured = readSupabaseConfig(env)
  if (requested === 'supabase' || env.PROD) {
    if (!configured) throw new Error('Public tourism data is not configured. Both public Supabase settings are required.')
    return 'supabase'
  }
  return configured ? 'supabase' : 'demo'
}

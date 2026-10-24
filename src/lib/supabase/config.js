// Kept separate from application data/state until the approved integration phase.
export function readSupabaseConfig(env = {}) {
  const url = (env.VITE_SUPABASE_URL ?? '').trim()
  const publishableKey = (env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim()
  if (!url && !publishableKey) return null
  if (!url || !publishableKey) throw new Error('Both public Supabase settings are required.')
  const parsed = new URL(url)
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
  if (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) {
    throw new Error('Supabase requires HTTPS outside local development.')
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') {
    throw new Error('Use the Supabase project API origin without credentials or a path.')
  }
  // Only modern publishable keys are accepted, not legacy JWT/service-role keys.
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey)) {
    throw new Error('Use a browser-safe Supabase publishable key, never a secret or service-role key.')
  }
  return { url: parsed.origin, publishableKey }
}

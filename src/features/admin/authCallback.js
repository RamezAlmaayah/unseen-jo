// One-time callback exchange shared across React StrictMode effect replays.
// Only the Supabase Auth server validates these credentials; URL claims confer no role.
const callbacks = new WeakMap()
export function acceptAuthCallback(client, href, replaceUrl) {
  const previous = callbacks.get(client)
  if (previous?.href === href) return previous.promise
  const promise = consume(client, href, replaceUrl)
  callbacks.set(client, { href, promise })
  return promise
}

async function consume(client, href, replaceUrl) {
  const url = new URL(href)
  const params = new URLSearchParams(url.search)
  const fragment = new URLSearchParams(url.hash.slice(1))
  // Remove callback credentials/errors from history before network requests or UI updates.
  replaceUrl(url.pathname)
  const type = url.pathname === '/admin/accept-invite' ? 'invite' : 'recovery'
  const failure = () => new Error('This link is invalid, expired, or already used. Request a fresh invitation or recovery email.')
  if (params.has('error') || fragment.has('error') || params.has('error_code') || fragment.has('error_code')) throw failure()
  let response
  if (fragment.has('access_token') || fragment.has('refresh_token')) {
    if (!fragment.get('access_token') || !fragment.get('refresh_token') || fragment.get('type') !== type) throw failure()
    response = await client.auth.setSession({ access_token: fragment.get('access_token'), refresh_token: fragment.get('refresh_token') })
  } else if (params.has('token_hash')) {
    if (params.get('type') !== type || !params.get('token_hash')) throw failure()
    response = await client.auth.verifyOtp({ token_hash: params.get('token_hash'), type })
  } else if (params.has('code')) {
    // App-initiated recovery uses the verifier stored in the same browser.
    if (type !== 'recovery' || !params.get('code')) throw failure()
    const flowId=params.get('sb_flow_id')
    response = await client.auth.exchangeCodeForSession(params.get('code'),flowId?{flowId}:undefined)
  }
  if (response && (response.error || !response.data.session)) {
    if(['pkce_code_verifier_not_found','bad_code_verifier'].includes(response.error?.code))throw new Error('Password recovery must finish in the browser where it was requested. You can request a fresh reset link here.')
    throw failure()
  }
  const { data, error } = await client.auth.getUser()
  if (error || !data.user?.email_confirmed_at) throw failure()
  // Existing verified sessions may resume password setup after a page refresh.
  // Auth still authorizes updateUser; this does not authorize any CMS operation.
  return { id: data.user.id, email: data.user.email }
}

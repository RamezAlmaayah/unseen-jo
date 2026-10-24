import {tx} from '../../i18n/index.js'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { getAdminClient } from './client'
import { acceptAuthCallback } from './authCallback'
import {AuthFeedback,AuthFrame,AuthNotice} from '../account/AuthPresentation.jsx'
import FormField from '../../components/ui/FormField.jsx'
import Button from '../../components/ui/Button.jsx'
import {validateAuth} from '../account/model.js'

export default function AdminAuthCallback() {
  const [client] = useState(() => { try { return getAdminClient() } catch { return null } })
  const [href] = useState(() => window.location.href)
  const [state,setState] = useState({ loading:true })
  const [password,setPassword] = useState(''), [confirmation,setConfirmation] = useState('')
  const [busy,setBusy] = useState(false), [error,setError] = useState(''), [saved,setSaved] = useState(false)
  const locked=useRef(false),form=useRef(null),[errors,setErrors]=useState({})
  useEffect(() => {
    let active = true
    const verify = async () => {
      if (!client) throw new Error('Supabase configuration is missing. Contact the project owner.')
      return acceptAuthCallback(client,href,path => window.history.replaceState(window.history.state,'',path))
    }
    verify().then(user => { if(active) setState({user}) }).catch(() => { if(active) setState({error:'This link is invalid, expired, or already used. Request a fresh invitation or recovery email.'}) })
    return () => { active=false }
  }, [client,href])
  async function submit(event) {
    event.preventDefault();if(locked.current)return;setError('')
    if(!saved){const validation=validateAuth({password,confirm:confirmation},'reset');setErrors(validation);if(Object.keys(validation).length){requestAnimationFrame(()=>form.current?.querySelector('[aria-invalid="true"]')?.focus());return}}
    locked.current=true
    setBusy(true)
    try {
      if (!saved) {
        const verified = await client.auth.getUser()
        if(verified.error || verified.data.user?.id !== state.user.id || !verified.data.user?.email_confirmed_at) throw new Error('Your verified session has expired. Open a fresh email link.')
        const {error: updateError} = await client.auth.updateUser({password})
        if(updateError) throw new Error('Password could not be saved. Check the project’s password requirements or request a fresh link and try again.')
        setPassword('');setConfirmation('');setSaved(true)
      }
      const {error: signOutError} = await client.auth.signOut({scope:'local'})
      if(signOutError) throw new Error('Password saved, but sign-out failed. Retry sign-out before signing in.')
      setState({done:true})
    } catch(e) { setError(e.message) } finally { locked.current=false;setBusy(false) }
  }
  return <AuthFrame admin label="Account setup"><p className="account-eyebrow">{tx('Administration')}</p><h1>{tx(state.done?'Password saved':window.location.pathname==='/admin/accept-invite'?'Set your password':'Create a new password.')}</h1>
    {state.loading?<AuthNotice kind="loading"><p role="status">{tx('Verifying your email link and session\u2026')}</p></AuthNotice>:state.error?<><AuthFeedback error>{tx(state.error)}</AuthFeedback><p className="auth-session-note">{tx('Open the reset link in this same browser profile and use the same site address.')}</p><div className="auth-link-actions"><Link to="/admin/login">{tx('Return to sign in')}</Link></div></>:state.done?<><AuthNotice kind="success"><p role="status">{tx('Your password was updated.')}</p><p>{tx('You are signed out. Sign in with your email and new password. Administrator access requires a separately approved role assignment.')}</p></AuthNotice><div className="auth-link-actions"><Link className="button button--primary" to="/admin/login">{tx('Sign in')}</Link></div></>:<><p className="auth-description">{tx('Choose your password privately. Setting a password does not grant administrator access.')}</p><p className="auth-session-note">{tx('Verified account: ')}<bdi dir="ltr">{state.user.email}</bdi></p><AuthFeedback error>{tx(error)}</AuthFeedback><form ref={form} noValidate onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>{!saved&&<><FormField label="New password" name="password" type="password" autoComplete="new-password" required maxLength={128} value={password} onChange={e=>{setPassword(e.target.value);setErrors(v=>({...v,password:undefined}))}} error={errors.password} hint="Use at least 12 characters, including a letter and a number."/><FormField label="Confirm password" name="confirm-password" type="password" autoComplete="new-password" required maxLength={128} value={confirmation} onChange={e=>{setConfirmation(e.target.value);setErrors(v=>({...v,confirm:undefined}))}} error={errors.confirm}/></>}<Button type="submit" className="auth-submit" disabled={busy}>{tx(busy?'Please wait\u2026':saved?'Retry sign-out':'Save password and sign out')}</Button></fieldset></form></>}
  </AuthFrame>
}

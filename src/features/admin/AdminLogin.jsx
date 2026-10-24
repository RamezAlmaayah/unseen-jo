import {useRef,useState} from 'react'
import {LoaderCircle,LockKeyhole} from 'lucide-react'
import FormField from '../../components/ui/FormField.jsx'
import Button from '../../components/ui/Button.jsx'
import {AuthFeedback,AuthFrame,AuthNotice} from '../account/AuthPresentation.jsx'
import {accountError,validateAuth} from '../account/model.js'
import {useEmailCooldown} from '../account/useEmailCooldown.js'
import {tx} from '../../i18n/index.js'

export default function AdminLogin({client,onLogin}){
 const [mode,setMode]=useState('login'),[values,setValues]=useState({email:'',password:''}),[errors,setErrors]=useState({}),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[sent,setSent]=useState(false),locked=useRef(false),form=useRef(null),cooldown=useEmailCooldown('admin')
 const recovery=mode==='recovery'
 function change(next){if(locked.current)return;setMode(next);setErrors({});setMessage('');setSent(false)}
 async function submit(event){
  event.preventDefault();if(locked.current||recovery&&cooldown.remaining)return
  const validation=validateAuth(values,mode);setErrors(validation)
  if(Object.keys(validation).length){requestAnimationFrame(()=>form.current?.querySelector('[aria-invalid="true"]')?.focus());return}
  locked.current=true;setBusy(true);setMessage('')
  try{
   const result=recovery?await client.auth.resetPasswordForEmail(values.email.trim(),{redirectTo:`${window.location.origin}/admin/recovery`}):await client.auth.signInWithPassword({email:values.email.trim(),password:values.password})
   if(result.error)throw result.error
   if(recovery){cooldown.start();setSent(true)}else{setValues(v=>({...v,password:''}));onLogin()}
  }catch(error){setMessage(accountError(error));if(error?.status===429)cooldown.start()}finally{locked.current=false;setBusy(false)}
 }
 return <AuthFrame admin label="Administrator workspace"><p className="account-eyebrow">{tx('Administration')}</p><h1>{tx(sent?'Check your inbox.':recovery?'Find your way back.':'Welcome to your workspace.')}</h1>
  {sent?<><AuthNotice><p role="status">{tx('If this account exists, a recovery email will be sent.')}</p><p>{tx('Check your spam folder too. Use the most recent email link.')}</p></AuthNotice><p className="auth-session-note">{tx('Open the reset link in this same browser profile and use the same site address.')}</p><button className="text-action" disabled={cooldown.remaining>0} onClick={()=>setSent(false)}>{tx(cooldown.remaining?`Resend available in ${cooldown.remaining}s`:'Send another email')}</button></>:<><p className="auth-description">{tx(recovery?'We will send a secure password reset link to your email.':'Sign in to curate the next Unseen Jo discovery.')}</p><form ref={form} noValidate onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}><legend className="sr-only">{tx(recovery?'Send reset link':'Sign in')}</legend><FormField label="Email" name="email" type="email" autoComplete="username" required maxLength={254} value={values.email} onChange={e=>{setValues(v=>({...v,email:e.target.value}));setErrors(v=>({...v,email:undefined}))}} error={errors.email}/>{!recovery&&<><FormField label="Password" name="password" type="password" autoComplete="current-password" required maxLength={128} value={values.password} onChange={e=>{setValues(v=>({...v,password:e.target.value}));setErrors(v=>({...v,password:undefined}))}} error={errors.password}/><button type="button" className="text-action auth-forgot" onClick={()=>change('recovery')}>{tx('Forgot password?')}</button><p className="auth-session-note">{tx('Your session stays signed in on this browser until you sign out.')}</p></>}{recovery&&<p className="auth-session-note">{tx('Open the reset link in this same browser profile and use the same site address.')}</p>}<Button type="submit" className="auth-submit" disabled={busy||recovery&&cooldown.remaining>0}>{busy&&<LoaderCircle className="auth-spinner" size={16} aria-hidden="true"/>}{tx(busy?'Please wait…':recovery&&cooldown.remaining?`Resend available in ${cooldown.remaining}s`:recovery?'Send reset link':'Sign in')}</Button></fieldset></form><AuthFeedback error>{tx(message)}</AuthFeedback></>}
  {recovery&&<div className="auth-link-actions"><button className="text-action" disabled={busy} onClick={()=>change('login')}>{tx('Return to sign in')}</button></div>}
  <p className="auth-security"><LockKeyhole size={14} aria-hidden="true"/>{tx('Administrator access is checked securely after sign-in.')}</p>
 </AuthFrame>
}

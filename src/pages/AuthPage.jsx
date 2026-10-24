import {useEffect,useRef,useState} from 'react'
import {Link,useLocation,useNavigate,useSearchParams} from 'react-router'
import {AnimatePresence,motion,useIsPresent,useReducedMotion} from 'motion/react'
import {LoaderCircle,LockKeyhole} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {isArabic,tx} from '../i18n/index.js'
import {usePageTitle} from '../i18n/usePageTitle.js'
import BrandLogo from '../components/layout/BrandLogo.jsx'
import {useLegalDocuments,requireRegistrationLegal} from '../features/legal/useLegalDocuments.js'
import {canRegisterWithLegal} from '../features/legal/model.js'
import LegalLinks from '../components/layout/LegalLinks.jsx'
import FormField from '../components/ui/FormField.jsx'
import Button from '../components/ui/Button.jsx'
import {getUserClient} from '../features/account/client.js'
import {accountError,safeReturn,validateAuth} from '../features/account/model.js'
import {useUserAuth} from '../features/account/context.js'
import {readSupabaseConfig} from '../lib/supabase/config.js'
import {AuthFeedback,AuthNotice,AuthScenery} from '../features/account/AuthPresentation.jsx'
import {useEmailCooldown} from '../features/account/useEmailCooldown.js'

const copy={confirmation:{title:'Confirm your email.',description:'Request a new confirmation link in this browser.',action:'Resend confirmation'},login:{title:'Welcome back.',description:'Your next discovery is waiting.',action:'Sign in'},register:{title:'Start your journey.',description:'Make room for the places you have yet to discover.',action:'Create account'},recovery:{title:'Find your way back.',description:'We will send a secure password reset link to your email.',action:'Send reset link'},reset:{title:'A fresh start.',description:'Choose a strong new password for your account.',action:'Update password'}}
let settingsPromise
function FormPresence({children,...props}){const present=useIsPresent();return <motion.div {...props} inert={!present} aria-hidden={!present||undefined}>{children}</motion.div>}
function authSettings(){return settingsPromise??=(async()=>{const c=readSupabaseConfig(import.meta.env);if(!c)return {};const r=await fetch(`${c.url}/auth/v1/settings`,{headers:{apikey:c.publishableKey}});if(!r.ok)throw Error('Settings unavailable');return r.json()})().catch(()=>({}))}
export default function AuthPage(){
 useTranslation()
 const [params,setParams]=useSearchParams(),location=useLocation(),navigate=useNavigate(),reduced=useReducedMotion(),{user,status:authStatus}=useUserAuth()
 const mode=['login','register','recovery','reset','confirmation'].includes(params.get('mode'))?params.get('mode'):'login',register=mode==='register',emailOnly=['recovery','confirmation'].includes(mode),rtl=isArabic(),direction=rtl?-1:1
 const legal=useLegalDocuments(null,register),legalReady=legal.source==='static'||legal.status==='ready'&&canRegisterWithLegal(legal.source,legal.documents)
 const returnTo=safeReturn(params.get('returnTo'))
 const [values,setValues]=useState({name:'',email:'',password:'',confirm:''}),[errors,setErrors]=useState({}),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[google,setGoogle]=useState(false)
 const [success,setSuccess]=useState(''),[failed,setFailed]=useState(false),cooldown=useEmailCooldown()
 const shell=useRef(null),previous=useRef(mode),mounted=useRef(true),locked=useRef(false)
 const recovery=mode==='reset'&&location.state?.recoveryVerified===true
 usePageTitle(`${copy[mode].action} | Unseen Jo`)
 useEffect(()=>{mounted.current=true;authSettings().then(s=>{if(mounted.current)setGoogle(s.external?.google===true)});return()=>{mounted.current=false}},[])
 useEffect(()=>{if(user&&mode==='login')navigate(returnTo,{replace:true})},[user,mode,navigate,returnTo])
 useEffect(()=>{
  // URL changes (including browser back/forward) reset only transient feedback.
  // eslint-disable-next-line react/set-state-in-effect
  setErrors({});setMessage('');setSuccess('');setFailed(false)
  if(previous.current!==mode){previous.current=mode;const timer=setTimeout(()=>{
   const content=shell.current?.querySelector('.auth-form-content:not([inert])'),active=document.activeElement
   // A visitor may already be typing while the panels slide. Never move
   // focus away from an input or action they deliberately focused.
   if(content?.contains(active)&&active?.matches('input,button,a,select,textarea'))return
   content?.querySelector('h1')?.focus()
  },reduced?0:620);return()=>clearTimeout(timer)}
 },[mode,reduced])
 function switchMode(next){if(locked.current)return;setParams({mode:next,...(returnTo!=='/profile'?{returnTo}:{})})}
 function update(key,value){setValues(current=>({...current,[key]:value}));setErrors(current=>({...current,[key]:undefined}));setMessage('')}
 async function submit(event){
  event.preventDefault();if(locked.current)return
  const validation=validateAuth(values,mode);setErrors(validation)
  if(Object.keys(validation).length){requestAnimationFrame(()=>shell.current?.querySelector('.auth-form-content:not([inert]) [aria-invalid="true"]')?.focus());return}
  if(mode==='reset'&&!recovery){setFailed(true);setMessage('This link has expired or is invalid. Request a new link.');return}
  if(emailOnly&&cooldown.remaining)return
  locked.current=true;setBusy(true);setMessage('');setFailed(false)
  try{
   if(register){try{await requireRegistrationLegal(legal.source)}catch{const e=Error('Registration is paused until approved legal documents are available.');e.legal=true;throw e}}
   const client=await getUserClient(),callback=new URL('/auth/callback',window.location.origin);callback.searchParams.set('returnTo',returnTo)
   let result
   if(mode==='login')result=await client.auth.signInWithPassword({email:values.email.trim(),password:values.password})
   else if(mode==='register'){
    callback.searchParams.set('flow','signup')
    result=await client.auth.signUp({email:values.email.trim(),password:values.password,options:{data:{full_name:values.name.trim(),preferred_language:rtl?'ar-JO':'en'},emailRedirectTo:callback.href}})
   }else if(mode==='confirmation'){
    callback.searchParams.set('flow','signup');result=await client.auth.resend({type:'signup',email:values.email.trim(),options:{emailRedirectTo:callback.href}})
   }else if(mode==='recovery'){
    callback.searchParams.set('flow','recovery');result=await client.auth.resetPasswordForEmail(values.email.trim(),{redirectTo:callback.href})
   }else result=await client.auth.updateUser({password:values.password})
   if(result.error)throw result.error
   if(!mounted.current)return
   setValues(current=>({...current,password:'',confirm:''}))
   if(mode==='login'||mode==='register'&&result.data?.session)navigate(returnTo,{replace:true})
   else if(mode==='register'){cooldown.start();setSuccess('mail');setMessage('Check your inbox. If registration is available for this address, a confirmation link will arrive. Open it in this browser to finish signing up.')}
   else if(mode==='confirmation'){cooldown.start();setSuccess('mail');setMessage('If confirmation is still required, a new link will arrive. Open the latest link in this browser, using the same site address.')}
   else if(mode==='recovery'){cooldown.start();setSuccess('mail');setMessage('If an account uses this email, a password reset link will arrive shortly. Open it in this browser.')}
   else{setSuccess('password');setMessage('Your password was updated.')}
  }catch(error){if(mounted.current){setFailed(true);setMessage(error.legal?error.message:accountError(error));if(error?.status===429||['over_email_send_rate_limit','over_request_rate_limit'].includes(error?.code))cooldown.start()}}finally{locked.current=false;if(mounted.current)setBusy(false)}
 }
 async function oauth(){if(locked.current)return;locked.current=true;setBusy(true);try{if(register){try{await requireRegistrationLegal(legal.source)}catch{const e=Error('Registration is paused until approved legal documents are available.');e.legal=true;throw e}}const client=await getUserClient(),callback=new URL('/auth/callback',window.location.origin);callback.searchParams.set('returnTo',returnTo);const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:callback.href}});if(error)throw error}catch(error){setFailed(true);setMessage(error.legal?error.message:accountError(error));locked.current=false;setBusy(false)}}
 return <div className="auth-page auth-premium"><motion.section ref={shell} className={`auth-shell ${register?'is-register':''}`} data-auth-mode={mode} aria-label={tx('Your Unseen Jo account')} initial={reduced?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:0.3}}>
  <motion.div className="auth-form-side" animate={{x:register?`${direction*100}%`:'0%'}} transition={{duration:reduced?0:0.62,ease:[0.65,0,0.2,1]}}>
   <div className="auth-form-stack"><AnimatePresence initial={false} mode="sync"><FormPresence key={mode} className="auth-form-content" initial={{opacity:0,x:reduced?0:direction*(register?18:-18)}} animate={{opacity:1,x:0}} exit={{opacity:0,x:reduced?0:direction*(register?-18:18),transition:{duration:reduced?0:0.14}}} transition={{duration:reduced?0:0.24,delay:reduced?0:0.18}}>
    <BrandLogo className="auth-form-brand"/><p className="account-eyebrow">{tx('Jordan, beyond the familiar')}</p><h1 tabIndex={-1}>{tx(success==='mail'?'Check your inbox.':success==='password'?'Password updated.':copy[mode].title)}</h1>{!success&&<p className="auth-description">{tx(copy[mode].description)}</p>}
    {success?<><AuthNotice kind={success==='password'?'success':'mail'}><AuthFeedback>{tx(message)}</AuthFeedback>{success==='mail'&&<p>{tx('Check your spam folder too. Use the most recent email link.')}</p>}</AuthNotice>{success==='password'?<Link className="button button--primary auth-submit" to="/profile">{tx('Continue to your profile')}</Link>:<><p className="auth-session-note">{tx('For secure recovery and automatic sign-in, use the same browser profile and site address where you requested the link.')}</p><button type="button" className="text-action" disabled={cooldown.remaining>0} onClick={()=>{setSuccess('');setMessage('');if(register)switchMode('confirmation')}}>{tx(cooldown.remaining?'Resend available in '+cooldown.remaining+'s':'Send another email')}</button></>}</>:mode==='reset'&&!recovery?<div><AuthFeedback error>{tx('This link has expired or is invalid. Request a new link.')}</AuthFeedback><p className="auth-session-note">{tx('For secure recovery and automatic sign-in, use the same browser profile and site address where you requested the link.')}</p><button className="text-action" onClick={()=>switchMode('recovery')}>{tx('Send a new reset link')}</button></div>:<form noValidate onSubmit={submit} aria-busy={busy}>
     <fieldset disabled={busy}><legend className="sr-only">{tx(copy[mode].action)}</legend>
      {register&&<FormField label="Full name" name="name" autoComplete="name" required maxLength={100} value={values.name} onChange={e=>update('name',e.target.value)} error={errors.name}/>}
      {mode!=='reset'&&<FormField label="Email address" name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={e=>update('email',e.target.value)} error={errors.email}/>}
      {!emailOnly&&<FormField label="Password" name="password" type="password" autoComplete={mode==='login'?'current-password':'new-password'} required maxLength={128} value={values.password} onChange={e=>update('password',e.target.value)} error={errors.password} hint={mode==='login'?undefined:'Use at least 12 characters, including a letter and a number.'}/>}
      {(register||mode==='reset')&&<FormField label="Confirm password" name="confirm-password" type="password" autoComplete="new-password" required maxLength={128} value={values.confirm} onChange={e=>update('confirm',e.target.value)} error={errors.confirm}/>}
      {mode==='login'&&<button type="button" className="text-action auth-forgot" onClick={()=>switchMode('recovery')}>{tx('Forgot password?')}</button>}
      {mode==='login'&&<p className="auth-session-note">{tx('Your session stays signed in on this browser until you sign out.')}</p>}
      {mode==='recovery'&&<p className="auth-session-note">{tx('Open the reset link in this same browser profile and use the same site address.')}</p>}
      {register&&<><LegalLinks registration/>{legal.source!=='static'&&<div className="auth-session-note" role="status">{legalReady?<p>{tx('Published legal versions')}: {tx('Privacy Policy')} {legal.documents.privacy.version} ? {tx('Terms of Service')} {legal.documents.terms.version}</p>:<><p>{tx(legal.status==='loading'?'Checking published legal documents?':'Registration is paused until approved legal documents are available.')}</p><button type="button" className="text-action" onClick={legal.refresh}>{tx('Check again')}</button></>}</div>}</>}
      <Button type="submit" className="auth-submit" disabled={busy||register&&!legalReady||authStatus==='restoring'||emailOnly&&cooldown.remaining>0}>{busy&&<LoaderCircle size={16} className="auth-spinner" aria-hidden="true"/>}{tx(busy?'Please wait…':emailOnly&&cooldown.remaining?`Resend available in ${cooldown.remaining}s`:copy[mode].action)}</Button>
     </fieldset>
    </form>}
    {!success&&<AuthFeedback error={failed||authStatus==='error'}>{tx(message||(authStatus==='error'?'Your session could not be restored. Please sign in again.':''))}</AuthFeedback>}{['register','login'].includes(mode)&&!success&&<div className="auth-secondary-actions"><button type="button" className="text-action" disabled={busy} onClick={()=>switchMode('confirmation')}>{tx('Resend confirmation email')}</button><Link to="/explore">{tx('Continue as a guest')}</Link></div>}
    {google&&['login','register'].includes(mode)&&<Button variant="secondary" disabled={busy||register&&!legalReady} onClick={oauth}>{tx('Continue with Google')}</Button>}
    {!success&&['login','register'].includes(mode)&&<p className="auth-mobile-switch">{tx(register?'Already have an account?':'New to Unseen Jo?')} <button className="text-action" disabled={busy} onClick={()=>switchMode(register?'login':'register')}>{tx(register?'Sign in':'Create account')}</button></p>}
    {['recovery','reset','confirmation'].includes(mode)&&<button className="text-action" disabled={busy} onClick={()=>switchMode('login')}>{tx('Return to sign in')}</button>}
    <p className="auth-security"><LockKeyhole size={15} aria-hidden="true"/>{tx('Secure account access. Explore freely as a guest.')}</p>
   </FormPresence></AnimatePresence></div>
  </motion.div>
  <motion.aside className="auth-welcome" animate={{x:register?`${-direction*100}%`:'0%'}} transition={{duration:reduced?0:0.62,ease:[0.65,0,0.2,1]}}>
   <AuthScenery><AnimatePresence mode="wait" initial={false}><motion.div key={register?'return':'new'} initial={{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-8}} transition={{duration:reduced?0:0.2}}><h2>{tx(register?'Good to see you again.':'A little curiosity. A new discovery.')}</h2><p>{tx(register?'Your saved places and personal discoveries are waiting.':'Find your kind of Jordan. Keep the places that inspire you.')}</p></motion.div></AnimatePresence><Button variant="secondary" disabled={busy} onClick={()=>switchMode(register?'login':'register')}>{tx(register?'Sign in':'Create account')}</Button></AuthScenery>
  </motion.aside>
 </motion.section></div>
}

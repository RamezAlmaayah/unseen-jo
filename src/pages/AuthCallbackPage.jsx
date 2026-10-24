import {useEffect,useState} from 'react'
import {Link,useNavigate} from 'react-router'
import {getUserClient} from '../features/account/client.js'
import {consumeUserCallback} from '../features/account/callback.js'
import {accountError} from '../features/account/model.js'
import {AuthFeedback,AuthFrame,AuthNotice} from '../features/account/AuthPresentation.jsx'
import {tx} from '../i18n/index.js'
export default function AuthCallbackPage(){
 const navigate=useNavigate(),[error,setError]=useState(''),[outcome,setOutcome]=useState(null),[href]=useState(()=>window.location.href)
 useEffect(()=>{let active=true;void getUserClient().then(client=>consumeUserCallback(client,href,path=>window.history.replaceState(null,'',path))).then(result=>{if(!active)return;if(result.status==='verified'&&result.recovery){navigate('/auth?mode=reset',{replace:true,state:{recoveryVerified:true}});return}setOutcome(result)}).catch(e=>{if(active)setError(accountError(e))});return()=>{active=false}},[navigate,href])
 const verified=outcome?.status==='verified'||outcome?.status==='already_signed_in'
 const title=error?'Account link unavailable':outcome?.status==='verified'?'Email confirmed.':outcome?.status==='already_signed_in'?'You are already signed in':outcome?.status==='signin_required'?'Finish signing in':outcome?'Open your confirmation email':'Confirming your account…'
 const message=outcome?.status==='verified'?'Your email is confirmed. Your next discovery is waiting.':outcome?.status==='already_signed_in'?'Your existing account session is verified. Continue to your profile.':outcome?.status==='signin_required'?'This link was opened without its original browser verification key. Your email may already be confirmed. Sign in with your password, or open the link in the browser where you requested it.':outcome?'There are no confirmation details left on this page. If you already confirmed your email, sign in. Otherwise open the full email link.':'Please wait while your secure link is verified.'
 return <AuthFrame><p className="account-eyebrow">{tx('Your Unseen Jo account')}</p><h1>{tx(title)}</h1><AuthNotice kind={verified?'success':!error&&!outcome?'loading':'mail'}><AuthFeedback error={!!error}>{tx(error||message)}</AuthFeedback></AuthNotice>{!verified&&(error||outcome)&&<p className="auth-session-note">{tx('For secure recovery and automatic sign-in, use the same browser profile and site address where you requested the link.')}</p>}
  <div className="auth-link-actions">{verified?<Link className="button button--primary" to={outcome.returnTo}>{tx('Continue to your profile')}</Link>:(error||outcome)&&<><Link className="button button--primary" to={`/auth?mode=login&returnTo=${encodeURIComponent(outcome?.returnTo||'/profile')}`}>{tx('Sign in')}</Link><Link to="/auth?mode=recovery">{tx('Send a new reset link')}</Link><Link to="/auth?mode=confirmation">{tx('Resend confirmation email')}</Link></>}</div>
 </AuthFrame>
}

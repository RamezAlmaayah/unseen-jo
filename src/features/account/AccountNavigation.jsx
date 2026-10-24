import {useEffect,useRef,useState} from 'react'
import {Link,useLocation} from 'react-router'
import {UserRound} from 'lucide-react'
import {tx} from '../../i18n/index.js'
import {useUserAuth} from './context.js'
import {accountError} from './model.js'
export default function AccountNavigation(){
 const {user,status,signOut}=useUserAuth(),[openFor,setOpenFor]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),root=useRef(null),button=useRef(null),location=useLocation()
 const routeKey=location.pathname+location.search+(user?.id||'guest'),open=openFor===routeKey
 useEffect(()=>{if(!open)return;function close(e){if(e.type==='keydown'&&e.key==='Escape'){setOpenFor(null);button.current?.focus()}else if(e.type==='pointerdown'&&!root.current?.contains(e.target))setOpenFor(null)}document.addEventListener('keydown',close);document.addEventListener('pointerdown',close);return()=>{document.removeEventListener('keydown',close);document.removeEventListener('pointerdown',close)}},[open])
 if(status==='restoring')return <button className="profile-action" disabled aria-label={tx('Restoring your account…')}><UserRound aria-hidden="true"/></button>
 if(!user)return <Link className="profile-action" to={`/auth?mode=login&returnTo=${encodeURIComponent(location.pathname+location.search)}`} aria-label={tx('Sign in or create an account')} title={tx('Sign in or create an account')}><UserRound aria-hidden="true"/></Link>
 return <div className="account-navigation" ref={root}><button className="profile-action" ref={button} onClick={()=>setOpenFor(open?null:routeKey)} aria-expanded={open} aria-controls="account-navigation-panel" aria-label={tx('Your account')}><UserRound aria-hidden="true"/></button>{open&&<nav id="account-navigation-panel" className="account-navigation-panel" aria-label={tx('Your account')}><Link to="/profile">{tx('Profile')}</Link><Link to="/my-discoveries">{tx('My Discoveries')}</Link><button disabled={busy} onClick={async()=>{setBusy(true);try{await signOut();setOpenFor(null)}catch(e){setError(accountError(e))}finally{setBusy(false)}}}>{tx(busy?'Please wait…':'Sign out')}</button>{error&&<p role="alert">{tx(error)}</p>}</nav>}</div>
}

import {Link} from 'react-router'
import {motion,useReducedMotion} from 'motion/react'
import {ArrowLeft,Check,Compass,LoaderCircle,Mail,ShieldCheck} from 'lucide-react'
import BrandLogo from '../../components/layout/BrandLogo.jsx'
import LanguageSwitcher from '../../i18n/LanguageSwitcher.jsx'
import LegalLinks from '../../components/layout/LegalLinks.jsx'
import {tx} from '../../i18n/index.js'
import '../../styles/auth-premium.css'

export function AuthScenery({admin=false,children}){
 return <><div className="auth-landscape" aria-hidden="true"/><div className="auth-panel-kicker"><Compass size={16} aria-hidden="true"/>{tx('Discover Jordan differently')}</div><div className="auth-welcome-copy"><span className="auth-panel-mark" aria-hidden="true">{admin?<ShieldCheck size={27}/>:<Compass size={27}/>}</span>{children||<><h2>{tx(admin?'Thoughtfully curated.':'A little curiosity. A new discovery.')}</h2><p>{tx(admin?'A considered space for the people behind Unseen Jo.':'Find your kind of Jordan. Keep the places that inspire you.')}</p></>}</div><Link className="auth-explore" to="/explore"><ArrowLeft size={16} aria-hidden="true"/>{tx('Keep exploring')}</Link></>
}
export function AuthFeedback({error,children}){
 if(!children)return null
 return <div className={`auth-feedback ${error?'auth-feedback--error':'auth-feedback--success'}`} role={error?'alert':'status'}>{children}</div>
}
export function AuthNotice({kind='mail',children}){
 return <div className="auth-notice"><span className="auth-notice-icon" aria-hidden="true">{kind==='success'?<Check size={24}/>:kind==='loading'?<LoaderCircle className="auth-spinner" size={24}/>:<Mail size={24}/>}</span>{children}</div>
}
export function AuthFrame({children,admin=false,label='Your Unseen Jo account'}){
 const reduced=useReducedMotion(),Root=admin?'main':'div'
 return <Root id={admin?'main-content':undefined} className={`auth-page auth-premium ${admin?'auth-admin-page':''}`}>
  {admin&&<header className="auth-topline"><Link to="/">{tx('Back to Unseen Jo')}</Link><LanguageSwitcher/></header>}
  <motion.section className="auth-shell auth-static" aria-label={tx(label)} initial={reduced?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.25}}>
   <div className="auth-form-side"><div className="auth-form-content"><BrandLogo className="auth-form-brand"/>{children}</div></div>
   <aside className="auth-welcome"><AuthScenery admin={admin}/></aside>
  </motion.section>
  {admin&&<LegalLinks/>}
 </Root>
}

import {Link} from 'react-router'
import {useTranslation} from 'react-i18next'
import {isArabic} from '../../i18n/index.js'
import {legalCopy} from '../../features/legal/ui.js'
import '../../styles/legal.css'
export default function SiteFooter(){
 useTranslation()
 const c=legalCopy[isArabic()?'ar':'en']
 return <footer className="site-footer"><div><Link className="site-footer__brand" to="/">Unseen Jo</Link><span>{c.footer}</span></div><nav aria-label={c.legal}><Link to="/privacy-policy">{c.privacy}</Link><Link to="/terms-of-service">{c.terms}</Link></nav></footer>
}

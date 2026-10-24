import {Link} from 'react-router'
import {useTranslation} from 'react-i18next'
import {isArabic} from '../../i18n/index.js'
import {legalCopy} from '../../features/legal/ui.js'
export default function LegalLinks({registration=false}){
 useTranslation()
 const ar=isArabic(),c=legalCopy[ar?'ar':'en'],hint=ar?' (تفتح في علامة تبويب جديدة)':' (opens in a new tab)'
 return <p className="legal-links">{registration&&<>{c.review} </>}<Link to="/terms-of-service" target="_blank" rel="noopener">{c.terms}<span className="sr-only">{hint}</span></Link><span> {c.and} </span><Link to="/privacy-policy" target="_blank" rel="noopener">{c.privacy}<span className="sr-only">{hint}</span></Link></p>
}

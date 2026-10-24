import {useEffect} from 'react'
import {Link,useLocation} from 'react-router'
import {useTranslation} from 'react-i18next'
import {isArabic} from '../i18n/index.js'
import {usePageTitle} from '../i18n/usePageTitle.js'
import {LEGAL_REVISION,LEGAL_OPERATOR,privacySections,termsSections} from '../features/legal/content.js'
import {legalCopy} from '../features/legal/ui.js'
import '../styles/legal.css'
import {useLegalDocuments} from '../features/legal/useLegalDocuments.js'
import LegalDocument from '../features/legal/LegalDocument.jsx'
import {tx} from '../i18n/index.js'
const identityPattern=new RegExp('('+Object.values(LEGAL_OPERATOR).map(value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')')
// Keep the exact supplied Latin name/email readable inside Arabic prose.
// React escapes every text segment; no HTML or arbitrary link is interpreted.
function LegalParagraph({text}){
 return <p>{text.split(identityPattern).map((part,index)=>part===LEGAL_OPERATOR.email?<a key={index} href={'mailto:'+LEGAL_OPERATOR.email}><bdi dir="ltr">{part}</bdi></a>:part===LEGAL_OPERATOR.name?<bdi key={index} dir="ltr">{part}</bdi>:part)}</p>
}
export default function LegalPage({type}){
 const data=useLegalDocuments(type)
 if(data.source==='static')return <StaticLegalPage type={type}/>
 return <ManagedLegalPage type={type} data={data}/>
}
function ManagedLegalPage({type,data}){
 useTranslation();const language=isArabic()?'ar-JO':'en',{hash}=useLocation(),part=data.revision?.content[language]
 usePageTitle(`${part?.title||legalCopy[isArabic()?'ar':'en'][type]} | Unseen Jo`,part?.introduction||'',data.status==='error'||data.status==='ready'&&!data.revision)
 if(data.status!=='ready'||!data.revision||data.source!=='supabase')return <div className="legal-page legal-unavailable"><h1>{tx(data.status==='loading'?'Loading legal document…':'Legal document unavailable')}</h1><p role={data.status==='loading'?'status':'alert'}>{tx(data.status==='loading'?'Retrieving the current approved version.':'No approved version is available. An unapproved draft is not a substitute. Please try again later.')}</p>{data.status!=='loading'&&<button className="button button--secondary" onClick={data.refresh}>{tx('Check again')}</button>}<Link to="/">{tx('Back to home')}</Link></div>
 return <LegalDocument content={data.revision.content} language={language} documentKey={type} date={data.revision.created_at} version={data.revision.version} hash={hash}/>
}
function StaticLegalPage({type}){
 useTranslation()
 const ar=isArabic(),lang=ar?'ar':'en',c=legalCopy[lang],privacy=type==='privacy',title=c[type],sections=privacy?privacySections:termsSections,{hash}=useLocation()
 const introduction=privacy?(ar?'كيف يتعامل Unseen Jo مع معلومات حسابك وتفضيلاتك واكتشافاتك.':'How Unseen Jo handles your account information, preferences, and discoveries.'):(ar?'شروط استخدام Unseen Jo لاستكشاف الأردن والتخطيط لاكتشافاتك.':'The conditions for using Unseen Jo to explore Jordan and plan your discoveries.')
 usePageTitle(`${title} | Unseen Jo`,introduction)
 useEffect(()=>{if(!hash)return;const target=document.getElementById(hash.slice(1));target?.scrollIntoView();target?.focus({preventScroll:true})},[hash,type])
 const date=new Intl.DateTimeFormat(ar?'ar-JO':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Amman'}).format(new Date(`${LEGAL_REVISION}T12:00:00Z`))
 return <div className="legal-page" dir={ar?'rtl':'ltr'} lang={ar?'ar-JO':'en'}>
  <header className="legal-hero" id="legal-top" tabIndex={-1}><Link className="legal-back" to="/">{c.home}</Link><p className="legal-eyebrow">Unseen Jo · {c.legal}</p><h1>{title}</h1><p className="legal-introduction">{introduction}</p><p className="legal-date">{c.updated}: <time dateTime={LEGAL_REVISION}>{date}</time></p></header>
  <div className="legal-layout"><nav className="legal-toc" aria-label={c.contents}><h2>{c.contents}</h2><ol>{sections.map(s=><li key={s.id}><Link to={`#${s.id}`}>{s[lang].title}</Link></li>)}</ol></nav>
   <article className="legal-document" aria-label={title}>{sections.map(s=><section key={s.id} id={s.id} tabIndex={-1}><h2>{s[lang].title}</h2>{s[lang].paragraphs.map((p,i)=><LegalParagraph key={i} text={p}/>)}{privacy&&s.id==='rights'&&<a href="https://modee.gov.jo/EN/Pages/FAQs">{c.reference}</a>}</section>)}<nav className="legal-related" aria-label={c.related}><Link to={privacy?'/terms-of-service':'/privacy-policy'}>{privacy?c.terms:c.privacy}</Link><Link to="#legal-top">{c.top}</Link></nav></article>
  </div>
 </div>
}

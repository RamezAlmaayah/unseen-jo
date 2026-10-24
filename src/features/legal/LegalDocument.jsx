import {Link} from 'react-router'
import {useEffect} from 'react'
import {tx} from '../../i18n/index.js'
import {legalCopy} from './ui.js'
import {REVIEW_KEYS,REVIEW_LABELS} from './model.js'
import SafeMarkdown from './SafeMarkdown.jsx'
import '../../styles/legal.css'

// Shared renderer for live public pages and Admin preview; rendering and link
// safety do not depend on whether the input was authored by an administrator.
export default function LegalDocument({content,language='en',documentKey='privacy',date,version,status='published',preview=false,hash=''}){
 const ar=language==='ar-JO',c=legalCopy[ar?'ar':'en'],part=content[language],prefix=preview?'preview-':'',pending=REVIEW_KEYS.filter(k=>!content.review[k])
 useEffect(()=>{if(preview||!hash)return;const el=document.getElementById(hash.slice(1));el?.scrollIntoView();el?.focus({preventScroll:true})},[hash,preview,content])
 const formatted=date?new Intl.DateTimeFormat(ar?'ar-JO':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Amman'}).format(new Date(date)):null
 return <div className={`legal-page ${preview?'legal-preview':''}`} dir={ar?'rtl':'ltr'} lang={language}>
  <header className="legal-hero" id={prefix+'legal-top'} tabIndex={-1}>{!preview&&<Link className="legal-back" to="/">{c.home}</Link>}<p className="legal-eyebrow">Unseen Jo · {c.legal}</p><h1>{part.title}</h1><SafeMarkdown text={part.introduction}/><p className="legal-date">{formatted&&<>{c.updated}: <time dateTime={date}>{formatted}</time></>}<span>{tx(preview?'Preview — not a publication':status==='published'?'Published':'Draft for review')}</span>{version&&<span>{tx('Version')}: {tx(version)}</span>}</p></header>
  <aside className="legal-review-note" aria-label={tx('Editorial approval and legal review')}><strong>{tx('Editorial approval and legal review')}</strong><p>{tx('Publication is the website owner’s editorial approval. It is not external legal certification.')}</p>{pending.length>0&&<><p>{tx('Owner confirmation is still required for:')}</p><ul>{pending.map(k=><li key={k}>{tx(REVIEW_LABELS[k])}</li>)}</ul></>}</aside>
  <div className="legal-layout"><nav className="legal-toc" aria-label={c.contents}><h2>{c.contents}</h2><ol>{part.sections.map(s=><li key={s.id}><a href={`#${prefix+s.id}`}>{s.title}</a></li>)}</ol></nav><article className="legal-document" aria-label={part.title}>{part.sections.map(s=><section id={prefix+s.id} key={s.id} tabIndex={-1}><h2>{s.title}</h2><SafeMarkdown text={s.body}/>{documentKey==='privacy'&&s.id==='rights'&&<a href="https://modee.gov.jo/EN/Pages/FAQs">{c.reference}</a>}</section>)}{!preview&&<nav className="legal-related" aria-label={c.related}><Link to={documentKey==='privacy'?'/terms-of-service':'/privacy-policy'}>{documentKey==='privacy'?c.terms:c.privacy}</Link><Link to="#legal-top">{c.top}</Link></nav>}</article></div>
 </div>
}

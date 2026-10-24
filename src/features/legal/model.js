/* eslint-disable no-control-regex -- reject control characters in stored text and URLs */
export const LEGAL_KEYS=['privacy','terms']
export const LEGAL_LANGUAGES=['en','ar-JO']
export const REVIEW_KEYS=['operator','contact','retention','legalReview']
export const REVIEW_LABELS={operator:'Operator identity and address confirmed',contact:'Privacy and legal contact confirmed',retention:'Retention and request handling confirmed',legalReview:'External legal review completed'}
const exact=(obj,keys)=>obj&&typeof obj==='object'&&!Array.isArray(obj)&&Object.keys(obj).length===keys.length&&keys.every(k=>Object.hasOwn(obj,k))
const fail=()=>{throw Error('Legal content is incomplete or contains unsupported formatting.')}
export function safeLegalHref(href){
 if(typeof href!=='string'||/[\s\\<>\u0000-\u001f\u007f]/.test(href))return null
 let decoded;try{decoded=decodeURIComponent(href)}catch{return null}
 if(/[\u0000-\u001f\u007f\\<>]/.test(decoded))return null
 if(/^#[a-z][a-z0-9-]{0,63}$/.test(href)||/^\/(privacy-policy|terms-of-service)(#[a-z][a-z0-9-]{0,63})?$/.test(href))return href
 if(/^mailto:[^?\s@]+@[^?\s@]+\.[^?\s@]+$/i.test(href))return href
 try{const url=new URL(href);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?href:null}catch{return null}
}
export function validateLegalContent(content,{complete=false}={}){
 if(!exact(content,[...LEGAL_LANGUAGES,'review'])||new TextEncoder().encode(JSON.stringify(content)).length>262144||!exact(content.review,REVIEW_KEYS)||REVIEW_KEYS.some(k=>typeof content.review[k]!=='boolean'))fail()
 let ids
 for(const lang of LEGAL_LANGUAGES){const part=content[lang];if(!exact(part,['title','introduction','sections'])||!Array.isArray(part.sections)||part.sections.length>60||complete&&!part.sections.length)fail()
  if(part.sections.some(s=>!exact(s,['id','title','body'])))fail()
  for(const [text,max]of [[part.title,180],[part.introduction,3000],...part.sections.flatMap(s=>[[s.title,180],[s.body,24000]])]){
   if(typeof text!=='string'||text.length>max||/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)||complete&&!text.trim())fail()
   for(const match of text.matchAll(/\[[^\]\n]*\]\(([^)]*)\)/g))if(!safeLegalHref(match[1]))fail()
  }
  const next=part.sections.map(s=>{if(!exact(s,['id','title','body'])||!/^[a-z][a-z0-9-]{0,63}$/.test(s.id)||['legal-top','legal-document'].includes(s.id))fail();return s.id})
  if(new Set(next).size!==next.length||ids&&JSON.stringify(ids)!==JSON.stringify(next))fail();ids=next
  if(complete&&!(lang==='ar-JO'?/[\u0600-\u06ff]/:/[A-Za-z]/).test(part.title+' '+part.introduction))fail()
 }
 return content
}
export const legalState=r=>r?.revoked_at?'revoked':r?.approved_at?'published':'draft'
export const currentPublication=(revisions,key)=>revisions.filter(r=>r.document_key===key&&legalState(r)==='published').sort((a,b)=>b.version-a.version)[0]||null
export const legalContentEqual=(a,b)=>{const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;return JSON.stringify(sort(a))===JSON.stringify(sort(b))}
export function legalSource(env){if(!env.VITE_LEGAL_CONTENT_SOURCE||env.VITE_LEGAL_CONTENT_SOURCE==='static')return 'static';if(env.VITE_LEGAL_CONTENT_SOURCE==='supabase')return 'supabase';return 'invalid'}
export function canRegisterWithLegal(source,documents){return source==='static'||source==='supabase'&&LEGAL_KEYS.every(key=>{const r=documents?.[key];return r&&r.document_key===key&&legalState(r)==='published'})}
export const legalError=e=>['40001','P0002'].includes(e?.code)?'This legal document changed. Reload before saving; your edits are still on this page.':e?.code==='42501'?'A current administrator session is required.':['PGRST202','PGRST205','42P01'].includes(e?.code)?'Legal storage has not been activated. Apply the reviewed migration before editing.':e?.code==='23514'?'Legal content is incomplete or contains unsupported formatting.':'The legal operation could not be verified. Reload the current state before retrying.'

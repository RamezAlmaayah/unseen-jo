import {useEffect,useRef,useState} from 'react'
import {Link} from 'react-router'
import {useTranslation} from 'react-i18next'
import {isArabic} from '../../i18n/index.js'
import {getUserClient} from './client.js'
import FormField from '../../components/ui/FormField.jsx'
import Button from '../../components/ui/Button.jsx'
import './privacy.css'
import {privacyLabels} from './privacyLabels.js'
import {privacyQaEnabled} from './privacyAvailability.js'
export default function PrivacyAccount(props){
 useTranslation()
 const ar=isArabic(),c=privacyLabels[ar?'ar':'en']
 if(privacyQaEnabled(import.meta.env,window.location.hostname))return <PrivacyAccountActive {...props}/>
 return <section className="privacy-account" data-privacy-unavailable="true" aria-labelledby="privacy-account-title"><h2 id="privacy-account-title">{c.title}</h2><p role="status">{ar?'تنزيل البيانات وحذف الحساب ذاتيًا غير متاحين حاليًا. ولا تُرسل هذه الصفحة أي طلب.':'Self-service data downloads and account deletion are currently unavailable. This page does not submit requests.'}</p><p>{ar?'توضّح سياسة الخصوصية أدوات الحساب المتاحة وبيانات التواصل مع المشغّل.':'The Privacy Policy explains the available account controls and how to contact the operator.'}</p><Link to="/privacy-policy">{c.policy}</Link></section>
}
function PrivacyAccountActive({user}){
 useTranslation();const c=privacyLabels[isArabic()?'ar':'en'],[open,setOpen]=useState(false),[confirm,setConfirm]=useState(false),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[request,setRequest]=useState(null),[message,setMessage]=useState(''),[failed,setFailed]=useState(false),lock=useRef(false),heading=useRef(null),trigger=useRef(null)
 useEffect(()=>{let live=true;getUserClient().then(c=>c.from('account_privacy_requests').select('id,status,created_at').eq('user_id',user.id).neq('status','completed').maybeSingle()).then(r=>{if(live&&!r.error)setRequest(r.data)}).catch(()=>{});return()=>{live=false}},[user.id])
 useEffect(()=>{if(open)heading.current?.focus()},[open])
 async function run(operation){if(lock.current)return;lock.current=true;setBusy(true);setMessage('');setFailed(false);try{await operation()}catch(e){setFailed(true);setMessage(e.message==='identity'?'identity':'failed')}finally{setPassword('');lock.current=false;setBusy(false)}}
 async function download(){await run(async()=>{const client=await getUserClient(),auth=await client.auth.getUser();if(auth.error||auth.data.user?.id!==user.id)throw Error();const r=await client.rpc('uj_export_account_data'),current=await client.auth.getUser();if(r.error||r.data?.profile?.id!==user.id||current.error||current.data.user?.id!==user.id)throw Error();const data={...r.data,account:{id:user.id,email:auth.data.user.email,created_at:auth.data.user.created_at},scope:c.scope},blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='unseen-jo-personal-data.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('downloaded')})}
 async function submit(e){e.preventDefault();if(!confirm||!password)return;await run(async()=>{const client=await getUserClient(),session=await client.auth.getSession(),token=session.data?.session?.access_token;if(session.error||!token)throw Error('identity');const identity=await client.auth.getUser(token);if(identity.error||identity.data.user?.id!==user.id)throw Error('identity');const r=await client.functions.invoke('account-privacy',{headers:{Authorization:`Bearer ${token}`},body:{password,confirm:true}});if(r.error){let code;try{code=(await r.error.context.json()).code}catch{/* No raw error rendering. */}throw Error(['identity','manual_identity','session'].includes(code)?'identity':'failed')}if(!r.data?.request?.id||!['pending','processing'].includes(r.data.request.status))throw Error();setRequest(r.data.request);setOpen(false);setConfirm(false)})}
 function close(){setOpen(false);setPassword('');setConfirm(false);trigger.current?.focus()}
 return <section className="privacy-account" aria-labelledby="privacy-account-title"><h2 id="privacy-account-title">{c.title}</h2><p>{c.intro}</p><p>{c.scope}</p><Button variant="secondary" disabled={busy} onClick={download}>{busy?c.wait:c.download}</Button><h3>{c.remove}</h3><p>{c.details}</p><p>{c.retain}</p><p>{c.manual}</p><Link to="/privacy-policy">{c.policy}</Link>
 {request?<div role="status" className="privacy-request-status"><p>{request.status==='processing'?c.processing:c.pending}</p><p>{c.requestId}: <bdi>{request.id}</bdi></p></div>:<button ref={trigger} type="button" className="button button--secondary" disabled={busy} onClick={()=>setOpen(true)}>{c.remove}</button>}
 {open&&!request&&<form onSubmit={submit} aria-busy={busy}><h3 ref={heading} tabIndex={-1}>{c.remove}</h3><fieldset disabled={busy}><legend className="sr-only">{c.remove}</legend><label className="privacy-confirm"><input type="checkbox" checked={confirm} required onChange={e=>setConfirm(e.target.checked)}/><span>{c.confirm}</span></label><FormField label={c.password} visibilityLabel={visible=>isArabic()?(visible?"\u0625\u062e\u0641\u0627\u0621 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631":"\u0625\u0638\u0647\u0627\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631"):(visible?"Hide password":"Show password")} type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/><div className="inline-actions"><Button type="submit" disabled={busy||!confirm||!password}>{busy?c.wait:c.send}</Button><Button type="button" variant="secondary" onClick={close}>{c.cancel}</Button></div></fieldset></form>}
 {message&&<p role={failed?'alert':'status'}>{c[message]}</p>}</section>
}

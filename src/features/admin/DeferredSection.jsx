import {useEffect,useRef,useState} from 'react'
import {tx} from '../../i18n/index.js'
// Activation is permanent. Editors and controls are never removed on scroll-away.
export default function DeferredSection({children,label,minHeight=300,className=''}){
 const host=useRef(null),[active,setActive]=useState(()=>typeof IntersectionObserver==='undefined')
 function activate(){if(host.current?.contains(document.activeElement))host.current.focus({preventScroll:true});setActive(true)}
 useEffect(()=>{if(active)return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();if(host.current?.contains(document.activeElement))host.current.focus({preventScroll:true});setActive(true)}},{rootMargin:'400px 0px'});observer.observe(host.current);return()=>observer.disconnect()},[active])
 return <div ref={host} role="region" aria-label={tx(label)} tabIndex={-1} className={`admin-deferred ${className}`} style={{minHeight}} data-deferred={active?'active':'waiting'}>{active?children:<div className="admin-deferred-placeholder"><button type="button" className="admin-secondary" onClick={activate}>{tx('Load section')}: {tx(label)}</button></div>}</div>
}

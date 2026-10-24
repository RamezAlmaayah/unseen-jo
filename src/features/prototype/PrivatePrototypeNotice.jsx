import {useEffect,useState} from 'react'
import {Link,useLocation} from 'react-router'
import {tx} from '../../i18n/index.js'
import {prototypeAccess,prototypeActive,prototypeBuild} from './runtime.js'
import {subscribeCatalogChanges} from '../tourism/catalogEvents.js'
export default function PrivatePrototypeNotice(){
 const [active,setActive]=useState(false)
 const {pathname}=useLocation()
 useEffect(()=>{if(!prototypeBuild())return;let alive=true;void prototypeAccess().then(a=>{if(alive)setActive(!!a)});const off=subscribeCatalogChanges(()=>setActive(prototypeActive()));return()=>{alive=false;off()}},[])
 return active&&!/^\/(auth|login|register|forgot-password|profile)(\/|$)/.test(pathname)?<aside className="prototype-notice" aria-label={tx('Private prototype')}><strong>{tx('Private prototype')}</strong><span>{tx('Includes synthetic visitor information. Admin-only; not public publication.')}</span><Link to="/admin/publishing#private-prototype">{tx('Manage prototype')}</Link></aside>:null
}

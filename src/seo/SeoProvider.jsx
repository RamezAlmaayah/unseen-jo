import {useEffect,useState} from 'react'
import {useLocation} from 'react-router'
import {useTranslation} from 'react-i18next'
import {SeoContext} from './context.js'
import {metaEntries,productionOrigin,routeSeo} from './model.js'
const origin=productionOrigin(import.meta.env.VITE_SITE_URL||'')
export default function SeoProvider({children}){
 const {pathname,search}=useLocation(),{i18n}=useTranslation(),[page,setPage]=useState(null)
 useEffect(()=>{
  const override=page?.pathname===pathname&&page.language===i18n.language?page:{}
  const seo=routeSeo(pathname,i18n.language,override,origin,search)
  document.title=seo.title
  const expected=new Set()
  for(const [kind,key,value]of metaEntries(seo)){
   const selector=`meta[${kind}="${key}"]`;expected.add(selector)
   const matches=[...document.head.querySelectorAll(selector)],node=matches.shift()||document.createElement('meta');matches.forEach(n=>n.remove())
   node.setAttribute(kind,key);node.setAttribute('content',value);node.dataset.seo='true';if(!node.parentNode)document.head.append(node)
  }
  document.head.querySelectorAll('meta[data-seo]').forEach(node=>{const kind=node.hasAttribute('property')?'property':'name';if(!expected.has(`meta[${kind}="${node.getAttribute(kind)}"]`))node.remove()})
  document.head.querySelectorAll('link[rel="canonical"]').forEach(n=>n.remove())
  if(seo.canonical){const link=document.createElement('link');link.rel='canonical';link.href=seo.canonical;document.head.append(link)}
 },[pathname,search,page,i18n.language])
 return <SeoContext.Provider value={setPage}>{children}</SeoContext.Provider>
}

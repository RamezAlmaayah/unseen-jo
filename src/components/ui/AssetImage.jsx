import {tx} from '../../i18n/index.js'
import { useEffect, useRef, useState } from 'react'
import {localImageSources} from './imageSources.js'

function ImageOrFallback({ alt, delivery, original=false, widths='640,1280', sizes, loading='lazy', onLoad, onError, ...props }) {
  const [unavailable, setUnavailable] = useState(false)
  const [sources,setSources]=useState(null),[fallback,setFallback]=useState(false),ref=useRef(null),mountedAt=useRef(0)
  useEffect(()=>{mountedAt.current=Date.now()},[])
  useEffect(()=>{
    if(!delivery)return
    let active=true,observer
    async function load(){
      try {
        const variants=original||fallback?[await delivery.original()]:await delivery.sources(widths.split(',').map(Number))
        if(active)setSources({src:variants[0].src,...(!original&&!fallback?{srcSet:variants.map(v=>`${v.src} ${v.width}w`).join(', '),sizes:sizes||`${props.width||640}px`}:{})})
      }catch{if(active){if(!original&&!fallback)setFallback(true);else setSources({src:props.src})}}
    }
    if(loading==='eager'||original||fallback||!globalThis.IntersectionObserver)void load()
    else {observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();void load()}},{rootMargin:'400px'});if(ref.current)observer.observe(ref.current)}
    return()=>{active=false;observer?.disconnect()}
  },[delivery,original,fallback,widths,sizes,loading,props.src,props.width])
  if(unavailable||!props.src)return <span className={`asset-unavailable ${props.className||''}`} role="img" aria-label={tx(`${alt}. Image unavailable`)}>{tx('Image unavailable')}</span>
  const resolved=delivery?(sources||{}):original?{src:props.src}:localImageSources(props.src,sizes,props.width)
  return <img {...props} {...resolved} ref={ref} data-original-src={props.src?.startsWith('/')?props.src:undefined} src={resolved.src} alt={tx(alt)} loading={loading} decoding="async" className={`asset-image ${props.className||''}`} onLoad={event=>{if(Date.now()-mountedAt.current>120&&!event.currentTarget.dataset.ready)event.currentTarget.classList.add('asset-image--arrived');event.currentTarget.dataset.ready='true';onLoad?.(event)}} onError={event=>{if(delivery&&!original&&!fallback){setSources(null);setFallback(true)}else{setUnavailable(true);onError?.(event)}}}/>
}

export default function AssetImage(props) { return <ImageOrFallback key={`${props.src}:${!!props.original}`} {...props} /> }

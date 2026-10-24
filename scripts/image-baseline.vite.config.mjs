// Measurement only: retain the original image renderer for a controlled A/B
// comparison against the identical current app/live content. Never deployed.
import config from '../vite.config.js'
export default {...config,plugins:[{
 name:'original-image-renderer-for-measurement',enforce:'pre',
 load(id){if(id.replaceAll('\\','/').endsWith('/src/components/ui/AssetImage.jsx'))return `
import {tx} from '../../i18n/index.js'
import {useState} from 'react'
function ImageOrFallback({alt,delivery,original,widths,sizes,...props}){
 const [unavailable,setUnavailable]=useState(false)
 return unavailable||!props.src?<span className={'asset-unavailable '+(props.className||'')} role="img" aria-label={tx(alt+'. Image unavailable')}>{tx('Image unavailable')}</span>:<img {...props} alt={tx(alt)} onError={()=>setUnavailable(true)}/>
}
export default function AssetImage(props){return <ImageOrFallback key={props.src} {...props}/>}
`}
},...config.plugins],cacheDir:'artifacts/image-performance/baseline-vite-cache',build:{outDir:'artifacts/image-performance/baseline-dist'}}

import {useMapLanguage,localizeLoadedMap} from '../../i18n/mapLanguage'
import {tx} from '../../i18n/index.js'
import {useEffect,useRef,useState} from 'react'
import Map,{Marker,NavigationControl,AttributionControl} from 'react-map-gl/maplibre'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import {MapPin,LocateFixed} from 'lucide-react'
import {hasCoordinates,JORDAN_BOUNDS} from '../map/geography'
import 'maplibre-gl/dist/maplibre-gl.css'
maplibregl.setWorkerUrl(workerUrl)
export default function CoordinatePicker({latitude,longitude,onChange,disabled=false}){
 const [camera,setCamera]=useState(null),ref=useRef(null),[ready,setReady]=useState(false),[error,setError]=useState(''),[attempt,setAttempt]=useState(0)
 const mapLocale=useMapLanguage(ref,ready)
 const point={latitude:latitude===''||latitude==null?NaN:Number(latitude),longitude:longitude===''||longitude==null?NaN:Number(longitude)},valid=hasCoordinates(point)
 useEffect(()=>{if(ready&&valid)ref.current?.jumpTo({center:[Number(longitude),Number(latitude)],zoom:Math.max(12,ref.current.getZoom())})},[latitude,longitude,ready,valid])
 useEffect(()=>{if(ready)return;const timer=setTimeout(()=>setError('Map loading timed out. Manual coordinate fields remain available.'),20000);return()=>clearTimeout(timer)},[ready,attempt])
 const choose=(lat,lon)=>{if(!disabled)onChange(Number(lat.toFixed(6)),Number(lon.toFixed(6)))}
 return <div className="admin-map-section"><div className="admin-map-hint"><MapPin size={16}/><span>{tx("Click the map or drag the pin. Arrow keys on the pin move it in small steps.")}</span></div><div className="admin-coordinate-map" data-map-ready={ready}>
 <Map key={`${attempt}-${mapLocale?'ar-JO':'en'}`} ref={ref} mapLib={maplibregl} locale={mapLocale} onMoveEnd={()=>{const m=ref.current;if(m){const c=m.getCenter();setCamera({latitude:c.lat,longitude:c.lng,zoom:m.getZoom()})}}} initialViewState={camera || (valid?{...point,zoom:12}:{latitude:31.3,longitude:36.5,zoom:6})} mapStyle="/maps/unseen-nature.json" minZoom={3} maxZoom={18} dragRotate={false} touchZoomRotate={false} renderWorldCopies={false} attributionControl={false} onLoad={()=>{localizeLoadedMap(ref);setReady(true);setError('')}} onClick={e=>choose(e.lngLat.lat,e.lngLat.lng)} onError={()=>setError('Some map layers could not load. Retry or enter coordinates manually.')}>
 <NavigationControl showCompass={false}/><AttributionControl compact={false} customAttribution='<a href="https://github.com/maputnik/osm-liberty">Liberty style</a> · CC BY 4.0 · modified by Unseen Jo'/>
 {tx(valid&&<Marker latitude={point.latitude} longitude={point.longitude} draggable={!disabled} onDragEnd={e=>choose(e.lngLat.lat,e.lngLat.lng)} anchor="bottom"><button type="button" className="admin-map-pin" aria-label={tx("Destination coordinate marker")} disabled={disabled} onKeyDown={e=>{const d={ArrowUp:[.0001,0],ArrowDown:[-.0001,0],ArrowLeft:[0,-.0001],ArrowRight:[0,.0001]}[e.key];if(d){e.preventDefault();e.stopPropagation();choose(point.latitude+d[0],point.longitude+d[1])}}}><MapPin size={28}/></button></Marker>)}
 </Map>{tx(!ready&&!error&&<p role="status" className="admin-map-message">{tx("Loading geographic map…")}</p>)}{tx(error&&<div className="admin-map-message" role="alert">{tx(error)}<button type="button" onClick={()=>{setReady(false);setError('');setAttempt(n=>n+1)}}>{tx("Retry map")}</button></div>)}</div><div className="admin-map-footer"><span dir="ltr" className="technical-value">{tx(valid?`${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`:'No destination coordinates selected')}</span><button type="button" className="admin-secondary" onClick={()=>ref.current?.fitBounds(JORDAN_BOUNDS,{padding:35,duration:0})}><LocateFixed size={15}/>{tx("View Jordan")}</button></div><p className="admin-help">{tx("Map selection is unverified until you record a reliable geographic source and review its precision. No coordinates are saved until Save Draft.")}</p></div>
}

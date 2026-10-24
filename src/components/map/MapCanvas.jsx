import {useMapLanguage,localizeLoadedMap} from '../../i18n/mapLanguage'
import {tx} from '../../i18n/index.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, { AttributionControl, Marker, ScaleControl } from 'react-map-gl/maplibre'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import Supercluster from 'supercluster'
import { Compass, Minus, Plus, RotateCcw, MapPin, Layers, Hand } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { hasCoordinates, JORDAN_BOUNDS, JORDAN_PADDING } from '../../features/map/geography.js'
import { markerCategories, markerCategory } from '../../features/map/categories.js'
import DestinationPopup from './DestinationPopup.jsx'
import 'maplibre-gl/dist/maplibre-gl.css'
import {readExploreState,saveExploreState} from '../../features/tourism/exploreState.js'

maplibregl.setWorkerUrl(workerUrl)
const DEFAULT_STYLE = '/maps/unseen-nature.json'
const mapStyle = import.meta.env.VITE_MAP_STYLE_URL?.trim() || DEFAULT_STYLE
const initialViewState = { longitude: 36.5, latitude: 31.3, zoom: 6, bearing: 0, pitch: 0 }

function MapViewportController({ mapRef, ready, focusRequest, origin, compact, reduced }) {
  const lastFocus = useRef(null), lastOrigin = useRef(null)
  useEffect(() => {
    if (!ready || !focusRequest || lastFocus.current === focusRequest.key || !hasCoordinates(focusRequest.place)) return
    lastFocus.current = focusRequest.key
    mapRef.current?.flyTo({ center: [focusRequest.place.longitude, focusRequest.place.latitude], zoom: 12.5, offset: [0, (mapRef.current?.getContainer().clientHeight ?? 430) / 2 - 80], duration: reduced ? 0 : 700, essential: false })
  }, [focusRequest, mapRef, ready, reduced])
  useEffect(() => {
    if (!ready || !origin || origin === lastOrigin.current || compact) return
    lastOrigin.current = origin
    mapRef.current?.flyTo({ center: [origin.longitude, origin.latitude], zoom: 10, duration: reduced ? 0 : 700, essential: false })
  }, [origin, ready, mapRef, reduced, compact])
  return null
}

export default function MapCanvas({ places = [], selectedId = null, onSelect, onClose, focusRequest, origin, categories = [], mode = 'supabase', compact = false,viewStateKey=null }) {
  const ref = useRef(null), host = useRef(null)
  const usedGps=useRef(false)
  const [camera,setCamera]=useState(()=>viewStateKey?readExploreState(viewStateKey).camera||null:null)
  useEffect(()=>{if(origin?.kind==='gps'){usedGps.current=true;if(viewStateKey)saveExploreState(viewStateKey,{camera:null})}},[origin?.kind,viewStateKey])
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false), [error, setError] = useState(''), [attempt, setAttempt] = useState(0)
  const [viewport, setViewport] = useState({ bounds: [-180,-85,180,85], zoom: 6, width: 0 })
  const [interaction, setInteraction] = useState(false)
  const [idle, setIdle] = useState(false)
  const mapLocale=useMapLanguage(ref,ready)
  // react-map-gl does not update this constructor option when props change.
  useEffect(() => {
    if (!ready) return
    const handler = ref.current?.getMap().cooperativeGestures
    if (interaction) handler?.disable()
    else handler?.enable()
  }, [interaction, ready])
  const mapped = useMemo(() => places.filter(hasCoordinates), [places])
  const selected = mapped.find(p => p.id === selectedId)
  const missing = places.length - mapped.length
  const clustered = mapped.length > 50
  const index = useMemo(() => {
    if (!clustered) return null
    return new Supercluster({ radius: 54, maxZoom: 16 }).load(mapped.filter(p => p.id !== selectedId).map(p => ({ type: 'Feature', properties: { id: p.id }, geometry: { type: 'Point', coordinates: [p.longitude,p.latitude] } })))
  }, [mapped, clustered, selectedId])
  const clusters = index ? index.getClusters(viewport.bounds, Math.floor(viewport.zoom)) : []
  const visible = index ? clusters.filter(c => !c.properties.cluster).map(c => mapped.find(p => p.id === c.properties.id)).filter(Boolean) : mapped
  if (index && selected && !visible.includes(selected)) visible.push(selected)
  const syncViewport = useCallback(() => {
    const map = ref.current
    if (!map) return
    const c=map.getCenter(),nextCamera={longitude:c.lng,latitude:c.lat,zoom:map.getZoom(),bearing:map.getBearing(),pitch:map.getPitch()};setCamera(nextCamera)
    if(viewStateKey&&!compact&&!usedGps.current&&origin?.kind!=='gps')saveExploreState(viewStateKey,{camera:nextCamera})
    const b = map.getBounds()
    setViewport({ bounds: [b.getWest(),b.getSouth(),b.getEast(),b.getNorth()], zoom: map.getZoom(), width: map.getContainer().clientWidth })
  }, [viewStateKey,compact,origin?.kind])
  useEffect(() => {
    if (ready) return
    const timeout = setTimeout(() => setError('Map loading is taking longer than expected. Check your connection and retry.'), 20_000)
    return () => clearTimeout(timeout)
  }, [ready, attempt])
  function reset() {
    setInteraction(false)
    if (compact && mapped[0]) ref.current?.jumpTo({ center: [mapped[0].longitude,mapped[0].latitude], zoom: 12 })
    else ref.current?.fitBounds(JORDAN_BOUNDS, { padding: JORDAN_PADDING, duration: reduced ? 0 : 600 })
  }
  function closePopup() {
    // A locale constructor change removes the old map and its popup before the
    // new map loads. That cleanup is not an administrator/user close action.
    const map=ref.current?.getMap()
    if(!map||map.getContainer().dataset.mapLanguage!==(mapLocale?'ar-JO':'en'))return
    host.current?.querySelector('.destination-marker[aria-pressed="true"]')?.focus(); onClose?.()
  }
  return <div ref={host} className="map-canvas" data-map-ready={ready} data-map-idle={idle} data-map-zoom={viewport.zoom.toFixed(2)} data-marker-count={mapped.length} onKeyDown={e => { if (e.key === 'Escape' && selected) { e.stopPropagation(); closePopup() } }}>
    <Map key={`${attempt}-${mapLocale?'ar-JO':'en'}`} ref={ref} mapLib={maplibregl} locale={mapLocale} initialViewState={camera || (compact && mapped[0] ? { ...initialViewState, longitude: mapped[0].longitude, latitude: mapped[0].latitude, zoom: 12 } : initialViewState)}
      mapStyle={mapStyle} minZoom={3} maxZoom={18} maxPitch={0} renderWorldCopies={false} attributionControl={false}
      dragRotate={false} touchZoomRotate={true} scrollZoom={interaction} cooperativeGestures={true} keyboard={true} canvasContextAttributes={{ antialias: true }}
      onLoad={() => { localizeLoadedMap(ref);setReady(true); setError(''); if (!compact&&!camera) ref.current?.fitBounds(JORDAN_BOUNDS, { padding: JORDAN_PADDING, duration: 0 }); syncViewport() }}
      onMoveStart={() => setIdle(false)} onIdle={() => setIdle(true)} onMoveEnd={syncViewport} onResize={syncViewport} onClick={() => onClose?.()} onError={event => { if (!event.error?.message?.includes('abort')) setError('Some map data could not load. You can retry; the destination list remains available.') }}
      >
      <AttributionControl position="bottom-right" compact={false} customAttribution='<a href="https://github.com/maputnik/osm-liberty">Liberty style</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · modified by Unseen Jo · <a href="https://github.com/mapbox/mapbox-gl-styles">OSM Bright / Mapbox</a> · <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>' />
      <ScaleControl position="bottom-left" unit="metric" />
      {tx(index ? clusters.filter(c => c.properties.cluster).map(cluster => <Marker key={`cluster-${cluster.id}`} longitude={cluster.geometry.coordinates[0]} latitude={cluster.geometry.coordinates[1]}><button className="map-cluster" type="button" aria-label={tx(`Zoom into ${cluster.properties.point_count} destinations`)} onClick={e => { e.stopPropagation(); ref.current?.easeTo({ center: cluster.geometry.coordinates, zoom: index.getClusterExpansionZoom(cluster.id), duration: reduced ? 0 : 500 }) }}>{tx(cluster.properties.point_count)}</button></Marker>) : null)}
      {tx(visible.map(place => { const { Icon, color } = markerCategory(place); return <Marker key={place.id} longitude={place.longitude} latitude={place.latitude} anchor="bottom">
        <button type="button" className={`destination-marker ${place.id === selectedId ? 'is-selected' : ''}`} style={{ '--marker-color': color }} data-place-id={place.id} data-latitude={place.latitude} data-longitude={place.longitude} aria-label={tx(`Show ${place.name} on map`)} aria-pressed={place.id === selectedId} onClick={e => { e.stopPropagation(); ref.current?.easeTo({ center: [ref.current?.getZoom() < 9 && (host.current?.clientWidth ?? 0) >= 600 ? ref.current.getCenter().lng : place.longitude, place.latitude], offset: [0, Math.min((host.current?.clientHeight ?? 430) / 2 - 80, ref.current?.getZoom() < 9 ? 100 : Infinity)], duration: reduced ? 0 : 400 }); onSelect?.(place) }}><Icon size={20} aria-hidden="true" /><span className="sr-only">{tx(place.category)}</span></button>
      </Marker> }))}
      {tx(origin && hasCoordinates(origin) ? <Marker longitude={origin.longitude} latitude={origin.latitude} anchor="center"><span className={`user-location user-location--${origin.kind}`} role="img" aria-label={tx(origin.kind === 'city' ? `${origin.name} approximate city centre` : 'Your current GPS reading')}><span /></span></Marker> : null)}
      {tx(selected ? <DestinationPopup place={selected} onClose={closePopup} sideAnchor={viewport.zoom < 9 && viewport.width >= 600} /> : null)}
    </Map>
    <MapViewportController mapRef={ref} ready={ready} focusRequest={focusRequest} origin={origin} compact={compact} reduced={reduced} />
    <div className="map-brand"><Compass size={24} aria-hidden="true" /><span><small>{tx("UNSEEN JO")}</small>{tx("Jordan nature atlas")}</span></div>
    <div className="map-controls" aria-label={tx("Map navigation controls")}>
      <button type="button" aria-label={tx("Zoom in")} disabled={!ready} onClick={() => ref.current?.zoomIn({ duration: reduced ? 0 : 250 })}><Plus size={20} /></button>
      <button type="button" aria-label={tx("Zoom out")} disabled={!ready} onClick={() => ref.current?.zoomOut({ duration: reduced ? 0 : 250 })}><Minus size={20} /></button>
      <button type="button" aria-label={tx(compact ? 'Reset destination view' : 'Reset Jordan view')} disabled={!ready} onClick={reset}><RotateCcw size={18} /></button>
    </div>
    {tx(!ready && !error ? <p className="map-loading" role="status">{tx("Loading Jordan’s geographic layers…")}</p> : null)}
    {tx(error ? <div className="map-error" role="alert"><p>{tx(error)}</p><button type="button" onClick={() => { setError(''); setReady(false); setAttempt(a => a + 1) }}>{tx("Retry map")}</button></div> : null)}
    <div className="map-bottom-note"><MapPin size={14} aria-hidden="true" /><span>{tx(mode === 'demo' ? 'Demo locations' : 'Curated destinations')} · {tx(mapped.length)}{tx(" mapped")}{tx(missing ? ` · ${missing} without coordinates` : '')}</span></div>
    {tx(!mapped.length && ready && !error ? <p className="map-empty sr-only" role="status">{tx(places.length ? 'These destinations have no verified map coordinates yet.' : 'No curated destinations in this view. Explore the geographic map freely.')}</p> : null)}
    <div className="map-toolstrip">
    <button type="button" aria-label={tx(interaction ? 'Page scroll mode' : 'Enable map gestures')} title={tx(interaction ? 'Switch back to page scrolling' : 'Enable one-finger drag and scroll zoom')} className="map-interaction-toggle" aria-pressed={interaction} onClick={() => setInteraction(v => !v)}><Hand size={17} aria-hidden="true" />{tx(interaction ? 'Scroll page' : 'Map gestures')}</button>
    {tx(!compact ? <details className="map-legend"><summary><Layers size={17} aria-hidden="true" />{tx("Map key")}</summary><div><p className="map-legend__heading">{tx("THE LIVING LANDSCAPE")}</p><div className="landscape-key"><span><i className="key-forest" />{tx("Woodland")}</span><span><i className="key-sand" />{tx("Sand & rock")}</span><span><i className="key-water" />{tx("Water")}</span><span><i className="key-road" />{tx("Roads")}</span></div><p className="map-legend__heading">{tx("CURATED DESTINATIONS")}</p>{tx(categories.map(category => { const config = markerCategories[category.slug]; const Icon = config?.Icon ?? MapPin; return <span key={category.slug}><Icon size={15} style={{ color: config?.color }} />{tx(category.name)}</span> }))}<p>{tx("Small base-map labels/POIs are provider data, not verified Unseen Jo attractions.")}</p></div></details> : null)}
    </div>
  </div>
}

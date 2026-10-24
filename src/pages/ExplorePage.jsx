import {usePageTitle} from '../i18n/usePageTitle'
import {useLocation as useRouterLocation} from 'react-router'
import {tx,formatNumber} from '../i18n/index.js'
import { useEffect,useMemo,useRef,useState,useSyncExternalStore } from 'react'
import { Search, X, Compass, TreePine, Route } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import SectionHeading from '../components/discovery/SectionHeading'
import CategoryFilter from '../components/discovery/CategoryFilter'
import DestinationCard from '../components/discovery/DestinationCard'
import DestinationPreview from '../components/discovery/DestinationPreview'
import DiscoveryPromo from '../components/discovery/DiscoveryPromo'
import ContentState from '../components/discovery/ContentState'
import Reveal from '../components/ui/Reveal'
import { useTourism } from '../features/tourism/useTourism'
import { filterPlaces } from '../features/tourism/model'
import { usePreviewFavorites } from '../features/discovery/usePreviewFavorites'
import TourismMap from '../components/map/TourismMap'
import NearYouControl from '../components/map/NearYouControl'
import { useLocation } from '../features/map/useLocation'
import { nearbyPlaces, hasCoordinates } from '../features/map/geography'
import { useReducedMotion } from 'motion/react'
import AttributeFilters from '../components/map/AttributeFilters'
import {readExploreState,saveExploreState} from '../features/tourism/exploreState.js'

const compactQuery = '(width < 64rem)'
const compactSnapshot = () => window.matchMedia(compactQuery).matches
const subscribeCompact = listener => { const query = window.matchMedia(compactQuery); query.addEventListener('change', listener); return () => query.removeEventListener('change', listener) }

const initialAttributes = { city: '', maxCost: null, maxMinutes: null, group: '' }

export default function ExplorePage({ mapRoute = false }) {
  const routerLocation=useRouterLocation()
  useEffect(()=>{if(routerLocation.hash!=='#destination-search')return;const frame=requestAnimationFrame(()=>document.getElementById('destination-search')?.focus());return()=>cancelAnimationFrame(frame)},[routerLocation.key,routerLocation.hash])
  const { destinations, categories: categoryOptions, status, error, retry, mode } = useTourism()
  const { favorites, toggleFavorite } = usePreviewFavorites()
  const viewStateKey=mode==='supabase'?(mapRoute?'map':'explore'):null
  const [restored]=useState(()=>readExploreState(viewStateKey)),didRestoreScroll=useRef(false)
  const [query, setQuery] = useState(restored.query||'')
  const [categories, setCategories] = useState(restored.categories||[])
  const [preview, setPreview] = useState(null)
  const [view, setView] = useState(() => restored.view||(mapRoute || mode === 'supabase' ? 'map' : 'list'))
  const compact = useSyncExternalStore(subscribeCompact, compactSnapshot, () => false)
  const compactMap = compact && view === 'map'
  const [selectedId, setSelectedId] = useState(restored.selectedId||null)
  const [focusRequest, setFocusRequest] = useState(null)
  const [radius, setRadius] = useState(25), [sortDistance, setSortDistance] = useState(true)
  const [attributes, setAttributes] = useState(restored.attributes||initialAttributes)
  const location = useLocation(setSelectedId)
  const reduced = useReducedMotion()
  useEffect(()=>{saveExploreState(viewStateKey,{query,categories,selectedId,attributes,view})},[viewStateKey,query,categories,selectedId,attributes,view])
  useEffect(()=>{if(!viewStateKey)return;const save=()=>saveExploreState(viewStateKey,{scroll:window.scrollY});let timer;const scroll=()=>{clearTimeout(timer);timer=setTimeout(save,200)};window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('pagehide',save);return()=>{clearTimeout(timer);save();window.removeEventListener('scroll',scroll);window.removeEventListener('pagehide',save)}},[viewStateKey])
  useEffect(()=>{if(!viewStateKey||status!=='ready'||didRestoreScroll.current)return;const frame=requestAnimationFrame(()=>{didRestoreScroll.current=true;window.scrollTo({top:restored.scroll||0,behavior:'instant'})});return()=>cancelAnimationFrame(frame)},[viewStateKey,status,restored.scroll])
  usePageTitle(mapRoute ? 'Jordan map | Unseen Jo' : 'Explore Jordan | Unseen Jo')
  const filtered = useMemo(() => nearbyPlaces(filterPlaces(destinations, { query, categorySlugs: categories, ...attributes }), location.origin, radius, sortDistance), [destinations, query, categories, attributes, location.origin, radius, sortDistance])
  const isFiltered = query !== '' || categories.length > 0 || location.origin !== null || attributes.city !== '' || attributes.group !== '' || attributes.maxCost !== null || attributes.maxMinutes !== null
  const visibleSelection = filtered.some(p => p.id === selectedId) ? selectedId : null
  function clearFilters() { setQuery(''); setCategories([]); setAttributes(initialAttributes); location.clear(); setSelectedId(null) }
  function selectFromCard(place) {
    setView('map')
    setSelectedId(place.id)
    setFocusRequest(current => ({ key: (current?.key ?? 0) + 1, place }))
    requestAnimationFrame(() => document.getElementById('explore-map')?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' }))
  }
  function selectFromMarker(place) {
    setSelectedId(place.id)
    document.querySelector(`[data-place-id="${CSS.escape(place.id)}"]`)?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' })
  }
  function toggleCategory(value) {
    setSelectedId(null)
    setCategories(current => value === 'all' ? [] : current.includes(value) ? current.filter(item => item !== value) : [...current, value])
  }
  return <div className="explore-page" data-view={view} data-layout={!compact && view === 'map' ? 'split' : 'list'}>
    <SectionHeading title={tx(mapRoute ? 'Your Jordan, mapped.' : 'Explore Jordan differently.')}>{tx("Discover hidden gems, local experiences, and places worth the journey.")}</SectionHeading>
    <div className="explore-workspace">
      <div className="explore-sidebar">
      <div className="explore-controls">
        <div className="explore-search">
          <Search size={24} aria-hidden="true" />
          <input id="destination-search" type="search" maxLength={160} aria-label={tx(mode === 'demo' ? 'Search demo destinations' : 'Search destinations')} placeholder={tx("Search places or experiences")} value={query} onChange={event => { setQuery(event.target.value); setSelectedId(null) }} />
          {tx(query ? <button type="button" onClick={() => { setQuery(''); setSelectedId(null) }} aria-label={tx("Clear search")}><X aria-hidden="true" /></button> : null)}
          <button type="button" className="explore-filter-shortcut" onClick={() => { if (compactMap) document.querySelector('.attribute-filters').open = true; requestAnimationFrame(() => document.querySelector('.explore-categories button')?.focus()) }} aria-label={tx("Go to category filters")}><img src="/assets/figma/explore/filters.png" alt={tx("")} width="50" height="50" /></button>
        </div>
        {tx(!compactMap ? <CategoryFilter selected={categories} onChange={toggleCategory} options={categoryOptions} mode={mode} /> : null)}
        <div className="explore-location-tools"><NearYouControl location={location} radius={radius} onRadius={value => { setRadius(value); setSelectedId(null) }} sort={sortDistance} onSort={setSortDistance} /><AttributeFilters value={attributes} onChange={value => { setAttributes(value); setSelectedId(null) }} places={destinations} mode={mode}>{tx(compactMap ? <section className="map-category-filters"><p>{tx("Destination categories")}</p><CategoryFilter selected={categories} onChange={toggleCategory} options={categoryOptions} mode={mode} /></section> : null)}</AttributeFilters><div className="map-view-jumps" role="group" aria-label={tx("Destination view")}><button type="button" aria-pressed={view === 'list'} aria-controls="explore-list" onClick={() => setView('list')}>{tx("List")}</button><button type="button" aria-pressed={view === 'map'} aria-controls="explore-map" onClick={() => setView('map')}>{tx("Map")}</button></div></div>
        <div className="explore-demo-notice"><p className="demo-label">{tx(destinations.some(p=>p.prototype)?'Private prototype destinations':compactMap ? (mode === 'demo' ? 'Local demo / not live data' : 'Live tourism collection') : mode === 'demo' ? 'Local demo · Figma sample values, not live tourism data' : 'Published destinations · unknown details are marked unavailable')}</p>
          <p className="explore-results-status" role="status">{tx(status === 'ready' ? `${filtered.length} ${mode === 'demo' ? 'demo ' : ''}${filtered.length === 1 ? 'destination' : 'destinations'}` : mode === 'demo' ? 'Local dataset' : 'Tourism collection')}</p>
          {tx(isFiltered ? <button type="button" className="text-action" onClick={clearFilters}>{tx("Clear search and filters")}</button> : null)}
        </div>
      </div>
      <div className="explore-results" id="explore-list" data-empty={filtered.length === 0} role="region" aria-label={tx("Destination results")} tabIndex={0} aria-busy={status === 'loading'}>
        {tx(status !== 'ready' ? <ContentState mode={mode} status={status} message={tx(error)} onAction={status === 'error' ? retry : undefined} />
          : filtered.length === 0 ? <ContentState mode={mode} status="empty" emptyTitle={location.origin ? 'No mapped destinations within this radius' : mode === 'supabase' && destinations.length ? 'No destinations match your search' : undefined} message={tx(location.origin ? 'Try a wider radius or clear location filtering. Places without verified coordinates cannot be included.' : mode === 'supabase' && destinations.length === 0 ? 'Our destination collection is being prepared. Please check back soon.' : 'Try another name or clear the selected categories.')} onAction={isFiltered ? clearFilters : undefined} actionLabel="Clear search and filters" />
            : <div className="explore-grid"><AnimatePresence initial={false}>
              {tx(filtered.map((place, index) => <Reveal key={place.id} layout exit={{ opacity: 0 }} delay={index * 0.06}>
                <DestinationCard place={place} compact={!compact && view === 'map'} selected={visibleSelection === place.id} favorite={favorites.includes(place.id)} onFavorite={toggleFavorite} onPreview={p => { if (hasCoordinates(p)) selectFromCard(p); setPreview(p) }} onMapSelect={selectFromCard} />
                {tx(location.origin ? <p className="destination-distance">≈ {formatNumber(place.distanceKm,{minimumFractionDigits:1,maximumFractionDigits:1})}{tx(" km · straight-line")}{tx(location.origin.kind === 'city' ? ' from city centre' : '')}</p> : null)}
              </Reveal>))}
            </AnimatePresence></div>)}
        {tx(mode === 'supabase' && status === 'ready' && destinations.length === 0 ? <article className="atlas-guide"><p className="atlas-guide__eyebrow">{tx("A DIFFERENT WAY TO DISCOVER")}</p><h2>{tx("Start with the landscape.")}</h2><ul><li><Route aria-hidden="true" size={20} /><span><strong>{tx("Cities & streets")}</strong>{tx("Zoom in for roads and local place names.")}</span></li><li><TreePine aria-hidden="true" size={20} /><span><strong>{tx("Nature & terrain")}</strong>{tx("Explore mapped parks, coastlines and land cover.")}</span></li><li><Compass aria-hidden="true" size={20} /><span><strong>{tx("Curated discoveries")}</strong>{tx("Verified destinations will appear when published.")}</span></li></ul><p>{tx("Map-provider labels are geographic context, not verified Unseen Jo recommendations.")}</p></article> : null)}
        <p className="sr-only" role="status">{tx(favorites.length ? `${favorites.length} saved places.` : '')}</p>
      </div>
      </div>
      <aside className="explore-map" id="explore-map" aria-label={tx("Interactive Jordan map")}>
        <TourismMap viewStateKey={viewStateKey} places={filtered} categories={categoryOptions} selectedId={visibleSelection} focusRequest={focusRequest} origin={location.origin} onSelect={selectFromMarker} onClose={() => setSelectedId(null)} mode={mode} />
        <p>{tx("Geographic map · provider POIs are separate from curated Unseen Jo destinations")}</p>
      </aside>
    </div>
    <DiscoveryPromo />
    <DestinationPreview place={preview ? destinations.find(place=>place.id===preview.id)||null : null} onClose={() => setPreview(null)} />
  </div>
}

import {tx,formatNumber} from '../../i18n/index.js'
import { Link } from 'react-router'
import { useEffect, useRef } from 'react'
import { Popup } from 'react-map-gl/maplibre'
import AssetImage from '../ui/AssetImage.jsx'
import { placeHref } from '../../features/tourism/model.js'
import { markerCategory } from '../../features/map/categories.js'

export default function DestinationPopup({ place, onClose, sideAnchor = false }) {
  const live = place.mode === 'supabase'
  const { Icon, color } = markerCategory(place)
  const article = useRef(null)
  useEffect(() => {
    const frame = requestAnimationFrame(() => article.current?.closest('.maplibregl-popup')?.querySelector('.maplibregl-popup-close-button')?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(frame)
  }, [place.id])
  return <Popup longitude={place.longitude} latitude={place.latitude} anchor={sideAnchor ? 'left' : 'bottom'} offset={28} maxWidth="240px" closeOnClick={false} onClose={onClose} focusAfterOpen={false}>
    <article ref={article} className="tourism-popup" aria-label={tx(`${place.name} map details`)}>
      {tx(live ? <AssetImage src={place.image} delivery={place.imageDelivery} widths="320,640" sizes="216px" alt={tx(`${place.name} destination cover`)} width="216" height="98" loading="lazy" /> : <div className="demo-category-cover demo-category-cover--popup" style={{ color }}><Icon size={30} aria-hidden="true" /><span>{tx("Map reference · ")}{tx(place.category)}</span></div>)}
      <p className="map-eyebrow">{tx(live ? 'UNSEEN JO DESTINATION' : 'DEMONSTRATION LOCATION')}</p>
      <h2>{tx(place.name)}</h2><p>{tx(place.category)}{tx(place.city ? ` · ${place.city}` : '')}</p>
      <p>{tx(live ? place.details?.description?.slice(0, 170) || 'Further destination information is not yet available.' : 'Sourced reference point for the local demonstration. Sample prices and travel times are omitted.')}</p>
      {tx(place.distanceKm != null ? <p>≈ {formatNumber(place.distanceKm,{minimumFractionDigits:1,maximumFractionDigits:1})}{tx(" km straight-line")}</p> : null)}
      {tx(live ? <p>{tx(place.costLabel)} · {tx(place.durationLabel)}</p> : null)}
      {tx(place.coordinatePrecision ? <p className="map-source-note">{tx(place.coordinatePrecision)}</p> : null)}
      {tx(!live && place.coordinateSource ? <a className="map-source-note" href={place.coordinateSource} target="_blank" rel="noopener noreferrer">{tx("Location source")}</a> : null)}
      <Link className="button" to={placeHref(place)}>{tx("View Details")}</Link>
    </article>
  </Popup>
}

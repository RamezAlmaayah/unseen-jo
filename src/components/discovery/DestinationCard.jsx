import {tx} from '../../i18n/index.js'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import AssetImage from '../ui/AssetImage'
import { placeHref } from '../../features/tourism/model'
import { MapPin } from 'lucide-react'
import { hasCoordinates } from '../../features/map/geography'
import { markerCategory } from '../../features/map/categories'

export default function DestinationCard({ place, large = false, compact = false, favorite, onFavorite, onPreview, onMapSelect, selected = false }) {
  const reduced = useReducedMotion()
  const directory = large ? 'result' : 'explore'
  const live = place.mode === 'supabase'
  const { Icon, color } = markerCategory(place)
  const ImageControl = compact ? 'div' : 'button'
  return (
    <motion.article className={`destination-card ${large ? 'destination-card--large' : ''} ${compact ? 'destination-card--compact' : ''} ${selected ? 'destination-card--selected' : ''}`} data-place-id={place.id} layout={!reduced}
      whileHover={reduced ? undefined : { y: compact ? -1 : -3 }} transition={{ duration: 0.2 }}>
      <ImageControl className={`destination-card__image destination-card__image--${large ? 'result' : place.crop}`} {...(!compact ? {type:'button',onClick:()=>onPreview(place),'aria-label':tx(`Open ${place.name} ${live ? '' : 'demo '}details preview`)} : {})}>
        {tx(!live && !place.image ? <span className="demo-category-cover" style={{ color }}><Icon size={32} aria-hidden="true" /><span>{tx("Photo pending verification")}</span></span> : <AssetImage src={large ? place.resultImage || place.image : place.image} delivery={place.imageDelivery} widths={large ? "640,1280,2400" : compact ? "320,640" : "640,1280"} sizes={large ? "(max-width: 600px) calc(100vw - 32px), 722px" : compact ? "auto, 128px" : "auto, (max-width: 600px) calc(100vw - 32px), (max-width: 1023px) 50vw, 560px"} alt={tx(place.alt)} width={large ? 722 : 344} height={large ? 314 : 179} loading={large ? 'eager' : 'lazy'} />)}
        {tx(!live && place.image ? <span className="destination-card__photo-note">{tx("Unverified demo photo")}</span> : null)}
      </ImageControl>
      {tx(onMapSelect ? <button type="button" className="destination-card__map-select" disabled={!hasCoordinates(place)} title={tx(hasCoordinates(place) ? 'Show on map' : 'Verified location unavailable')} aria-label={tx(`Locate ${place.name} on map`)} onClick={() => onMapSelect(place)}><MapPin size={18} aria-hidden="true" /></button> : null)}
      {place.translationFallback&&<p className="translation-notice">{tx("Arabic content is unavailable or awaiting review; English source content is shown.")}</p>}<div className="destination-card__body">
        <h2><Link className={compact ? 'destination-card__open' : undefined} to={placeHref(place)} title={compact ? place.name : undefined}>{tx(place.name)}</Link></h2>
        <p className="destination-card__category">{tx(place.category)}{tx(!live ? ' · Sample' : '')}</p>
        <button type="button" className={`preview-favorite ${favorite ? 'preview-favorite--selected' : ''}`} aria-label={tx(`Favorite ${place.name}`)} aria-pressed={favorite} title={tx("Save to My Discoveries")} onClick={() => onFavorite(place.id)}>
          <img src={`/assets/figma/${directory}/favorite.png`} alt={tx("")} width={large ? 56 : 24} height={large ? 57 : 24} />
          {tx(favorite ? <span className="preview-favorite__dot" aria-hidden="true" /> : null)}
        </button>
      </div>
      <dl className="destination-card__metadata" aria-label={tx(live ? 'Available destination information' : 'Illustrative Figma demo information')}>
        {tx([
          ['travel-time', place.prototype?'Prototype driving estimate':live ? 'Travel time unavailable' : 'Figma sample travel time, not live routing', place.travelLabel || (live ? 'Unavailable' : null)],
          ['duration', live ? 'Visit duration' : 'Demo visit duration', place.durationLabel],
          ['cost', live ? 'Available cost in JOD' : 'Demo estimated cost in JOD', live ? place.costLabel : `${place.costJod} JD`],
        ].filter(([icon]) => !compact || icon !== 'travel-time').map(([icon, label, value]) => <div key={icon}><dt><img src={`/assets/figma/${directory}/${icon}.png`} alt={tx("")} width={large ? 54 : 21} height={large ? 54 : 21} /><span className="sr-only">{tx(label)}</span></dt><dd>{tx(value)}</dd></div>))}
      </dl>
    </motion.article>
  )
}

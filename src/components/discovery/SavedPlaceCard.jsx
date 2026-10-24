import {tx} from '../../i18n/index.js'
import { Link } from 'react-router'
import { BookmarkMinus } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import AssetImage from '../ui/AssetImage'
import { placeHref } from '../../features/tourism/model'

export default function SavedPlaceCard({ place, onRemove }) {
  const reduced = useReducedMotion()
  return <motion.article layout={!reduced} className="saved-place-card" data-place-id={place.id} whileHover={reduced ? undefined : { y: -3 }} transition={{ duration: 0.18 }}>
    <Link to={placeHref(place)} className={`saved-place-card__image saved-place-card__image--${place.discoveryCrop || 'cover'}`} aria-label={tx(`View ${place.name} details`)}><AssetImage src={place.discoveryImage || place.image} delivery={place.imageDelivery} widths="320,640,1280" sizes="auto, (max-width:600px) 90vw, 416px" alt={tx(place.discoveryAlt || place.alt)} width="416" height="150" loading="lazy" /></Link>
    <div className="saved-place-card__body"><h2><Link to={placeHref(place)}>{tx(place.name)}</Link></h2><p>{tx(place.category)}</p></div>
    <dl className="saved-place-card__metadata"><div><dt><img src="/assets/figma/discoveries/duration.png" alt={tx("")} width="25" height="31" /><span className="sr-only">{tx("Visit duration")}</span></dt><dd>{tx(place.durationLabel?.replace('hr', 'hrs') || 'Duration unavailable')}</dd></div><div><dt><img src="/assets/figma/discoveries/cost.png" alt={tx("")} width="25" height="31" /><span className="sr-only">{tx("Available cost")}</span></dt><dd>{tx(place.mode === 'supabase' ? place.costLabel : `${place.costJod.toFixed(2)} JD`)}</dd></div></dl>
    <button type="button" className="saved-place-card__remove icon-control" aria-label={tx(`Remove ${place.name} from saved places`)} onClick={() => onRemove(place.id)}><BookmarkMinus size={21} aria-hidden="true" /></button>
  </motion.article>
}

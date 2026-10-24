import {tx} from '../../i18n/index.js'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import ButtonLink from '../ui/ButtonLink'
import AssetImage from '../ui/AssetImage'
import { placeHref } from '../../features/tourism/model'

export default function DestinationPreview({ place, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    if (place && !ref.current.open) ref.current.showModal()
    else if (!place && ref.current?.open) ref.current.close()
  }, [place])
  return (
    <dialog ref={ref} className="destination-preview" onClose={onClose} onCancel={onClose} aria-labelledby="destination-preview-title" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      {tx(place ? <div>
        <button type="button" className="destination-preview__close" onClick={onClose} aria-label={tx("Close destination preview")}><X aria-hidden="true" /></button>
        <p className="demo-label">{tx(place.prototype?'Private prototype destination · demonstration visitor information.':place.mode === 'supabase' ? 'Published destination · details preview' : 'Local demo · details preview')}</p>
        <h2 id="destination-preview-title">{tx(place.name)}</h2>
        <AssetImage className="destination-preview__image" src={place.image} delivery={place.imageDelivery} widths="640,1280,2400" sizes="(max-width: 640px) calc(100vw - 48px), 600px" loading="eager" alt={tx(place.alt)} width="600" height="250" />
        {tx(place.mode === 'supabase' ? <p>{tx(place.category)} · {tx(place.durationLabel)} · {tx(place.costLabel)}</p> : <p>{tx(place.category)} · {tx(place.durationLabel)} · {tx(place.costJod)}{tx(" JD estimated demo cost")}</p>)}
        <p>{tx(place.prototype?'Includes synthetic visitor information. Admin-only; not public publication.':place.mode === 'supabase' ? 'Only available source information is shown. Check destination conditions before visiting.' : 'These are illustrative Figma values, not verified travel advice or a booking offer.')}</p>
        <ButtonLink to={placeHref(place)} onClick={onClose}>{tx("View place details")}</ButtonLink>
      </div> : null)}
    </dialog>
  )
}

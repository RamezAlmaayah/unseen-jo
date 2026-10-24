import {tx} from '../../i18n/index.js'
import { useState } from 'react'
import DestinationCard from './DestinationCard'
import DestinationPreview from './DestinationPreview'
import MatchingReasons from './MatchingReasons'
import Reveal from '../ui/Reveal'
import ButtonLink from '../ui/ButtonLink'
import Button from '../ui/Button'
import { usePreviewFavorites } from '../../features/discovery/usePreviewFavorites'
import { placeHref } from '../../features/tourism/model'

export default function DiscoveryResultContent({ recommendation,onAgain,onEdit,againBusy=false }) {
  const { place, reasons } = recommendation
  const { favorites, toggleFavorite } = usePreviewFavorites()
  const [preview, setPreview] = useState(null)
  return <>
    <div className="discovery-result-grid">
      <Reveal entrance delay={0.08}><DestinationCard place={place} large favorite={favorites.includes(place.id)} onFavorite={toggleFavorite} onPreview={setPreview} />{place.details?.gallery?.[0]?.attribution&&<details className="recommendation-credit"><summary>{tx('Photo attribution and source')}</summary><p>{place.details.gallery[0].attribution}</p>{place.details.gallery[0].sourceUrl?.startsWith('https://')&&<a href={place.details.gallery[0].sourceUrl} target="_blank" rel="noopener noreferrer">{tx('Photo source')}</a>}</details>}</Reveal>
      <Reveal entrance delay={0.16}><MatchingReasons reasons={reasons} score={recommendation.score} coverage={recommendation.coverage} scoreSupported={recommendation.scoreSupported} weights={recommendation.weights}/></Reveal>
    </div>
    <Reveal className="discovery-result-actions" entrance delay={0.24}>
      <ButtonLink to={placeHref(place)}>{tx("Explore This Place")}</ButtonLink>
      {onAgain?<Button onClick={onAgain} disabled={againBusy} variant="secondary">{tx("Surprise Me Again")}</Button>:<ButtonLink to="/surprise-me" variant="secondary">{tx("Surprise Me Again")}</ButtonLink>}
      {onEdit&&<ButtonLink to={onEdit} variant="secondary">{tx('Edit Preferences')}</ButtonLink>}
    </Reveal>
    <DestinationPreview place={preview} onClose={() => setPreview(null)} />
    <p className="sr-only" role="status">{tx(favorites.length ? 'Guests save on this device; signed-in explorers sync with their account.' : '')}</p>
  </>
}

import {usePageTitle} from '../i18n/usePageTitle'
import {tx} from '../i18n/index.js'
import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useTourism } from '../features/tourism/useTourism'
import { placeHref } from '../features/tourism/model'
import { usePreviewFavorites } from '../features/discovery/usePreviewFavorites'
import ContentState from '../components/discovery/ContentState'
import PhotoGallery from '../components/discovery/PhotoGallery'
import VisitorInformation from '../components/discovery/VisitorInformation'
import Reveal from '../components/ui/Reveal'
import AssetImage from '../components/ui/AssetImage'
import Button from '../components/ui/Button'
import ButtonLink from '../components/ui/ButtonLink'
import NotFoundPage from './NotFoundPage'
import TourismMap from '../components/map/TourismMap'
import { hasCoordinates, directionsUrl } from '../features/map/geography'
const prose=value=>value?.replace(/\\n/g,'\n')

export default function PlaceDetailsPage() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const sample = params.get('sample') === 'figma'
  const { destinations, status, error, retry, mode } = useTourism(sample, true, slug)
  const { favorites, toggleFavorite } = usePreviewFavorites()
  const place = destinations.find(item => (item.slug || item.id) === slug)
  const live = mode === 'supabase'
  usePageTitle(`${place?.details?.title || place?.name || 'Place details'} | Unseen Jo`,place?.details?.description||'',sample||!!place?.prototype)
  if (status !== 'ready') return <div className="data-page-state"><ContentState mode={mode} status={status} message={tx(error)} onAction={status === 'error' ? retry : undefined} /></div>
  if (!place) return <NotFoundPage place />
  const details = place.details || {}
  const saved = favorites.includes(place.id)
  const located = hasCoordinates(place)
  const photos = details.gallery || [{ src: place.image, alt: place.alt }]
  return <div className={`place-details-page ${details.gallery ? '' : 'place-details-page--partial'}`}>
    <Reveal entrance><Link to="/explore" className="details-back"><ArrowLeft size={50} aria-hidden="true" />{tx("Back to results")}</Link></Reveal>
    <Reveal entrance delay={0.06}><PhotoGallery key={place.id} photos={photos} name={place.name} mode={mode} /></Reveal>
    <Reveal entrance delay={0.12} className="details-heading"><h1>{details.title || place.name}</h1><p>{tx(details.subtitle || place.category)}</p></Reveal>
    <p className="details-demo-note demo-label">{tx(place.prototype?'Private prototype destination · demonstration visitor information.':live ? 'Published destination · available source information.' : 'Figma sample · illustrative travel values, not verified advice.')}</p>
    {place.translationFallback&&<p className="translation-notice" role="status">{tx("Arabic content is unavailable or awaiting review; English source content is shown.")}</p>}
    <Reveal><VisitorInformation place={place}/></Reveal>
    <div className="details-content-grid">
      <div className="details-story"><Reveal><section aria-labelledby="why-go"><h2 id="why-go">{tx("Why go?")}</h2><p className="details-description" style={{whiteSpace:'pre-line'}}>{prose(details.description)||tx(live ? 'A detailed description is not yet available.' : 'A detailed description is unavailable in this local demo. The original Figma photograph and available sample metadata are shown here.')}</p>{tx(live && place.sourceUrl ? <p className="demo-label"><a href={place.sourceUrl} target="_blank" rel="noopener noreferrer">{tx("Destination source")}</a>{tx(place.verifiedAt ? ' · Essential information reviewed' : ' · Verification date unavailable')}</p> : null)}{details.visitorGuidance&&<details className="visitor-source-context"><summary>{tx("Additional source context")}</summary><p className="translation-guidance">{prose(details.visitorGuidance)}</p></details>}</section></Reveal>
        <Reveal><section className="details-experiences" aria-labelledby="experiences-heading"><h2 id="experiences-heading">{tx("What you’ll experience")}</h2>{details.activities?<p style={{whiteSpace:'pre-line'}}>{prose(details.activities)}</p>:tx(details.experiences ? <div className="experience-grid">{tx(details.experiences.map((experience, index) => <Reveal key={experience.title} delay={index * 0.05}><article className="experience-card"><AssetImage src={experience.image} alt={tx(experience.alt)} width="239" height="140" loading="lazy" /><h3>{tx(experience.title)}</h3><p>{experience.description}</p></article></Reveal>))}</div> : <p>{tx(live ? 'Additional experience details are not yet available.' : 'Supporting experience photographs and descriptions are unavailable for this demo destination.')}</p>)}</section></Reveal>
      </div>
      <Reveal className="details-map"><section aria-label={tx("Destination location")}>
        {tx(located ? <TourismMap places={[place]} compact mode={mode} /> : <div className="map-unavailable" role="status">{tx("Location unavailable · verified coordinates are not provided.")}</div>)}
        <p className="demo-label">{tx(located ? place.coordinatePrecision || 'Geographic location · confirm arrival and access conditions before travelling.' : 'No marker is shown without a verified location.')}</p>
        {tx(located ? <a className="button" href={directionsUrl(place)} target="_blank" rel="noopener noreferrer">{tx("Get Directions")}<span className="sr-only">{tx(" in an external map, new tab")}</span></a> : <Button disabled aria-describedby="directions-unavailable">{tx("Get Directions")}</Button>)}
        <p id="directions-unavailable" className="demo-label">{tx(located ? 'Opens the destination coordinates in Google Maps. No route or travel-time estimate is calculated here.' : 'Unavailable: verified destination coordinates are not provided.')}</p>
      </section></Reveal>
    </div>
    <Reveal className="details-actions"><Button aria-pressed={saved} onClick={() => toggleFavorite(place.id)}>{tx(saved ? 'Remove from My Discoveries' : 'Add My Discoveries')}</Button><ButtonLink to="/surprise-me" variant="secondary">{tx("Discover something else")}</ButtonLink></Reveal>
    <p className="details-save-status demo-label" role="status">{tx(saved ? place.prototype?'Saved privately on this device. Existing account favorites are preserved.':'Saved to My Discoveries. Guests save on this device; signed-in explorers sync with their account.' : 'Not saved. You can save places without an account.')}</p>
    <Reveal className="related-demo-places"><h2>{tx(live ? 'More destinations' : 'More demo destinations')}</h2><p className="demo-label">{tx(live ? 'Browse Explore for other published destinations · not personalized recommendations' : 'Other entries in the local collection · not personalized recommendations')}</p>{tx(live ? <Link to="/explore">{tx("Explore destinations")}</Link> : <ul>{tx(destinations.filter(item => item.id !== place.id).slice(0, 3).map(item => <li key={item.id}><Link to={placeHref(sample ? { ...item, mode: 'demo-sample' } : item)}>{tx(item.name)}<span>{tx(item.category)}</span></Link></li>))}</ul>)}</Reveal>
  </div>
}

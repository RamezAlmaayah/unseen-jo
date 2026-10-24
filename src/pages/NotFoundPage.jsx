import {usePageTitle} from '../i18n/usePageTitle'
import {tx} from '../i18n/index.js'
import Reveal from '../components/ui/Reveal'
import ButtonLink from '../components/ui/ButtonLink'

export default function NotFoundPage({ place = false }) {
  const title = place ? 'Place not found' : 'Page not found'
  usePageTitle(`${title} | Unseen Jo`)
  return <Reveal entrance className="not-found-page"><p className="account-eyebrow">{tx("404 · A different path awaits")}</p><h1>{tx(title)}</h1><p>{tx(place ? 'This destination is not currently available. Explore the available places to continue.' : 'This path does not lead to an available Unseen Jo page.')}</p><div className="inline-actions"><ButtonLink to="/explore">{tx("Explore places")}</ButtonLink><ButtonLink to="/" variant="secondary">{tx("Back to home")}</ButtonLink></div></Reveal>
}

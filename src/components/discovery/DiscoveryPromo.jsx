import {tx} from '../../i18n/index.js'
import ButtonLink from '../ui/ButtonLink'
import Reveal from '../ui/Reveal'

export default function DiscoveryPromo() {
  return <Reveal className="explore-promo promo-reveal"><section className="landing-promo" aria-labelledby="explore-promo-title">
    <img className="landing-promo__background" src="/assets/figma/explore/petra-promo-banner.png" alt={tx("")} width="2172" height="724" loading="lazy" />
    <img className="landing-promo__compass" src="/assets/figma/explore/compass.png" alt={tx("")} width="120" height="108" loading="lazy" />
    <div className="landing-promo__copy"><h2 id="explore-promo-title">{tx("Not sure where to go?")}</h2><p>{tx("Let us find something unexpected.")}</p></div>
    <ButtonLink to="/surprise-me" variant="gold">{tx("Surprise Me")}</ButtonLink>
  </section></Reveal>
}

import AssetImage from '../components/ui/AssetImage'
import {tx} from '../i18n/index.js'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import Reveal from '../components/ui/Reveal'
import ButtonLink from '../components/ui/ButtonLink'
import FeaturedCard from '../components/landing/FeaturedCard'
import { featuredDestinations } from '../data/featured-destinations'
import { useTourism } from '../features/tourism/useTourism'
import ContentState from '../components/discovery/ContentState'

export default function LandingPage() {
  const { destinations, status, error, retry, mode } = useTourism(false, false)
  const featured = mode === 'demo' ? featuredDestinations : destinations.slice(0, 3)

  return (
    <div className="landing-page">
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="landing-hero__artwork"><AssetImage className="landing-hero__image" src="/assets/figma/landing/landscape-hero.png" alt={tx("Jordanian hills and forested cliffs at sunset")} width="1859" height="846" fetchPriority="high" loading="eager" sizes="100vw" /></div>
        <div className="landing-hero__content">
          <Reveal entrance><p className="landing-hero__eyebrow">{tx("DISCOVER THE UNEXPECTED")}</p></Reveal>
          <Reveal entrance delay={0.08}>
            <h1 id="hero-title" className="landing-hero__title"><span>{tx("There’s more")}</span>{tx(' ')}<span>{tx("to Jordan.")}</span></h1>
          </Reveal>
          <Reveal entrance delay={0.16}>
            <p className="landing-hero__description">{tx("Find places and experiences that match your time, budget and interests.")}</p>
          </Reveal>
          <div className="landing-hero__actions">
            <Reveal entrance delay={0.22}><ButtonLink to="/preferences">{tx("Start Exploring")}</ButtonLink></Reveal>
            <Reveal entrance delay={0.28}><ButtonLink to="/map" variant="secondary">{tx("Explore Map")}</ButtonLink></Reveal>
          </div>
        </div>
      </section>

      <section className="featured-section" aria-labelledby="featured-title">
        <Reveal className="featured-section__heading">
          <div><h2 id="featured-title">{tx("Your next adventure starts here")}</h2><p>{tx("Hidden places. Real experiences. A different side of Jordan.")}</p></div>
          <Link className="view-all" to="/explore" aria-label={tx(mode === 'demo' ? 'View all demo destinations' : 'View all destinations')}>{tx(mode === 'demo' ? 'view all · demo' : 'view all')} <ArrowRight size={35} aria-hidden="true" /></Link>
        </Reveal>
        {tx(mode === 'supabase' && (status !== 'ready' || !featured.length) ? <ContentState mode={mode} status={status === 'ready' ? 'empty' : status} message={tx(error || 'Our destination collection is being prepared. Please check back soon.')} onAction={status === 'error' ? retry : undefined} /> : null)}
        <div className="featured-grid">
          {tx(featured.map((destination, index) => (
            <Reveal key={destination.id} delay={index * 0.08}><FeaturedCard destination={destination} /></Reveal>
          )))}
        </div>
      </section>

      <Reveal className="promo-reveal">
        <section className="landing-promo" aria-labelledby="promo-title">
          <AssetImage className="landing-promo__background" src="/assets/figma/landing/petra-promo-banner.png" alt={tx("")} width="2172" height="724" loading="lazy" sizes="100vw" />
          <AssetImage className="landing-promo__compass" src="/assets/figma/landing/compass.png" alt={tx("")} width="120" height="108" loading="lazy" />
          <div className="landing-promo__copy"><h2 id="promo-title">{tx("Not sure where to go?")}</h2><p>{tx("Let us find something unexpected.")}</p></div>
          <ButtonLink to="/surprise-me" variant="gold">{tx("Surprise Me")}</ButtonLink>
        </section>
      </Reveal>
    </div>
  )
}

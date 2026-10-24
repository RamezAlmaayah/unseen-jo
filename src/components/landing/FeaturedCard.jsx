import {tx} from '../../i18n/index.js'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import AssetImage from '../ui/AssetImage'

export default function FeaturedCard({ destination }) {
  const reduced = useReducedMotion()
  return (
    <motion.article className="featured-card" whileHover={reduced ? undefined : { y: -4 }} transition={{ duration: 0.2 }}>
      <div className="featured-card__image">
        <AssetImage src={destination.image} delivery={destination.imageDelivery} sizes="(max-width: 600px) calc(100vw - 32px), 355px" alt={tx(destination.alt)} width="355" height="188" loading="lazy" />
      </div>
      <div className="featured-card__copy">
        <h3>{tx(destination.mode === 'supabase' ? <Link to={`/places/${destination.slug}`}>{tx(destination.name)}</Link> : destination.name)}</h3>
        <p>{tx(destination.category)}</p>
      </div>
    </motion.article>
  )
}

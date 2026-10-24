import {tx} from '../../i18n/index.js'
import { motion, useReducedMotion } from 'motion/react'

const categories = [
  ['all', 'All'], ['nature', 'Nature'], ['history', 'History'], ['family', 'Family'],
  ['adventure', 'Adventure'], ['culture', 'Culture'], ['food', 'Food'], ['photography', 'Photography'],
]

export default function CategoryFilter({ selected, onChange, options, mode = 'demo' }) {
  const reduced = useReducedMotion()
  const choices = mode === 'demo' || !options ? categories : [['all', 'All'], ...options.map(c => [c.slug, c.name])]
  return <div className="explore-categories" role="group" aria-label={tx(mode === 'demo' ? 'Filter demo destinations by category' : 'Filter destinations by category')}>
    {tx(choices.map(([value, label]) => <motion.button type="button" key={value} className="category-pill" aria-pressed={value === 'all' ? selected.length === 0 : selected.includes(value)}
      onClick={() => onChange(value)} whileTap={reduced ? undefined : { scale: 0.96 }}>{tx(label)}</motion.button>))}
  </div>
}

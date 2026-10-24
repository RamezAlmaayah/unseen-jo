import {tx} from '../../i18n/index.js'
import { motion, useReducedMotion } from 'motion/react'

export default function PreferenceChoice({ name, option, checked, onChange, interest = false }) {
  const reduced = useReducedMotion()
  return (
    <motion.label className={`preference-choice ${interest ? 'preference-choice--interest' : ''} ${option.value === 'photography' ? 'preference-choice--photography' : ''}`}
      whileHover={reduced ? undefined : { y: -2 }} whileTap={reduced ? undefined : { scale: 0.98 }}>
      <input type={interest ? 'checkbox' : 'radio'} name={name} value={option.value} checked={checked} onChange={onChange} />
      <span className="preference-choice__surface" aria-hidden="true" />
      {tx(option.icon ? <span className="preference-choice__icon"><img src={`/assets/figma/preferences/${option.icon}`} alt={tx("")} width="47" height="45" /></span> : null)}
      {tx(option.symbol ? <span className="preference-choice__symbol" aria-hidden="true">{tx(option.symbol)}</span> : null)}
      <span className="preference-choice__label">{tx(option.label)}</span>
    </motion.label>
  )
}

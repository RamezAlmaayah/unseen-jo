import {tx} from '../../i18n/index.js'
import { motion, useReducedMotion } from 'motion/react'

export default function Reveal({ children, className, delay = 0, entrance = false, ...props }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={entrance ? { opacity: 1, y: 0 } : undefined}
      whileInView={entrance ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : delay, ease: 'easeOut' }}
      {...props}
    >{tx(children)}</motion.div>
  )
}

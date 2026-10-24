import {tx} from '../../i18n/index.js'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'

const MotionLink = motion.create(Link)

export default function ButtonLink({ to, variant = 'primary', className = '', children, ...props }) {
  const reduced = useReducedMotion()
  return (
    <MotionLink to={to} className={`button button--${variant} ${className}`}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.16 }} {...props}>
      {tx(children)}
    </MotionLink>
  )
}

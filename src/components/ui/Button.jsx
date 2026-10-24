import {tx} from '../../i18n/index.js'
import { motion, useReducedMotion } from 'motion/react'

const variants = {
  primary: 'button--primary',
  secondary: 'button--secondary',
  gold: 'button--gold',
  terracotta: 'button--terracotta',
}

export default function Button({ variant = 'primary', className = '', type = 'button', children, ...props }) {
  const reduced = useReducedMotion()
  return (
    <motion.button type={type} className={`button ${variants[variant] ?? variants.primary} ${className}`} whileHover={reduced || props.disabled ? undefined : { y: -2 }} whileTap={reduced || props.disabled ? undefined : { scale: 0.98 }} transition={{ duration: 0.16 }} {...props}>
      {tx(children)}
    </motion.button>
  )
}


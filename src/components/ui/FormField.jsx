import {tx} from '../../i18n/index.js'
import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function FormField({ label, error, hint, type = 'text', visibilityLabel, ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const password = type === 'password'
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
  return <div className="account-field"><label htmlFor={id}>{tx(label)}</label><div className={`account-field__control ${password ? 'account-field__control--password' : ''}`}><input {...props} id={id} type={password && visible ? 'text' : type} aria-invalid={error ? true : undefined} aria-describedby={describedBy} />{tx(password ? <button type="button" className="password-toggle" onClick={() => setVisible(value => !value)} aria-label={visibilityLabel?.(visible) || tx(`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`)} aria-pressed={visible}>{tx(visible ? <EyeOff size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />)}</button> : null)}</div>{tx(hint ? <p id={`${id}-hint`} className="field-hint">{tx(hint)}</p> : null)}{tx(error ? <p id={`${id}-error`} className="field-error">{tx(error)}</p> : null)}</div>
}

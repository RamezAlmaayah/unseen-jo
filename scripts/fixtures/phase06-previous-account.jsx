import {usePageTitle} from '../../src/i18n/usePageTitle'
import {tx} from '../../src/i18n/index.js'
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import Reveal from '../../src/components/ui/Reveal'
import Button from '../../src/components/ui/Button'
import FormField from '../../src/components/ui/FormField'
import { validateAccount } from '../../src/features/discovery/formValidation'

const copy = {
  login: { title: 'Welcome back.', subtitle: 'Your next discovery is waiting.', action: 'Log in', status: 'Login is unavailable in this UI preview. No session was created.' },
  register: { title: 'Start your journey.', subtitle: 'Make room for the places you haven’t found yet.', action: 'Create account', status: 'Registration is unavailable in this UI preview. No account was created.' },
  recovery: { title: 'Find your way back.', subtitle: 'Password recovery for your Unseen Jo account.', action: 'Request password reset', status: 'Password recovery is unavailable in this UI preview. No reset email was sent.' },
}

export default function AccountPage({ mode }) {
  const content = copy[mode]
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const form = useRef(null)
  usePageTitle(`${mode === 'recovery' ? 'Password recovery' : mode === 'register' ? 'Registration' : 'Login'} | Unseen Jo`)
  function update(key, value) { setValues(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); setStatus('') }
  function submit(event) {
    event.preventDefault()
    const nextErrors = validateAccount(values, mode)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setStatus('Please correct the highlighted fields.')
      requestAnimationFrame(() => form.current?.querySelector('[aria-invalid="true"]')?.focus())
    } else {
      setValues(current => ({ ...current, password: '', confirm: '' }))
      setStatus(content.status)
    }
  }
  return <div className={`account-page account-page--${mode}`}><Reveal entrance className="account-intro"><Link to="/" className="brand"><img src="/assets/figma/preferences/brand-logo.png" alt={tx("")} width="56" height="53" /><span>{tx("Unseen Jo")}</span></Link><p className="account-eyebrow">{tx("Jordan, beyond the familiar")}</p><h1>{tx(content.title)}</h1><p className="account-subtitle">{tx(content.subtitle)}</p><p className="account-display">{tx("A little curiosity.")}<br />{tx("A new discovery.")}</p><Link to="/explore" className="account-back"><ArrowLeft size={20} aria-hidden="true" />{tx("Keep exploring")}</Link></Reveal>
    <Reveal entrance delay={0.08} className="account-form-panel"><div className="account-preview-note"><LockKeyhole size={22} aria-hidden="true" /><p><strong>{tx("Account UI preview")}</strong>{tx("Authentication is not available yet. No credentials are sent or stored, and no account session is created.")}</p></div>
      <h2>{tx(mode === 'login' ? 'Log in to Unseen Jo' : mode === 'register' ? 'Create your account' : 'Reset your password')}</h2>
      {tx(mode === 'recovery' ? <p className="account-form-description">{tx("When authentication is connected, you’ll enter your account email here to request a recovery link. This preview validates the field only; it cannot send email.")}</p> : null)}
      <form ref={form} noValidate onSubmit={submit}>
        {tx(mode === 'register' ? <FormField label={tx("Full name")} name="name" autoComplete="name" required maxLength={100} value={values.name} onChange={event => update('name', event.target.value)} error={errors.name} /> : null)}
        <FormField label={tx("Email address")} name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={event => update('email', event.target.value)} error={errors.email} />
        {tx(mode !== 'recovery' ? <FormField label={tx("Password")} name="password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required value={values.password} onChange={event => update('password', event.target.value)} error={errors.password} hint={tx(mode === 'register' ? 'Preview rule: at least 8 characters, with a letter and a number.' : undefined)} /> : null)}
        {tx(mode === 'register' ? <FormField label={tx("Confirm password")} name="confirm-password" type="password" autoComplete="new-password" required value={values.confirm} onChange={event => update('confirm', event.target.value)} error={errors.confirm} /> : null)}
        {tx(mode === 'login' ? <Link to="/forgot-password" className="account-forgot">{tx("Forgot password?")}</Link> : null)}
        <Button type="submit" className="account-submit">{tx(content.action)}</Button><p className="account-submit-hint">{tx("Preview only · validates the form without an account service")}</p>
        <p role="status" className="account-form-status">{tx(status)}</p>
      </form>
      <p className="account-switch">{tx(mode === 'login' ? <>{tx("New to Unseen Jo? ")}<Link to="/register">{tx("Create an account")}</Link></> : mode === 'register' ? <>{tx("Already have an account? ")}<Link to="/login">{tx("Log in")}</Link></> : <Link to="/login">{tx("Return to login")}</Link>)}</p>
    </Reveal>
  </div>
}

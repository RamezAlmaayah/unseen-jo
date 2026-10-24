import {tx} from '../../i18n/index.js'
import Button from '../ui/Button'

export default function ContentState({ status, message, onAction, actionLabel = 'Try again', mode = 'demo', emptyTitle }) {
  const live = mode === 'supabase'
  return (
    <div className={`content-state content-state--${status}`} role={status === 'error' ? 'alert' : 'status'} aria-live="polite">
      <h2>{tx(status === 'loading' ? (live ? 'Loading destinations…' : 'Loading demo destinations…') : status === 'error' ? (live ? 'Destinations unavailable' : 'Demo destinations unavailable') : (emptyTitle || (live ? 'No published destinations available' : 'No demo destinations found')))}</h2>
      {tx(status === 'loading' ? <div className="tourism-skeleton" aria-hidden="true"><span /><span /><span /></div> : null)}
      {tx(message ? <p>{tx(message)}</p> : null)}
      {tx(onAction ? <Button onClick={onAction} variant="secondary">{tx(actionLabel)}</Button> : null)}
    </div>
  )
}

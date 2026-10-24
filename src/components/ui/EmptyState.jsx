import {tx} from '../../i18n/index.js'
import ButtonLink from './ButtonLink'

export default function EmptyState({ title, children, to, action }) {
  return <div className="empty-state"><h2>{tx(title)}</h2><p>{tx(children)}</p>{tx(to ? <ButtonLink to={to} variant="secondary">{tx(action)}</ButtonLink> : null)}</div>
}

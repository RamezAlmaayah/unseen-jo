import {tx} from '../../i18n/index.js'
import Reveal from '../ui/Reveal'

export default function SectionHeading({ title, children, className = '' }) {
  return <Reveal entrance className={`discovery-heading ${className}`}><h1>{tx(title)}</h1><p>{tx(children)}</p></Reveal>
}

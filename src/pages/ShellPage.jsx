import {usePageTitle} from '../i18n/usePageTitle'
import {tx} from '../i18n/index.js'
import { Link } from 'react-router'

export default function ShellPage({ title, description, homeLink = false }) {
  usePageTitle(`${title} | Unseen Jo`)

  return (
    <section aria-labelledby="page-title" className="max-w-5xl">
      <h1 id="page-title" className="text-section font-extrabold leading-tight text-primary">{tx(title)}</h1>
      {tx(description ? <p className="mt-4 max-w-3xl text-body text-primary">{tx(description)}</p> : null)}
      {tx(homeLink ? <Link className="button button--secondary mt-8" to="/">{tx("Back to home")}</Link> : null)}
    </section>
  )
}

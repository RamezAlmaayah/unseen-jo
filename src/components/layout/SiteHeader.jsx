import AccountNavigation from '../../features/account/AccountNavigation'
import BrandLogo from './BrandLogo'
import {tx} from '../../i18n/index.js'
import LanguageSwitcher from '../../i18n/LanguageSwitcher'
import { Search } from 'lucide-react'
import { Link,NavLink, useLocation } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { primaryNavigation } from '../../config/navigation'

export default function SiteHeader() {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  return (
    <motion.header className="site-header" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="site-header__inner">
        <div className="site-header__main">
          <BrandLogo />
          <nav className="primary-navigation" aria-label={tx("Primary")}>
            {tx(primaryNavigation.map(({ to, label }) => (
              <NavLink key={to} to={to} className={`navigation-link ${(to === '/explore' && (['/preferences', '/surprise-me'].includes(pathname) || pathname.startsWith('/places/'))) || (to === '/my-discoveries' && pathname === '/discovery-result') ? 'is-flow-active' : ''}`}>
                {tx(label)}
              </NavLink>
            )))}
          </nav>
        </div>
        <div className="site-header__actions">
          <LanguageSwitcher />
          <Link to="/explore#destination-search" className="search-action" aria-label={tx("Search destinations")} title={tx("Search destinations")}>
            <Search size={24} strokeWidth={2} aria-hidden="true" />
          </Link>
          <AccountNavigation/>
        </div>
      </div>
    </motion.header>
  )
}

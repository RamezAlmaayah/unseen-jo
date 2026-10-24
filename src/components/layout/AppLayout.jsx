import {tx} from '../../i18n/index.js'
import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import AccountSyncNotice from '../../features/account/AccountSyncNotice'

export default function AppLayout() {
  const { pathname } = useLocation()
  const mainRef = useRef(null)
  const previousPath = useRef(pathname)

  useEffect(() => {
    if (previousPath.current !== pathname) {
      mainRef.current?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'instant' })
      previousPath.current = pathname
    }
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#main-content">{tx("Skip to content")}</a>
      <SiteHeader />
      <AccountSyncNotice />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="full-page-main">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}

import {tx} from './i18n/index.js'
import './features/legal/navigationGuard.js'
import {useTranslation} from 'react-i18next'
import SeoProvider from './seo/SeoProvider'
import { MotionConfig } from 'motion/react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes,useSearchParams } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './pages/LandingPage'
import PreferencesPage from './pages/PreferencesPage'
import ExplorePage from './pages/ExplorePage'
import SurpriseMePage from './pages/SurpriseMePage'
import DiscoveryResultPage from './pages/DiscoveryResultPage'
import PlaceDetailsPage from './pages/PlaceDetailsPage'
import NotFoundPage from './pages/NotFoundPage'
import LegalPage from './pages/LegalPage'
import UserAuthProvider from './features/account/UserAuthProvider'
import UserAccountProvider from './features/account/UserAccountProvider'
import PersonalDiscoveriesProvider from './features/personal/PersonalDiscoveriesProvider'
import { PreferencesProvider } from './features/preferences/PreferencesProvider'
import RecommendationProvider from './features/recommendations/RecommendationProvider'
import {safeReturn} from './features/account/model.js'
const AdminApp = lazy(() => import('./features/admin/AdminApp'))
const AuthPage=lazy(()=>import('./pages/AuthPage'))
const AuthCallbackPage=lazy(()=>import('./pages/AuthCallbackPage'))
const ProfilePage=lazy(()=>import('./pages/ProfilePage'))
const MyDiscoveriesPage=lazy(()=>import('./pages/MyDiscoveriesPage'))
function LegacyAuthRedirect({mode}){const [params]=useSearchParams(),returnTo=safeReturn(params.get('returnTo'));return <Navigate to={`/auth?mode=${mode}${returnTo==='/profile'?'':`&returnTo=${encodeURIComponent(returnTo)}`}`} replace/>}

export default function App() {
  useTranslation()
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <SeoProvider>
        <UserAuthProvider><PreferencesProvider>
          <RecommendationProvider>
          <UserAccountProvider>
          <PersonalDiscoveriesProvider>
          <Routes>
            <Route path="admin/*" element={<Suspense fallback={<p role="status">{tx("Loading administrator workspace…")}</p>}><AdminApp /></Suspense>} />
            <Route element={<AppLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="preferences" element={<PreferencesPage />} />
              <Route path="privacy-policy" element={<LegalPage type="privacy" />} />
              <Route path="terms-of-service" element={<LegalPage type="terms" />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="surprise-me" element={<SurpriseMePage />} />
              <Route path="discovery-result" element={<DiscoveryResultPage />} />
              <Route path="map" element={<ExplorePage mapRoute />} />
              <Route path="places/:slug" element={<PlaceDetailsPage />} />
              <Route path="my-discoveries" element={<Suspense fallback={<p role="status">{tx('Loading your saved places…')}</p>}><MyDiscoveriesPage /></Suspense>} />
              <Route path="auth" element={<Suspense fallback={<p role="status">{tx('Loading account…')}</p>}><AuthPage/></Suspense>} />
              <Route path="auth/callback" element={<Suspense fallback={<p role="status">{tx('Loading account…')}</p>}><AuthCallbackPage/></Suspense>} />
              <Route path="login" element={<LegacyAuthRedirect mode="login"/>} />
              <Route path="register" element={<LegacyAuthRedirect mode="register"/>} />
              <Route path="forgot-password" element={<LegacyAuthRedirect mode="recovery"/>} />
              <Route path="profile" element={<Suspense fallback={<p role="status">{tx('Loading account…')}</p>}><ProfilePage/></Suspense>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          </PersonalDiscoveriesProvider></UserAccountProvider>
          </RecommendationProvider>
        </PreferencesProvider></UserAuthProvider>
        </SeoProvider>
      </BrowserRouter>
    </MotionConfig>
  )
}

import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import AppProviders from './context/AppProviders'
import ConciergeButton from './components/concierge/ConciergeButton'
import ConciergePanel from './components/concierge/ConciergePanel'

const Products          = lazy(() => import('./pages/Products'))
const Login             = lazy(() => import('./pages/Login'))
const Register          = lazy(() => import('./pages/Register'))
const ForgotPassword    = lazy(() => import('./pages/ForgotPassword'))
const ProductDetail     = lazy(() => import('./pages/ProductDetail'))
const Tickets           = lazy(() => import('./pages/Tickets'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const Admin             = lazy(() => import('./pages/Admin'))
const Favorites         = lazy(() => import('./pages/Favorites'))
const Help              = lazy(() => import('./pages/Help'))
const Legal             = lazy(() => import('./pages/Legal'))
const Concierge         = lazy(() => import('./pages/Concierge'))
const NotFound          = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0ead8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 28,
        height: 28,
        border: '3px solid rgba(196,146,42,0.2)',
        borderTopColor: '#c4922a',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function ScrollToTop() {
  const { pathname, state } = useLocation()
  useEffect(() => {
    if ((state as { scrollToCatalog?: boolean } | null)?.scrollToCatalog) return
    window.scrollTo(0, 0)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"                   element={<Products />} />
              <Route path="/login"              element={<Login />} />
              <Route path="/register"           element={<Register />} />
              <Route path="/restore-password"   element={<ForgotPassword />} />
              <Route path="/products"           element={<Products />} />
              <Route path="/products/:pid"      element={<ProductDetail />} />
              <Route path="/tickets"            element={<Tickets />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/admin"              element={<Admin />} />
              <Route path="/favorites"          element={<Favorites />} />
              <Route path="/help"               element={<Help />} />
              <Route path="/legal"              element={<Legal />} />
              <Route path="/concierge"          element={<Concierge />} />
              <Route path="*"                   element={<NotFound />} />
            </Routes>
          </Suspense>
          <ConciergeButton />
          <ConciergePanel />
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  )
}

import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import './BottomNav.css'

type BottomNavProps = {
  cartCount?: number
  onCartOpen?: () => void
}

const INACTIVE = 'rgba(255,255,255,0.45)'
const ACTIVE   = '#c4922a'

export default function BottomNav({ cartCount = 0, onCartOpen }: BottomNavProps) {
  const location = useLocation()
  const { user } = useUser()
  const isHome   = location.pathname === '/'

  // Flag <body> while mounted so other fixed/floating elements (e.g. the
  // Concierge FAB) can avoid this space without depending on CSS :has().
  useEffect(() => {
    document.body.classList.add('has-bottom-nav')
    return () => { document.body.classList.remove('has-bottom-nav') }
  }, [])

  const handleInicio = () => {
    if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">

      {/* Inicio */}
      <Link to="/" className={`bn-item ${isHome ? 'bn-active' : ''}`} onClick={handleInicio}>
        <svg width="21" height="21" fill={isHome ? ACTIVE : 'none'} stroke={isHome ? ACTIVE : INACTIVE} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isHome ? 2.5 : 1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="bn-item-label">Inicio</span>
      </Link>

      {/* Carrito */}
      <button className="bn-item bn-cart-center" onClick={onCartOpen} aria-label="Carrito">
        {cartCount > 0 && <span className="bn-cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>}
        <svg width="21" height="21" fill="none" stroke={INACTIVE} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 13H4L5 9z" />
        </svg>
        <span className="bn-item-label">Carrito</span>
      </button>

      {/* Favoritos */}
      <Link to="/favorites" className={`bn-item ${location.pathname === '/favorites' ? 'bn-active' : ''}`}>
        <svg width="21" height="21" fill={location.pathname === '/favorites' ? ACTIVE : 'none'} stroke={location.pathname === '/favorites' ? ACTIVE : INACTIVE} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={location.pathname === '/favorites' ? 2.5 : 1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="bn-item-label">Favoritos</span>
      </Link>

      {/* Mi cuenta / Mis pedidos según estado de auth */}
      {user ? (
        <Link
          to="/tickets"
          className={`bn-item ${location.pathname === '/tickets' ? 'bn-active' : ''}`}
          aria-label="Mis pedidos"
        >
          <svg width="21" height="21" fill="none" stroke={location.pathname === '/tickets' ? ACTIVE : INACTIVE} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={location.pathname === '/tickets' ? 2.5 : 1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="bn-item-label">Mis pedidos</span>
        </Link>
      ) : (
        <Link
          to="/login"
          className={`bn-item ${location.pathname === '/login' ? 'bn-active' : ''}`}
          aria-label="Mi cuenta"
        >
          <svg width="21" height="21" fill="none" stroke={INACTIVE} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="bn-item-label">Mi cuenta</span>
        </Link>
      )}

    </nav>
  )
}

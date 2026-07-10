import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { API_URL, apiFetch } from "../config/api";
import { useUser } from '../context/UserContext'
import './Navbar.css'
import './concierge/Concierge.css'

type NavbarProps = {
  cartId?: string
  role?: string
  cartCount?: number
  onCartOpen?: () => void
  userName?: string
}

export default function Navbar({ cartId, role, cartCount = 0, onCartOpen, userName }: NavbarProps) {
  const [userMenuOpen, setUserMenuOpen]   = useState(false)
  const [searchValue, setSearchValue]     = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [scrolled, setScrolled]           = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const searchRef       = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const navigate  = useNavigate()
  const location  = useLocation()
  const { refetch } = useUser()

  // Cerrar user-dropdown al hacer click fuera
  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenuOpen])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchValue(params.get('search') || '')
  }, [location.search])

  useEffect(() => {
    if (mobileSearchOpen) mobileSearchRef.current?.focus()
  }, [mobileSearchOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchValue.trim()
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
    setMobileSearchOpen(false)
  }

  const handleLogout = async () => {
    try { await apiFetch(`${API_URL}/auth/logout`) } catch (err) { console.error('[logout]', err) }
    await refetch()
    navigate('/', { replace: true })
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Mobile search overlay */}
      <div className={`mobile-search-overlay ${mobileSearchOpen ? 'open' : ''}`}>
        <button
          onClick={() => setMobileSearchOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', flexShrink: 0 }}
          aria-label="Cerrar búsqueda"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <form onSubmit={handleSearch} className="mobile-search-bar">
          <input
            ref={mobileSearchRef}
            type="search"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Buscar libros, autores..."
          />
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', display: 'flex' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      <header className={`navbar${scrolled ? ' scrolled' : ''}`} style={{ position: 'relative' }}>

        {/* Logo */}
        <Link to="/products" className="nav-logo">
          <div style={{ width: 28, height: 28, backgroundColor: 'rgba(196,146,42,0.15)', border: '1px solid rgba(196,146,42,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" fill="none" stroke="#c4922a" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'rgba(255,255,255,0.92)', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.01em' }}>Folio</span>
        </Link>

        {/* Desktop search */}
        <form className="nav-search-form" onSubmit={handleSearch}>
          <button type="submit" className="nav-search-btn" aria-label="Buscar">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <input
            ref={searchRef}
            className="nav-search-input"
            type="search"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Buscar libros, autores, géneros..."
          />
          {!searchValue && <span className="kbd">/</span>}
          {searchValue && (
            <button type="button" onClick={() => { setSearchValue(''); searchRef.current?.focus() }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', fontSize: 16, padding: 0 }}>×</button>
          )}
        </form>

        {/* Desktop nav links */}
        <nav className="nav-links">
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>Catálogo</Link>
          {cartId && <Link to="/tickets" className={`nav-link ${isActive('/tickets') ? 'active' : ''}`}>Pedidos</Link>}
          {role === 'admin' && <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>}
        </nav>

        {/* Right actions */}
        <div className="nav-right">

          {/* Mobile search icon */}
          <button className="mobile-search-icon-btn" onClick={() => setMobileSearchOpen(true)} aria-label="Buscar">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Favoritos — solo desktop */}
          <Link to="/favorites" className={`nav-icon-btn nav-favorites-btn ${isActive('/favorites') ? 'active' : ''}`} aria-label="Favoritos">
            <svg width="16" height="16" fill={isActive('/favorites') ? 'white' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>

          {/* Carrito — solo desktop (mobile: BottomNav) */}
          {onCartOpen && (
            <button onClick={onCartOpen} className="nav-icon-btn nav-cart-btn" style={{ cursor: 'pointer' }} aria-label="Carrito">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 13H4L5 9z" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>}
            </button>
          )}

          {/* Usuario — ícono en mobile, avatar+salir en desktop */}
          {cartId ? (
            <div ref={userMenuRef} className="nav-user-wrap" style={{ position: 'relative' }}>
              <button
                className="nav-avatar nav-user-btn"
                onClick={() => setUserMenuOpen(v => !v)}
                aria-label="Mi cuenta"
                title={userName}
              >
                {userName ? userName.charAt(0).toUpperCase() : '?'}
              </button>
              {userMenuOpen && (
                <div className="nav-user-dropdown">
                  {userName && <p className="nav-user-dropdown-name">{userName}</p>}
                  <button className="nav-user-dropdown-logout" onClick={handleLogout}>Salir</button>
                </div>
              )}
              {/* Salir — solo visible en desktop */}
              <button className="logout-link" onClick={handleLogout}>Salir</button>
            </div>
          ) : (
            <Link to="/login" className="nav-login-link" aria-label="Iniciar sesión">
              <svg className="nav-login-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="nav-login-text">Iniciar sesión</span>
            </Link>
          )}

        </div>

      </header>
    </>
  )
}

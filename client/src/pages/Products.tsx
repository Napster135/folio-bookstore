import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import { useToast } from '../context/ToastContext'
import { useUser } from '../context/UserContext'
import { useDocumentTitle } from '../hooks/useSEO'
import BookCard from '../components/BookCard'
import Hero from '../components/Hero'
import QuoteStrip from '../components/QuoteStrip'
import RecentlyViewedCarousel from '../components/RecentlyViewedCarousel'
import { useGuestCart } from '../context/GuestCartContext'
import { API_URL, apiFetch } from "../config/api";
import './Products.css'

type Product = {
  _id: string
  title: string
  author?: string
  category: string
  description: string
  price: number
  thumbnail: string
  stock: number
}

type ProductsData = {
  products: Product[]
  hasNextPage: boolean
  hasPrevPage: boolean
  page: number
  totalPages: number
  totalDocs: number
  categories: string[]
  user: { user: string; role: string; cartId: string } | null
  isAdmin: boolean
  isPremium: boolean
}

export default function Products() {
  const [data, setData] = useState<ProductsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const { user, cartCount, setCartCount } = useUser()
  const { count: guestCount } = useGuestCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(0)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [showAllCats, setShowAllCats] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const location = useLocation()

  // Scroll to catalog section when navigated here via BottomNav "Catálogo"
  useEffect(() => {
    if (!(location.state as { scrollToCatalog?: boolean } | null)?.scrollToCatalog) return
    const el = document.getElementById('catalogo')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [location.state])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const page = searchParams.get('page') || '1'
  const sort = searchParams.get('sort') || ''
  const query = searchParams.get('query') || ''
  const urlSearch = searchParams.get('search') || ''
  useDocumentTitle(urlSearch ? `"${urlSearch}" — Catálogo` : 'Catálogo de libros')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const params = new URLSearchParams()
    if (page) params.set('page', page)
    if (sort) params.set('sort', sort)
    if (query) params.set('query', query)
    if (urlSearch) params.set('search', urlSearch)

    apiFetch(`${API_URL}/api/products?${params.toString()}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(json => { if (json) setData(json) })
      .catch(err => { if (err.name !== 'AbortError') setError('No se pudieron cargar los productos.') })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [page, sort, query, urlSearch])

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) { next.set(key, value) } else { next.delete(key) }
    if (key !== 'page') next.set('page', '1')
    setSearchParams(next)
  }

  const clearFilters = () => { setSearchParams({ page: '1' }) }

  const handleAddToCart = async (productId: string) => {
    if (!user?.cartId) {
      // Guest: delegado a BookCard vía GuestCartContext
      return
    }
    setAddingToCart(productId)
    try {
      const res = await apiFetch(`${API_URL}/api/carts/${user.cartId}/product/${productId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        setCartCount(c => c + 1)
        setAddedToCart(productId)
        showToast('¡Agregado al carrito!', 'success')
        setTimeout(() => setAddedToCart(null), 2000)
      } else {
        showToast('No se pudo agregar al carrito', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    }
    finally { setAddingToCart(null) }
  }

  const totalCartCount = user ? cartCount : guestCount

  const hasFilters = query || sort || urlSearch || inStockOnly || maxPriceFilter > 0

  // Client-side filtering for sidebar
  const allProducts = data?.products ?? []
  const productMax = useMemo(
    () => allProducts.length > 0 ? Math.ceil(Math.max(...allProducts.map(p => p.price))) : 200,
    [allProducts]
  )
  const filteredProducts = useMemo(
    () => allProducts.filter(p => {
      if (inStockOnly && p.stock === 0) return false
      if (maxPriceFilter > 0 && p.price > maxPriceFilter) return false
      return true
    }),
    [allProducts, inStockOnly, maxPriceFilter]
  )

  // Compute category-tab vars outside JSX (avoid IIFE in render and window.innerWidth read)
  const allCats = data?.categories ?? []
  const VISIBLE = isMobile ? 2 : 5
  const queryIdx = allCats.indexOf(query)
  const catsExpanded = showAllCats || queryIdx >= VISIBLE
  const visibleCats = catsExpanded ? allCats : allCats.slice(0, VISIBLE)
  const hasMore = allCats.length > VISIBLE

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0ead8' }}>

      <Navbar cartId={user?.cartId} role={user?.role} cartCount={totalCartCount} onCartOpen={() => setCartOpen(true)} userName={user?.user} />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartId={user?.cartId}
        onCartCountChange={setCartCount}
      />

      <main className="products-main-pad" style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Hero — premium editorial */}
        {!hasFilters && (
          <div className="hero-zone">
            <Hero
              cartId={user?.cartId}
              onAddToCart={handleAddToCart}
              addingToCart={addingToCart}
              addedToCart={addedToCart}
            />
            <QuoteStrip />
          </div>
        )}

        <div id="catalogo" className="products-layout" style={{ scrollMarginTop: 80 }}>

          {/* Sidebar — desktop only */}
          <aside className="products-sidebar">
            <p style={{ fontSize: 13, fontWeight: 700, color: '#09090b', margin: '0 0 16px' }}>Filtros</p>

            {/* Categorías */}
            <div className="sidebar-section">
              <p className="sidebar-label">Categoría</p>
              <button className={`sidebar-cat-btn ${!query ? 'active' : ''}`} onClick={() => setFilter('query', '')}>
                <span>Todos</span>
              </button>
              {data?.categories.map(cat => (
                <button key={cat} className={`sidebar-cat-btn ${query === cat ? 'active' : ''}`} onClick={() => setFilter('query', query === cat ? '' : cat)}>
                  <span>{cat}</span>
                </button>
              ))}
            </div>

            {/* Precio máximo */}
            <div className="sidebar-section">
              <p className="sidebar-label">Precio máximo</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#71717a', marginBottom: 6 }}>
                <span>$0</span>
                <span style={{ fontWeight: 600, color: '#09090b' }}>{maxPriceFilter > 0 ? `$${maxPriceFilter}` : 'Todos'}</span>
              </div>
              <input
                type="range" className="sidebar-range"
                min={0} max={productMax} step={5}
                value={maxPriceFilter || productMax}
                onChange={e => setMaxPriceFilter(Number(e.target.value) === productMax ? 0 : Number(e.target.value))}
              />
            </div>

            {/* Stock */}
            <div className="sidebar-section">
              <p className="sidebar-label">Disponibilidad</p>
              <label className="sidebar-toggle" htmlFor="inStockOnly">
                <input id="inStockOnly" type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
                Solo disponibles
              </label>
            </div>

            {/* Orden */}
            <div className="sidebar-section">
              <p className="sidebar-label">Ordenar por precio</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {[{ v: 'asc', l: '↑ Menor' }, { v: 'desc', l: '↓ Mayor' }].map(({ v, l }) => (
                  <button key={v} onClick={() => setFilter('sort', sort === v ? '' : v)} style={{
                    flex: 1, padding: '6px 4px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                    border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                    backgroundColor: sort === v ? '#09090b' : 'transparent',
                    borderColor: sort === v ? '#09090b' : '#e4e4e7',
                    color: sort === v ? 'white' : '#3f3f46',
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button onClick={() => { clearFilters(); setMaxPriceFilter(0); setInStockOnly(false) }}
                style={{ width: '100%', padding: '7px', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#ef4444', background: 'none', border: '1px solid #fee2e2', cursor: 'pointer', fontFamily: 'inherit' }}>
                ✕ Limpiar filtros
              </button>
            )}
          </aside>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Tabs de categoría + Más + sort (desktop) */}
            <>
              <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                <div className="cat-tabs-wrap">
                  <div className="cat-tabs">
                    <button className={`cat-tab ${!query ? 'active' : ''}`} onClick={() => setFilter('query', '')}>Todos</button>
                    {visibleCats.map(cat => (
                      <button key={cat} className={`cat-tab ${query === cat ? 'active' : ''}`} onClick={() => setFilter('query', query === cat ? '' : cat)}>{cat}</button>
                    ))}
                    {/* Menos — al final de la lista cuando está expandido */}
                    {hasMore && catsExpanded && (
                      <button className="cat-tab cat-tab-more active" onClick={() => setShowAllCats(false)}>
                        Menos
                      </button>
                    )}
                  </div>
                </div>
                {/* Más — fuera del scroll, desaparece al expandir */}
                {hasMore && !catsExpanded && (
                  <button className="cat-tab cat-tab-more" style={{ flexShrink: 0 }} onClick={() => setShowAllCats(true)}>
                    Más
                  </button>
                )}
                {/* Sort — desktop only, mobile lo ve en la fila siguiente */}
                <div className="sort-controls" style={{ alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: '#a1a1aa' }}>Precio:</span>
                  {['asc', 'desc'].map(s => (
                    <button key={s} onClick={() => setFilter('sort', sort === s ? '' : s)} style={{
                      padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                      border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                      backgroundColor: sort === s ? '#09090b' : 'transparent',
                      borderColor: sort === s ? '#09090b' : '#e4e4e7',
                      color: sort === s ? 'white' : '#3f3f46',
                    }}>{s === 'asc' ? '↑' : '↓'}</button>
                  ))}
                </div>
              </div>

              {/* Fila de precio — mobile only */}
              <div className="sort-row-mobile">
                <span className="sort-row-label">Precio:</span>
                {['asc', 'desc'].map(s => (
                  <button key={s} className={`sort-row-btn${sort === s ? ' active' : ''}`} onClick={() => setFilter('sort', sort === s ? '' : s)}>
                    {s === 'asc' ? '↑ Menor' : '↓ Mayor'}
                  </button>
                ))}
                {hasFilters && (
                  <button className="sort-row-clear" onClick={() => { clearFilters(); setMaxPriceFilter(0); setInStockOnly(false) }}>
                    ✕ Limpiar
                  </button>
                )}
              </div>
            </>

            {/* Error */}
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: '#dc2626', margin: 0 }}>⚠️ {error}</p>
              </div>
            )}

            {/* Skeleton */}
            {loading && (
              <div className="books-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                    <div className="skel" style={{ aspectRatio: '3/4', width: '100%' }} />
                    <div style={{ padding: 12 }}>
                      <div className="skel" style={{ height: 10, width: '40%', marginBottom: 8 }} />
                      <div className="skel" style={{ height: 13, marginBottom: 12 }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className="skel" style={{ height: 14, width: '25%' }} />
                        <div className="skel" style={{ height: 28, width: '35%', borderRadius: 8 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#09090b', margin: '0 0 6px' }}>Sin resultados</h3>
                <p style={{ fontSize: 13, color: '#a1a1aa', margin: '0 0 16px' }}>Probá con otra búsqueda o remové los filtros</p>
                <button onClick={() => { clearFilters(); setMaxPriceFilter(0); setInStockOnly(false) }} style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, backgroundColor: '#09090b', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Ver todos
                </button>
              </div>
            )}

            {/* Grid — usa BookCard */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="books-grid">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <BookCard
                      product={product}
                      cartId={user?.cartId}
                      onAddToCart={handleAddToCart}
                      addingToCart={addingToCart}
                      addedToCart={addedToCart}
                    />
                  </motion.div>
                ))}
              </div>
            )}

          </div>{/* /main content */}
        </div>{/* /layout */}

        {/* Resultados — centrado antes de paginación */}
        {data && !loading && filteredProducts.length > 0 && (
          <p className="results-summary">
            {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
            {data.totalDocs ? ` de ${data.totalDocs}` : ''}
          </p>
        )}

        {/* Paginación */}
        {data && data.totalPages > 1 && !loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40 }}>
            <button onClick={() => setFilter('page', String(Number(page) - 1))} disabled={!data.hasPrevPage} style={{
              padding: '7px 16px', borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13,
              cursor: data.hasPrevPage ? 'pointer' : 'not-allowed', opacity: data.hasPrevPage ? 1 : 0.4,
              backgroundColor: 'white', color: '#3f3f46', fontFamily: 'inherit',
            }}>← Anterior</button>
            <span style={{ fontSize: 13, color: '#71717a', padding: '7px 14px', backgroundColor: '#f4f4f5', borderRadius: 8 }}>
              {page} / {data.totalPages}
            </span>
            <button onClick={() => setFilter('page', String(Number(page) + 1))} disabled={!data.hasNextPage} style={{
              padding: '7px 16px', borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13,
              cursor: data.hasNextPage ? 'pointer' : 'not-allowed', opacity: data.hasNextPage ? 1 : 0.4,
              backgroundColor: 'white', color: '#3f3f46', fontFamily: 'inherit',
            }}>Siguiente →</button>
          </div>
        )}

        {/* Vistos recientemente */}
        {!hasFilters && (
          <div style={{ marginTop: 56 }}>
            <RecentlyViewedCarousel />
          </div>
        )}

      </main>

      <Footer />
      <BottomNav cartCount={totalCartCount} onCartOpen={() => setCartOpen(true)} />
    </div>
  )
}
    
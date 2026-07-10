import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import { useToast } from '../context/ToastContext'
import { useUser } from '../context/UserContext'
import { useSEO } from '../hooks/useSEO'
import RelatedProducts from '../components/RelatedProducts'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { useFavorites } from '../hooks/useFavorites'
import { useGuestCart } from '../context/GuestCartContext'
import { useConcierge } from '../context/ConciergeContext'
import { shareProduct } from '../utils/shareProduct'
import { API_URL, apiFetch } from "../config/api";
import './ProductDetail.css'

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='560' viewBox='0 0 400 560'%3E%3Crect width='400' height='560' fill='%23f0ead8'/%3E%3Crect x='160' y='200' width='80' height='100' rx='4' fill='%23d4c9a8'/%3E%3Ctext x='200' y='340' text-anchor='middle' fill='%23a09070' font-family='sans-serif' font-size='14' font-weight='500'%3EFolio%3C/text%3E%3C/svg%3E"

type Product = {
  _id: string
  title: string
  author?: string
  category: string
  description: string
  price: number
  thumbnail: string
  stock: number
  code: string
}

type DetailData = {
  product: Product
  user: { user: string; role: string; cartId: string } | null
  isAdmin: boolean
  isPremium: boolean
}

const TRUST_SIGNALS = [
  {
    text: 'Envío gratis en pedidos +$50',
    icon: (
      <svg className="pdp-trust-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  {
    text: 'Pago 100% seguro con Stripe',
    icon: (
      <svg className="pdp-trust-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    text: 'Devolución gratuita en 30 días',
    icon: (
      <svg className="pdp-trust-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
]

export default function ProductDetail() {
  const { pid } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const { user, cartCount, setCartCount } = useUser()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [qty, setQty] = useState(1)
  const { addProduct: addToRecent } = useRecentlyViewed()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { addItem: addGuestItem, count: guestCount } = useGuestCart()
  const { openFresh } = useConcierge()

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    apiFetch(`${API_URL}/api/products/${pid}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(json => { if (json) setData(json) })
      .catch(err => { if (err.name !== 'AbortError') setError('No se pudo cargar el producto.') })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [pid])

  const handleAddToCart = async () => {
    if (!data?.product) return
    const p = data.product
    if (!user?.cartId) {
      // Guest: localStorage cart
      for (let i = 0; i < qty; i++) {
        addGuestItem({
          _id: p._id,
          title: p.title,
          price: p.price,
          thumbnail: p.thumbnail,
          quantity: 1,
          stock: p.stock,
          category: p.category,
        })
      }
      setAdded(true)
      showToast(`${qty > 1 ? qty + ' productos' : 'Producto'} agregado${qty > 1 ? 's' : ''} al carrito`, 'success')
      setTimeout(() => setAdded(false), 3000)
      return
    }
    setAdding(true)
    try {
      const res = await apiFetch(`${API_URL}/api/carts/${user.cartId}/product/${p._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty }),
      })
      if (res.ok) {
        setCartCount(c => c + qty)
        setAdded(true)
        showToast(`${qty > 1 ? qty + ' productos' : 'Producto'} agregado${qty > 1 ? 's' : ''} al carrito`, 'success')
        setTimeout(() => setAdded(false), 3000)
      } else {
        showToast('No se pudo agregar al carrito', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setAdding(false)
    }
  }

  const totalCartCount = user ? cartCount : guestCount

  const product = data?.product

  // Flag <body> while the mobile sticky "Agregar al carrito" bar is shown,
  // so the Concierge FAB (same corner) can hide itself.
  useEffect(() => {
    if (!product) return
    document.body.classList.add('has-sticky-cta')
    return () => { document.body.classList.remove('has-sticky-cta') }
  }, [product])

  useEffect(() => {
    if (product) {
      addToRecent({
        _id: product._id,
        title: product.title,
        author: product.author,
        price: product.price,
        thumbnail: product.thumbnail,
        category: product.category,
      })
    }
  }, [product?._id, product, addToRecent])

  useSEO({
    title: product ? product.title : 'Detalle de producto',
    description: product
      ? `${product.author ? `de ${product.author}. ` : ''}${product.description}`
      : undefined,
    image: product?.thumbnail,
    url: `/products/${pid}`,
    type: 'product',
    price: product?.price,
    availability: product && product.stock > 0 ? 'InStock' : 'OutOfStock',
    category: product?.category,
    author: product?.author,
    schema: product ? {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.title,
      image: product.thumbnail,
      description: product.description,
      brand: { '@type': 'Brand', name: product.author || 'Folio' },
      category: product.category,
      sku: product.code,
      offers: {
        '@type': 'Offer',
        url: `${window.location.origin}/products/${product._id}`,
        priceCurrency: 'USD',
        price: product.price,
        availability: product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'Folio' },
      },
    } : undefined,
  })

  const isFav = product ? isFavorite(product._id) : false

  const handleToggleFavorite = () => {
    if (!user) {
      showToast('Iniciá sesión para guardar favoritos', 'info')
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    if (!product) return
    toggleFavorite({
      _id: product._id,
      title: product.title,
      author: product.author,
      price: product.price,
      thumbnail: product.thumbnail,
      category: product.category,
      stock: product.stock,
    })
  }

  const handleShare = () => {
    if (!product) return
    shareProduct(product, showToast)
  }

  const handleOpenConcierge = () => {
    if (!product) return
    let msg = product.author
      ? `Busco libros parecidos a "${product.title}" de ${product.author}.`
      : `Busco libros similares a "${product.title}".`
    if (product.category) {
      msg += ` Me interesa seguir leyendo ${product.category}.`
    }
    openFresh(msg, {
      title: product.title,
      author: product.author,
      category: product.category,
      thumbnail: product.thumbnail,
    })
  }

  const stockDotClass = !product ? '' :
    product.stock > 5 ? 'in-stock' :
    product.stock > 0 ? 'low-stock' : 'out-of-stock'

  const stockLabel = !product ? '' :
    product.stock > 5 ? 'En stock' :
    product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'

  const SKELETON_WIDTHS = [80, 40, 100, 60, 200]

  return (
    <div className="pdp-page">
      <Navbar
        cartId={user?.cartId}
        role={user?.role}
        cartCount={totalCartCount}
        onCartOpen={() => setCartOpen(true)}
        userName={user?.user}
      />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartId={user?.cartId}
        onCartCountChange={setCartCount}
      />

      <main className="pdp-main">

        {/* Breadcrumb */}
        <div className="pdp-breadcrumb">
          <button className="back-btn" onClick={() => navigate('/products')}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al catálogo
          </button>
          {product && (
            <>
              <span className="pdp-breadcrumb-sep">/</span>
              <span className="pdp-breadcrumb-cat">{product.category}</span>
              <span className="pdp-breadcrumb-sep">/</span>
              <span className="pdp-breadcrumb-title">{product.title}</span>
            </>
          )}
        </div>

        {/* Error */}
        {error && <p className="pdp-error">{error}</p>}

        {/* Skeleton */}
        {loading && (
          <div className="pdp-skel-wrap">
            <div className="pdp-skel-cover" />
            <div className="pdp-skel-lines">
              {SKELETON_WIDTHS.map((w, i) => (
                <div
                  key={i}
                  className="pdp-skel-line"
                  style={{ height: i === 4 ? 80 : 20, width: `${w}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && product && (
          <div className="detail-grid">

            {/* Cover */}
            <div className="pdp-cover-wrap">
              <img
                className="pdp-cover-img"
                src={product.thumbnail}
                alt={product.title}
                loading="lazy"
                decoding="async"
                onError={e => {
                  ;(e.target as HTMLImageElement).src = FALLBACK_IMG
                }}
              />
              {product.stock > 0 && product.stock <= 5 && (
                <span className="pdp-stock-badge">
                  Últimas {product.stock} unidades
                </span>
              )}
            </div>

            {/* Info */}
            <div className="pdp-info">

              <div>
                <span className="pdp-category">{product.category}</span>

                <div className="pdp-header">
                  <h1 className="pdp-title">{product.title}</h1>
                  <div className="pdp-header-actions">
                    <button className="pdp-share-btn" onClick={handleShare} aria-label="Compartir">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button className="pdp-fav-btn" onClick={handleToggleFavorite} aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
                      <svg width="16" height="16" fill={isFav ? '#ef4444' : 'none'} stroke={isFav ? '#ef4444' : 'currentColor'} strokeWidth={1.75} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {product.author && (
                  <p className="pdp-author">por {product.author}</p>
                )}

                <p className="pdp-description">{product.description}</p>
              </div>

              {/* Price + stock */}
              <div className="pdp-price-row">
                <span className="pdp-price">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}</span>
                <div className="pdp-stock-indicator">
                  <div className={`pdp-stock-dot ${stockDotClass}`} />
                  <span className="pdp-stock-label">{stockLabel}</span>
                </div>
              </div>

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="pdp-qty-row">
                  <span className="pdp-qty-label">Cantidad</span>
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                  <span className="pdp-qty-count">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>+</button>
                  <span className="pdp-qty-max">máx. {product.stock}</span>
                </div>
              )}

              {/* Low stock warning */}
              {product.stock > 0 && product.stock <= 5 && (
                <p className="pdp-low-stock-warning">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  Solo quedan {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
                </p>
              )}

              {/* CTA — desktop */}
              <div className="desktop-cta">
                <button
                  className={`add-cart-btn${added ? ' added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0 || added}
                >
                  {added
                    ? '✓ Agregado al carrito'
                    : adding
                    ? 'Agregando...'
                    : `Agregar al carrito · $${(product.price * qty).toFixed(2)}`}
                </button>
              </div>

              {/* Details */}
              <div className="pdp-details">
                <p className="pdp-details-heading">Detalles</p>
                <div className="pdp-details-list">
                  {[
                    { label: 'Categoría', value: product.category },
                    ...(product.author ? [{ label: 'Autor', value: product.author }] : []),
                    { label: 'Disponibilidad', value: product.stock > 0 ? `${product.stock} unidades` : 'Sin stock' },
                  ].map(({ label, value }) => (
                    <div key={label} className="pdp-details-row">
                      <span className="pdp-details-label">{label}</span>
                      <span className="pdp-details-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust signals */}
              <div className="pdp-trust">
                {TRUST_SIGNALS.map(({ icon, text }) => (
                  <div key={text} className="pdp-trust-item">
                    {icon}
                    {text}
                  </div>
                ))}
              </div>

              {/* Concierge CTA */}
              <div className="pdp-concierge-card">
                <div className="pdp-concierge-header">
                  <span className="pdp-concierge-icon">✨</span>
                  <p className="pdp-concierge-title">¿Buscás algo parecido?</p>
                </div>
                <p className="pdp-concierge-desc">
                  El Librero IA puede recomendarte otros libros similares a este según el género, autor y estilo.
                </p>
                <button className="pdp-concierge-btn" onClick={handleOpenConcierge}>
                  Encontrar libros similares
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Related */}
        {!loading && product && (
          <RelatedProducts
            category={product.category}
            excludeId={product._id}
            cartId={user?.cartId}
            onCartCountChange={fn => setCartCount(fn)}
          />
        )}

      </main>

      <Footer />
      <BottomNav cartCount={totalCartCount} onCartOpen={() => setCartOpen(true)} />

      {/* Sticky CTA — mobile only */}
      {product && (
        <div className="sticky-cta">
          <div className="sticky-cta-row">
            <span className="sticky-cta-price">${(product.price * qty).toFixed(2)}</span>
            <div className="sticky-cta-qty">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
              <span className="pdp-qty-count">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>+</button>
            </div>
          </div>
          <button
            className={`add-cart-btn${added ? ' added' : ''}`}
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0 || added}
          >
            {added ? '✓ Agregado' : adding ? 'Agregando...' : `Agregar · $${(product.price * qty).toFixed(2)}`}
          </button>
        </div>
      )}
    </div>
  )
}

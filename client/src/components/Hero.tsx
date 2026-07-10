import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useFavorites, type FavoriteProduct } from '../hooks/useFavorites'
import { useUser } from '../context/UserContext'
import { useToast } from '../context/ToastContext'
import { useGuestCart } from '../context/GuestCartContext'
import { API_URL, apiFetch } from "../config/api";
import './Hero.css'

// ─── Types ───────────────────────────────────────────────────────────────────

export type HeroProduct = {
  _id: string
  title: string
  author?: string
  category: string
  description?: string
  price: number
  thumbnail: string
  stock: number
}

type HeroProps = {
  cartId?: string
  onAddToCart: (id: string) => void
  addingToCart: string | null
  addedToCart: string | null
}

// ─── Animation variants ───────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const slideUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

// ─── Mini card ────────────────────────────────────────────────────────────────

function MiniCard({ book }: { book: HeroProduct }) {
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { user } = useUser()
  const { showToast } = useToast()
  const [favAnim, setFavAnim] = useState(false)
  const isFav = isFavorite(book._id)

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      showToast('Iniciá sesión para guardar favoritos', 'info')
      navigate('/login')
      return
    }
    setFavAnim(true)
    setTimeout(() => setFavAnim(false), 300)
    toggleFavorite(book as FavoriteProduct)
  }

  return (
    <motion.div
      className="ph-mini-card"
      onClick={() => navigate(`/products/${book._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/products/${book._id}`)}
      aria-label={`Ver ${book.title}`}
      style={{ height: '100%' }}
      whileHover={{ scale: 1.015, boxShadow: '0 8px 24px rgba(0,0,0,0.14)', transition: { duration: 0.22 } }}
    >
      <div className="ph-mini-img-wrap">
        <img
          src={book.thumbnail}
          alt={book.title}
          className="ph-mini-img"
          loading="lazy"
          decoding="async"
          onError={e => {
            ;(e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23f0ead8'/%3E%3Ctext x='100' y='155' text-anchor='middle' fill='%23b8a87a' font-family='sans-serif' font-size='14'%3EFolio%3C/text%3E%3C/svg%3E"
          }}
        />
        <button
          className={`ph-mini-fav${isFav ? ' is-fav' : ''}${favAnim ? ' pop' : ''}`}
          onClick={handleFav}
          aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <svg
            width="13"
            height="13"
            fill={isFav ? '#ef4444' : 'none'}
            stroke={isFav ? '#ef4444' : '#71717a'}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      <div className="ph-mini-info">
        <p className="ph-mini-title">{book.title}</p>
        {book.author && <p className="ph-mini-author">{book.author}</p>}
        <p className="ph-mini-price">{fmt(book.price)}</p>
      </div>
    </motion.div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero({ cartId, onAddToCart, addingToCart, addedToCart }: HeroProps) {
  const [featured, setFeatured] = useState<HeroProduct | null>(null)
  const [miniBooks, setMiniBooks] = useState<HeroProduct[]>([])
  const [guestAdded, setGuestAdded] = useState(false)
  const [heroFavAnim, setHeroFavAnim] = useState(false)
  const navigate = useNavigate()
  const { addItem: addGuestItem } = useGuestCart()
  const { showToast } = useToast()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { user } = useUser()

  const handleHeroFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      showToast('Iniciá sesión para guardar favoritos', 'info')
      navigate('/login')
      return
    }
    setHeroFavAnim(true)
    setTimeout(() => setHeroFavAnim(false), 300)
    if (featured) toggleFavorite(featured as FavoriteProduct)
  }

  useEffect(() => {
    // Se pide más de lo que muestra la primera página de la grilla (20) para
    // elegir el destacado fuera de ese rango: así nunca duplica ni "agujerea" la grilla.
    apiFetch(`${API_URL}/api/products?limit=25`, { headers: { Accept: 'application/json' } })
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((j: { products?: HeroProduct[] }) => {
        const all = j?.products ?? []
        if (!all.length) return
        // Pool disjunto de la primera página de la grilla; si el catálogo es chico, se usa todo.
        const pool = all.length > 20 ? all.slice(20) : all
        // Fisher-Yates shuffle so hero books differ from catalog on every load
        const shuffled = [...pool].sort(() => Math.random() - 0.5)
        const feat =
          shuffled.find((p: HeroProduct & { featured?: boolean }) => p.featured) ??
          shuffled[0]
        setFeatured(feat)
        setMiniBooks(shuffled.filter(p => p._id !== feat._id).slice(0, 4))
      })
      .catch(() => {})
  }, [])

  if (!featured) return null

  const isAdding = addingToCart === featured._id
  const isAdded = addedToCart === featured._id || guestAdded

  const handleHeroCTA = () => {
    if (featured.stock === 0) return
    if (cartId) {
      onAddToCart(featured._id)
    } else {
      addGuestItem({
        _id: featured._id,
        title: featured.title,
        price: featured.price,
        thumbnail: featured.thumbnail,
        quantity: 1,
        stock: featured.stock,
        category: featured.category,
      })
      showToast('¡Agregado al carrito!', 'success')
      setGuestAdded(true)
      setTimeout(() => setGuestAdded(false), 2500)
    }
  }

  return (
    <div className="ph-root">
      {/* ── Left: dark editorial column ── */}
      <div className="ph-left">
        {/* Atmospheric overlays */}
        <div className="ph-left-ambient" aria-hidden="true" />
        <div className="ph-left-grain" aria-hidden="true" />

        {/* Text side */}
        <motion.div
          className="ph-left-body"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Badge mobile — encima del título, solo en mobile */}
          <motion.span className="ph-badge ph-badge-mobile" variants={slideUp}>
            <span className="ph-badge-dot" />
            Libro del mes
          </motion.span>
          <motion.h2 className="ph-title" variants={slideUp}>{featured.title}</motion.h2>

          {featured.author && (
            <motion.p className="ph-author" variants={slideUp}>{featured.author}</motion.p>
          )}

          <motion.div className="ph-rating" variants={slideUp}>
            <span className="ph-rating-stars">★★★★</span>
            <span className="ph-rating-half">☆</span>
            <span className="ph-rating-count">· 847 reseñas</span>
          </motion.div>

          <motion.p className="ph-desc" variants={slideUp}>
            {(featured.description ?? '').length > 130
              ? featured.description!.slice(0, 130) + '…'
              : (featured.description ?? '')}
          </motion.p>

          <motion.div className="ph-price-row" variants={slideUp}>
            <span className="ph-price-current">{fmt(featured.price)}</span>
          </motion.div>

          <motion.div className="ph-ctas" variants={slideUp}>
            <button
              className="ph-cta-primary"
              onClick={handleHeroCTA}
              disabled={isAdding || featured.stock === 0}
            >
              {isAdded
                ? '✓ Agregado'
                : isAdding
                ? 'Agregando...'
                : featured.stock === 0
                ? 'Sin stock'
                : 'Agregar al carrito'}
            </button>

            <button
              className="ph-cta-outline"
              onClick={() => navigate(`/products/${featured._id}`)}
            >
              Ver producto →
            </button>
          </motion.div>

          <motion.div className="ph-trust" variants={slideUp}>
            <span className="ph-trust-item">Envíos a todo el país</span>
            <span className="ph-trust-sep">·</span>
            <span className="ph-trust-item">Compra segura</span>
            <span className="ph-trust-sep">·</span>
            <span className="ph-trust-item">Miles de lectores felices</span>
          </motion.div>
        </motion.div>

        {/* Image side */}
        <div className="ph-left-img-col">
          <motion.span
            className="ph-badge"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="ph-badge-dot" />
            Libro del mes
          </motion.span>

          <motion.div
            className="ph-left-img-wrap"
            initial={{ opacity: 0, scale: 0.96, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
              scale:   { duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.9 },
            }}
          >
            <div className="ph-left-img-glow" />
            <div className="ph-img-inner">
              <img
                className="ph-left-img"
                src={featured.thumbnail}
                alt={featured.title}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <button
                className={`ph-hero-fav${featured && isFavorite(featured._id) ? ' is-fav' : ''}${heroFavAnim ? ' pop' : ''}`}
                onClick={handleHeroFav}
                aria-label={featured && isFavorite(featured._id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <svg
                  width="13" height="13"
                  fill={featured && isFavorite(featured._id) ? '#ef4444' : 'none'}
                  stroke={featured && isFavorite(featured._id) ? '#ef4444' : '#71717a'}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right: cream 2×2 mini-card grid ── */}
      <div className="ph-right">
        <div className="ph-mini-grid">
          {miniBooks.map((book, i) => (
            <motion.div
              key={book._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: '100%', minHeight: 0 }}
            >
              <MiniCard book={book} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

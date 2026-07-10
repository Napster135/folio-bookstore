import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFavorites, type FavoriteProduct } from '../hooks/useFavorites'
import { useGuestCart } from '../context/GuestCartContext'
import { useUser } from '../context/UserContext'
import { useToast } from '../context/ToastContext'
import './BookCard.css'

export type BookCardProduct = {
  _id: string
  title: string
  titleEs?: string
  author?: string
  category: string
  description?: string
  price: number
  currency?: string
  thumbnail: string
  stock: number
}

type BookCardProps = {
  product: BookCardProduct
  cartId?: string
  onAddToCart?: (productId: string) => void
  addingToCart?: string | null
  addedToCart?: string | null
  compact?: boolean
}

const formatPrice = (price: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='560' viewBox='0 0 400 560'%3E%3Crect width='400' height='560' fill='%23f0ead8'/%3E%3Crect x='160' y='200' width='80' height='100' rx='4' fill='%23d4c9a8'/%3E%3Crect x='172' y='215' width='56' height='6' rx='2' fill='%23b8a87a'/%3E%3Crect x='172' y='228' width='40' height='4' rx='2' fill='%23b8a87a'/%3E%3Crect x='172' y='245' width='56' height='40' rx='2' fill='%23c9bda0'/%3E%3Ctext x='200' y='340' text-anchor='middle' fill='%23a09070' font-family='sans-serif' font-size='14' font-weight='500'%3EFolio%3C/text%3E%3C/svg%3E"

function BookCard({
  product,
  cartId,
  onAddToCart,
  addingToCart,
  addedToCart,
  compact = false,
}: BookCardProps) {
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { addItem: addGuestItem } = useGuestCart()
  const { user } = useUser()
  const { showToast } = useToast()
  const [favAnim, setFavAnim] = useState(false)
  const [guestAdded, setGuestAdded] = useState(false)

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFavAnim(true)
    setTimeout(() => setFavAnim(false), 300)
    toggleFavorite(product as FavoriteProduct)
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (cartId) {
      // Logged-in: usar backend cart
      onAddToCart?.(product._id)
    } else {
      // Guest: usar localStorage cart
      if (product.stock === 0) return
      addGuestItem({
        _id: product._id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: 1,
        stock: product.stock,
        category: product.category,
      })
      showToast('¡Agregado al carrito!', 'success')
      setGuestAdded(true)
      setTimeout(() => setGuestAdded(false), 2000)
    }
  }

  const isFav = isFavorite(product._id)
  const isAdding = addingToCart === product._id
  const isAdded = addedToCart === product._id || guestAdded
  const isLowStock = product.stock > 0 && product.stock <= 5

  const showCartBtn = !!(cartId && onAddToCart) || (!cartId && !user)

  return (
    <article
      className={`book-card${compact ? ' compact' : ''}`}
      onClick={() => navigate(`/products/${product._id}`)}
      aria-label={`Ver detalle de ${product.title}`}
    >
        <div className="book-img-wrap">
          <img
            src={product.thumbnail}
            alt={`${product.title}${product.author ? ` de ${product.author}` : ''}`}
            className="book-img"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = FALLBACK_IMG
            }}
          />

          {isLowStock && <span className="stock-badge">Últimas unidades</span>}
          {product.stock === 0 && <span className="stock-badge out">Sin stock</span>}

          <button
            className={`fav-btn${isFav ? ' is-fav' : ''}${favAnim ? ' fav-anim' : ''}`}
            onClick={handleFav}
            aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <svg
              width="15"
              height="15"
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

        <div className="book-content">
          <span className="book-category">{product.category}</span>
          <h3 className="book-title">{product.title}</h3>
          {product.titleEs && <p className="book-title-es">{product.titleEs}</p>}
          {product.author && <p className="book-author">{product.author}</p>}

          <div className="book-footer">
            <span className="book-price">
              {formatPrice(product.price, product.currency || 'USD')}
            </span>

            {showCartBtn && (
              <button
                className={`cart-pill${isAdded ? ' added' : ''}`}
                onClick={handleAdd}
                disabled={isAdding || product.stock === 0}
                aria-label={isAdded ? 'Agregado' : 'Agregar al carrito'}
              >
                {/* Ícono — visible solo en mobile */}
                <svg className="cart-pill-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {isAdded
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    : product.stock === 0
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 13H4L5 9z" />
                  }
                </svg>
                {/* Texto — visible solo en desktop */}
                <span className="cart-pill-text">
                  {isAdded ? '✓' : product.stock === 0 ? 'Sin stock' : 'Agregar'}
                </span>
              </button>
            )}
          </div>
        </div>
    </article>
  )
}

export default memo(BookCard)

import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConcierge, type ConciergeBook } from '../../context/ConciergeContext'
import { useUser } from '../../context/UserContext'
import { useGuestCart } from '../../context/GuestCartContext'
import { useFavorites } from '../../hooks/useFavorites'
import { useToast } from '../../context/ToastContext'
import { API_URL, apiFetch } from "../../config/api";
import './Concierge.css'

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='560' viewBox='0 0 400 560'%3E%3Crect width='400' height='560' fill='%23f0ead8'/%3E%3Ctext x='200' y='290' text-anchor='middle' fill='%23a09070' font-family='sans-serif' font-size='14'%3EFolio%3C/text%3E%3C/svg%3E"

const fmt = (p: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p)

export default function ConciergeBookCard({
  book,
  featured = false,
}: {
  book: ConciergeBook
  featured?: boolean
}) {
  const navigate = useNavigate()
  const { close } = useConcierge()
  const { user, setCartCount } = useUser()
  const { addItem: addGuestItem } = useGuestCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { showToast } = useToast()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const isFav = isFavorite(book._id)

  const goDetail = () => {
    close()
    navigate(`/products/${book._id}`)
  }

  const handleCart = async (e: MouseEvent) => {
    e.stopPropagation()
    if (adding || added) return

    if (!user?.cartId) {
      addGuestItem({
        _id: book._id,
        title: book.title,
        price: book.price,
        thumbnail: book.thumbnail,
        quantity: 1,
        stock: book.stock,
        category: book.category,
      })
      setAdded(true)
      showToast('Producto agregado al carrito', 'success')
      setTimeout(() => setAdded(false), 3000)
      return
    }

    setAdding(true)
    try {
      const res = await apiFetch(`${API_URL}/api/carts/${user.cartId}/product/${book._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 }),
      })
      if (res.ok) {
        setCartCount(c => c + 1)
        setAdded(true)
        showToast('Producto agregado al carrito', 'success')
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

  const handleFav = (e: MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      showToast('Iniciá sesión para guardar favoritos', 'info')
      return
    }
    toggleFavorite({
      _id: book._id,
      title: book.title,
      author: book.author,
      price: book.price,
      thumbnail: book.thumbnail,
      category: book.category,
      stock: book.stock,
    })
  }

  return (
    <div className={`concierge-book-card${featured ? ' featured' : ''}`}>
      {featured && (
        <div className="concierge-book-featured-badge">⭐ Destacado</div>
      )}

      <div
        className="concierge-book-card-main"
        onClick={goDetail}
        role="link"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && goDetail()}
      >
        <img
          src={book.thumbnail || FALLBACK_IMG}
          alt={book.title}
          className="concierge-book-thumb"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG }}
        />
        <div className="concierge-book-info">
          <div>
            <div className="concierge-book-category">{book.category}</div>
            <div className="concierge-book-title">{book.title}</div>
            {book.author && <div className="concierge-book-author">{book.author}</div>}
            {book.description && (
              <div className="concierge-book-desc">{book.description}</div>
            )}
          </div>
          <div className="concierge-book-price">{fmt(book.price)}</div>
        </div>
      </div>

      <div className="concierge-book-actions">
        <button className="concierge-action-btn detail" onClick={goDetail}>
          <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver detalle
        </button>

        <button
          className={`concierge-action-btn cart${added ? ' added' : ''}`}
          onClick={handleCart}
          disabled={adding}
        >
          {added ? (
            <>✓ Agregado</>
          ) : (
            <>
              <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {adding ? '…' : 'Al carrito'}
            </>
          )}
        </button>

        <button
          className={`concierge-action-btn fav${isFav ? ' active' : ''}`}
          onClick={handleFav}
          aria-label={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <svg
            width="12" height="12"
            fill={isFav ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

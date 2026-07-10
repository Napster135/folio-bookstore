import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { useFavorites } from '../hooks/useFavorites'
import './RecentlyViewedCarousel.css'

export default function RecentlyViewedCarousel() {
  const { items } = useRecentlyViewed()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)

  if (items.length === 0) return null

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' })
  }

  return (
    <section className="rv-section">
      <div className="rv-header">
        <h2 className="rv-header-title">Vistos recientemente</h2>
        <div className="rv-scroll-btns">
          <button className="rv-scroll-btn" onClick={() => scroll('left')} aria-label="Anterior">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="rv-scroll-btn" onClick={() => scroll('right')} aria-label="Siguiente">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="rv-track">
        {items.map(p => (
          <div key={p._id} className="rv-card" onClick={() => navigate(`/products/${p._id}`)}>
            <div className="rv-img-wrap">
              <img
                src={p.thumbnail}
                alt={p.title}
                className="rv-img"
                loading="lazy"
                decoding="async"
                onError={e => {
                  ;(e.target as HTMLImageElement).src =
                    'https://placehold.co/110x147/f4f1ea/555555?text=Folio'
                }}
              />
            </div>
            <button
              className="rv-fav"
              onClick={e => { e.stopPropagation(); toggleFavorite({ ...p, stock: 0 }) }}
              aria-label={isFavorite(p._id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <svg
                width="11" height="11"
                fill={isFavorite(p._id) ? '#ef4444' : 'none'}
                stroke={isFavorite(p._id) ? '#ef4444' : '#71717a'}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <div className="rv-card-body">
              <p className="rv-card-title">{p.title}</p>
              {p.author && <p className="rv-card-author">{p.author}</p>}
              <p className="rv-card-price">${p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

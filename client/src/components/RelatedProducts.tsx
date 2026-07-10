import { useEffect, useState } from 'react'
import BookCard from './BookCard'
import { useToast } from '../context/ToastContext'
import { API_URL, apiFetch } from "../config/api";
import './RelatedProducts.css'

type Product = {
  _id: string
  title: string
  author?: string
  category: string
  description?: string
  price: number
  thumbnail: string
  stock: number
}

type Props = {
  category: string
  excludeId: string
  cartId?: string
  onCartCountChange?: (fn: (c: number) => number) => void
}

export default function RelatedProducts({ category, excludeId, cartId, onCartCountChange }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (!category) return
    setLoading(true)
    apiFetch(`${API_URL}/api/products?query=${encodeURIComponent(category)}&limit=6`, {
      headers: { Accept: 'application/json' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.products) {
          setProducts(json.products.filter((p: Product) => p._id !== excludeId).slice(0, 5))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, excludeId])

  const handleAddToCart = async (productId: string) => {
    if (!cartId) return
    setAddingToCart(productId)
    try {
      const res = await apiFetch(`${API_URL}/api/carts/${cartId}/product/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        onCartCountChange?.(c => c + 1)
        setAddedToCart(productId)
        showToast('¡Agregado al carrito!', 'success')
        setTimeout(() => setAddedToCart(null), 2000)
      } else {
        showToast('No se pudo agregar', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setAddingToCart(null)
    }
  }

  if (!loading && products.length === 0) return null

  return (
    <section className="related-section">
      <div className="related-header">
        <h2 className="related-title">También te puede interesar</h2>
        <a
          href={`/products?query=${encodeURIComponent(category)}`}
          className="related-link"
        >
          Ver todo en {category} →
        </a>
      </div>

      <div className="related-grid">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="related-skel-card">
                <div className="skel related-skel-img" />
                <div className="related-skel-body">
                  <div className="skel" style={{ height: 10, width: '40%' }} />
                  <div className="skel" style={{ height: 12 }} />
                  <div className="skel" style={{ height: 12, width: '70%' }} />
                </div>
              </div>
            ))
          : products.map(p => (
              <BookCard
                key={p._id}
                product={p}
                cartId={cartId}
                onAddToCart={handleAddToCart}
                addingToCart={addingToCart}
                addedToCart={addedToCart}
                compact
              />
            ))
        }
      </div>
    </section>
  )
}

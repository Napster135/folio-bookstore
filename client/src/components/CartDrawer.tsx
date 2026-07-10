import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PaymentModal from './PaymentModal'
import { useGuestCart, type GuestCartItem } from '../context/GuestCartContext'
import { useUser } from '../context/UserContext'
import { API_URL, apiFetch } from "../config/api";
import './CartDrawer.css'

type CartItem = {
  _id: string
  title: string
  price: number
  thumbnail: string
  quantity: number
}

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
  cartId?: string
  onCartCountChange?: (count: number) => void
}

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='68' viewBox='0 0 52 68'%3E%3Crect width='52' height='68' fill='%23f0ead8'/%3E%3Ctext x='26' y='38' text-anchor='middle' fill='%23b8a87a' font-family='sans-serif' font-size='8'%3EFolio%3C/text%3E%3C/svg%3E"

export default function CartDrawer({ isOpen, onClose, cartId, onCartCountChange }: CartDrawerProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const navigate = useNavigate()

  const { items: guestItems, removeItem: removeGuest, updateQty: updateGuestQty,
          count: guestCount, total: guestTotal } = useGuestCart()

  const isGuest = !cartId
  const { user: currentUser } = useUser()
  const isPremium = !isGuest && currentUser?.role === 'premium'
  const isAdmin = !isGuest && currentUser?.role === 'admin'

  // ── Backend cart fetch (logged-in) ──────────────────────────
  const fetchCart = useCallback(async () => {
    if (!cartId) return
    setLoading(true)
    try {
      const res = await apiFetch(`${API_URL}/api/carts/${cartId}`, { headers: { Accept: 'application/json' } })
      if (!res.ok) { console.error('[CartDrawer] fetch not ok:', res.status); return }
      const json = await res.json()
      const raw = json.productsInCart ?? json.products ?? json
      setItems(Array.isArray(raw) ? raw : [])
    } catch (e) { console.error('[CartDrawer] fetch error:', e) }
    finally { setLoading(false) }
  }, [cartId])

  useEffect(() => {
    if (isOpen && !isGuest) fetchCart()
  }, [isOpen, fetchCart, isGuest])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !paymentOpen) onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, paymentOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const notifyCount = (updated: CartItem[]) => {
    onCartCountChange?.(updated.reduce((acc, p) => acc + p.quantity, 0))
  }

  // ── Backend cart actions (logged-in) ────────────────────────
  const handleRemove = async (pid: string) => {
    if (!cartId) return
    setRemovingId(pid)
    try {
      const res = await apiFetch(`${API_URL}/api/carts/${cartId}/product/${pid}`, { method: 'DELETE' })
      if (!res.ok) return
      const updated = items.filter(p => p._id !== pid)
      setItems(updated)
      notifyCount(updated)
    } catch (e) { console.error('[CartDrawer] remove error:', e) }
    finally { setRemovingId(null) }
  }

  const handleQtyChange = async (pid: string, delta: number) => {
    if (!cartId) return
    const item = items.find(p => p._id === pid)
    if (!item) return
    const newQty = item.quantity + delta
    if (newQty < 1) return
    try {
      const res = await apiFetch(`${API_URL}/api/carts/${cartId}/product/${pid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: newQty }),
      })
      if (!res.ok) return
      const updated = items.map(p => p._id === pid ? { ...p, quantity: newQty } : p)
      setItems(updated)
      notifyCount(updated)
    } catch (e) { console.error('[CartDrawer] qty error:', e) }
  }

  const handlePaymentSuccess = (code: string) => {
    setPaymentOpen(false)
    onClose()
    navigate(`/order-confirmation${code ? `?code=${code}` : ''}`, { replace: true })
  }

  // ── Unified display data ────────────────────────────────────
  const displayItems: CartItem[] = isGuest
    ? guestItems.map((g: GuestCartItem) => ({
        _id: g._id, title: g.title, price: g.price, thumbnail: g.thumbnail, quantity: g.quantity,
      }))
    : items

  const subtotal = isGuest
    ? guestTotal
    : items.reduce((acc, p) => acc + p.price * p.quantity, 0)
  const discountRate = isAdmin ? 0.20 : isPremium ? 0.10 : 0
  const discountAmount = Math.round(subtotal * discountRate * 100) / 100
  const total = Math.round((subtotal - discountAmount) * 100) / 100

  const itemCount = isGuest
    ? guestCount
    : items.reduce((acc, p) => acc + p.quantity, 0)

  // ── Guest qty/remove ────────────────────────────────────────
  const handleGuestQtyChange = (pid: string, delta: number) => {
    const item = guestItems.find(i => i._id === pid)
    if (!item) return
    const newQty = item.quantity + delta
    if (newQty < 1) removeGuest(pid)
    else updateGuestQty(pid, newQty)
  }

  const onRemove = isGuest
    ? (pid: string) => removeGuest(pid)
    : handleRemove

  const onQtyChange = isGuest
    ? (pid: string, delta: number) => handleGuestQtyChange(pid, delta)
    : handleQtyChange

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`} aria-label="Carrito de compras">

        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header-inner">
            <svg width="18" height="18" fill="none" stroke="#09090b" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 13H4L5 9z" />
            </svg>
            <span className="drawer-title">Mi carrito</span>
            {itemCount > 0 && <span className="drawer-badge">{itemCount}</span>}
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Cerrar carrito">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Guest banner */}
        {isGuest && itemCount > 0 && (
          <div style={{ margin: '0 16px 0', padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="13" height="13" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: 12, color: '#92400e' }}>
              Comprá como invitado o{' '}
              <button onClick={() => { onClose(); navigate('/login') }}
                style={{ background: 'none', border: 'none', color: '#b45309', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 12, fontFamily: 'inherit' }}>
                iniciá sesión
              </button>
              {' '}para guardar tu historial
            </span>
          </div>
        )}

        {/* Body */}
        <div className="drawer-body">

          {loading && [1, 2, 3].map(i => (
            <div key={i} className="drawer-skel-item">
              <div className="shimmer drawer-skel-img" />
              <div className="drawer-skel-lines">
                <div className="shimmer" style={{ height: 12, width: '80%' }} />
                <div className="shimmer" style={{ height: 10, width: '45%' }} />
                <div className="shimmer" style={{ height: 26, width: '55%', marginTop: 4 }} />
              </div>
            </div>
          ))}

          {!loading && displayItems.length === 0 && (
            <div className="drawer-empty">
              <svg width="52" height="52" fill="none" stroke="#d4d4d8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 13H4L5 9z" />
              </svg>
              <p className="drawer-empty-text">Nada por aquí todavía</p>
              <p className="drawer-empty-sub">Explorá el catálogo y encontrá tu próxima compra</p>
              <button className="drawer-empty-btn" onClick={onClose}>Explorar catálogo</button>
            </div>
          )}

          {!loading && displayItems.map(item => (
            <div
              key={item._id}
              className="cart-item"
              style={{ opacity: removingId === item._id ? 0.35 : 1 }}
            >
              <img
                className="cart-item-img"
                src={item.thumbnail}
                alt={item.title}
                onError={e => { ;(e.target as HTMLImageElement).src = FALLBACK_IMG }}
              />
              <div className="cart-item-info">
                <p className="cart-item-title">{item.title}</p>
                <p className="cart-item-price">${item.price.toFixed(2)} c/u</p>
                <div className="item-qty-row">
                  <button className="item-qty-btn" onClick={() => onQtyChange(item._id, -1)} disabled={item.quantity <= 1}>−</button>
                  <span className="item-qty-count">{item.quantity}</span>
                  <button className="item-qty-btn" onClick={() => onQtyChange(item._id, 1)}>+</button>
                  <span className="item-total">${(item.price * item.quantity).toFixed(2)}</span>
                  <button className="remove-btn" onClick={() => onRemove(item._id)} aria-label="Eliminar producto">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Footer */}
        {displayItems.length > 0 && (
          <div className="drawer-footer">
            {discountRate > 0 && (
              <>
                <div className="drawer-footer-row">
                  <span className="drawer-total-label" style={{ color: '#71717a', fontWeight: 400 }}>Subtotal</span>
                  <span style={{ fontSize: 14, color: '#71717a' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div className="drawer-footer-row">
                  <span style={{ fontSize: 13, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>★</span> Descuento {isAdmin ? 'admin' : 'premium'} ({discountRate * 100}%)
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#16a34a' }}>−${discountAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="drawer-footer-row">
              <span className="drawer-total-label">
                Total ({itemCount} {itemCount === 1 ? 'artículo' : 'artículos'})
              </span>
              <span className="drawer-total-amount">${total.toFixed(2)}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={() => setPaymentOpen(true)}
            >
              Ir al pago →
            </button>
            <button className="keep-btn" onClick={onClose}>
              Seguir comprando
            </button>
          </div>
        )}

      </aside>

      {/* Payment modal — logged-in */}
      {cartId && (
        <PaymentModal
          isOpen={paymentOpen}
          cartId={cartId}
          total={total}
          discountInfo={discountRate > 0 ? { subtotal, discountRate, discountAmount } : undefined}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPaymentOpen(false)}
        />
      )}

      {/* Payment modal — guest */}
      {isGuest && (
        <PaymentModal
          isOpen={paymentOpen}
          isGuest
          guestItems={guestItems}
          total={guestTotal}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPaymentOpen(false)}
        />
      )}
    </>
  )
}

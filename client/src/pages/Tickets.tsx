import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import { useUser } from '../context/UserContext'
import { API_URL, apiFetch } from "../config/api";
import './Tickets.css'

type TicketItem = {
  productId?: string
  title: string
  quantity: number
  unitPrice: number
  subtotal: number
  thumbnail?: string
}

type Ticket = {
  _id: string
  code: string
  purchase_datetime: string
  amount: number
  subtotal?: number
  purchaser?: { first_name?: string; email?: string }
  guestEmail?: string
  items?: TicketItem[]
  discountAmount?: number
  discountRate?: number
}

type Data = {
  tickets: Ticket[]
  user: { user: string; role: string; cartId: string }
  isAdmin: boolean
  isPremium: boolean
}

export default function Tickets() {
  const navigate = useNavigate()
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const { user, cartCount, setCartCount, refetch } = useUser()

  useEffect(() => {
    apiFetch(`${API_URL}/auth/tickets`, { headers: { Accept: 'application/json' } })
      .then(r => {
        if (r.status === 401 || r.redirected) { refetch(); navigate('/login', { replace: true }); return null }
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(j => { if (j) setData(j) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafaf8' }}>

      <Navbar cartId={user?.cartId} role={user?.role} cartCount={cartCount} onCartOpen={() => setCartOpen(true)} userName={user?.user} />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartId={user?.cartId}
        onCartCountChange={setCartCount}
      />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#09090b', margin: '0 0 4px', fontFamily: "'Playfair Display', Georgia, serif" }}>
            Mis pedidos
          </h1>
          <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>
            Historial completo de tus compras en Folio
          </p>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="tickets-grid">
            {[1,2,3].map(i => (
              <div key={i} style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: 14, padding: 20 }}>
                <div className="skel" style={{ height: 12, width: '60%', marginBottom: 12 }} />
                <div className="skel" style={{ height: 28, width: '40%', marginBottom: 16 }} />
                <div className="skel" style={{ height: 10, width: '80%', marginBottom: 8 }} />
                <div className="skel" style={{ height: 10, width: '50%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && data?.tickets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 16, border: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🧾</div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#09090b', margin: '0 0 8px' }}>Sin pedidos todavía</h3>
            <p style={{ fontSize: 14, color: '#a1a1aa', margin: '0 0 24px' }}>
              Cuando realices tu primera compra, aparecerá aquí.
            </p>
            <a href="/products" style={{
              display: 'inline-block', padding: '10px 24px',
              backgroundColor: '#09090b', color: 'white', borderRadius: 10,
              textDecoration: 'none', fontSize: 14, fontWeight: 500
            }}>Ver catálogo</a>
          </div>
        )}

        {/* Tickets */}
        {!loading && data && data.tickets.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 16 }}>
              {data.tickets.length} {data.tickets.length === 1 ? 'compra realizada' : 'compras realizadas'}
            </p>
            <div className="tickets-grid">
              {[...data.tickets].reverse().map((ticket, i) => (
                <div className="ticket-card" key={ticket._id}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <span className="ticket-badge">✓ Completado</span>
                      <p style={{ fontSize: 11, color: '#a1a1aa', margin: '8px 0 2px', fontFamily: 'monospace' }}>
                        #{ticket.code || ticket._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: '#a1a1aa', textAlign: 'right' }}>
                      Orden #{data.tickets.length - i}
                    </span>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    {ticket.discountRate && ticket.discountRate > 0 ? (() => {
                      const subtotal = ticket.subtotal ?? ticket.amount + (ticket.discountAmount ?? 0)
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#a1a1aa' }}>Subtotal</span>
                            <span style={{ fontSize: 13, color: '#a1a1aa', textDecoration: 'line-through' }}>${subtotal.toFixed(2)} USD</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#16a34a' }}>★ Ahorraste ({(ticket.discountRate * 100).toFixed(0)}%)</span>
                            <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>−${ticket.discountAmount?.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #f4f4f5', paddingTop: 8, marginTop: 2 }}>
                            <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>Total pagado</span>
                            <div>
                              <span style={{ fontSize: 28, fontWeight: 700, color: '#09090b' }}>${ticket.amount.toFixed(2)}</span>
                              <span style={{ fontSize: 13, color: '#a1a1aa', marginLeft: 6 }}>USD</span>
                            </div>
                          </div>
                        </div>
                      )
                    })() : (
                      <>
                        <span style={{ fontSize: 28, fontWeight: 700, color: '#09090b' }}>${ticket.amount.toFixed(2)}</span>
                        <span style={{ fontSize: 13, color: '#a1a1aa', marginLeft: 6 }}>USD</span>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 14, borderTop: '1px solid #f4f4f5' }}>
                    <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                      <span style={{ color: '#a1a1aa', minWidth: 60 }}>Fecha</span>
                      <span style={{ color: '#09090b', fontWeight: 500 }}>{fmt(ticket.purchase_datetime)}</span>
                    </div>
                    {(ticket.purchaser?.email || ticket.guestEmail) && (
                      <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                        <span style={{ color: '#a1a1aa', minWidth: 60 }}>Email</span>
                        <span style={{ color: '#09090b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.purchaser?.email || ticket.guestEmail}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items snapshot */}
                  {ticket.items && ticket.items.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f4f4f5' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                        Productos
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {ticket.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {item.thumbnail && (
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                style={{ width: 32, height: 42, objectFit: 'cover', borderRadius: 4, flexShrink: 0, background: '#f4f1ea' }}
                                onError={e => { ;(e.target as HTMLImageElement).style.display = 'none' }}
                              />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 12, fontWeight: 500, color: '#09090b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.title}
                              </p>
                              <p style={{ fontSize: 11, color: '#a1a1aa', margin: '2px 0 0' }}>
                                {item.quantity} × ${item.unitPrice.toFixed(2)}
                              </p>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#09090b', flexShrink: 0 }}>
                              ${item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
      <BottomNav cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />

    </div>
  )
}

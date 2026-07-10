import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import './OrderConfirmation.css'

export default function OrderConfirmation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [countdown, setCountdown] = useState(8)
  const ticketCode = searchParams.get('code') || searchParams.get('ticket')
  const { user } = useUser()

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          navigate(user ? '/tickets' : '/products', { replace: true })
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [user, navigate])

  return (
    <>

      <div className="oc-wrapper">
        <div className="oc-card">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
            <div style={{ width: 26, height: 26, backgroundColor: '#09090b', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#09090b', fontFamily: "'Playfair Display', Georgia, serif" }}>Folio</span>
          </div>

          {/* Check */}
          <div className="check-circle">
            <svg width="32" height="32" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#09090b', margin: '0 0 10px', fontFamily: "'Playfair Display', Georgia, serif" }}>
            ¡Compra confirmada!
          </h1>
          <p style={{ fontSize: 14, color: '#71717a', margin: '0 0 20px', lineHeight: 1.6 }}>
            Tu pedido fue procesado con éxito. Recibirás un email con los detalles de tu compra.
          </p>

          {ticketCode && (
            <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: '#a1a1aa', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Número de orden</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#09090b', margin: 0, fontFamily: 'monospace' }}>
                #{ticketCode.toUpperCase()}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <a href="/tickets" style={{
              display: 'block', padding: '11px', backgroundColor: '#09090b',
              color: 'white', borderRadius: 10, textDecoration: 'none',
              fontSize: 14, fontWeight: 500
            }}>Ver mis pedidos</a>
            <a href="/products" style={{
              display: 'block', padding: '11px', backgroundColor: 'transparent',
              color: '#71717a', borderRadius: 10, textDecoration: 'none',
              fontSize: 14, border: '1px solid #e4e4e7'
            }}>Seguir comprando</a>
          </div>

          {/* Trust */}
          <div className="trust-row">
            <div className="trust-pill"><span>🚚</span> Envío en camino</div>
            <div className="trust-pill"><span>📧</span> Email enviado</div>
            <div className="trust-pill"><span>🔒</span> Pago seguro</div>
          </div>

          {/* Progress auto-redirect */}
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
          <p style={{ fontSize: 11, color: '#d4d4d8', marginTop: 8 }}>
            Redirigiendo a tus pedidos en {countdown}s...
          </p>
        </div>
      </div>
    </>
  )
}

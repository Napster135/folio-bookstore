import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import './Footer.css'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const { showToast } = useToast()

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    setEmail('')
    showToast('¡Suscripción confirmada! Pronto recibirás novedades.', 'success')
  }

  return (
    <>
      {/* Trust strip */}
      <div className="trust-strip">
        <div className="trust-strip-inner">
          {([
            {
              text: 'Entrega en todo el país',
              icon: (
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              ),
            },
            {
              text: 'Pago protegido',
              icon: (
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
            },
            {
              text: 'Múltiples medios de pago',
              icon: (
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              ),
            },
            {
              text: 'Devoluciones simples',
              icon: (
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ),
            },
          ] as { text: string; icon: React.ReactNode }[]).map(t => (
            <div className="trust-item" key={t.text}>
              {t.icon}
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter banner */}
      <div style={{ background: '#1a1208', borderTop: '1px solid rgba(196,146,42,0.15)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'rgba(240,225,190,0.92)', margin: '0 0 5px', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}>
              Novedades editoriales
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(220,195,150,0.45)', margin: 0, letterSpacing: '0.01em' }}>
              Recomendaciones y ofertas exclusivas cada semana.
            </p>
          </div>
          {subscribed ? (
            <p style={{ fontSize: 13, color: '#c4922a', fontWeight: 600, margin: 0 }}>✓ ¡Suscripción confirmada!</p>
          ) : (
            <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{ padding: '9px 16px', borderRadius: 999, border: '1px solid rgba(196,146,42,0.25)', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 220, background: 'rgba(255,255,255,0.05)', color: 'rgba(240,225,190,0.85)' }}
              />
              <button
                type="submit"
                style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#d4b46a,#c4922a)', color: '#0f0d08', border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >
                Suscribirme
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer principal */}
      <footer className="footer">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, backgroundColor: 'rgba(196,146,42,0.12)', border: '1px solid rgba(196,146,42,0.25)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" fill="none" stroke="#c4922a" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 17, color: 'rgba(240,225,190,0.92)', fontFamily: "'Playfair Display', Georgia, serif" }}>Folio</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(220,195,150,0.42)', lineHeight: 1.65, maxWidth: 220, margin: '0 0 18px', letterSpacing: '0.01em' }}>
              Tu librería online de confianza. Los mejores títulos, entrega rápida y pagos seguros.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Instagram */}
              <a href="#" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(196,146,42,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(220,195,150,0.45)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,146,42,0.1)'; e.currentTarget.style.color = '#c4922a' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(220,195,150,0.45)' }}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              {/* Twitter/X */}
              <a href="#" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(196,146,42,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(220,195,150,0.45)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,146,42,0.1)'; e.currentTarget.style.color = '#c4922a' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(220,195,150,0.45)' }}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* Librería */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(196,146,42,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Librería</p>
            <a className="footer-link" href="/products#catalogo">Todos los libros</a>
            <a className="footer-link" href="/products?query=Ficción">Ficción</a>
            <a className="footer-link" href="/products?query=Técnico">Técnicos</a>
            <a className="footer-link" href="/products?query=Infantil">Infantil</a>
            <a className="footer-link" href="/products?sort=asc">Más económicos</a>
          </div>

          {/* Cuenta */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(196,146,42,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Mi cuenta</p>
            <a className="footer-link" href="/login">Iniciar sesión</a>
            <a className="footer-link" href="/register">Registrarse</a>
            <a className="footer-link" href="/tickets">Mis pedidos</a>
            <a className="footer-link" href="/restore-password">Cambiar contraseña</a>
          </div>

          {/* Ayuda */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(196,146,42,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Ayuda</p>
            <a className="footer-link" href="/help#envios">Envíos y entregas</a>
            <a className="footer-link" href="/help#devoluciones">Devoluciones</a>
            <a className="footer-link" href="/help#pagos">Métodos de pago</a>
            <a className="footer-link" href="/help#contacto">Contacto</a>
            <a className="footer-link" href="/api/docs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              Documentación API
              <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.6 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span style={{ fontSize: 12, color: 'rgba(220,195,150,0.3)', letterSpacing: '0.01em' }}>© 2025 Folio. Todos los derechos reservados.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="/legal#privacidad" style={{ fontSize: 12, color: 'rgba(220,195,150,0.3)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c4922a')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(220,195,150,0.3)')}>Privacidad</a>
            <a href="/legal#terminos" style={{ fontSize: 12, color: 'rgba(220,195,150,0.3)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c4922a')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(220,195,150,0.3)')}>Términos</a>
            <a href="/legal#cookies" style={{ fontSize: 12, color: 'rgba(220,195,150,0.3)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c4922a')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(220,195,150,0.3)')}>Cookies</a>
          </div>
        </div>
      </footer>
    </>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL, apiFetch } from "../config/api";
import { useUser } from '../context/UserContext'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const { refetch } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('error') === 'google_not_configured'
      ? 'Google OAuth no está configurado aún.'
      : ''
  })

  const getRedirect = () => {
    const params = new URLSearchParams(window.location.search)
    const r = params.get('redirect')
    return r && r.startsWith('/') ? r : '/products'
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok || res.redirected) {
        await refetch()
        navigate(getRedirect(), { replace: true })
      } else {
        setError('Email o contraseña incorrectos')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* Panel izquierdo — desktop only */}
        <div className="login-left">
          <a href="/products" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, backgroundColor: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" stroke="#09090b" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 17, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.01em' }}>Folio</span>
          </a>

          <div>
            <p style={{ color: '#71717a', fontSize: 11, marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Librería online</p>
            <h2 style={{ color: 'white', fontSize: 30, fontWeight: 700, lineHeight: 1.2, margin: '0 0 14px', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Cada libro,<br />una historia.
            </h2>
            <p style={{ color: '#71717a', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              Descubrí títulos únicos, gestioná tu colección y comprá con total seguridad.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '📚', text: 'Miles de títulos disponibles' },
              { icon: '🔒', text: 'Pagos 100% seguros con Stripe' },
              { icon: '🚚', text: 'Envío a todo el país' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14 }}>{f.icon}</span>
                <span style={{ color: '#52525b', fontSize: 13 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="login-right">

          {/* Branding — solo mobile */}
          <div className="login-mobile-brand">
            <a href="/products" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div className="login-mobile-brand-icon">
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="login-mobile-brand-name">Folio</span>
            </a>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Iniciar sesión</h2>
            <p className="login-form-sub">Ingresá tus datos para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="login-field">
              <label className="login-label">Contraseña</label>
              <div className="login-pass-wrap">
                <input
                  className="login-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="login-pass-toggle"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" disabled={loading} className="login-btn-primary">
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">o continuá con</span>
            <div className="login-divider-line" />
          </div>

          <div className="login-social">
            <a href="/auth/google" className="login-btn-google">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </a>
            <a href="/auth/github" className="login-btn-github">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Continuar con GitHub
            </a>
          </div>

          <div className="login-footer">
            <a href="/register" className="login-footer-link">Crear cuenta</a>
            <a href="/restore-password" className="login-footer-link">¿Olvidaste tu contraseña?</a>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/products" style={{ fontSize: 12, color: '#a1a1aa', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#09090b')}
              onMouseLeave={e => (e.currentTarget.style.color = '#a1a1aa')}
            >
              ← Explorar catálogo sin cuenta
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

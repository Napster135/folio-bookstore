import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL, apiFetch } from "../config/api";
import './Register.css'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
        }),
      })
      if (res.ok || res.redirected) {
        setSuccess(true)
        setTimeout(() => { navigate('/login', { replace: true }) }, 2000)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.message || 'No se pudo crear la cuenta. Intentá de nuevo.')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reg-wrapper">
      <div className="reg-card">

        {/* Panel izquierdo — desktop only */}
        <div className="reg-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 34, height: 34, backgroundColor: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" stroke="#09090b" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 17, fontFamily: "'Playfair Display', Georgia, serif" }}>Folio</span>
          </div>

          <div>
            <p style={{ color: '#71717a', fontSize: 11, marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Únite a la comunidad</p>
            <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, lineHeight: 1.25, margin: '0 0 14px', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Tu próximo<br />libro favorito<br />te espera.
            </h2>
            <p style={{ color: '#71717a', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              Creá tu cuenta gratis y accedé a todo el catálogo con envíos y pagos seguros.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '✓', text: 'Cuenta gratuita para siempre' },
              { icon: '✓', text: 'Historial de compras' },
              { icon: '✓', text: 'Ofertas exclusivas para miembros' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#c8a96e', fontWeight: 700 }}>{f.icon}</span>
                <span style={{ color: '#52525b', fontSize: 13 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="reg-right">

          {/* Branding — solo mobile */}
          <div className="reg-mobile-brand">
            <div className="reg-mobile-brand-icon">
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="reg-mobile-brand-name">Folio</span>
          </div>

          <div className="reg-form-header">
            <h2 className="reg-form-title">Crear cuenta</h2>
            <p className="reg-form-sub">Completá tus datos para registrarte</p>
          </div>

          {success ? (
            <div className="reg-success">
              <div className="reg-success-icon">✅</div>
              <h3 className="reg-success-title">¡Cuenta creada!</h3>
              <p className="reg-success-sub">Redirigiendo al login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="reg-form">
              <div className="input-row">
                <div className="reg-field">
                  <label className="reg-label">Nombre</label>
                  <input className="reg-input" type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Juan" required />
                </div>
                <div className="reg-field">
                  <label className="reg-label">Apellido</label>
                  <input className="reg-input" type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="García" required />
                </div>
              </div>

              <div className="reg-field">
                <label className="reg-label">Email</label>
                <input className="reg-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@email.com" required />
              </div>

              <div className="reg-field">
                <label className="reg-label">Contraseña</label>
                <input className="reg-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 6 caracteres" required />
                {form.password && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor:
                        form.password.length >= i * 4
                          ? i === 1 ? '#ef4444' : i === 2 ? '#f59e0b' : '#22c55e'
                          : 'rgba(255,255,255,0.1)'
                      }} />
                    ))}
                  </div>
                )}
              </div>

              <div className="reg-field">
                <label className="reg-label">Confirmar contraseña</label>
                <input
                  className="reg-input"
                  type="password"
                  value={form.confirm}
                  onChange={e => set('confirm', e.target.value)}
                  placeholder="Repetí la contraseña"
                  required
                  style={{ borderColor: form.confirm && form.confirm !== form.password ? '#ef4444' : '' }}
                />
                {form.confirm && form.confirm !== form.password && (
                  <p className="reg-mismatch">Las contraseñas no coinciden</p>
                )}
              </div>

              {error && <p className="reg-error">{error}</p>}

              <button
                type="submit"
                disabled={loading || (!!form.confirm && form.confirm !== form.password)}
                className="reg-btn"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>

              <div className="reg-divider">
                <div className="reg-divider-line" />
                <span className="reg-divider-text">o registrate con</span>
                <div className="reg-divider-line" />
              </div>

              <div className="reg-social">
                <a href="/auth/google" className="login-btn-google">
                  <svg width="15" height="15" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </a>
                <a href="/auth/github" className="login-btn-github">
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
              </div>

              <p className="reg-footer-text">
                ¿Ya tenés cuenta?{' '}
                <a href="/login" className="reg-footer-link">Iniciá sesión</a>
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}

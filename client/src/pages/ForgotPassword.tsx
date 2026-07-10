import { useState } from 'react'
import { API_URL, apiFetch } from "../config/api";
import './ForgotPassword.css'

type Step = 'email' | 'code' | 'done'

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await apiFetch(`${API_URL}/auth/sendTokenToEmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) { setStep('code') }
      else { setError('No encontramos una cuenta con ese email.') }
    } catch { setError('Error de conexión. Intentá de nuevo.') }
    finally { setLoading(false) }
  }

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
    if (newPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      const res = await apiFetch(`${API_URL}/auth/restorePassword`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      })
      if (res.ok) { setStep('done') }
      else {
        const data = await res.json().catch(() => ({}))
        setError(data.message || 'Código incorrecto o vencido.')
      }
    } catch { setError('Error de conexión. Intentá de nuevo.') }
    finally { setLoading(false) }
  }

  return (
    <>

      <div className="fp-wrapper">
        <div className="fp-card">

          {/* Logo */}
          <a href="/products" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, backgroundColor: '#09090b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#09090b', fontFamily: "'Playfair Display', Georgia, serif" }}>Folio</span>
          </a>

          {/* Pasos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
            {(['email', 'code', 'done'] as Step[]).map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="step-dot" style={{
                  backgroundColor: step === s ? '#09090b' : (
                    (step === 'code' && s === 'email') || step === 'done' ? '#09090b' : '#e4e4e7'
                  ),
                  opacity: step === s ? 1 : 0.4,
                  width: step === s ? 24 : 8,
                  borderRadius: step === s ? 4 : '50%',
                }} />
                {i < 2 && <div style={{ width: 24, height: 1, backgroundColor: '#e4e4e7' }} />}
              </div>
            ))}
          </div>

          {/* Step 1: email */}
          {step === 'email' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#09090b', margin: '0 0 6px' }}>Recuperar contraseña</h2>
                <p style={{ fontSize: 13, color: '#71717a', margin: 0, lineHeight: 1.5 }}>
                  Ingresá tu email y te enviamos un código para restablecer tu contraseña.
                </p>
              </div>
              <form onSubmit={sendEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 6 }}>Email</label>
                  <input className="fp-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />
                </div>
                {error && <p style={{ fontSize: 13, color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8, padding: '10px 12px', margin: 0 }}>{error}</p>}
                <button type="submit" className="fp-btn" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar código'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: código + nueva contraseña */}
          {step === 'code' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#09090b', margin: '0 0 6px' }}>Ingresá el código</h2>
                <p style={{ fontSize: 13, color: '#71717a', margin: 0, lineHeight: 1.5 }}>
                  Enviamos un código a <strong>{email}</strong>. Ingresalo junto con tu nueva contraseña.
                </p>
              </div>
              <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 6 }}>Código de verificación</label>
                  <input
                    className="fp-input"
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Pegá el código del email"
                    required
                    style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 6 }}>Nueva contraseña</label>
                  <input className="fp-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 6 }}>Confirmar contraseña</label>
                  <input
                    className="fp-input"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repetí la contraseña"
                    required
                    style={{ borderColor: confirmPassword && confirmPassword !== newPassword ? '#ef4444' : '' }}
                  />
                </div>
                {error && <p style={{ fontSize: 13, color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8, padding: '10px 12px', margin: 0 }}>{error}</p>}
                <button type="submit" className="fp-btn" disabled={loading || (!!confirmPassword && confirmPassword !== newPassword)}>
                  {loading ? 'Actualizando...' : 'Cambiar contraseña'}
                </button>
                <button type="button" onClick={() => { setStep('email'); setError('') }}
                  style={{ background: 'none', border: 'none', fontSize: 13, color: '#a1a1aa', cursor: 'pointer', fontFamily: 'inherit' }}>
                  ← Volver
                </button>
              </form>
            </>
          )}

          {/* Step 3: done */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🔓</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#09090b', margin: '0 0 8px' }}>¡Contraseña actualizada!</h3>
              <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 28px', lineHeight: 1.5 }}>
                Tu contraseña fue cambiada con éxito. Ya podés iniciar sesión.
              </p>
              <a href="/login" style={{
                display: 'inline-block', padding: '11px 28px',
                backgroundColor: '#09090b', color: 'white',
                borderRadius: 10, textDecoration: 'none',
                fontSize: 14, fontWeight: 500
              }}>Ir al login</a>
            </div>
          )}

          {step === 'email' && (
            <p style={{ fontSize: 13, color: '#a1a1aa', textAlign: 'center', marginTop: 20 }}>
              <a href="/login" style={{ color: '#09090b', fontWeight: 500, textDecoration: 'none' }}>← Volver al login</a>
            </p>
          )}

          <p style={{ fontSize: 12, color: '#d4d4d8', textAlign: 'center', marginTop: 12 }}>
            <a href="/products" style={{ color: '#a1a1aa', textDecoration: 'none' }}>← Explorar catálogo sin cuenta</a>
          </p>
        </div>
      </div>
    </>
  )
}

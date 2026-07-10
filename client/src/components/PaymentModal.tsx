import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useGuestCart, type GuestCartItem } from '../context/GuestCartContext'
import { API_URL, apiFetch } from "../config/api";
import './PaymentModal.css'

// ── Stripe loader ────────────────────────────────────────────

let stripePromise: ReturnType<typeof loadStripe> | null = null

const getStripe = async () => {
  if (!stripePromise) {
    const res = await apiFetch(`${API_URL}/publicKey`)
    const { publicKey } = await res.json()
    stripePromise = loadStripe(publicKey)
  }
  return stripePromise
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(n)

// ── Logged-in checkout form ──────────────────────────────────

type DiscountInfo = { subtotal: number; discountRate: number; discountAmount: number }

type UserFormProps = {
  cartId: string
  total: number
  discountInfo?: DiscountInfo
  onSuccess: (code: string) => void
  onClose: () => void
}

function UserCheckoutForm({ cartId, total, discountInfo, onSuccess, onClose }: UserFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [cardReady, setCardReady] = useState(false)
  const [phone, setPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [billSame, setBillSame] = useState(true)
  const [billingAddress, setBillingAddress] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setError('')

    try {
      const intentRes = await apiFetch(`${API_URL}/api/carts/${cartId}/purchase`, { method: 'POST' })
      if (!intentRes.ok) {
        const j = await intentRes.json().catch(() => ({}))
        setError(j.message || 'Error al iniciar el pago. Intentá de nuevo.')
        setProcessing(false)
        return
      }
      const { payload } = await intentRes.json()
      const clientSecret: string = payload?.client_secret

      if (!clientSecret) {
        setError('No se pudo obtener el token de pago.')
        setProcessing(false)
        return
      }

      const card = elements.getElement(CardElement)!
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      })

      if (stripeError) {
        setError(stripeError.message || 'Pago rechazado. Verificá los datos de la tarjeta.')
        setProcessing(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        const confirmRes = await apiFetch(`${API_URL}/api/carts/${cartId}/confirmPurchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            phone,
            shippingAddress,
            billingAddress: billSame ? shippingAddress : billingAddress,
          }),
        })
        const confirmJson = await confirmRes.json()
        const code = confirmJson?.payload?.ticket?.code ?? confirmJson?.payload?.ticket?._id ?? ''
        onSuccess(code)
      } else {
        setError('El pago no fue aprobado. Intentá con otra tarjeta.')
        setProcessing(false)
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pm-form">
      {discountInfo ? (
        <div style={{ marginBottom: 12 }}>
          <div className="pm-total-row" style={{ opacity: 0.6, marginBottom: 4 }}>
            <span className="pm-total-label" style={{ fontWeight: 400, fontSize: 13 }}>Subtotal</span>
            <span style={{ fontSize: 13 }}>{fmt(discountInfo.subtotal)}</span>
          </div>
          <div className="pm-total-row" style={{ color: '#16a34a', marginBottom: 4 }}>
            <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>★</span> Descuento premium ({Math.round(discountInfo.discountRate * 100)}%)
            </span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>−{fmt(discountInfo.discountAmount)}</span>
          </div>
          <div className="pm-total-row" style={{ borderTop: '1px solid #e4e4e7', paddingTop: 8 }}>
            <span className="pm-total-label">Total a pagar</span>
            <span className="pm-total-amount">{fmt(total)}</span>
          </div>
        </div>
      ) : (
        <div className="pm-total-row">
          <span className="pm-total-label">Total a pagar</span>
          <span className="pm-total-amount">{fmt(total)}</span>
        </div>
      )}

      <TestCardHint />

      <AddressFields
        phone={phone} setPhone={setPhone}
        shippingAddress={shippingAddress} setShippingAddress={setShippingAddress}
        billSame={billSame} setBillSame={setBillSame}
        billingAddress={billingAddress} setBillingAddress={setBillingAddress}
        required={false}
        disabled={processing}
      />

      <div className="pm-card-wrap">
        <label className="pm-label">Datos de la tarjeta</label>
        <CardElementWrapper onReady={setCardReady} onError={setError} />
      </div>

      {error && <p className="pm-error">{error}</p>}

      <SubmitButton processing={processing} disabled={!cardReady} total={total} />
      <button type="button" className="pm-cancel-btn" onClick={onClose} disabled={processing}>
        Cancelar
      </button>
    </form>
  )
}

// ── Guest checkout form ──────────────────────────────────────

type GuestFormProps = {
  guestItems: GuestCartItem[]
  total: number
  onSuccess: (code: string) => void
  onClose: () => void
}

function GuestCheckoutForm({ guestItems, total, onSuccess, onClose }: GuestFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { clearCart } = useGuestCart()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [cardReady, setCardReady] = useState(false)
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [name, setName] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [phone, setPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [addressTouched, setAddressTouched] = useState(false)
  const [billSame, setBillSame] = useState(true)
  const [billingAddress, setBillingAddress] = useState('')

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const nameValid = name.trim().length > 1
  const addressValid = shippingAddress.trim().length > 4

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailTouched(true)
    setNameTouched(true)
    setAddressTouched(true)
    if (!nameValid) { setError('Ingresá tu nombre completo.'); return }
    if (!emailValid) { setError('Ingresá un email válido para recibir tu comprobante.'); return }
    if (!addressValid) { setError('Ingresá una dirección de envío.'); return }
    if (!stripe || !elements) return
    setProcessing(true)
    setError('')

    try {
      // 1. Crear PaymentIntent guest
      const checkoutRes = await apiFetch(`${API_URL}/api/guest/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: guestItems, email }),
      })

      if (!checkoutRes.ok) {
        const j = await checkoutRes.json().catch(() => ({}))
        setError(j.message || 'Error al iniciar el pago.')
        setProcessing(false)
        return
      }

      const checkoutData = await checkoutRes.json()
      const clientSecret: string = checkoutData?.client_secret ?? checkoutData?.payload?.client_secret

      if (!clientSecret) {
        setError('No se pudo obtener el token de pago.')
        setProcessing(false)
        return
      }

      // 2. Confirmar con Stripe
      const card = elements.getElement(CardElement)!
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card, billing_details: { email, name, phone: phone || undefined } },
      })

      if (stripeError) {
        setError(stripeError.message || 'Pago rechazado. Verificá los datos de la tarjeta.')
        setProcessing(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        // 3. Confirmar compra en backend (descuenta stock, crea ticket)
        const confirmRes = await apiFetch(`${API_URL}/api/guest/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: guestItems,
            email,
            paymentIntentId: paymentIntent.id,
            name,
            phone,
            shippingAddress,
            billingAddress: billSame ? shippingAddress : billingAddress,
          }),
        })
        const confirmData = await confirmRes.json()
        const code = confirmData?.ticket?.code ?? confirmData?.payload?.ticket?.code ?? ''

        // 4. Limpiar carrito guest
        clearCart()
        onSuccess(code)
      } else {
        setError('El pago no fue aprobado. Intentá con otra tarjeta.')
        setProcessing(false)
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pm-form">
      <div className="pm-total-row">
        <span className="pm-total-label">Total a pagar</span>
        <span className="pm-total-amount">{fmt(total)}</span>
      </div>

      <TestCardHint />

      {/* Name field */}
      <div className="pm-card-wrap">
        <label className="pm-label" htmlFor="guest-name">
          Nombre completo
        </label>
        <input
          id="guest-name"
          type="text"
          className={`pm-email-input${nameTouched && !nameValid ? ' invalid' : ''}`}
          placeholder="Juan Pérez"
          value={name}
          onChange={e => { setName(e.target.value); if (error) setError('') }}
          onBlur={() => setNameTouched(true)}
          disabled={processing}
          autoComplete="name"
        />
        {nameTouched && !nameValid && (
          <p className="pm-field-error">Ingresá tu nombre completo</p>
        )}
      </div>

      {/* Email field */}
      <div className="pm-card-wrap">
        <label className="pm-label" htmlFor="guest-email">
          Email para el comprobante
        </label>
        <input
          id="guest-email"
          type="email"
          className={`pm-email-input${emailTouched && !emailValid ? ' invalid' : ''}`}
          placeholder="tu@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); if (error) setError('') }}
          onBlur={() => setEmailTouched(true)}
          disabled={processing}
          autoComplete="email"
        />
        {emailTouched && !emailValid && (
          <p className="pm-field-error">Ingresá un email válido</p>
        )}
      </div>

      <AddressFields
        phone={phone} setPhone={setPhone}
        shippingAddress={shippingAddress} setShippingAddress={setShippingAddress}
        billSame={billSame} setBillSame={setBillSame}
        billingAddress={billingAddress} setBillingAddress={setBillingAddress}
        required
        addressTouched={addressTouched}
        addressValid={addressValid}
        disabled={processing}
      />

      <div className="pm-card-wrap">
        <label className="pm-label">Datos de la tarjeta</label>
        <CardElementWrapper onReady={setCardReady} onError={setError} />
      </div>

      {error && <p className="pm-error">{error}</p>}

      <SubmitButton processing={processing} disabled={!cardReady || !emailValid || !nameValid || !addressValid} total={total} />
      <button type="button" className="pm-cancel-btn" onClick={onClose} disabled={processing}>
        Cancelar
      </button>
    </form>
  )
}

// ── Shared sub-components ────────────────────────────────────

type AddressFieldsProps = {
  phone: string
  setPhone: (v: string) => void
  shippingAddress: string
  setShippingAddress: (v: string) => void
  billSame: boolean
  setBillSame: (v: boolean) => void
  billingAddress: string
  setBillingAddress: (v: string) => void
  required: boolean
  addressTouched?: boolean
  addressValid?: boolean
  disabled: boolean
}

function AddressFields({
  phone, setPhone, shippingAddress, setShippingAddress,
  billSame, setBillSame, billingAddress, setBillingAddress,
  required, addressTouched, addressValid, disabled,
}: AddressFieldsProps) {
  const showAddressError = required && addressTouched && addressValid === false

  return (
    <>
      <div className="pm-card-wrap">
        <label className="pm-label" htmlFor="pm-phone">
          Teléfono{!required && ' (opcional)'}
        </label>
        <input
          id="pm-phone"
          type="tel"
          className="pm-email-input"
          placeholder="+54 9 11 1234-5678"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          disabled={disabled}
          autoComplete="tel"
        />
      </div>

      <div className="pm-card-wrap">
        <label className="pm-label" htmlFor="pm-shipping">
          Dirección de envío{!required && ' (opcional)'}
        </label>
        <textarea
          id="pm-shipping"
          className={`pm-email-input pm-textarea${showAddressError ? ' invalid' : ''}`}
          placeholder="Calle, número, ciudad, código postal"
          value={shippingAddress}
          onChange={e => setShippingAddress(e.target.value)}
          disabled={disabled}
          autoComplete="street-address"
          rows={2}
        />
        {showAddressError && (
          <p className="pm-field-error">Ingresá una dirección de envío</p>
        )}
      </div>

      <label className="pm-checkbox-row">
        <input
          type="checkbox"
          checked={billSame}
          onChange={e => setBillSame(e.target.checked)}
          disabled={disabled}
        />
        Usar la misma dirección para facturación
      </label>

      {!billSame && (
        <div className="pm-card-wrap">
          <label className="pm-label" htmlFor="pm-billing">
            Dirección de facturación
          </label>
          <textarea
            id="pm-billing"
            className="pm-email-input pm-textarea"
            placeholder="Calle, número, ciudad, código postal"
            value={billingAddress}
            onChange={e => setBillingAddress(e.target.value)}
            disabled={disabled}
            rows={2}
          />
        </div>
      )}
    </>
  )
}

function TestCardHint() {
  return (
    <div className="pm-test-hint">
      <svg width="13" height="13" fill="none" stroke="#6366f1" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
      </svg>
      <span>
        Tarjeta de prueba: <strong>4242 4242 4242 4242</strong> · cualquier fecha futura · cualquier CVC
      </span>
    </div>
  )
}

function CardElementWrapper({ onReady, onError }: { onReady: (v: boolean) => void; onError: (msg: string) => void }) {
  return (
    <div className="pm-card-element">
      <CardElement
        options={{
          style: {
            base: { fontSize: '14px', color: '#09090b', fontFamily: 'system-ui, sans-serif', '::placeholder': { color: '#a1a1aa' } },
            invalid: { color: '#ef4444' },
          },
          hidePostalCode: true,
        }}
        onChange={e => {
          onReady(e.complete)
          if (e.error) onError(e.error.message ?? '')
          else onError('')
        }}
      />
    </div>
  )
}

function SubmitButton({ processing, disabled, total }: { processing: boolean; disabled: boolean; total: number }) {
  return (
    <button type="submit" className="pm-pay-btn" disabled={processing || disabled}>
      {processing ? (
        <span className="pm-spinner-row">
          <span className="pm-spinner" />
          Procesando pago...
        </span>
      ) : (
        <>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
          </svg>
          Pagar {fmt(total)}
        </>
      )}
    </button>
  )
}

// ── Modal wrapper ────────────────────────────────────────────

type PaymentModalProps =
  | { isOpen: boolean; cartId: string; total: number; discountInfo?: DiscountInfo; onSuccess: (code: string) => void; onClose: () => void; isGuest?: false; guestItems?: never }
  | { isOpen: boolean; isGuest: true; guestItems: GuestCartItem[]; total: number; onSuccess: (code: string) => void; onClose: () => void; cartId?: never }

export default function PaymentModal(props: PaymentModalProps) {
  const { isOpen, total, onSuccess, onClose } = props
  const [stripe, setStripe] = useState<Awaited<ReturnType<typeof loadStripe>> | null>(null)

  useEffect(() => {
    if (isOpen && !stripe) {
      getStripe().then(s => setStripe(s ?? null))
    }
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="pm-header">
          <div className="pm-header-left">
            <div className="pm-logo-wrap">
              <svg width="13" height="13" fill="none" stroke="#09090b" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="pm-header-title">
              Folio · {props.isGuest ? 'Compra como invitado' : 'Pago seguro'}
            </span>
          </div>
          <button className="pm-close" onClick={onClose} aria-label="Cerrar">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form — conditioned on Stripe loading */}
        {stripe ? (
          <Elements stripe={stripe}>
            {props.isGuest ? (
              <GuestCheckoutForm
                guestItems={props.guestItems}
                total={total}
                onSuccess={onSuccess}
                onClose={onClose}
              />
            ) : (
              <UserCheckoutForm
                cartId={props.cartId}
                total={total}
                discountInfo={props.isGuest ? undefined : props.discountInfo}
                onSuccess={onSuccess}
                onClose={onClose}
              />
            )}
          </Elements>
        ) : (
          <div className="pm-loading">
            <span className="pm-spinner" />
            <span>Cargando pasarela de pago...</span>
          </div>
        )}

        {/* Stripe badge */}
        <div className="pm-stripe-badge">
          <svg width="12" height="12" fill="none" stroke="#a1a1aa" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Pago procesado de forma segura por <strong>Stripe</strong></span>
        </div>

      </div>
    </div>
  )
}

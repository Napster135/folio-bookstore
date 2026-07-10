import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import { useUser } from '../context/UserContext'
import { useDocumentTitle } from '../hooks/useSEO'

const sections = [
  { id: 'envios', label: 'Envíos y entregas' },
  { id: 'devoluciones', label: 'Devoluciones' },
  { id: 'pagos', label: 'Métodos de pago' },
  { id: 'contacto', label: 'Contacto' },
]

export default function Help() {
  const { user, cartCount } = useUser()
  const location = useLocation()
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  useDocumentTitle('Centro de ayuda — Folio')

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [location.hash])

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = `mailto:soporte@folio.com?subject=${encodeURIComponent(`Consulta de ${contactForm.name}`)}&body=${encodeURIComponent(contactForm.message + '\n\n' + contactForm.email)}`
    setSent(true)
  }

  const card = (children: React.ReactNode) => (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '32px 36px', marginBottom: 24 }}>
      {children}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Navbar cartId={user?.cartId} role={user?.role} cartCount={cartCount} onCartOpen={() => {}} />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 16px 64px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#09090b', margin: '0 0 8px', fontFamily: "'Playfair Display', Georgia, serif" }}>
            Centro de ayuda
          </h1>
          <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>
            Todo lo que necesitás saber sobre tus pedidos, envíos y pagos.
          </p>
        </div>

        {/* Quick nav */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`}
              style={{ padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500, border: '1px solid #e4e4e7', backgroundColor: 'white', color: '#3f3f46', textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#09090b'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#09090b' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#3f3f46'; e.currentTarget.style.borderColor = '#e4e4e7' }}
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* Envíos */}
        <section id="envios" style={{ scrollMarginTop: 80 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#09090b', margin: '0 0 16px' }}>Envíos y entregas</h2>
          {card(
            <>
              <Item title="¿Cuánto tarda el envío?">
                Los pedidos se procesan en 1–2 días hábiles. El envío estándar demora entre 3 y 7 días hábiles según tu ubicación.
              </Item>
              <Item title="¿Hay envío gratis?">
                Sí. Todos los pedidos superiores a $50 tienen envío gratuito a todo el país.
              </Item>
              <Item title="¿Puedo rastrear mi pedido?">
                Una vez despachado recibirás un correo con el número de seguimiento para rastrear tu paquete en tiempo real.
              </Item>
              <Item title="¿Hacen envíos internacionales?" last>
                Por el momento solo realizamos envíos dentro del país. Pronto habilitaremos envíos internacionales.
              </Item>
            </>
          )}
        </section>

        {/* Devoluciones */}
        <section id="devoluciones" style={{ scrollMarginTop: 80 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#09090b', margin: '0 0 16px' }}>Devoluciones</h2>
          {card(
            <>
              <Item title="¿Cuánto tiempo tengo para devolver?">
                Tenés 30 días corridos desde la recepción del pedido para solicitar una devolución.
              </Item>
              <Item title="¿Qué condiciones debe tener el producto?">
                El libro debe estar en su estado original: sin marcas, sin daños y con el empaque intacto.
              </Item>
              <Item title="¿Cómo inicio una devolución?">
                Escribinos a <a href="mailto:soporte@folio.com" style={{ color: '#09090b', fontWeight: 600 }}>soporte@folio.com</a> con tu número de pedido y el motivo. Te responderemos en menos de 24 horas.
              </Item>
              <Item title="¿Cuándo recibo el reembolso?" last>
                Una vez aprobada la devolución, el reembolso se acredita en tu método de pago original en un plazo de 5–10 días hábiles.
              </Item>
            </>
          )}
        </section>

        {/* Métodos de pago */}
        <section id="pagos" style={{ scrollMarginTop: 80 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#09090b', margin: '0 0 16px' }}>Métodos de pago</h2>
          {card(
            <>
              <Item title="¿Qué métodos de pago aceptan?">
                Aceptamos todas las tarjetas de crédito y débito principales: Visa, Mastercard y American Express. Los pagos se procesan de forma segura a través de Stripe.
              </Item>
              <Item title="¿Es seguro pagar en Folio?">
                Sí. Todos los pagos están encriptados con SSL y procesados por Stripe, uno de los procesadores de pago más seguros del mundo. Folio nunca almacena los datos de tu tarjeta.
              </Item>
              <Item title="¿Puedo pagar en cuotas?">
                Dependiendo de tu banco y tarjeta, es posible seleccionar cuotas al momento del pago en la pantalla de checkout de Stripe.
              </Item>
              <Item title="¿Recibo factura o comprobante?" last>
                Sí. Al completar la compra recibirás un correo con el resumen del pedido. También podés consultarlo desde la sección <a href="/tickets" style={{ color: '#09090b', fontWeight: 600 }}>Mis pedidos</a>.
              </Item>
            </>
          )}
        </section>

        {/* Contacto */}
        <section id="contacto" style={{ scrollMarginTop: 80 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#09090b', margin: '0 0 16px' }}>Contacto</h2>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '32px 36px' }}>
            <p style={{ fontSize: 14, color: '#52525b', margin: '0 0 24px', lineHeight: 1.6 }}>
              ¿Tenés una consulta que no está respondida aquí? Completá el formulario y te respondemos en menos de 24 horas.
            </p>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#16a34a', margin: '0 0 6px' }}>¡Mensaje enviado!</p>
                <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>Abrimos tu cliente de correo. Te responderemos a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3f3f46', marginBottom: 6 }}>Nombre</label>
                    <input
                      type="text" required
                      value={contactForm.name}
                      onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Tu nombre"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3f3f46', marginBottom: 6 }}>Email</label>
                    <input
                      type="email" required
                      value={contactForm.email}
                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="tu@email.com"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3f3f46', marginBottom: 6 }}>Mensaje</label>
                  <textarea
                    required rows={5}
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Contanos en qué podemos ayudarte..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                <button type="submit" style={{
                  alignSelf: 'flex-start', padding: '10px 24px', background: '#09090b', color: 'white',
                  border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Enviar mensaje
                </button>
              </form>
            )}
          </div>
        </section>

      </main>

      <Footer />
      <BottomNav cartCount={cartCount} onCartOpen={() => {}} />
    </div>
  )
}

function Item({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ paddingBottom: last ? 0 : 20, marginBottom: last ? 0 : 20, borderBottom: last ? 'none' : '1px solid #f4f4f5' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '0 0 6px' }}>{title}</p>
      <p style={{ fontSize: 13, color: '#52525b', margin: 0, lineHeight: 1.65 }}>{children}</p>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 13px', borderRadius: 9, border: '1.5px solid #e4e4e7',
  fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  color: '#09090b', backgroundColor: 'white',
}

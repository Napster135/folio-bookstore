import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import { useUser } from '../context/UserContext'
import { useDocumentTitle } from '../hooks/useSEO'

const sections = [
  { id: 'privacidad', label: 'Privacidad' },
  { id: 'terminos', label: 'Términos' },
  { id: 'cookies', label: 'Cookies' },
]

export default function Legal() {
  const { user, cartCount } = useUser()
  const location = useLocation()
  useDocumentTitle('Legal — Folio')

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [location.hash])

  const card = (children: React.ReactNode) => (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '32px 36px', marginBottom: 24 }}>
      {children}
    </div>
  )

  const h2 = (text: string) => (
    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#09090b', margin: '0 0 16px', fontFamily: "'Playfair Display', Georgia, serif" }}>{text}</h2>
  )

  const p = (text: string) => (
    <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.75, margin: '0 0 12px' }}>{text}</p>
  )

  const li = (items: string[]) => (
    <ul style={{ margin: '0 0 12px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map(i => <li key={i} style={{ fontSize: 14, color: '#52525b', lineHeight: 1.65 }}>{i}</li>)}
    </ul>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Navbar cartId={user?.cartId} role={user?.role} cartCount={cartCount} onCartOpen={() => {}} />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 16px 64px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#09090b', margin: '0 0 8px', fontFamily: "'Playfair Display', Georgia, serif" }}>
            Legal
          </h1>
          <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>
            Información sobre privacidad, términos de uso y cookies de Folio.
          </p>
        </div>

        {/* Quick nav */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          {sections.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              style={{
                padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                background: 'white', border: '1px solid #e4e4e7', color: '#3f3f46',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#09090b'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#3f3f46' }}
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* PRIVACIDAD */}
        <div id="privacidad" style={{ scrollMarginTop: 80 }}>
          {card(
            <>
              {h2('Política de Privacidad')}
              {p('En Folio nos comprometemos a proteger tu información personal. Esta política describe qué datos recopilamos, cómo los usamos y cómo los protegemos.')}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '20px 0 8px' }}>Datos que recopilamos</h3>
              {li([
                'Nombre y apellido al registrarte.',
                'Dirección de email para autenticación y comunicaciones.',
                'Historial de compras asociado a tu cuenta.',
                'Datos de sesión almacenados de forma segura en el servidor.',
              ])}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '20px 0 8px' }}>Cómo usamos tu información</h3>
              {li([
                'Procesar tus compras y enviarte confirmaciones.',
                'Mantener el historial de tus pedidos.',
                'Mejorar la experiencia de la plataforma.',
                'Enviarte novedades si te suscribiste al newsletter (podés darte de baja en cualquier momento).',
              ])}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '20px 0 8px' }}>Seguridad</h3>
              {p('Los pagos son procesados por Stripe y nunca almacenamos datos de tarjetas. Las contraseñas se guardan con hash bcrypt.')}
              {p('Última actualización: junio de 2025.')}
            </>
          )}
        </div>

        {/* TÉRMINOS */}
        <div id="terminos" style={{ scrollMarginTop: 80 }}>
          {card(
            <>
              {h2('Términos y Condiciones')}
              {p('Al usar Folio aceptás los siguientes términos. Por favor leelos con atención antes de realizar una compra.')}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '20px 0 8px' }}>Uso del sitio</h3>
              {li([
                'Folio es una plataforma de venta de libros online.',
                'Para comprar podés hacerlo como invitado o con una cuenta registrada.',
                'El precio de los productos está expresado en dólares estadounidenses (USD).',
                'El stock se descuenta al confirmar el pago con Stripe.',
              ])}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '20px 0 8px' }}>Compras y pagos</h3>
              {li([
                'Los pagos se procesan de forma segura a través de Stripe.',
                'Una vez confirmado el pago, recibirás un ticket de compra en tu historial de pedidos.',
                'En caso de error en el cobro, el ticket no se genera y el stock no se modifica.',
              ])}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '20px 0 8px' }}>Devoluciones</h3>
              {p('Podés solicitar devolución dentro de los 30 días de realizada la compra escribiéndonos a soporte@folio.com. El reembolso se procesa en 5 a 10 días hábiles.')}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '20px 0 8px' }}>Cuentas premium</h3>
              {p('Los usuarios con rol premium acceden a un descuento del 10% en todas sus compras. El descuento se aplica automáticamente al momento del pago.')}
              {p('Última actualización: junio de 2025.')}
            </>
          )}
        </div>

        {/* COOKIES */}
        <div id="cookies" style={{ scrollMarginTop: 80 }}>
          {card(
            <>
              {h2('Política de Cookies')}
              {p('Folio utiliza cookies y almacenamiento local para brindarte una mejor experiencia de navegación.')}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '20px 0 8px' }}>¿Qué cookies usamos?</h3>
              {li([
                'Cookie de sesión (express-session): necesaria para mantener tu sesión activa. Se borra al cerrar sesión.',
                'Carrito de invitado (localStorage): guarda tu carrito si navegás sin cuenta. Se elimina al iniciar sesión o vaciar el carrito.',
                'Favoritos (localStorage): guarda tus libros favoritos localmente si no tenés cuenta.',
                'Libros vistos recientemente (localStorage): recordamos los últimos productos que visitaste para mostrártelos en el catálogo.',
              ])}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '20px 0 8px' }}>Cookies de terceros</h3>
              {li([
                'Stripe puede establecer cookies propias durante el proceso de pago para prevenir fraudes.',
                'No utilizamos cookies de publicidad ni rastreo de terceros.',
              ])}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#09090b', margin: '20px 0 8px' }}>Control de cookies</h3>
              {p('Podés limpiar las cookies y el almacenamiento local desde la configuración de tu navegador en cualquier momento. Esto cerrará tu sesión activa y vaciará tu carrito de invitado.')}
              {p('Última actualización: junio de 2025.')}
            </>
          )}
        </div>

      </main>

      <Footer />
      <BottomNav cartCount={cartCount} onCartOpen={() => {}} />
    </div>
  )
}

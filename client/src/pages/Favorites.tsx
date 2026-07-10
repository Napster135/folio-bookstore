import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import BookCard from '../components/BookCard'
import { useFavorites } from '../hooks/useFavorites'
import { useDocumentTitle } from '../hooks/useSEO'
import { useToast } from '../context/ToastContext'
import { useUser } from '../context/UserContext'
import { API_URL, apiFetch } from "../config/api";
import './Favorites.css'

export default function Favorites() {
  const { favorites } = useFavorites()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { user, cartCount, setCartCount } = useUser()
  const [cartOpen, setCartOpen] = useState(false)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState<string | null>(null)

  useDocumentTitle('Mis favoritos')

  const handleAddToCart = async (productId: string) => {
    if (!user?.cartId) {
      showToast('Iniciá sesión para agregar al carrito', 'info')
      navigate('/login')
      return
    }
    setAddingToCart(productId)
    try {
      const res = await apiFetch(`${API_URL}/api/carts/${user.cartId}/product/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        setCartCount(c => c + 1)
        setAddedToCart(productId)
        showToast('¡Agregado al carrito!', 'success')
        setTimeout(() => setAddedToCart(null), 2000)
      } else {
        showToast('No se pudo agregar', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setAddingToCart(null)
    }
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fafaf8' }}>
        <Navbar cartId={undefined} cartCount={0} onCartOpen={() => {}} />
        <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>❤️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#09090b', margin: '0 0 8px', fontFamily: "'Playfair Display', Georgia, serif" }}>
            Guardá tus libros favoritos
          </h2>
          <p style={{ fontSize: 14, color: '#71717a', margin: '0 0 28px', lineHeight: 1.6 }}>
            Iniciá sesión para guardar libros y acceder a tu lista desde cualquier dispositivo.
          </p>
          <button
            onClick={() => navigate('/login?redirect=/favorites')}
            style={{ padding: '11px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, backgroundColor: '#09090b', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Iniciar sesión
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafaf8' }}>
      <Navbar
        cartId={user?.cartId}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
      />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', paddingBottom: 80 }}>
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#09090b',
              margin: '0 0 4px',
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Mis favoritos
          </h1>
          <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>
            {favorites.length} {favorites.length === 1 ? 'libro guardado' : 'libros guardados'}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'white',
              borderRadius: 16,
              border: '1px solid #f0f0f0',
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>❤️</div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#09090b', margin: '0 0 8px' }}>
              Todavía no guardaste libros
            </h3>
            <p style={{ fontSize: 14, color: '#a1a1aa', margin: '0 0 24px' }}>
              Tocá el corazón en cualquier libro para guardarlo acá.
            </p>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: '#09090b',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Explorar catálogo
            </button>
          </div>
        ) : (
          <div className="fav-grid">
            {favorites.map(product => (
              <BookCard
                key={product._id}
                product={product}
                cartId={user?.cartId}
                onAddToCart={handleAddToCart}
                addingToCart={addingToCart}
                addedToCart={addedToCart}
              />
            ))}
          </div>
        )}
      </main>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartId={user?.cartId}
        onCartCountChange={setCartCount}
      />
      <Footer />
      <BottomNav cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
    </div>
  )
}

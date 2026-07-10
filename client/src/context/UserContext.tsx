import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

import { API_URL, apiFetch } from "../config/api";
const GUEST_CART_KEY = 'folio_guest_cart'

export type UserInfo = {
  user: string
  role: string
  cartId: string
}

type UserContextType = {
  user: UserInfo | null
  cartCount: number
  setCartCount: React.Dispatch<React.SetStateAction<number>>
  loading: boolean
  refetch: () => void
}

const UserContext = createContext<UserContextType>({
  user: null,
  cartCount: 0,
  setCartCount: () => {},
  loading: true,
  refetch: () => {},
})

export const useUser = () => useContext(UserContext)

// Merge guest cart into the user's backend cart after login
async function mergeGuestCart(cartId: string) {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    if (!raw) return
    const items: { _id: string; quantity: number }[] = JSON.parse(raw)
    if (!items.length) return
    // Limpiar antes de los POSTs: si fetchUser corre dos veces (React StrictMode),
    // la segunda llamada encuentra localStorage vacío y no duplica.
    localStorage.removeItem(GUEST_CART_KEY)
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        await apiFetch(`${API_URL}/api/carts/${cartId}/product/${item._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  } catch (e) { console.error('[mergeGuestCart]', e) }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_URL}/auth/tickets`, { headers: { Accept: 'application/json' } })
      if (!res.ok) { setUser(null); setCartCount(0); return }
      const j = await res.json()
      if (j?.user) {
        setUser(j.user)
        // Merge guest cart once after login (localStorage will be cleared after merge)
        if (j.user.cartId && localStorage.getItem(GUEST_CART_KEY)) {
          await mergeGuestCart(j.user.cartId)
        }
        if (j.user.cartId) {
          const cr = await apiFetch(`${API_URL}/api/carts/quantity/${j.user.cartId}`, {
            headers: { Accept: 'application/json' },
          })
          const cj = await cr.json()
          setCartCount(cj?.quantity ?? cj?.total ?? 0)
        } else {
          setCartCount(0)
        }
      } else {
        setUser(null)
        setCartCount(0)
      }
    } catch {
      setUser(null)
      setCartCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  return (
    <UserContext.Provider value={{ user, cartCount, setCartCount, loading, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

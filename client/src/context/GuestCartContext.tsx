import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const GUEST_CART_KEY = 'folio_guest_cart'

export type GuestCartItem = {
  _id: string
  title: string
  price: number
  thumbnail: string
  quantity: number
  stock: number
  category?: string
}

type GuestCartContextType = {
  items: GuestCartItem[]
  count: number
  total: number
  addItem: (product: GuestCartItem) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
}

const GuestCartContext = createContext<GuestCartContextType>({
  items: [],
  count: 0,
  total: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
})

export const useGuestCart = () => useContext(GuestCartContext)

function load(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(items: GuestCartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
  } catch (e) { console.error('[GuestCart] save error:', e) }
}

export function GuestCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<GuestCartItem[]>(load)

  useEffect(() => { save(items) }, [items])

  const addItem = useCallback((product: GuestCartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === product._id)
      if (existing) {
        const newQty = Math.min(existing.quantity + 1, product.stock)
        return prev.map(i => i._id === product._id ? { ...i, quantity: newQty } : i)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i._id !== id))
  }, [])

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) { setItems(prev => prev.filter(i => i._id !== id)); return }
    setItems(prev => prev.map(i => i._id === id ? { ...i, quantity: qty } : i))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    try { localStorage.removeItem(GUEST_CART_KEY) } catch (e) { console.error('[GuestCart] clear error:', e) }
  }, [])

  const count = items.reduce((acc, i) => acc + i.quantity, 0)
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  return (
    <GuestCartContext.Provider value={{ items, count, total, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </GuestCartContext.Provider>
  )
}

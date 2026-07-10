import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useUser } from './UserContext'

const STORAGE_PREFIX = 'folio_favs_'
const GUEST_KEY = 'folio_favs_guest'

export type FavoriteProduct = {
  _id: string
  title: string
  author?: string
  price: number
  thumbnail: string
  category: string
  stock: number
}

type FavoritesContextType = {
  favorites: FavoriteProduct[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (product: FavoriteProduct) => void
  removeFavorite: (id: string) => void
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  removeFavorite: () => {},
})

export const useFavoritesContext = () => useContext(FavoritesContext)

function load(key: string): FavoriteProduct[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useUser()
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const storageKeyRef = useRef<string>(GUEST_KEY)

  // Load favorites when session changes
  useEffect(() => {
    if (loading) return
    const key = user?.cartId ? STORAGE_PREFIX + user.cartId : GUEST_KEY
    storageKeyRef.current = key
    setFavorites(load(key))
  }, [user?.cartId, loading])

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem(storageKeyRef.current, JSON.stringify(favorites))
    } catch (e) { console.error('[Favorites] persist error:', e) }
  }, [favorites])

  const isFavorite = useCallback(
    (id: string) => favorites.some(f => f._id === id),
    [favorites]
  )

  const toggleFavorite = useCallback((product: FavoriteProduct) => {
    setFavorites(prev =>
      prev.some(f => f._id === product._id)
        ? prev.filter(f => f._id !== product._id)
        : [product, ...prev]
    )
  }, [])

  const removeFavorite = useCallback(
    (id: string) => setFavorites(prev => prev.filter(f => f._id !== id)),
    []
  )

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

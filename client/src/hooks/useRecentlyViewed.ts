import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'folio_recently_viewed'
const MAX_ITEMS = 8

export type RecentProduct = {
  _id: string
  title: string
  author?: string
  price: number
  thumbnail: string
  category: string
}

function load(): RecentProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch { /* localStorage not available */ }
  }, [items])

  const addProduct = useCallback((product: RecentProduct) => {
    setItems(prev => {
      const filtered = prev.filter(p => p._id !== product._id)
      return [product, ...filtered].slice(0, MAX_ITEMS)
    })
  }, [])

  return { items, addProduct }
}

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react'

import { API_URL, apiFetch } from "../config/api";
export type ConciergeBook = {
  _id: string
  title: string
  author: string
  price: number
  thumbnail: string
  category: string
  stock: number
  description?: string
}

export type ConciergeMessage = {
  id: number
  role: 'user' | 'assistant'
  text: string
  books?: ConciergeBook[]
  loading?: boolean
}

export type ConciergeBookContext = {
  title: string
  author?: string
  category?: string
  thumbnail?: string
}

type ConciergeContextType = {
  isOpen: boolean
  open: (initialMessage?: string) => void
  openFresh: (message: string, book?: ConciergeBookContext) => void
  reset: () => void
  close: () => void
  messages: ConciergeMessage[]
  sendMessage: (text: string) => void
  loading: boolean
  bookContext: ConciergeBookContext | null
}

const ConciergeContext = createContext<ConciergeContextType>({
  isOpen: false,
  open: () => {},
  openFresh: () => {},
  reset: () => {},
  close: () => {},
  messages: [],
  sendMessage: () => {},
  loading: false,
  bookContext: null,
})

// eslint-disable-next-line react-refresh/only-export-components
export const useConcierge = () => useContext(ConciergeContext)

let nextId = 1

const GREETING: ConciergeMessage = {
  id: 0,
  role: 'assistant',
  text: '👋 Hola.\n\nSoy el Librero IA de Folio.\n\nPuedo ayudarte a:\n• descubrir nuevos libros\n• encontrar regalos\n• recomendar autores\n• encontrar libros similares\n\n¿Qué estás buscando hoy?',
}

const makeBookGreeting = (title: string): ConciergeMessage => ({
  id: 0,
  role: 'assistant',
  text: `👋 Veo que estás viendo "${title}".\n\nPuedo recomendarte libros parecidos por:\n• autor\n• género\n• estilo\n• temática\n\nPreparé una selección para vos.`,
})

export function ConciergeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ConciergeMessage[]>([GREETING])
  const [loading, setLoading] = useState(false)
  const [bookContext, setBookContext] = useState<ConciergeBookContext | null>(null)
  const historyRef = useRef<{ role: string; content: string }[]>([])
  const sendRef = useRef<(text: string) => void>(() => {})

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: ConciergeMessage = { id: nextId++, role: 'user', text }
    const loadingId = nextId++
    const loadingMsg: ConciergeMessage = { id: loadingId, role: 'assistant', text: '', loading: true }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setLoading(true)

    const newHistory = [...historyRef.current, { role: 'user', content: text }]

    try {
      const res = await apiFetch(`${API_URL}/api/concierge/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: newHistory }),
      })
      const data = await res.json()
      const reply = data.reply ?? 'No pude procesar tu mensaje. Intentá de nuevo.'
      const books: ConciergeBook[] = data.books ?? []

      historyRef.current = [...newHistory, { role: 'assistant', content: reply }]

      setMessages(prev => [
        ...prev.filter(m => m.id !== loadingId),
        { id: nextId++, role: 'assistant', text: reply, books },
      ])
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.id !== loadingId),
        { id: nextId++, role: 'assistant', text: 'Hubo un problema de conexión. Por favor intentá de nuevo.' },
      ])
    } finally {
      setLoading(false)
    }
  }, [loading])

  useEffect(() => { sendRef.current = sendMessage })

  const open = useCallback((initialMessage?: string) => {
    setIsOpen(true)
    if (initialMessage) {
      setTimeout(() => sendRef.current(initialMessage), 80)
    }
  }, [])

  const openFresh = useCallback((message: string, book?: ConciergeBookContext) => {
    setBookContext(book ?? null)
    setMessages([book ? makeBookGreeting(book.title) : GREETING])
    historyRef.current = []
    setIsOpen(true)
    if (message) setTimeout(() => sendRef.current(message), 80)
  }, [])

  const reset = useCallback(() => {
    setMessages([GREETING])
    historyRef.current = []
    setBookContext(null)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => setBookContext(null), 350)
  }, [])

  return (
    <ConciergeContext.Provider value={{ isOpen, open, openFresh, reset, close, messages, sendMessage, loading, bookContext }}>
      {children}
    </ConciergeContext.Provider>
  )
}

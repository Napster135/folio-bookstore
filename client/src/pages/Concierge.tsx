import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import Navbar from '../components/Navbar'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import { useUser } from '../context/UserContext'
import { useDocumentTitle } from '../hooks/useSEO'
import type { ConciergeBook, ConciergeMessage as MsgType } from '../context/ConciergeContext'
import ConciergeBookCard from '../components/concierge/ConciergeBookCard'
import { API_URL, apiFetch } from "../config/api";
import '../components/concierge/Concierge.css'

const REFINE_CHIPS = [
  { emoji: '📚', label: 'Otro género' },
  { emoji: '✍️', label: 'Otro autor' },
  { emoji: '💰', label: 'Más económico' },
  { emoji: '✨', label: 'Sorprendeme' },
  { emoji: '🔄', label: 'Limpiar conversación', isReset: true as const },
]

const QUICK_ACTIONS = [
  { emoji: '📖', label: 'Recomiéndame algo para empezar a leer' },
  { emoji: '🎁', label: 'Necesito un regalo especial' },
  { emoji: '🔮', label: 'Quiero ficción' },
  { emoji: '🔥', label: 'Bestsellers populares' },
  { emoji: '✨', label: 'Sorpréndeme' },
  { emoji: '💰', label: 'Busco algo económico' },
  { emoji: '🕵️', label: 'Quiero un thriller' },
  { emoji: '🌌', label: 'Ciencia ficción' },
]

let nextId = 1

const GREETING: MsgType = {
  id: 0,
  role: 'assistant',
  text: '👋 Hola.\n\nSoy el Librero IA de Folio.\n\nPuedo ayudarte a:\n• descubrir nuevos libros\n• encontrar regalos\n• recomendar autores\n• encontrar libros similares\n\n¿Qué estás buscando hoy?',
}

export default function Concierge() {
  useDocumentTitle('Librero IA — Folio Concierge')

  const { user, cartCount, setCartCount } = useUser()
  const [cartOpen, setCartOpen] = useState(false)
  const [messages, setMessages] = useState<MsgType[]>([GREETING])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const historyRef = useRef<{ role: string; content: string }[]>([])
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if ('ontouchstart' in window) return
    inputRef.current?.focus()
  }, [])
  useEffect(() => {
    if (messages.length <= 1) return // no scrollear al saludo inicial
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const loadingId = nextId++
    setMessages(prev => [
      ...prev,
      { id: nextId++, role: 'user', text },
      { id: loadingId, role: 'assistant', text: '', loading: true },
    ])
    setLoading(true)
    const newHistory = [...historyRef.current, { role: 'user', content: text }]

    try {
      const res  = await apiFetch(`${API_URL}/api/concierge/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: newHistory }),
      })
      const data = await res.json()
      const reply  = data.reply ?? 'No pude procesar tu mensaje.'
      const books: ConciergeBook[] = data.books ?? []
      historyRef.current = [...newHistory, { role: 'assistant', content: reply }]
      setMessages(prev => [
        ...prev.filter(m => m.id !== loadingId),
        { id: nextId++, role: 'assistant', text: reply, books },
      ])
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.id !== loadingId),
        { id: nextId++, role: 'assistant', text: 'Hubo un problema de conexión. Intentá de nuevo.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    send(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) { send(input.trim()); setInput('') }
    }
  }

  const showQuickActions = messages.length <= 1

  const lastBookMsgId = messages.reduceRight<number | null>(
    (found, m) => found ?? (m.books && m.books.length > 0 ? m.id : null),
    null,
  )

  const handleRefine = () => {
    setInput('')
    inputRef.current?.focus()
  }

  const handleReset = () => {
    setMessages([GREETING])
    historyRef.current = []
    setInput('')
  }

  return (
    <div className="concierge-page">
      <Navbar
        cartId={user?.cartId}
        role={user?.role}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        userName={user?.user}
      />

      {/* ── Hero ── */}
      <section className="concierge-page-hero">
        <div className="concierge-page-hero-badge">📚 Librero IA</div>
        <h1>Encontrá tu próximo libro</h1>
        <p>Contale al Librero IA lo que buscás y te recomendará títulos reales del catálogo de Folio.</p>
      </section>

      {/* ── Body ── */}
      <main className="concierge-page-body">

        {/* Input */}
        <form onSubmit={handleSubmit}>
          <div className="concierge-page-input-wrap">
            <textarea
              ref={inputRef}
              className="concierge-page-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="¿Qué tipo de libro estás buscando?"
              rows={1}
              disabled={loading}
              aria-label="Mensaje al Librero IA"
            />
            <button
              type="submit"
              className="concierge-page-send-btn"
              disabled={!input.trim() || loading}
              aria-label="Enviar"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>

        {/* Quick actions */}
        {showQuickActions && (
          <div className="concierge-page-quick">
            {QUICK_ACTIONS.map(a => (
              <button
                key={a.label}
                className="concierge-page-quick-btn"
                onClick={() => send(a.label)}
                disabled={loading}
              >
                {a.emoji} {a.label}
              </button>
            ))}
          </div>
        )}

        {/* Conversation */}
        <div className="concierge-page-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`concierge-page-msg ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="concierge-page-msg-header">
                  <div className="concierge-page-msg-avatar">📚</div>
                  <span className="concierge-page-msg-label">Librero IA</span>
                </div>
              )}

              {msg.loading ? (
                <div
                  className="concierge-page-msg-bubble"
                  style={{ background: '#ffffff', border: '1px solid #ece8e0' }}
                >
                  <div className="concierge-loading-dots">
                    <span /><span /><span />
                  </div>
                </div>
              ) : (
                <div className="concierge-page-msg-bubble" style={msg.role === 'assistant' ? { whiteSpace: 'pre-line' } : undefined}>{msg.text}</div>
              )}

              {!msg.loading && msg.books && msg.books.length > 0 && (
                <>
                  <div className="concierge-page-msg-books">
                    {msg.books.map((book, index) => (
                      <ConciergeBookCard
                        key={String(book._id)}
                        book={book}
                        featured={index === 0 && msg.books!.length > 1}
                      />
                    ))}
                  </div>
                  {msg.id === lastBookMsgId && (
                    <div className="concierge-refine">
                      <p className="concierge-refine-text">¿Querés seguir afinando la búsqueda?</p>
                      <p className="concierge-refine-hint">Podés contarme:</p>
                      <ul className="concierge-refine-list">
                        <li>otro género</li>
                        <li>otro autor</li>
                        <li>un presupuesto</li>
                        <li>un libro parecido</li>
                      </ul>
                      <button className="concierge-refine-btn" onClick={handleRefine}>
                        Escribir otra consulta
                      </button>
                      <div className="concierge-refine-chips">
                        {REFINE_CHIPS.map(chip => (
                          <button
                            key={chip.label}
                            className={`concierge-chip${chip.isReset ? ' concierge-chip--reset' : ''}`}
                            onClick={chip.isReset ? handleReset : () => send(chip.label)}
                          >
                            {chip.emoji} {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
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

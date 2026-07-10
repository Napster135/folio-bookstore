import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useConcierge } from '../../context/ConciergeContext'
import ConciergeMessage from './ConciergeMessage'
import './Concierge.css'

const QUICK_ACTIONS = [
  { emoji: '📖', label: 'Recomiéndame algo para empezar' },
  { emoji: '🎁', label: 'Necesito un regalo' },
  { emoji: '🔮', label: 'Quiero ficción' },
  { emoji: '🔥', label: 'Bestsellers populares' },
  { emoji: '✨', label: 'Sorpréndeme' },
  { emoji: '💰', label: 'Algo económico' },
]

export default function ConciergePanel() {
  const { isOpen, close, messages, sendMessage, loading, reset, bookContext } = useConcierge()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const showQuickActions = messages.length <= 1

  useEffect(() => {
    if (!isOpen) return
    if ('ontouchstart' in window) return
    setTimeout(() => inputRef.current?.focus(), 120)
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const doSend = () => {
    if (!input.trim() || loading) return
    sendMessage(input.trim())
    setInput('')
  }

  const onRefine = () => {
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const lastBookMsgId = messages.reduceRight<number | null>(
    (found, m) => found ?? (m.books && m.books.length > 0 ? m.id : null),
    null,
  )

  const placeholder = lastBookMsgId !== null
    ? 'Contame un poco más y afinamos la búsqueda...'
    : 'Preguntale al Librero IA...'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    doSend()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      doSend()
    }
  }

  return (
    <>
      <div
        className={`concierge-backdrop${isOpen ? ' open' : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      <div
        className={`concierge-panel${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Librero IA"
      >
        {/* ── Header ── */}
        <div className="concierge-panel-header">
          <div className="concierge-panel-icon">📚</div>
          <div className="concierge-panel-title-wrap">
            <p className="concierge-panel-title">Librero IA</p>
            <p className="concierge-panel-subtitle">Tu asesor de lectura</p>
          </div>
          <button className="concierge-panel-close" onClick={close} aria-label="Cerrar">×</button>
        </div>

        {/* ── Book context card ── */}
        {bookContext && (
          <div className="concierge-context-card">
            <p className="concierge-context-label">📖 Buscando recomendaciones para</p>
            <div className="concierge-context-book">
              {bookContext.thumbnail && (
                <img
                  src={bookContext.thumbnail}
                  alt={bookContext.title}
                  className="concierge-context-thumb"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <div className="concierge-context-info">
                <p className="concierge-context-title">{bookContext.title}</p>
                {bookContext.author && (
                  <p className="concierge-context-author">{bookContext.author}</p>
                )}
                {bookContext.category && (
                  <span className="concierge-context-cat">{bookContext.category}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Messages ── */}
        <div className="concierge-messages">
          {messages.map(msg => (
            <ConciergeMessage
              key={msg.id}
              message={msg}
              onRefine={msg.id === lastBookMsgId ? onRefine : undefined}
              onSendChip={msg.id === lastBookMsgId ? (text) => sendMessage(text) : undefined}
              onReset={msg.id === lastBookMsgId ? reset : undefined}
            />
          ))}

          {showQuickActions && !loading && (
            <div className="concierge-quick-actions">
              <p className="concierge-quick-title">Sugerencias rápidas</p>
              <div className="concierge-quick-grid">
                {QUICK_ACTIONS.map(a => (
                  <button
                    key={a.label}
                    className="concierge-quick-btn"
                    onClick={() => sendMessage(a.label)}
                  >
                    {a.emoji} {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div className="concierge-panel-input-area">
          <form className="concierge-input-form" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className="concierge-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              disabled={loading}
              aria-label="Mensaje al Librero IA"
            />
            <button
              type="submit"
              className="concierge-send-btn"
              disabled={!input.trim() || loading}
              aria-label="Enviar mensaje"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

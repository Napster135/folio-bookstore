import ConciergeBookCard from './ConciergeBookCard'
import type { ConciergeMessage as MessageType } from '../../context/ConciergeContext'
import './Concierge.css'

const REFINE_CHIPS = [
  { emoji: '📚', label: 'Otro género' },
  { emoji: '✍️', label: 'Otro autor' },
  { emoji: '💰', label: 'Más económico' },
  { emoji: '✨', label: 'Sorprendeme' },
  { emoji: '🔄', label: 'Limpiar conversación', isReset: true as const },
]

interface Props {
  message: MessageType
  onRefine?: () => void
  onSendChip?: (text: string) => void
  onReset?: () => void
}

export default function ConciergeMessage({ message, onRefine, onSendChip, onReset }: Props) {
  const isUser = message.role === 'user'
  const hasBooks = !message.loading && message.books && message.books.length > 0
  const bookCount = message.books?.length ?? 0

  return (
    <div className={`concierge-msg ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && <div className="concierge-msg-avatar">📚</div>}

      <div className="concierge-msg-body">
        {message.loading ? (
          <div
            className="concierge-msg-bubble"
            style={{ background: '#ffffff', border: '1px solid #ece8e0' }}
          >
            <div className="concierge-loading-dots">
              <span /><span /><span />
            </div>
          </div>
        ) : (
          <div className="concierge-msg-bubble">{message.text}</div>
        )}

        {hasBooks && (
          <>
            <div className="concierge-books">
              {message.books!.map((book, index) => (
                <ConciergeBookCard
                  key={String(book._id)}
                  book={book}
                  featured={index === 0 && bookCount > 1}
                />
              ))}
            </div>

            {onRefine && (
              <div className="concierge-refine">
                <p className="concierge-refine-text">¿Querés seguir afinando la búsqueda?</p>
                <p className="concierge-refine-hint">Podés contarme:</p>
                <ul className="concierge-refine-list">
                  <li>otro género</li>
                  <li>otro autor</li>
                  <li>un presupuesto</li>
                  <li>un libro parecido</li>
                </ul>
                <button className="concierge-refine-btn" onClick={onRefine}>
                  Escribir otra consulta
                </button>
                <div className="concierge-refine-chips">
                  {REFINE_CHIPS.map(chip => (
                    <button
                      key={chip.label}
                      className={`concierge-chip${chip.isReset ? ' concierge-chip--reset' : ''}`}
                      onClick={chip.isReset ? onReset : () => onSendChip?.(chip.label)}
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
    </div>
  )
}

import { useLocation } from 'react-router-dom'
import { useConcierge } from '../../context/ConciergeContext'
import './Concierge.css'

export default function ConciergeButton() {
  const { open, isOpen } = useConcierge()
  const { pathname } = useLocation()

  // Hide on the dedicated /concierge page and when the panel is already open
  if (isOpen || pathname === '/concierge') return null

  return (
    <button
      className="concierge-fab"
      onClick={() => open()}
      aria-label="Abrir Librero IA"
    >
      <span className="concierge-fab-icon">📚</span>
      <span>Librero IA</span>
    </button>
  )
}

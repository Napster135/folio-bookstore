import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Página no encontrada | Folio — Librería Online'
    return () => { document.title = 'Folio — Librería Online' }
  }, [])

  return (
    <>

      <div className="notfound-page">
        <span className="notfound-book">📚</span>
        <div className="notfound-code">404</div>
        <div className="notfound-divider" />
        <h1 className="notfound-title">Página no encontrada</h1>
        <p className="notfound-subtitle">
          Parece que esta página se perdió entre los estantes. No te preocupes, tenemos miles de títulos esperándote.
        </p>
        <div className="notfound-actions">
          <button className="notfound-btn-primary" onClick={() => navigate('/products')}>
            Explorar catálogo
          </button>
          <button className="notfound-btn-secondary" onClick={() => navigate(-1)}>
            ← Volver atrás
          </button>
        </div>
      </div>
    </>
  )
}

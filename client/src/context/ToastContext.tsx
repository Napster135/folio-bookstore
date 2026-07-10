import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: number
  message: string
  type: ToastType
}

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export const useToast = () => useContext(ToastContext)

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id))
    }, 3500)
  }, [])

  const dismiss = (id: number) => setToasts(t => t.filter(x => x.id !== id))

  const borderColor = (type: ToastType) =>
    type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : '#22c55e'

  const icon = (type: ToastType) =>
    type === 'error' ? '✕' : type === 'info' ? 'ℹ' : '✓'

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            onClick={() => dismiss(toast.id)}
            className='folio-toast'
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 12,
              backgroundColor: '#09090b', color: 'white',
              fontSize: 13, fontWeight: 500,
              boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              cursor: 'pointer', pointerEvents: 'auto',
              minWidth: 200, maxWidth: 320,
              borderLeft: '3px solid ' + borderColor(toast.type),
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>{icon(toast.type)}</span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

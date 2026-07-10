import { Component, type ReactNode, type ErrorInfo } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#f0ead8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          fontFamily: 'inherit',
        }}>
          <p style={{ fontSize: 15, color: '#52525b', margin: 0 }}>
            Algo salió mal. Intentá recargar la página.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '9px 22px',
              borderRadius: 8,
              background: '#c4922a',
              color: '#0f0d08',
              border: 'none',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

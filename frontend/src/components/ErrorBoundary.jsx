import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message:   error.message,
        source:    'react-boundary',
        stack:     error.stack + '\n' + info.componentStack,
        url:       window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {})
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={s.page} role="alert">
        <div style={s.box}>
          <div style={s.icon}>⚠</div>
          <h1 style={s.title}>Something went wrong</h1>
          <p style={s.msg}>{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
          <div style={s.actions}>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => window.location.href = '/'}>
              Back to Home
            </button>
            <button style={s.btn} onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }
}

const s = {
  page:       { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1a2e', fontFamily: 'Arial, sans-serif' },
  box:        { textAlign: 'center', padding: '40px 32px', background: '#16213e', borderRadius: 14, border: '1px solid #b71c1c', maxWidth: 420 },
  icon:       { fontSize: 48, marginBottom: 16 },
  title:      { color: '#ff6b6b', fontSize: 24, fontWeight: 900, margin: '0 0 12px' },
  msg:        { color: '#ccc', fontSize: 14, margin: '0 0 24px', wordBreak: 'break-word' },
  actions:    { display: 'flex', gap: 12, justifyContent: 'center' },
  btn:        { padding: '10px 20px', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer', background: '#1e3a5f', color: '#fff' },
  btnPrimary: { background: '#e52521' },
}

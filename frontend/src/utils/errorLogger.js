function report(payload) {
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      url:       window.location.href,
      userAgent: navigator.userAgent,
    }),
  }).catch(() => {})
}

export function installGlobalErrorHandlers() {
  window.onerror = (message, source, lineno, colno, error) => {
    report({
      message: typeof message === 'string' ? message : String(message),
      source:  `${source ?? 'unknown'}:${lineno}:${colno}`,
      stack:   error?.stack,
    })
    return false // let default error handling proceed
  }

  window.onunhandledrejection = (event) => {
    const reason = event.reason
    report({
      message: reason instanceof Error ? reason.message : String(reason ?? 'Unhandled rejection'),
      source:  'unhandledrejection',
      stack:   reason instanceof Error ? reason.stack : undefined,
    })
  }
}

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert" style={s.box}>
      <span style={s.icon} aria-hidden="true">⚠</span>
      <span style={s.text}>{message}</span>
      {onRetry && (
        <button style={s.btn} onClick={onRetry}>Retry</button>
      )}
    </div>
  )
}

const s = {
  box:  { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#2d0000', border: '1px solid #b71c1c', borderRadius: 8, color: '#ff8a80', fontSize: 14 },
  icon: { fontSize: 18, flexShrink: 0 },
  text: { flex: 1 },
  btn:  { marginLeft: 'auto', padding: '5px 12px', fontSize: 12, fontWeight: 700, background: '#b71c1c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
}

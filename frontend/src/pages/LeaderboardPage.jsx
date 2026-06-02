import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage.jsx'

const MEDAL = ['🥇', '🥈', '🥉']

function LeaderboardPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [tick, setTick]       = useState(0)

  const retry = () => setTick(t => t + 1)

  useEffect(() => {
    let alive = true
    fetch('/api/scores/best?limit=20')
      .then(r => {
        if (!r.ok) throw new Error(`Server error ${r.status}`)
        return r.json()
      })
      .then(data => { if (alive) { setEntries(data); setError(null); setLoading(false) } })
      .catch(err => { if (alive) { setError(err.message); setLoading(false) } })
    return () => { alive = false }
  }, [tick])

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🏆 Global Leaderboard</h1>

      {loading && <p style={styles.info}>Loading...</p>}
      {error   && <ErrorMessage message={`Could not load scores: ${error}`} onRetry={retry} />}

      {!loading && !error && entries.length === 0 && (
        <p style={styles.info}>No scores yet — be the first!</p>
      )}

      {!loading && !error && entries.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Player</th>
              <th style={styles.th}>Best Score</th>
              <th style={styles.th}>Plays</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.username} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={styles.td}>{MEDAL[i] ?? `#${i + 1}`}</td>
                <td style={styles.td}>{e.username}</td>
                <td style={{ ...styles.td, fontWeight: 'bold', color: '#ffd700' }}>{e.score}</td>
                <td style={styles.td}>{e.plays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link to="/" style={styles.back}>← Back to Home</Link>
    </div>
  )
}

const styles = {
  page:    { maxWidth: 560, margin: '40px auto', fontFamily: 'Arial, sans-serif', color: '#fff', background: '#1a1a2e', padding: 24, borderRadius: 12 },
  title:   { textAlign: 'center', color: '#ffd700', marginBottom: 24 },
  info:    { textAlign: 'center', opacity: 0.7 },
  error:   { textAlign: 'center', color: '#ff6b6b' },
  table:   { width: '100%', borderCollapse: 'collapse' },
  th:      { padding: '10px 14px', borderBottom: '2px solid #ffd700', color: '#ffd700', textAlign: 'left' },
  td:      { padding: '10px 14px' },
  rowEven: { background: '#16213e' },
  rowOdd:  { background: '#0f3460' },
  back:    { display: 'block', marginTop: 24, textAlign: 'center', color: '#aaffaa', textDecoration: 'none' },
}

export default LeaderboardPage

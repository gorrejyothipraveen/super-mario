import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProgress, clearProgress } from '../game/services/saveService.js'
import { setVolume, getVolume } from '../game/services/soundManager.js'

export default function HomePage() {
  const navigate = useNavigate()
  const [save, setSave]             = useState(null)
  const [showSettings, setSettings] = useState(false)
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem('smario_username') || 'guest'
  )
  const [nameInput, setNameInput]   = useState(playerName)
  const [volume, setVol]            = useState(() => getVolume())
  const [exitMsg, setExitMsg]       = useState(false)

  useEffect(() => {
    loadProgress().then(s => { if (s && s.levelIndex > 0) setSave(s) })
  }, [])

  function handleStart() {
    clearProgress()
    navigate('/game')
  }

  function handleContinue() {
    navigate('/game', { state: { save } })
  }

  function saveSettings() {
    const name = nameInput.trim() || 'guest'
    localStorage.setItem('smario_username', name)
    setPlayerName(name)
    setVolume(volume)
    setSettings(false)
  }

  function handleExit() {
    const closed = window.close()
    if (closed === undefined) setExitMsg(true)
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>🍄</div>
        <h1 style={s.title}>Super Mario Web</h1>
        <p style={s.subtitle}>Welcome, {playerName}!</p>
      </header>

      <nav aria-label="Main menu" style={s.menu}>
        <MenuBtn icon="▶" label="Start Game"   onClick={handleStart} primary />
        {save && (
          <MenuBtn
            icon="↩"
            label={`Continue  (Level ${save.levelIndex + 1}, Score ${save.score})`}
            onClick={handleContinue}
          />
        )}
        <MenuBtn icon="⚙" label="Settings"    onClick={() => setSettings(v => !v)} />
        <MenuBtn icon="🏆" label="Leaderboard" onClick={() => navigate('/leaderboard')} />
        <MenuBtn icon="✕" label="Exit"         onClick={handleExit} danger />
      </nav>

      {exitMsg && (
        <p style={s.exitMsg} role="alert">
          Close this browser tab to exit.
        </p>
      )}

      {showSettings && (
        <section aria-label="Settings panel" style={s.panel}>
          <h2 style={s.panelTitle}>⚙ Settings</h2>
          <label style={s.label} htmlFor="player-name">Player name</label>
          <input
            id="player-name"
            style={s.input}
            value={nameInput}
            maxLength={20}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveSettings()}
            autoFocus
          />
          <label style={{ ...s.label, marginTop: 14 }} htmlFor="volume">
            Volume — {Math.round(volume * 100)}%
          </label>
          <input
            id="volume"
            type="range"
            min="0" max="1" step="0.05"
            value={volume}
            style={{ width: '100%', accentColor: '#ffd700', cursor: 'pointer' }}
            onChange={e => { const v = parseFloat(e.target.value); setVol(v); setVolume(v) }}
          />
          <div style={s.panelActions}>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={saveSettings}>Save</button>
            <button style={s.btn} onClick={() => setSettings(false)}>Cancel</button>
          </div>
        </section>
      )}

      <footer style={s.footer}>
        Use arrow keys or WASD · UP / SPACE to jump · Stomp enemies!
      </footer>
    </div>
  )
}

function MenuBtn({ icon, label, onClick, primary, danger }) {
  const [hover, setHover] = useState(false)
  const base = { ...s.btn, ...(primary ? s.btnPrimary : danger ? s.btnDanger : s.btnSecondary) }
  const style = hover ? { ...base, ...s.btnHover } : base
  return (
    <button
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={label}
    >
      <span aria-hidden="true" style={{ marginRight: 10 }}>{icon}</span>
      {label}
    </button>
  )
}

const s = {
  page:        { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)', fontFamily: 'Arial, sans-serif', color: '#fff', padding: 24, boxSizing: 'border-box' },
  header:      { textAlign: 'center', marginBottom: 40 },
  logo:        { fontSize: 64, lineHeight: 1 },
  title:       { fontSize: 42, fontWeight: 900, color: '#ffd700', margin: '8px 0 4px', textShadow: '2px 2px 0 #000' },
  subtitle:    { fontSize: 16, opacity: 0.7, margin: 0 },
  menu:        { display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 340 },
  btn:         { width: '100%', padding: '14px 20px', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'transform 0.1s, opacity 0.1s', outline: 'none' },
  btnPrimary:  { background: '#e52521', color: '#fff', boxShadow: '0 4px 0 #8b1a18' },
  btnSecondary:{ background: '#16213e', color: '#fff', border: '2px solid #0f3460' },
  btnDanger:   { background: 'transparent', color: '#ff6b6b', border: '2px solid #ff6b6b' },
  btnHover:    { transform: 'translateY(-2px)', opacity: 0.9 },
  exitMsg:     { marginTop: 12, color: '#aaa', fontSize: 14 },
  panel:       { marginTop: 24, background: '#16213e', border: '2px solid #0f3460', borderRadius: 12, padding: 24, width: '100%', maxWidth: 340 },
  panelTitle:  { margin: '0 0 16px', fontSize: 18 },
  label:       { display: 'block', marginBottom: 6, fontSize: 14, opacity: 0.8 },
  input:       { width: '100%', padding: '10px 12px', fontSize: 15, background: '#0f3460', border: '2px solid #ffd700', borderRadius: 6, color: '#fff', boxSizing: 'border-box', outline: 'none' },
  panelActions:{ display: 'flex', gap: 8, marginTop: 16 },
  footer:      { marginTop: 48, fontSize: 13, opacity: 0.4, textAlign: 'center' },
}

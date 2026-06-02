import { useState, useEffect } from 'react'

const DEFAULT_CONFIG = JSON.stringify({
  spawn:     { xFrac: 0.10 },
  platforms: [
    { xFrac: 0.30, fromBottom: 130, w: 140 },
    { xFrac: 0.60, fromBottom: 200, w: 140 },
  ],
  coins: [
    { xFrac: 0.30, fromBottom: 165 },
    { xFrac: 0.60, fromBottom: 235 },
  ],
  enemies: [
    { xFrac: 0.50, fromBottom: 64, leftFrac: 0.40, rightFrac: 0.60 },
  ],
  goal:      { xFrac: 0.95, fromBottom: 70 },
  nextLevel: null,
}, null, 2)

const EMPTY_FORM = { name: '', background: '#5c94fc', config_json: DEFAULT_CONFIG }

export default function AdminPage() {
  const [adminKey, setAdminKey]   = useState(() => sessionStorage.getItem('smario_admin_key') || '')
  const [keyInput, setKeyInput]   = useState(adminKey)
  const [levels, setLevels]       = useState([])
  const [apiError, setApiError]   = useState('')
  const [form, setForm]           = useState(null)   // null=hidden | {id?, ...fields}
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)
  const [tick, setTick]           = useState(0)

  const refresh = () => setTick(t => t + 1)

  function headers() {
    return { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey }
  }

  useEffect(() => {
    if (!adminKey) return
    let alive = true
    fetch('/api/levels', { headers: { 'X-Admin-Key': adminKey } })
      .then(res => {
        if (!res.ok) throw new Error(res.status === 401 ? 'Invalid admin key' : 'Failed to load levels')
        return res.json()
      })
      .then(data => { if (alive) { setApiError(''); setLevels(data) } })
      .catch(e   => { if (alive) setApiError(e.message) })
    return () => { alive = false }
  }, [adminKey, tick])

  function applyKey() {
    const k = keyInput.trim() || 'dev-admin-key'
    sessionStorage.setItem('smario_admin_key', k)
    setAdminKey(k)
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM })
    setFormError('')
  }

  function openEdit(level) {
    setForm({
      id:          level.id,
      name:        level.name,
      background:  level.background,
      config_json: JSON.stringify(level.config, null, 2),
    })
    setFormError('')
  }

  async function saveForm() {
    setFormError('')
    if (!form.name.trim()) { setFormError('Name is required'); return }
    let parsed
    try { parsed = JSON.parse(form.config_json) } catch {
      setFormError('Config JSON is not valid JSON'); return
    }
    for (const k of ['spawn', 'platforms', 'coins', 'enemies', 'goal']) {
      if (!(k in parsed)) { setFormError(`Config JSON missing required key: ${k}`); return }
    }
    setSaving(true)
    try {
      const isEdit = Boolean(form.id)
      const url    = isEdit ? `/api/levels/${form.id}` : '/api/levels'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify({
          name:        form.name.trim(),
          background:  form.background,
          config_json: form.config_json,
        }),
      })
      const body = await res.json()
      if (!res.ok) { setFormError(body.message || 'Save failed'); return }
      setForm(null)
      refresh()
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(level) {
    try {
      const res = await fetch(`/api/levels/${level.id}/publish`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ published: !level.published }),
      })
      if (!res.ok) throw new Error('Failed to update')
      refresh()
    } catch (e) {
      setApiError(e.message)
    }
  }

  async function removeLevel(level) {
    if (!window.confirm(`Delete "${level.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/levels/${level.id}`, {
        method: 'DELETE', headers: headers(),
      })
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete')
      refresh()
    } catch (e) {
      setApiError(e.message)
    }
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>Admin Panel</h1>

      {/* Admin key */}
      <section style={s.card}>
        <label style={s.label} htmlFor="admin-key">Admin Key</label>
        <div style={s.row}>
          <input
            id="admin-key"
            type="password"
            style={s.input}
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyKey()}
            placeholder="Enter admin key"
          />
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={applyKey}>Apply</button>
        </div>
      </section>

      {apiError && <p style={s.error} role="alert">{apiError}</p>}

      {/* Level list */}
      {adminKey && (
        <section style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.sectionTitle}>Levels ({levels.length})</h2>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={openCreate}>+ New Level</button>
          </div>

          {levels.length === 0 ? (
            <p style={s.empty}>No levels yet. Create one above.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>BG</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {levels.map(level => (
                  <tr key={level.id} style={s.tr}>
                    <td style={s.td}>{level.id}</td>
                    <td style={s.td}>{level.name}</td>
                    <td style={s.td}>
                      <span style={{ ...s.colorSwatch, background: level.background }} />
                      {level.background}
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...(level.published ? s.badgeGreen : s.badgeGray) }}>
                        {level.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button style={{ ...s.btn, ...s.btnSmall }} onClick={() => openEdit(level)}>Edit</button>
                      <button
                        style={{ ...s.btn, ...s.btnSmall, ...(level.published ? s.btnWarning : s.btnSuccess) }}
                        onClick={() => togglePublish(level)}
                      >
                        {level.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button style={{ ...s.btn, ...s.btnSmall, ...s.btnDanger }} onClick={() => removeLevel(level)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Create / edit form */}
      {form && (
        <section style={s.card} aria-label="Level editor">
          <h2 style={s.sectionTitle}>{form.id ? `Edit Level #${form.id}` : 'New Level'}</h2>
          {formError && <p style={s.error}>{formError}</p>}

          <label style={s.label} htmlFor="lv-name">Name</label>
          <input
            id="lv-name"
            style={s.input}
            maxLength={50}
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />

          <label style={{ ...s.label, marginTop: 12 }} htmlFor="lv-bg">Background colour</label>
          <div style={s.row}>
            <input
              id="lv-bg"
              type="color"
              value={form.background}
              style={s.colorPicker}
              onChange={e => setForm(f => ({ ...f, background: e.target.value }))}
            />
            <input
              style={{ ...s.input, flex: 1 }}
              value={form.background}
              onChange={e => setForm(f => ({ ...f, background: e.target.value }))}
            />
          </div>

          <label style={{ ...s.label, marginTop: 12 }} htmlFor="lv-config">
            Config JSON
            <span style={s.hint}> — required keys: spawn, platforms, coins, enemies, goal</span>
          </label>
          <textarea
            id="lv-config"
            style={s.textarea}
            value={form.config_json}
            onChange={e => setForm(f => ({ ...f, config_json: e.target.value }))}
            rows={18}
            spellCheck={false}
          />

          <div style={{ ...s.row, marginTop: 16 }}>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={saveForm} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button style={s.btn} onClick={() => setForm(null)}>Cancel</button>
          </div>
        </section>
      )}
    </div>
  )
}

const s = {
  page:        { minHeight: '100vh', background: '#0f1a2e', color: '#fff', fontFamily: 'Arial, sans-serif', padding: '24px 32px', boxSizing: 'border-box' },
  title:       { fontSize: 28, fontWeight: 900, color: '#ffd700', marginBottom: 24 },
  card:        { background: '#16213e', border: '1px solid #0f3460', borderRadius: 10, padding: 20, marginBottom: 20 },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:{ fontSize: 18, fontWeight: 700, margin: 0 },
  label:       { display: 'block', fontSize: 13, opacity: 0.75, marginBottom: 6 },
  hint:        { fontWeight: 400, fontSize: 11, opacity: 0.5 },
  input:       { width: '100%', padding: '9px 12px', fontSize: 14, background: '#0f3460', border: '1px solid #2a5298', borderRadius: 6, color: '#fff', boxSizing: 'border-box', outline: 'none' },
  textarea:    { width: '100%', padding: '9px 12px', fontSize: 12, fontFamily: 'monospace', background: '#0a1628', border: '1px solid #2a5298', borderRadius: 6, color: '#e2e8f0', boxSizing: 'border-box', outline: 'none', resize: 'vertical' },
  row:         { display: 'flex', gap: 8, alignItems: 'center' },
  colorPicker: { width: 44, height: 36, border: 'none', background: 'none', cursor: 'pointer', padding: 0, borderRadius: 4 },
  btn:         { padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', background: '#1e3a5f', color: '#fff' },
  btnPrimary:  { background: '#e52521', color: '#fff' },
  btnSmall:    { padding: '5px 10px', fontSize: 12, marginRight: 4 },
  btnSuccess:  { background: '#2e7d32' },
  btnWarning:  { background: '#795548' },
  btnDanger:   { background: '#b71c1c' },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:          { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #2a3a5c', opacity: 0.6 },
  tr:          { borderBottom: '1px solid #1a2a45' },
  td:          { padding: '9px 10px', verticalAlign: 'middle' },
  badge:       { padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  badgeGreen:  { background: '#1b5e20', color: '#a5d6a7' },
  badgeGray:   { background: '#333', color: '#aaa' },
  colorSwatch: { display: 'inline-block', width: 12, height: 12, borderRadius: 3, marginRight: 6, border: '1px solid #555', verticalAlign: 'middle' },
  error:       { color: '#ff6b6b', fontSize: 13, margin: '8px 0' },
  empty:       { opacity: 0.5, fontSize: 14 },
}

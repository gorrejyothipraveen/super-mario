const LS_KEY = 'smario_save'

function getUsername() {
  let name = localStorage.getItem('smario_username')
  if (!name) {
    name = 'guest'
    localStorage.setItem('smario_username', name)
  }
  return name
}

function lsSave(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function saveProgress(levelIndex, score, unlockedLevels) {
  const state = { levelIndex, score, unlockedLevels }
  lsSave(state)
  try {
    const username = getUsername()
    await fetch(`/api/saves/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
  } catch {
    // backend unavailable — localStorage already saved
  }
}

export async function loadProgress() {
  try {
    const username = getUsername()
    const res = await fetch(`/api/saves/${username}`)
    if (res.ok) return res.json()
  } catch {
    // backend unavailable — fall through to localStorage
  }
  return lsLoad()
}

export function clearProgress() {
  localStorage.removeItem(LS_KEY)
}

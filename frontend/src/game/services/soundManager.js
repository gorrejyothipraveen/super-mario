let _ctx = null

function ctx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function vol() {
  return parseFloat(localStorage.getItem('smario_volume') ?? '0.5')
}

function tone({ type = 'sine', freq, endFreq, duration, gainVal }) {
  const c   = ctx()
  const osc = c.createOscillator()
  const g   = c.createGain()
  const v   = gainVal ?? vol()
  const now = c.currentTime

  osc.connect(g)
  g.connect(c.destination)

  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration)
  }

  g.gain.setValueAtTime(v * 0.4, now)
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.start(now)
  osc.stop(now + duration + 0.01)
}

export function playJump() {
  tone({ type: 'square', freq: 220, endFreq: 660, duration: 0.14 })
}

export function playCoin() {
  tone({ type: 'sine', freq: 988,  endFreq: 1480, duration: 0.08 })
  setTimeout(() =>
    tone({ type: 'sine', freq: 1480, duration: 0.12 }), 80)
}

export function playEnemyStomp() {
  tone({ type: 'square', freq: 180, endFreq: 55,  duration: 0.18 })
}

export function playPlayerHit() {
  tone({ type: 'sawtooth', freq: 320, endFreq: 90, duration: 0.28 })
}

export function playGameOver() {
  const delays = [0, 180, 360, 540]
  const freqs  = [330, 262, 220, 165]
  delays.forEach((d, i) =>
    setTimeout(() => tone({ type: 'square', freq: freqs[i], duration: 0.22 }), d)
  )
}

export function setVolume(v) {
  localStorage.setItem('smario_volume', String(Math.max(0, Math.min(1, v))))
}

export function getVolume() {
  return vol()
}

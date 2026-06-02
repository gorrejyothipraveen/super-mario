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
  tone({ type: 'square', freq: 300, endFreq: 620, duration: 0.10 })
}

export function playCoin() {
  tone({ type: 'sine', freq: 1318, duration: 0.05 })
  setTimeout(() => tone({ type: 'sine', freq: 1760, duration: 0.10 }), 55)
}

export function playEnemyStomp() {
  tone({ type: 'square', freq: 200, endFreq: 60, duration: 0.15 })
}

export function playPlayerHit() {
  tone({ type: 'sawtooth', freq: 440, endFreq: 110, duration: 0.30 })
}

export function playGameOver() {
  const steps = [
    { d: 0,   f: 330, dur: 0.25 },
    { d: 270, f: 262, dur: 0.25 },
    { d: 540, f: 220, dur: 0.25 },
    { d: 810, f: 165, dur: 0.60 },
  ]
  steps.forEach(({ d, f, dur }) =>
    setTimeout(() => tone({ type: 'square', freq: f, duration: dur }), d)
  )
}

export function setVolume(v) {
  localStorage.setItem('smario_volume', String(Math.max(0, Math.min(1, v))))
}

export function getVolume() {
  return vol()
}

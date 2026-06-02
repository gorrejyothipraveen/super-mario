import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import gameConfig from './config.js'
import { touch } from './services/touchInput.js'

const isTouchDevice = () =>
  'ontouchstart' in window || navigator.maxTouchPoints > 0

function usePortrait() {
  const [portrait, setPortrait] = useState(
    () => window.innerHeight > window.innerWidth
  )
  useEffect(() => {
    const update = () => setPortrait(window.innerHeight > window.innerWidth)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return portrait
}

export default function PhaserGame({ initialSave }) {
  const containerRef = useRef(null)
  const gameRef      = useRef(null)
  const portrait     = usePortrait()

  useEffect(() => {
    const startScene = initialSave ? 'PlayScene' : 'BootScene'
    const startData  = initialSave
      ? { levelIndex: initialSave.levelIndex, score: initialSave.score, unlockedLevels: initialSave.unlockedLevels }
      : {}

    gameRef.current = new Phaser.Game({
      ...gameConfig,
      parent: containerRef.current,
      scene: gameConfig.scene.map((SceneClass, i) => {
        if (i === 0 && startScene === 'PlayScene') {
          return class extends SceneClass {
            create() { this.scene.start('PlayScene', startData) }
          }
        }
        return SceneClass
      }),
    })

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'fixed', inset: 0, touchAction: 'none', userSelect: 'none' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />

      {portrait && (
        <div style={s.orientationOverlay}>
          <div style={s.orientationBox}>
            <div style={{ fontSize: 48 }}>📱➡️</div>
            <p style={{ margin: '12px 0 0', fontSize: 16 }}>
              Rotate your device to landscape for the best experience
            </p>
          </div>
        </div>
      )}

      {isTouchDevice() && !portrait && <TouchControls />}
    </div>
  )
}

function TouchControls() {
  function bind(key) {
    return {
      onTouchStart: e => { e.preventDefault(); touch[key] = true },
      onTouchEnd:   e => { e.preventDefault(); touch[key] = false },
      onTouchCancel:e => { e.preventDefault(); touch[key] = false },
    }
  }

  return (
    <div style={s.controls} aria-label="Touch controls">
      {/* D-pad left / right */}
      <div style={s.dpad}>
        <button style={s.dpadBtn} aria-label="Move left"  {...bind('left')}>◀</button>
        <button style={s.dpadBtn} aria-label="Move right" {...bind('right')}>▶</button>
      </div>

      {/* Jump */}
      <button style={{ ...s.dpadBtn, ...s.jumpBtn }} aria-label="Jump" {...bind('jump')}>▲</button>
    </div>
  )
}

const s = {
  orientationOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
  },
  orientationBox: {
    color: '#fff', textAlign: 'center', padding: 24,
    background: '#1a1a2e', borderRadius: 12,
  },
  controls: {
    position: 'absolute', bottom: 24, left: 0, right: 0,
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-end', padding: '0 24px',
    pointerEvents: 'none',
    zIndex: 50,
  },
  dpad: {
    display: 'flex', gap: 12, pointerEvents: 'auto',
  },
  dpadBtn: {
    width: 64, height: 64,
    fontSize: 24, fontWeight: 'bold',
    background: 'rgba(255,255,255,0.15)',
    border: '2px solid rgba(255,255,255,0.4)',
    borderRadius: 12, color: '#fff',
    cursor: 'pointer', pointerEvents: 'auto',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'none',
  },
  jumpBtn: {
    background: 'rgba(229,37,33,0.5)',
    border: '2px solid rgba(229,37,33,0.8)',
    width: 72, height: 72,
  },
}

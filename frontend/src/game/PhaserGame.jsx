import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import gameConfig from './config.js'

function PhaserGame() {
  const containerRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    gameRef.current = new Phaser.Game({
      ...gameConfig,
      parent: containerRef.current,
    })

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}
    />
  )
}

export default PhaserGame

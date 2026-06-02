import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import gameConfig from './config.js'

export default function PhaserGame({ initialSave }) {
  const containerRef = useRef(null)
  const gameRef      = useRef(null)

  useEffect(() => {
    const startScene = initialSave
      ? 'PlayScene'
      : 'BootScene'

    const startData = initialSave
      ? { levelIndex: initialSave.levelIndex, score: initialSave.score, unlockedLevels: initialSave.unlockedLevels }
      : {}

    gameRef.current = new Phaser.Game({
      ...gameConfig,
      parent: containerRef.current,
      scene: gameConfig.scene.map((SceneClass, i) => {
        if (i === 0 && startScene === 'PlayScene') {
          // Skip BootScene — jump directly to PlayScene with save data
          return class extends SceneClass {
            create() {
              this.scene.start('PlayScene', startData)
            }
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
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}
    />
  )
}

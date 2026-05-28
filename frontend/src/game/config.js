import Phaser from 'phaser'
import BootScene from './scenes/BootScene.js'
import GameScene from './scenes/GameScene.js'

const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  backgroundColor: '#5c94fc',
  scene: [BootScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

export default gameConfig

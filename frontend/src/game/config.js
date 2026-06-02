import Phaser from 'phaser'
import BootScene from './scenes/BootScene.js'
import GameScene from './scenes/GameScene.js'
import PlayScene from './scenes/PlayScene.js'

const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  backgroundColor: '#5c94fc',
  scene: [BootScene, GameScene, PlayScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

export default gameConfig

import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Game assets will be loaded here in future stories
  }

  create() {
    this.scene.start('GameScene')
  }
}

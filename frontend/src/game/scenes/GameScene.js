import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const { width, height } = this.scale

    this.add
      .text(width / 2, height / 2 - 40, 'Super Mario Web Game', {
        fontSize: '36px',
        fontFamily: 'Arial Black, Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 30, 'Press ENTER to start', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffe000',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.input.keyboard.on('keydown-ENTER', () => {
      // Will navigate to game start in a future story
    })
  }
}

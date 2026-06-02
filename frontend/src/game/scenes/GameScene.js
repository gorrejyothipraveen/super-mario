import Phaser from 'phaser'
import { loadProgress, clearProgress } from '../services/saveService.js'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  init(data) {
    this.won = data?.won ?? false
    this.finalScore = data?.score ?? 0
  }

  async create() {
    const { width, height } = this.scale

    if (this.won) {
      this._showWinScreen(width, height)
      return
    }

    this.add
      .text(width / 2, height / 2 - 60, 'Super Mario Web Game', {
        fontSize: '36px',
        fontFamily: 'Arial Black, Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 10, 'Press ENTER to start new game', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffe000',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.input.keyboard.on('keydown-ENTER', () => {
      clearProgress()
      this.scene.start('PlayScene', { levelIndex: 0, score: 0, unlockedLevels: [0] })
    })

    const save = await loadProgress()
    if (save && save.levelIndex > 0) {
      const continueText = this.add
        .text(width / 2, height / 2 + 55, `Press C to continue  (Level ${save.levelIndex + 1}, Score ${save.score})`, {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#aaffaa',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)

      this.tweens.add({
        targets: continueText,
        alpha: 0.3,
        duration: 700,
        yoyo: true,
        repeat: -1,
      })

      this.input.keyboard.on('keydown-C', () => {
        this.scene.start('PlayScene', {
          levelIndex: save.levelIndex,
          score: save.score,
          unlockedLevels: save.unlockedLevels,
        })
      })
    }
  }

  _showWinScreen(width, height) {
    this.add
      .text(width / 2, height / 2 - 40, '🎉 You Win! 🎉', {
        fontSize: '42px',
        fontFamily: 'Arial Black, Arial',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 20, `Final Score: ${this.finalScore}`, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 65, 'Press ENTER to play again', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffe000',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.input.keyboard.once('keydown-ENTER', () => {
      clearProgress()
      this.scene.start('PlayScene', { levelIndex: 0, score: 0, unlockedLevels: [0] })
    })
  }
}

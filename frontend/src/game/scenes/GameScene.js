import Phaser from 'phaser'
import { loadProgress, clearProgress } from '../services/saveService.js'
import { generateEndlessLevel } from '../levels/endless.js'

function submitScore(username, score) {
  fetch('/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, score }),
  }).catch(() => {})
}

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  init(data) {
    this.won        = data?.won      ?? false
    this.gameOver   = data?.gameOver ?? false
    this.finalScore = data?.score    ?? 0
    this.waves      = data?.waves    ?? 0
  }

  async create() {
    const { width, height } = this.scale

    if (this.won)      { this._showWinScreen(width, height);    return }
    if (this.gameOver) { this._showGameOverScreen(width, height); return }

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

    this.add
      .text(width / 2, height / 2 + 50, 'Press E for Endless Mode', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ff88ff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.input.keyboard.on('keydown-ENTER', () => {
      clearProgress()
      this.scene.start('PlayScene', { levelIndex: 0, score: 0, unlockedLevels: [0] })
    })

    this.input.keyboard.on('keydown-E', () => {
      this.scene.start('PlayScene', {
        endless:     true,
        wave:        1,
        wavesCompleted: 0,
        levelConfig: generateEndlessLevel(1),
        score:       0,
      })
    })

    const save = await loadProgress()
    if (save && save.levelIndex > 0) {
      const continueText = this.add
        .text(width / 2, height / 2 + 90, `Press C to continue  (Level ${save.levelIndex + 1}, Score ${save.score})`, {
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
    const username = localStorage.getItem('smario_username') || 'guest'
    submitScore(username, this.finalScore)

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

    this.add
      .text(width / 2, height / 2 + 105, 'Press L to view Leaderboard', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#aaffaa',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)

    this.input.keyboard.once('keydown-ENTER', () => {
      clearProgress()
      this.scene.start('PlayScene', { levelIndex: 0, score: 0, unlockedLevels: [0] })
    })

    this.input.keyboard.once('keydown-L', () => {
      window.location.href = '/leaderboard'
    })
  }

  _showGameOverScreen(width, height) {
    this.add.text(width / 2, height / 2 - 55, 'GAME OVER', {
      fontSize: '48px', fontFamily: 'Arial Black, Arial',
      color: '#ff3333', stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5)

    if (this.waves > 0) {
      this.add.text(width / 2, height / 2 + 5, `Waves Survived: ${this.waves}`, {
        fontSize: '20px', fontFamily: 'Arial',
        color: '#ff88ff', stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5)
    }

    this.add.text(width / 2, height / 2 + (this.waves > 0 ? 38 : 20), `Score: ${this.finalScore}`, {
      fontSize: '22px', fontFamily: 'Arial',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5)

    const retryY = height / 2 + (this.waves > 0 ? 80 : 65)
    this.add.text(width / 2, retryY, 'Press ENTER to try again', {
      fontSize: '16px', fontFamily: 'Arial',
      color: '#ffe000', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5)

    if (this.waves > 0) {
      this.add.text(width / 2, retryY + 36, 'Press E for Endless again', {
        fontSize: '14px', fontFamily: 'Arial',
        color: '#ff88ff', stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5)

      this.input.keyboard.once('keydown-E', () => {
        this.scene.start('PlayScene', {
          endless: true, wave: 1, wavesCompleted: 0,
          levelConfig: generateEndlessLevel(1), score: 0,
        })
      })
    }

    this.input.keyboard.once('keydown-ENTER', () => {
      clearProgress()
      this.scene.start('PlayScene', { levelIndex: 0, score: 0, unlockedLevels: [0] })
    })
  }
}

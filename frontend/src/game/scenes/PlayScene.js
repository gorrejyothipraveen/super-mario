import Phaser from 'phaser'
import { LEVELS } from '../levels/index.js'
import { saveProgress } from '../services/saveService.js'
import { playJump, playCoin, playEnemyStomp, playPlayerHit, playGameOver } from '../services/soundManager.js'
import { touch } from '../services/touchInput.js'

const PLAYER_SPEED     = 200
const JUMP_VELOCITY    = -450
const KNOCKBACK_X      = 280
const KNOCKBACK_Y      = -220
const INVINCIBILITY_MS = 1500
const ENEMY_SPEED      = 80
const STOMP_BOUNCE     = -280
const MAX_HP           = 3
const LEVEL_TIME       = 300
const COIN_POINTS      = 10

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlayScene' })
  }

  init(data) {
    this.levelIndex     = data.levelIndex ?? 0
    this.score          = data.score ?? 0
    this.unlockedLevels = data.unlockedLevels ?? [0]
    this.hp             = data.hp ?? MAX_HP
    this.coinsCollected = data.coinsCollected ?? 0
    this.timeLeft       = LEVEL_TIME
    this.wasOnGround    = true
    this.jumpAnimating  = false
    this.invincible     = false
    this.transitioning  = false
  }

  create() {
    const { width, height } = this.scale
    this.cfg = LEVELS[this.levelIndex]

    this.cameras.main.setBackgroundColor(this.cfg.background)

    this._createBackground(width, height)
    this._createGround(width, height)
    this._createPlatforms(width, height)
    this._createCoins(width, height)
    this._createEnemies(width, height)
    this._createGoal(width, height)
    this._createPlayer(width, height)
    this._setupCollisions()
    this._createControls()
    this._createHUD(width)
    this._startTimer()
  }

  update() {
    if (this.transitioning) return

    const onGround    = this.player.body.blocked.down
    const left        = this.cursors.left.isDown || this.wasd.left.isDown || touch.left
    const right       = this.cursors.right.isDown || this.wasd.right.isDown || touch.right
    const jumpPressed =
      this.cursors.up.isDown ||
      this.cursors.space.isDown ||
      this.wasd.up.isDown ||
      touch.jump

    if (left)       this.player.body.setVelocityX(-PLAYER_SPEED)
    else if (right) this.player.body.setVelocityX(PLAYER_SPEED)
    else            this.player.body.setVelocityX(0)

    if (jumpPressed && onGround) {
      this.player.body.setVelocityY(JUMP_VELOCITY)
      this._playJumpStretch()
      playJump()
    }

    if (!this.wasOnGround && onGround) this._playLandSquash()
    this.wasOnGround = onGround

    // Keep blue overalls aligned with the physics body
    if (this.playerOveralls) {
      this.playerOveralls.setPosition(this.player.x, this.player.y + 12)
      this.playerOveralls.setScale(this.player.scaleX, this.player.scaleY)
    }

    this._updateEnemies()
  }

  // --- background ---

  _createBackground(width, height) {
    if (this.cfg.background === '#1a1a2e') return // cave level — skip daytime decorations

    const g = this.add.graphics().setDepth(0)

    // Clouds
    const cloudDefs = [
      { x: width * 0.07, y: height * 0.12 },
      { x: width * 0.31, y: height * 0.08 },
      { x: width * 0.57, y: height * 0.15 },
      { x: width * 0.81, y: height * 0.09 },
    ]
    cloudDefs.forEach(({ x, y }) => {
      g.fillStyle(0xffffff, 1)
      g.fillCircle(x,      y,      18)
      g.fillCircle(x + 22, y - 10, 24)
      g.fillCircle(x + 46, y,      18)
      g.fillRect(x - 18,   y,      82, 18)
    })

    // Rolling green hills in background
    g.fillStyle(0x56a024, 1)
    ;[
      { x: width * 0.14, r: 55 },
      { x: width * 0.45, r: 70 },
      { x: width * 0.75, r: 52 },
    ].forEach(({ x, r }) => g.fillCircle(x, height - 32, r))
  }

  // --- timer ---

  _startTimer() {
    if (this.timerEvent) this.timerEvent.remove()
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: LEVEL_TIME - 1,
      callback: () => {
        if (this.transitioning) return
        this.timeLeft = Math.max(0, this.timeLeft - 1)
        this._updateTimerText()
        if (this.timeLeft === 0) { playGameOver(); this._gameOver('Time up!') }
      },
    })
  }

  // --- level transition / game over ---

  _reachGoal() {
    if (this.transitioning) return
    this.transitioning = true
    if (this.timerEvent) this.timerEvent.remove()

    this.player.body.setVelocity(0, 0)

    const next      = this.cfg.nextLevel
    const nextIndex = next !== null && LEVELS[next] !== undefined ? next : null
    const unlocked  = nextIndex !== null && !this.unlockedLevels.includes(nextIndex)
      ? [...this.unlockedLevels, nextIndex]
      : this.unlockedLevels

    saveProgress(nextIndex ?? this.levelIndex, this.score, unlocked)

    this.cameras.main.fadeOut(600, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (nextIndex !== null) {
        this.scene.restart({
          levelIndex: nextIndex,
          score: this.score,
          unlockedLevels: unlocked,
          hp: this.hp,
          coinsCollected: this.coinsCollected,
        })
      } else {
        this.scene.start('GameScene', { won: true, score: this.score })
      }
    })
  }

  _gameOver(reason) {
    if (this.transitioning) return
    this.transitioning = true
    if (this.timerEvent) this.timerEvent.remove()
    this.player.body.setVelocity(0, 0)

    this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      reason || 'Game Over',
      { fontSize: '36px', fontFamily: 'Arial Black', color: '#ff0000', stroke: '#000', strokeThickness: 5 }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(20)

    this.cameras.main.fadeOut(1500, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { gameOver: true, score: this.score })
    })
  }

  // --- enemy AI ---

  _updateEnemies() {
    this.enemyList.forEach(rect => {
      if (!rect.active || !rect.alive) return
      const vx = rect.body.velocity.x
      if      (rect.x <= rect.patrolLeft  || rect.body.blocked.left)  rect.body.setVelocityX(ENEMY_SPEED)
      else if (rect.x >= rect.patrolRight || rect.body.blocked.right) rect.body.setVelocityX(-ENEMY_SPEED)
      else if (vx === 0)                                               rect.body.setVelocityX(ENEMY_SPEED)
    })
  }

  _killEnemy(rect) {
    if (!rect.alive) return
    rect.alive = false
    rect.body.setVelocity(0, 0)
    rect.body.setAllowGravity(false)
    this.tweens.add({
      targets: rect, scaleY: 0.1, y: rect.y + 14, duration: 150, ease: 'Power2',
      onComplete: () => rect.destroy(),
    })
  }

  // --- collision / overlap callbacks ---

  _onHitEnemy(player, enemyRect) {
    if (!enemyRect.alive) return

    if (player.y < enemyRect.y && player.body.velocity.y >= 0) {
      this._killEnemy(enemyRect)
      player.body.setVelocityY(STOMP_BOUNCE)
      playEnemyStomp()
      return
    }

    if (this.invincible) return
    this.invincible = true

    this.hp = Math.max(0, this.hp - 1)
    this._updateHealthBar()
    playPlayerHit()

    if (this.hp === 0) {
      playGameOver()
      this._gameOver('Game Over!')
      return
    }

    const knockDir = player.x <= enemyRect.x ? -1 : 1
    player.body.setVelocity(knockDir * KNOCKBACK_X, KNOCKBACK_Y)

    const flashTargets = this.playerOveralls ? [player, this.playerOveralls] : player
    this.tweens.add({
      targets: flashTargets, alpha: 0.2, duration: 80, yoyo: true,
      repeat: Math.floor(INVINCIBILITY_MS / 160),
      onComplete: () => {
        player.alpha = 1
        if (this.playerOveralls) this.playerOveralls.alpha = 1
        this.invincible = false
      },
    })
  }

  _onCollectCoin(player, coin) {
    if (coin.collected) return
    coin.collected = true
    coin.body.enable = false

    this.coinsCollected += 1
    this.score += COIN_POINTS
    this._updateScoreText()
    playCoin()

    this.tweens.add({
      targets: coin, y: coin.y - 32, alpha: 0, scaleX: 1.5, scaleY: 1.5,
      duration: 300, ease: 'Power2',
      onComplete: () => coin.destroy(),
    })
  }

  // --- animation helpers ---

  _playJumpStretch() {
    if (this.jumpAnimating) return
    this.jumpAnimating = true
    const targets = this.playerOveralls ? [this.player, this.playerOveralls] : this.player
    this.tweens.add({
      targets, scaleX: 0.75, scaleY: 1.3, duration: 80, yoyo: true,
      onComplete: () => { this.jumpAnimating = false },
    })
  }

  _playLandSquash() {
    const targets = this.playerOveralls ? [this.player, this.playerOveralls] : this.player
    this.tweens.add({
      targets, scaleX: 1.3, scaleY: 0.7, duration: 60, yoyo: true, ease: 'Sine.easeOut',
    })
  }

  // --- HUD ---

  _createHUD(width) {
    const BAR_H = 38

    // Background bar
    const bg = this.add.graphics()
    bg.fillStyle(0x000000, 0.65)
    bg.fillRect(0, 0, width, BAR_H)
    bg.setScrollFactor(0).setDepth(10)

    // HP hearts (left side)
    this.heartRects = []
    for (let i = 0; i < MAX_HP; i++) {
      const r = this.add.rectangle(14 + i * 22, 19, 16, 16, 0xe52521)
      r.setScrollFactor(0).setDepth(11)
      this.heartRects.push(r)
    }

    // Coin icon (gold circle) + counter
    this.add.circle(88, 19, 7, 0xffd700).setScrollFactor(0).setDepth(11)
    this.coinsText = this.add
      .text(100, 10, `${this.coinsCollected}`, {
        fontSize: '16px', fontFamily: 'Arial Black', color: '#ffd700',
        stroke: '#000', strokeThickness: 3,
      })
      .setScrollFactor(0).setDepth(11)

    // Level name (centre)
    this.add
      .text(width / 2, 10, this.cfg.name, {
        fontSize: '15px', fontFamily: 'Arial', color: '#ffffff',
        stroke: '#000', strokeThickness: 2,
      })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(11)

    // Score (right side, gold)
    this.scoreText = this.add
      .text(width - 10, 10, `${this.score}`, {
        fontSize: '16px', fontFamily: 'Arial Black', color: '#ffd700',
        stroke: '#000', strokeThickness: 3,
      })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(11)

    // Timer (left of score)
    this.timerText = this.add
      .text(width - 80, 10, `${this.timeLeft}`, {
        fontSize: '14px', fontFamily: 'Arial Black', color: '#ffffff',
        stroke: '#000', strokeThickness: 3,
      })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(11)

    // Small "TIME" caption before timer
    this.add
      .text(width - 85, 10, 'TIME', {
        fontSize: '10px', fontFamily: 'Arial', color: '#aaaaaa',
      })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(11)
  }

  _updateHealthBar() {
    this.heartRects.forEach((r, i) => {
      r.setFillStyle(i < this.hp ? 0xe52521 : 0x444444)
    })
  }

  _updateScoreText() {
    this.scoreText.setText(`${this.score}`)
    this.coinsText.setText(`${this.coinsCollected}`)
  }

  _updateTimerText() {
    const urgent = this.timeLeft <= 60
    this.timerText.setText(`${this.timeLeft}`)
    this.timerText.setColor(urgent ? '#ff4444' : '#ffffff')
  }

  // --- scene builders ---

  _createGround(width, height) {
    // Physics body (brown dirt)
    const groundRect = this.add.rectangle(width / 2, height - 16, width, 32, 0x8b4513)
    this.physics.add.existing(groundRect, true)
    this.platforms = this.physics.add.staticGroup()
    this.platforms.add(groundRect)
    // Green grass strip on top of dirt
    this.add.rectangle(width / 2, height - 30, width, 8, 0x56a024).setDepth(2)
  }

  _createPlatforms(width, height) {
    const mortar = this.add.graphics().setDepth(3)
    mortar.lineStyle(2, 0x6b2a00, 1)

    this.cfg.platforms.forEach(({ xFrac, fromBottom, w }) => {
      const x = width * xFrac
      const y = height - fromBottom
      // Brick orange-brown body
      const rect = this.add.rectangle(x, y, w, 20, 0xc84b0c)
      this.physics.add.existing(rect, true)
      this.platforms.add(rect)
      // Mortar: vertical divisions and horizontal mid-line
      for (let bx = x - w / 2 + 32; bx < x + w / 2; bx += 32) {
        mortar.lineBetween(bx, y - 10, bx, y + 10)
      }
      mortar.lineBetween(x - w / 2, y, x + w / 2, y)
    })

    if (this.cfg.questionBlocks) this._createQuestionBlocks(width, height)
  }

  _createQuestionBlocks(width, height) {
    const qBorder = this.add.graphics().setDepth(3)
    qBorder.lineStyle(2, 0x8b4513, 1)

    this.cfg.questionBlocks.forEach(({ xFrac, fromBottom }) => {
      const x = width * xFrac
      const y = height - fromBottom
      const block = this.add.rectangle(x, y, 32, 32, 0xf0a000)
      this.physics.add.existing(block, true)
      this.platforms.add(block)
      qBorder.strokeRect(x - 16, y - 16, 32, 32)
      this.add.text(x, y, '?', {
        fontSize: '18px', fontFamily: 'Arial Black', color: '#5a2800',
      }).setOrigin(0.5).setDepth(4)
    })
  }

  _createCoins(width, height) {
    this.coins = this.physics.add.staticGroup()
    this.cfg.coins.forEach(({ xFrac, fromBottom }) => {
      const coin = this.add.circle(width * xFrac, height - fromBottom, 8, 0xffd700)
      this.physics.add.existing(coin, true)
      coin.collected = false
      this.coins.add(coin)
      // Coin spin: scaleX oscillates to simulate 3-D rotation
      this.tweens.add({
        targets: coin, scaleX: 0.1, duration: 380,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })
    })
  }

  _createEnemies(width, height) {
    this.enemyList = []
    this.enemies   = this.physics.add.group()
    this.cfg.enemies.forEach(({ xFrac, fromBottom, leftFrac, rightFrac }) => {
      // Blue Goomba-style enemy
      const rect = this.add.rectangle(width * xFrac, height - fromBottom, 32, 32, 0x4488cc)
      this.physics.add.existing(rect, false)
      rect.body.setCollideWorldBounds(true)
      rect.body.setVelocityX(ENEMY_SPEED)
      rect.patrolLeft  = width * leftFrac
      rect.patrolRight = width * rightFrac
      rect.alive = true
      this.enemies.add(rect)
      this.enemyList.push(rect)
    })
  }

  _createGoal(width, height) {
    const { xFrac, fromBottom } = this.cfg.goal
    const x = width * xFrac
    // White flag pole
    const pole = this.add.rectangle(x, height - fromBottom / 2, 8, fromBottom * 1.1, 0xffffff)
    this.physics.add.existing(pole, true)
    this.goal = this.physics.add.staticGroup()
    this.goal.add(pole)
    // Red flag at the top of the pole
    this.add.rectangle(x + 18, height - fromBottom + 14, 28, 20, 0xe52521).setDepth(2)
  }

  _createPlayer(width, height) {
    const x = width * this.cfg.spawn.xFrac
    const y = height - 80
    // Red physics body (Mario's cap/shirt colour)
    const playerRect = this.add.rectangle(x, y, 32, 48, 0xe52521)
    this.physics.add.existing(playerRect, false)
    this.player = playerRect
    this.player.body.setCollideWorldBounds(true)
    // Blue overalls layer — visual only, tracked in update()
    this.playerOveralls = this.add
      .rectangle(x, y + 12, 32, 22, 0x3355cc)
      .setDepth(this.player.depth + 1)
  }

  _setupCollisions() {
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.enemies, this.platforms)
    this.physics.add.collider(this.player, this.enemies, this._onHitEnemy, null, this)
    this.physics.add.overlap(this.player, this.coins, this._onCollectCoin, null, this)
    this.physics.add.overlap(this.player, this.goal,  this._reachGoal,    null, this)
  }

  _createControls() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd    = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up:   Phaser.Input.Keyboard.KeyCodes.W,
    })
  }
}

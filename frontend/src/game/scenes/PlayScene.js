import Phaser from 'phaser'
import { LEVELS } from '../levels/index.js'
import { generateEndlessLevel } from '../levels/endless.js'
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
const LEVEL_TIME         = 400
const COIN_POINTS        = 200
const STOMP_POINTS       = 100
const WAVE_BONUS_PER_WAVE = 500

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlayScene' })
  }

  init(data) {
    this.levelIndex     = data.levelIndex ?? 0
    this.levelConfig    = data.levelConfig ?? null   // explicit config overrides levelIndex
    this.score          = data.score ?? 0
    this.unlockedLevels = data.unlockedLevels ?? [0]
    this.hp             = data.hp ?? MAX_HP
    this.coinsCollected = data.coinsCollected ?? 0
    this.wasOnGround    = true
    this.jumpAnimating  = false
    this.invincible     = false
    this.transitioning  = false
    this.playerDir      = 1
    // Endless mode
    this.endless        = data.endless ?? false
    this.wave           = data.wave ?? 1
    this.wavesCompleted = data.wavesCompleted ?? 0
  }

  create() {
    const { width, height } = this.scale
    this.cfg = this.levelConfig ?? LEVELS[this.levelIndex]
    this.timeLeft           = this.cfg.timeLimit ?? LEVEL_TIME
    this.effectiveEnemySpeed = ENEMY_SPEED * (this.cfg.enemySpeedMult ?? 1)

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

    // Sync Mario graphic — position + horizontal flip for direction
    if (this.playerGfx) {
      this.playerGfx.setPosition(this.player.x, this.player.y)
      const vx = this.player.body.velocity.x
      if      (vx > 0) this.playerDir = 1
      else if (vx < 0) this.playerDir = -1
      this.playerGfx.scaleX = this.playerDir
    }

    this._updateEnemies()
  }

  // --- background (sky clouds + hills, overworld only) ---

  _createBackground(width, height) {
    if (this.cfg.background === '#1a1a2e') return

    const g = this.add.graphics().setDepth(0)

    // White fluffy clouds
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

    // Rolling green hills
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
    const duration = this.cfg.timeLimit ?? LEVEL_TIME
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: duration - 1,
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

    if (this.endless) {
      const waveBonus = WAVE_BONUS_PER_WAVE * this.wave
      this.score += waveBonus
      const nextWave = this.wave + 1

      this.add.text(
        this.scale.width / 2, this.scale.height / 2,
        `Wave ${this.wave} Complete!\n+${waveBonus} pts`,
        { fontSize: '32px', fontFamily: 'Arial Black', color: '#ffd700',
          stroke: '#000', strokeThickness: 5, align: 'center' }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(20)

      this.cameras.main.fadeOut(1200, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.restart({
          endless: true,
          wave: nextWave,
          wavesCompleted: this.wavesCompleted + 1,
          levelConfig: generateEndlessLevel(nextWave),
          score: this.score,
          hp: this.hp,
          coinsCollected: this.coinsCollected,
        })
      })
      return
    }

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
      this.scene.start('GameScene', {
        gameOver: true,
        score:    this.score,
        waves:    this.endless ? this.wavesCompleted : 0,
      })
    })
  }

  // --- enemy AI ---

  _updateEnemies() {
    this.enemyList.forEach(rect => {
      if (!rect.active || !rect.alive) return
      const vx = rect.body.velocity.x
      if      (rect.x <= rect.patrolLeft  || rect.body.blocked.left)  rect.body.setVelocityX(this.effectiveEnemySpeed)
      else if (rect.x >= rect.patrolRight || rect.body.blocked.right) rect.body.setVelocityX(-this.effectiveEnemySpeed)
      else if (vx === 0)                                               rect.body.setVelocityX(this.effectiveEnemySpeed)

      // Sync dragon graphic
      if (rect.gfx) {
        rect.gfx.setPosition(rect.x, rect.y)
        rect.gfx.scaleX = rect.body.velocity.x >= 0 ? 1 : -1
      }
    })
  }

  _killEnemy(rect) {
    if (!rect.alive) return
    rect.alive = false
    rect.body.setVelocity(0, 0)
    rect.body.setAllowGravity(false)
    const visual = rect.gfx || rect
    this.tweens.add({
      targets: visual, scaleY: 0.1, duration: 150, ease: 'Power2',
      onComplete: () => {
        if (rect.gfx) rect.gfx.destroy()
        rect.destroy()
      },
    })
  }

  // --- collision / overlap callbacks ---

  _onHitEnemy(player, enemyRect) {
    if (!enemyRect.alive) return

    if (player.y < enemyRect.y && player.body.velocity.y >= 0) {
      this._killEnemy(enemyRect)
      player.body.setVelocityY(STOMP_BOUNCE)
      playEnemyStomp()
      this.score += STOMP_POINTS
      this._updateScoreText()
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

    const flashTarget = this.playerGfx || player
    this.tweens.add({
      targets: flashTarget, alpha: 0.2, duration: 80, yoyo: true,
      repeat: Math.floor(INVINCIBILITY_MS / 160),
      onComplete: () => { flashTarget.alpha = 1; this.invincible = false },
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
    const target = this.playerGfx || this.player
    this.tweens.add({
      targets: target, scaleY: 1.35, duration: 80, yoyo: true,
      onComplete: () => { this.jumpAnimating = false },
    })
  }

  _playLandSquash() {
    const target = this.playerGfx || this.player
    this.tweens.add({
      targets: target, scaleY: 0.65, duration: 60, yoyo: true, ease: 'Sine.easeOut',
    })
  }

  // --- pixel-art character drawers (called once at create time) ---

  _drawMario(g) {
    // Hat crown (red, narrow)
    g.fillStyle(0xe52521, 1)
    g.fillRect(-8, -30, 18, 8)
    // Hat brim (red, wider)
    g.fillRect(-12, -22, 26, 6)
    // Left sideburn / hair (dark brown)
    g.fillStyle(0x724800, 1)
    g.fillRect(-14, -20, 5, 5)
    // Face (skin tone)
    g.fillStyle(0xfac68c, 1)
    g.fillRect(-10, -16, 22, 12)
    // Eye whites
    g.fillStyle(0xffffff, 1)
    g.fillRect(-8, -14, 5, 4)
    g.fillRect(3, -14, 5, 4)
    // Eye pupils
    g.fillStyle(0x111111, 1)
    g.fillRect(-7, -14, 3, 4)
    g.fillRect(4, -14, 3, 4)
    // Mustache (dark brown, wide)
    g.fillStyle(0x724800, 1)
    g.fillRect(-10, -6, 22, 5)
    // Shirt (red)
    g.fillStyle(0xe52521, 1)
    g.fillRect(-12, -2, 26, 12)
    // Overalls (blue)
    g.fillStyle(0x3355cc, 1)
    g.fillRect(-14, 8, 30, 16)
    // Overall suspenders over shirt
    g.fillStyle(0x4466ee, 1)
    g.fillRect(-8, -2, 6, 10)
    g.fillRect(2, -2, 6, 10)
    // Left shoe (dark brown)
    g.fillStyle(0x724800, 1)
    g.fillRect(-14, 22, 12, 8)
    // Right shoe
    g.fillRect(2, 22, 12, 8)
  }

  _drawDragon(g) {
    // Tail (dark blue, left side — mirrors when facing left)
    g.fillStyle(0x3366aa, 1)
    g.fillCircle(-14, 2, 6)
    g.fillCircle(-19, 0, 4)
    // Main body (blue)
    g.fillStyle(0x4488cc, 1)
    g.fillCircle(0, 4, 13)
    // Neck stub
    g.fillRect(-3, -12, 8, 10)
    // Head (blue, right side)
    g.fillCircle(6, -17, 11)
    // Underbelly — body (lighter blue)
    g.fillStyle(0x88aadd, 1)
    g.fillCircle(0, 6, 8)
    // Underbelly — head (lighter blue cheek)
    g.fillCircle(7, -15, 7)
    // Eye white
    g.fillStyle(0xffffff, 1)
    g.fillCircle(10, -19, 4)
    // Eye pupil
    g.fillStyle(0x111144, 1)
    g.fillCircle(11, -20, 2)
    // Horn — stepped pixel-art pyramid
    g.fillStyle(0xf0a000, 1)
    g.fillRect(3, -26, 6, 4)
    g.fillRect(5, -30, 2, 4)
    // Left foot (dark blue)
    g.fillStyle(0x3366aa, 1)
    g.fillRect(-10, 12, 9, 7)
    // Right foot
    g.fillRect(2, 12, 9, 7)
    // Claws (tan)
    g.fillStyle(0xccaa88, 1)
    g.fillRect(-12, 17, 3, 4)
    g.fillRect(-8,  17, 3, 4)
    g.fillRect(2,   17, 3, 4)
    g.fillRect(6,   17, 3, 4)
  }

  // --- HUD ---

  _createHUD(width) {
    const BAR_H = 40

    // Background bar
    const bg = this.add.graphics()
    bg.fillStyle(0x000000, 0.70)
    bg.fillRect(0, 0, width, BAR_H)
    bg.setScrollFactor(0).setDepth(10)

    // HP hearts (red squares, left side)
    this.heartRects = []
    for (let i = 0; i < MAX_HP; i++) {
      const r = this.add.rectangle(14 + i * 22, 20, 16, 16, 0xe52521)
      r.setScrollFactor(0).setDepth(11)
      this.heartRects.push(r)
    }

    // Gold coin icon + count
    this.add.circle(88, 20, 7, 0xffd700).setScrollFactor(0).setDepth(11)
    this.coinsText = this.add
      .text(100, 11, `${this.coinsCollected}`, {
        fontSize: '16px', fontFamily: 'Arial Black', color: '#ffd700',
        stroke: '#000', strokeThickness: 3,
      })
      .setScrollFactor(0).setDepth(11)

    // Level name / wave indicator (centre)
    const hudLabel = this.endless ? `WAVE  ${this.wave}` : this.cfg.name
    const hudColor = this.endless ? '#ffd700' : '#ffffff'
    this.add
      .text(width / 2, 11, hudLabel, {
        fontSize: '15px', fontFamily: 'Arial Black', color: hudColor,
        stroke: '#000', strokeThickness: 2,
      })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(11)

    // TIME label (small, above number)
    this.add
      .text(width - 10, 4, 'TIME', {
        fontSize: '9px', fontFamily: 'Arial', color: '#aaaaaa',
      })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(11)

    // Timer value (right side, prominent)
    this.timerText = this.add
      .text(width - 10, 14, `${this.timeLeft}`, {
        fontSize: '16px', fontFamily: 'Arial Black', color: '#ffffff',
        stroke: '#000', strokeThickness: 3,
      })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(11)

    // Score (left of timer)
    this.scoreText = this.add
      .text(width - 90, 11, `${this.score}`, {
        fontSize: '16px', fontFamily: 'Arial Black', color: '#ffd700',
        stroke: '#000', strokeThickness: 3,
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
    const urgent = this.timeLeft <= 100
    this.timerText.setText(`${this.timeLeft}`)
    this.timerText.setColor(urgent ? '#ff4444' : '#ffffff')
  }

  // --- scene builders ---

  _createGround(width, height) {
    const groundRect = this.add.rectangle(width / 2, height - 16, width, 32, 0x8b4513)
    this.physics.add.existing(groundRect, true)
    this.platforms = this.physics.add.staticGroup()
    this.platforms.add(groundRect)
    // Green grass strip on top
    this.add.rectangle(width / 2, height - 30, width, 8, 0x56a024).setDepth(2)
  }

  _createPlatforms(width, height) {
    const mortar = this.add.graphics().setDepth(3)
    mortar.lineStyle(2, 0x6b2a00, 1)

    this.cfg.platforms.forEach(({ xFrac, fromBottom, w }) => {
      const x = width * xFrac
      const y = height - fromBottom
      const rect = this.add.rectangle(x, y, w, 20, 0xc84b0c)
      this.physics.add.existing(rect, true)
      this.platforms.add(rect)
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
      // Invisible physics body
      const rect = this.add.rectangle(width * xFrac, height - fromBottom, 32, 32, 0x000000)
      rect.setAlpha(0)
      this.physics.add.existing(rect, false)
      rect.body.setCollideWorldBounds(true)
      rect.body.setVelocityX(ENEMY_SPEED)
      rect.patrolLeft  = width * leftFrac
      rect.patrolRight = width * rightFrac
      rect.alive = true
      // Dragon pixel-art overlay (drawn once, repositioned each frame)
      rect.gfx = this.add.graphics().setDepth(5)
      this._drawDragon(rect.gfx)
      rect.gfx.setPosition(rect.x, rect.y)
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
    // Red flag at top
    this.add.rectangle(x + 18, height - fromBottom + 14, 28, 20, 0xe52521).setDepth(2)
  }

  _createPlayer(width, height) {
    const x = width * this.cfg.spawn.xFrac
    const y = height - 80
    // Invisible physics body
    const playerRect = this.add.rectangle(x, y, 28, 44, 0x000000)
    playerRect.setAlpha(0)
    this.physics.add.existing(playerRect, false)
    this.player = playerRect
    this.player.body.setCollideWorldBounds(true)
    // Mario pixel-art overlay (drawn once, repositioned each frame)
    this.playerGfx = this.add.graphics().setDepth(5)
    this._drawMario(this.playerGfx)
    this.playerGfx.setPosition(x, y)
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

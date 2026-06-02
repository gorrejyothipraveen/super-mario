import Phaser from 'phaser'

const PLAYER_SPEED = 200
const JUMP_VELOCITY = -450
const KNOCKBACK_X = 280
const KNOCKBACK_Y = -220
const INVINCIBILITY_REPEAT = 5

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlayScene' })
    this.wasOnGround = true
    this.jumpAnimating = false
    this.invincible = false
  }

  create() {
    const { width, height } = this.scale

    this._createGround(width, height)
    this._createPlatforms(width, height)
    this._createEnemies(width, height)
    this._createPlayer(height)
    this._setupCollisions()
    this._createControls()
    this._createHUD()
  }

  update() {
    const onGround = this.player.body.blocked.down
    const left = this.cursors.left.isDown || this.wasd.left.isDown
    const right = this.cursors.right.isDown || this.wasd.right.isDown
    const jumpPressed =
      this.cursors.up.isDown ||
      this.cursors.space.isDown ||
      this.wasd.up.isDown

    if (left) {
      this.player.body.setVelocityX(-PLAYER_SPEED)
    } else if (right) {
      this.player.body.setVelocityX(PLAYER_SPEED)
    } else {
      this.player.body.setVelocityX(0)
    }

    if (jumpPressed && onGround) {
      this.player.body.setVelocityY(JUMP_VELOCITY)
      this._playJumpStretch()
    }

    if (!this.wasOnGround && onGround) {
      this._playLandSquash()
    }

    this.wasOnGround = onGround
  }

  // --- collision callbacks ---

  _onHitEnemy(player, enemy) {
    if (this.invincible) return
    this.invincible = true

    const knockDir = player.x <= enemy.x ? -1 : 1
    player.body.setVelocity(knockDir * KNOCKBACK_X, KNOCKBACK_Y)

    this.tweens.add({
      targets: player,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: INVINCIBILITY_REPEAT,
      onComplete: () => {
        player.alpha = 1
        this.invincible = false
      },
    })
  }

  // --- animation helpers ---

  _playJumpStretch() {
    if (this.jumpAnimating) return
    this.jumpAnimating = true
    this.tweens.add({
      targets: this.player,
      scaleX: 0.75,
      scaleY: 1.3,
      duration: 80,
      yoyo: true,
      onComplete: () => { this.jumpAnimating = false },
    })
  }

  _playLandSquash() {
    this.tweens.add({
      targets: this.player,
      scaleX: 1.3,
      scaleY: 0.7,
      duration: 60,
      yoyo: true,
      ease: 'Sine.easeOut',
    })
  }

  // --- scene builders ---

  _createGround(width, height) {
    const groundRect = this.add.rectangle(width / 2, height - 16, width, 32, 0x8b4513)
    this.physics.add.existing(groundRect, true)
    this.platforms = this.physics.add.staticGroup()
    this.platforms.add(groundRect)
  }

  _createPlatforms(width, height) {
    const defs = [
      { x: width * 0.25, y: height - 130, w: 140 },
      { x: width * 0.55, y: height - 210, w: 160 },
      { x: width * 0.8,  y: height - 150, w: 120 },
    ]
    defs.forEach(({ x, y, w }) => {
      const rect = this.add.rectangle(x, y, w, 20, 0x228b22)
      this.physics.add.existing(rect, true)
      this.platforms.add(rect)
    })
  }

  _createEnemies(width, height) {
    this.enemies = this.physics.add.staticGroup()
    const defs = [
      { x: width * 0.42, y: height - 48 },
      { x: width * 0.68, y: height - 48 },
      { x: width * 0.55, y: height - 236 },
    ]
    defs.forEach(({ x, y }) => {
      const rect = this.add.rectangle(x, y, 32, 32, 0x9b59b6)
      this.physics.add.existing(rect, true)
      this.enemies.add(rect)
    })
  }

  _createPlayer(height) {
    const playerRect = this.add.rectangle(100, height - 80, 32, 48, 0xe52521)
    this.physics.add.existing(playerRect, false)
    this.player = playerRect
    this.player.body.setCollideWorldBounds(true)
  }

  _setupCollisions() {
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.player, this.enemies, this._onHitEnemy, null, this)
  }

  _createControls() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
    })
  }

  _createHUD() {
    this.add
      .text(10, 10, 'Arrow keys / WASD to move  |  UP / W / SPACE to jump', {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
  }
}

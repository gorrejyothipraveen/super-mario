import Phaser from 'phaser'

const PLAYER_SPEED = 200
const JUMP_VELOCITY = -450

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlayScene' })
  }

  create() {
    const { width, height } = this.scale

    this._createTextures(width)
    this._createGround(width, height)
    this._createPlayer(height)
    this._createControls()
    this._createHUD()
  }

  update() {
    const onGround = this.player.body.blocked.down
    const left = this.cursors.left.isDown || this.wasd.left.isDown
    const right = this.cursors.right.isDown || this.wasd.right.isDown
    const jump =
      (this.cursors.up.isDown ||
        this.cursors.space.isDown ||
        this.wasd.up.isDown) &&
      onGround

    if (left) {
      this.player.setVelocityX(-PLAYER_SPEED)
      this.player.setFlipX(true)
    } else if (right) {
      this.player.setVelocityX(PLAYER_SPEED)
      this.player.setFlipX(false)
    } else {
      this.player.setVelocityX(0)
    }

    if (jump) {
      this.player.setVelocityY(JUMP_VELOCITY)
    }
  }

  _createTextures(width) {
    const playerGfx = this.make.graphics({ add: false })
    playerGfx.fillStyle(0xe52521)
    playerGfx.fillRect(0, 0, 32, 48)
    playerGfx.generateTexture('player', 32, 48)
    playerGfx.destroy()

    const groundGfx = this.make.graphics({ add: false })
    groundGfx.fillStyle(0x8b4513)
    groundGfx.fillRect(0, 0, width, 32)
    groundGfx.generateTexture('ground', width, 32)
    groundGfx.destroy()
  }

  _createGround(width, height) {
    this.ground = this.physics.add.staticGroup()
    this.ground.create(width / 2, height - 16, 'ground')
  }

  _createPlayer(height) {
    this.player = this.physics.add.sprite(100, height - 80, 'player')
    this.player.setCollideWorldBounds(true)
    this.physics.add.collider(this.player, this.ground)
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

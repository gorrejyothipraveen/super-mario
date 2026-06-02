import Phaser from 'phaser'

const PLAYER_SPEED = 200
const JUMP_VELOCITY = -450

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlayScene' })
  }

  create() {
    const { width, height } = this.scale

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
      this.player.body.setVelocityX(-PLAYER_SPEED)
    } else if (right) {
      this.player.body.setVelocityX(PLAYER_SPEED)
    } else {
      this.player.body.setVelocityX(0)
    }

    if (jump) {
      this.player.body.setVelocityY(JUMP_VELOCITY)
    }
  }

  _createGround(width, height) {
    const groundRect = this.add.rectangle(width / 2, height - 16, width, 32, 0x8b4513)
    this.physics.add.existing(groundRect, true)
    this.ground = groundRect
  }

  _createPlayer(height) {
    const playerRect = this.add.rectangle(100, height - 80, 32, 48, 0xe52521)
    this.physics.add.existing(playerRect, false)
    this.player = playerRect
    this.player.body.setCollideWorldBounds(true)
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

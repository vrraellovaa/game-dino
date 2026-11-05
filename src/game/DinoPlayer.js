import { GAME_CONFIG, GROUND_Y } from './config.js';
import { audioManager } from '../systems/audioManager.js';

export class DinoPlayer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'dino_sheet', 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics body configuration
    this.setCollideWorldBounds(true);
    this.body.setGravityY(GAME_CONFIG.gravity);

    // Default standing hitbox
    this.standWidth = 32;
    this.standHeight = 42;
    this.standOffsetX = 8;
    this.standOffsetY = 6;

    // Ducking hitbox (low profile)
    this.duckWidth = 42;
    this.duckHeight = 22;
    this.duckOffsetX = 4;
    this.duckOffsetY = 24;

    this.body.setSize(this.standWidth, this.standHeight);
    this.body.setOffset(this.standOffsetX, this.standOffsetY);

    // State tracking
    this.isDucking = false;
    this.isAlive = true;
    this.hasLanded = true;

    // Create animations if they don't exist yet
    this.initAnimations(scene);

    // Create dust particle emitter
    this.createDustParticles(scene);

    this.play('dino_idle');
  }

  initAnimations(scene) {
    if (!scene.anims.exists('dino_idle')) {
      scene.anims.create({
        key: 'dino_idle',
        frames: scene.anims.generateFrameNumbers('dino_sheet', { frames: [0, 1] }),
        frameRate: 3,
        repeat: -1,
      });

      scene.anims.create({
        key: 'dino_run',
        frames: scene.anims.generateFrameNumbers('dino_sheet', { frames: [2, 3, 4, 5] }),
        frameRate: 10,
        repeat: -1,
      });

      scene.anims.create({
        key: 'dino_jump',
        frames: [{ key: 'dino_sheet', frame: 6 }],
        frameRate: 1,
      });

      scene.anims.create({
        key: 'dino_fall',
        frames: [{ key: 'dino_sheet', frame: 7 }],
        frameRate: 1,
      });

      scene.anims.create({
        key: 'dino_duck',
        frames: scene.anims.generateFrameNumbers('dino_sheet', { frames: [8, 9] }),
        frameRate: 8,
        repeat: -1,
      });

      scene.anims.create({
        key: 'dino_hit',
        frames: scene.anims.generateFrameNumbers('dino_sheet', { frames: [10, 11] }),
        frameRate: 4,
        repeat: 0,
      });
    }
  }

  createDustParticles(scene) {
    this.dustEmitter = scene.add.particles(0, 0, 'particle_dust', {
      speed: { min: 20, max: 60 },
      angle: { min: 140, max: 180 },
      scale: { start: 1, end: 0 },
      lifespan: 300,
      gravityY: 100,
      frequency: 180,
      emitting: false,
    });
  }

  startRunning() {
    this.play('dino_run');
    this.dustEmitter.start();
  }

  jump() {
    if (!this.isAlive) return;

    const onGround = this.body.blocked.down || this.body.touching.down;
    if (onGround) {
      if (this.isDucking) {
        this.standUp();
      }
      this.body.setVelocityY(GAME_CONFIG.jumpVelocity);
      this.play('dino_jump');
      this.dustEmitter.stop();
      this.hasLanded = false;
      audioManager.playJump();
    }
  }

  duck() {
    if (!this.isAlive || this.isDucking) return;

    this.isDucking = true;
    this.body.setSize(this.duckWidth, this.duckHeight);
    this.body.setOffset(this.duckOffsetX, this.duckOffsetY);

    const onGround = this.body.blocked.down || this.body.touching.down;
    if (onGround) {
      this.play('dino_duck');
      audioManager.playDuck();
    }
  }

  standUp() {
    if (!this.isAlive || !this.isDucking) return;

    this.isDucking = false;
    this.body.setSize(this.standWidth, this.standHeight);
    this.body.setOffset(this.standOffsetX, this.standOffsetY);

    const onGround = this.body.blocked.down || this.body.touching.down;
    if (onGround) {
      this.play('dino_run');
    }
  }

  hit() {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.dustEmitter.stop();
    this.body.setVelocity(0, -180); // Small backward bounce
    this.play('dino_hit');
    audioManager.playHit();
  }

  updatePlayer() {
    if (!this.isAlive) return;

    const onGround = this.body.blocked.down || this.body.touching.down;

    // Follow player with dust emitter
    if (this.dustEmitter) {
      this.dustEmitter.setPosition(this.x - 12, this.y + 18);
    }

    if (onGround) {
      if (!this.hasLanded) {
        // Just landed
        this.hasLanded = true;
        this.dustEmitter.explode(4, this.x - 8, this.y + 20);
        this.dustEmitter.start();
      }

      if (this.isDucking) {
        if (this.anims.currentAnim?.key !== 'dino_duck') {
          this.play('dino_duck');
        }
      } else {
        if (this.anims.currentAnim?.key !== 'dino_run') {
          this.play('dino_run');
        }
      }
    } else {
      // In the air
      this.dustEmitter.stop();
      if (this.body.velocity.y < 0) {
        if (this.anims.currentAnim?.key !== 'dino_jump') {
          this.play('dino_jump');
        }
      } else {
        if (this.anims.currentAnim?.key !== 'dino_fall') {
          this.play('dino_fall');
        }
      }
    }
  }
}


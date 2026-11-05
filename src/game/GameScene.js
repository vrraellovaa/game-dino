import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, GAME_CONFIG } from './config.js';
import { DinoPlayer } from './DinoPlayer.js';
import { ObstacleSpawner } from '../systems/obstacleSpawner.js';
import { ScoreSystem } from '../systems/scoreSystem.js';
import { audioManager } from '../systems/audioManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.gameState = 'COUNTDOWN'; // 'COUNTDOWN', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.currentSpeed = GAME_CONFIG.initialSpeed;

    // Systems
    this.scoreSystem = new ScoreSystem();
    this.hud = this.game.registry.get('hud');
    this.controller = this.game.registry.get('gestureController');

    // Create Parallax Backgrounds (TileSprites)
    this.bgSky = this.add.tileSprite(0, 0, GAME_WIDTH, 300, 'bg_sky').setOrigin(0, 0);
    this.bgMountains = this.add.tileSprite(0, 110, GAME_WIDTH, 240, 'bg_mountains').setOrigin(0, 0);
    this.bgJungle = this.add.tileSprite(0, 180, GAME_WIDTH, 220, 'bg_jungle').setOrigin(0, 0);
    this.bgGround = this.add.tileSprite(0, GROUND_Y, GAME_WIDTH, 80, 'bg_ground').setOrigin(0, 0);

    // Static Ground Physics Platform
    this.groundPlatform = this.physics.add.staticGroup();
    const groundBar = this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 20, GAME_WIDTH, 40, 0x000000, 0);
    this.groundPlatform.add(groundBar);

    // Create Dino Player
    this.player = new DinoPlayer(this, 120, GROUND_Y - 24);
    this.physics.add.collider(this.player, this.groundPlatform);

    // Obstacle Spawner
    this.obstacleSpawner = new ObstacleSpawner(this);

    // Collision Detection between player and obstacles
    this.physics.add.overlap(
      this.player,
      this.obstacleSpawner.getGroup(),
      this.handlePlayerCollision,
      null,
      this
    );

    // Show HUD
    if (this.hud) {
      this.hud.setVisible(true);
      this.hud.onPauseClick = () => this.togglePause();
    }

    // Connect Gesture Controller
    this.setupGestureListeners();

    // Scene shutdown cleanup
    this.events.once('shutdown', () => {
      this.cleanup();
    });

    // Start Countdown
    this.startCountdown();
  }

  cleanup() {
    if (this.controller) {
      if (this.jumpListener) this.controller.off('jump', this.jumpListener);
      if (this.duckStartListener) this.controller.off('duckStart', this.duckStartListener);
      if (this.duckEndListener) this.controller.off('duckEnd', this.duckEndListener);
      if (this.openPalmListener) this.controller.off('openPalm', this.openPalmListener);
    }
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) pauseModal.style.display = 'none';
  }

  setupGestureListeners() {
    if (!this.controller) return;

    this.jumpListener = () => {
      if (this.gameState === 'PLAYING') {
        this.player.jump();
      }
    };

    this.duckStartListener = () => {
      if (this.gameState === 'PLAYING') {
        this.player.duck();
      }
    };

    this.duckEndListener = () => {
      if (this.gameState === 'PLAYING') {
        this.player.standUp();
      }
    };

    this.openPalmListener = () => {
      if (this.gameState === 'PAUSED') {
        this.resumeGame();
      }
    };

    this.controller.on('jump', this.jumpListener);
    this.controller.on('duckStart', this.duckStartListener);
    this.controller.on('duckEnd', this.duckEndListener);
    this.controller.on('openPalm', this.openPalmListener);

    // Pause key listener
    this.input.keyboard.on('keydown-P', () => this.togglePause());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
  }

  startCountdown() {
    this.gameState = 'COUNTDOWN';
    const countdownSteps = ['3', '2', '1', 'GO!'];
    let stepIndex = 0;

    const banner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '48px',
      color: '#fef08a',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center',
    }).setOrigin(0.5);

    const showStep = () => {
      if (stepIndex >= countdownSteps.length) {
        banner.destroy();
        this.gameState = 'PLAYING';
        this.player.startRunning();
        audioManager.playStart();
        return;
      }

      const text = countdownSteps[stepIndex];
      const isFinal = text === 'GO!';
      banner.setText(text);
      banner.setColor(isFinal ? '#4ade80' : '#fef08a');
      banner.setScale(0.5);
      banner.setAlpha(1);

      audioManager.playCountdownTick(isFinal);

      this.tweens.add({
        targets: banner,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: isFinal ? 400 : 300,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: banner,
            alpha: 0,
            duration: 200,
            delay: isFinal ? 300 : 100,
            onComplete: () => {
              stepIndex++;
              showStep();
            },
          });
        },
      });
    };

    showStep();
  }

  update(time, delta) {
    if (this.gameState !== 'PLAYING') return;

    const dt = delta / 1000;

    // Gradually ramp up speed (Easy mode curve)
    if (this.currentSpeed < GAME_CONFIG.maxSpeed) {
      this.currentSpeed += GAME_CONFIG.acceleration * dt;
    }

    // Parallax background scrolling
    this.bgSky.tilePositionX += this.currentSpeed * 0.05 * dt;
    this.bgMountains.tilePositionX += this.currentSpeed * 0.20 * dt;
    this.bgJungle.tilePositionX += this.currentSpeed * 0.50 * dt;
    this.bgGround.tilePositionX += this.currentSpeed * 1.00 * dt;

    // Update Player & Obstacles
    this.player.updatePlayer();
    this.obstacleSpawner.update(dt, this.currentSpeed);

    // Update Score & Milestones
    const { isMilestone, milestoneValue } = this.scoreSystem.update(dt, this.currentSpeed);
    if (isMilestone && this.hud) {
      this.hud.showMilestone(milestoneValue);
    }

    // Update HUD
    if (this.hud) {
      this.hud.update(
        this.scoreSystem.getDisplayScore(),
        this.scoreSystem.getHighScore(),
        this.currentSpeed
      );
    }
  }

  handlePlayerCollision() {
    if (this.gameState !== 'PLAYING') return;

    this.gameState = 'GAMEOVER';
    this.physics.pause();
    this.player.hit();

    // Finalize score
    const results = this.scoreSystem.finalizeScore();

    // Camera shake effect
    this.cameras.main.shake(300, 0.02);

    this.time.delayedCall(800, () => {
      audioManager.playGameOver();
      this.scene.start('GameOverScene', results);
    });
  }

  togglePause() {
    if (this.gameState === 'PLAYING') {
      this.pauseGame();
    } else if (this.gameState === 'PAUSED') {
      this.resumeGame();
    }
  }

  pauseGame() {
    this.gameState = 'PAUSED';
    this.physics.pause();
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) {
      pauseModal.style.display = 'flex';
    }
  }

  resumeGame() {
    this.gameState = 'PLAYING';
    this.physics.resume();
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) {
      pauseModal.style.display = 'none';
    }
  }

  restartGame() {
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) pauseModal.style.display = 'none';
    this.scene.restart();
  }

  returnToMenu() {
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) pauseModal.style.display = 'none';
    if (this.hud) this.hud.setVisible(false);
    audioManager.stopBgm();
    this.scene.start('MenuScene');
  }
}

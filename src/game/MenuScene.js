import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { PixelArtGenerator } from '../utils/pixelArtGenerator.js';
import { audioManager } from '../systems/audioManager.js';
import { storageManager } from '../systems/storageManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Ensure all pixel textures exist
    PixelArtGenerator.generateTextures(this);

    // Background layers (static scenic jungle view)
    this.add.image(GAME_WIDTH / 2, 150, 'bg_sky').setDisplaySize(GAME_WIDTH, 300);
    this.add.image(GAME_WIDTH / 2, 230, 'bg_mountains').setDisplaySize(GAME_WIDTH, 240);
    this.add.image(GAME_WIDTH / 2, 280, 'bg_jungle').setDisplaySize(GAME_WIDTH, 220);
    this.add.image(GAME_WIDTH / 2, 410, 'bg_ground').setDisplaySize(GAME_WIDTH, 80);

    // Title Graphic (Stylized retro text)
    const title = this.add.text(GAME_WIDTH / 2, 85, 'JURASSIC ADVENTURE', {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: '26px',
      color: '#fef08a',
      stroke: '#451a03',
      strokeThickness: 8,
      align: 'center',
    }).setOrigin(0.5);

    // Pulsing title glow
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add.text(GAME_WIDTH / 2, 122, 'HAND-CONTROLLED DINO RUN', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#4ade80',
      stroke: '#0f2415',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // Animated Dino in center
    const menuDino = this.add.sprite(GAME_WIDTH / 2, 225, 'dino_sheet', 0).setScale(2.2);
    if (!this.anims.exists('dino_run_menu')) {
      this.anims.create({
        key: 'dino_run_menu',
        frames: this.anims.generateFrameNumbers('dino_sheet', { frames: [2, 3, 4, 5] }),
        frameRate: 6,
        repeat: -1,
      });
    }
    menuDino.play('dino_run_menu');

    // High score badge
    const highScore = storageManager.getHighScore();
    this.add.text(GAME_WIDTH / 2, 280, `★ HIGH SCORE: ${highScore} ★`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#facc15',
      stroke: '#1e293b',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Instruction banner
    const playHint = this.add.text(GAME_WIDTH / 2, 320, 'SHOW [OPEN PALM] OR CLICK PLAY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: playHint,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // Create interactive menu buttons
    this.createMenuButtons();

    // Listen to Open Palm gesture to immediately start game
    const controller = this.game.registry.get('gestureController');
    this.controller = controller;
    if (controller) {
      this.palmListener = () => {
        if (this.scene.isActive('MenuScene')) {
          this.startGame();
        }
      };
      controller.on('openPalm', this.palmListener);
    }

    this.events.once('shutdown', () => {
      if (this.controller && this.palmListener) {
        this.controller.off('openPalm', this.palmListener);
      }
    });

    // Keyboard start shortcut
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
  }

  createMenuButtons() {
    const btnY = 360;
    const spacing = 180;
    const startX = GAME_WIDTH / 2 - spacing;

    this.createRetroButton(startX, btnY, '▶ PLAY GAME', () => this.startGame(), '#16a34a');
    this.createRetroButton(startX + spacing, btnY, '⚙ CALIBRATE', () => this.openCalibration(), '#0284c7');
    this.createRetroButton(startX + spacing * 2, btnY, '❓ HOW TO PLAY', () => this.openHowToPlay(), '#d97706');
  }

  createRetroButton(x, y, label, callback, bgColor = '#16a34a') {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 160, 36, Phaser.Display.Color.HexStringToColor(bgColor).color)
      .setStrokeStyle(3, 0x000000);

    const txt = this.add.text(0, 0, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff',
    }).setOrigin(0.5);

    container.add([bg, txt]);
    container.setSize(160, 36);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setStrokeStyle(3, 0xffffff);
      container.setScale(1.05);
    });

    container.on('pointerout', () => {
      bg.setStrokeStyle(3, 0x000000);
      container.setScale(1.0);
    });

    container.on('pointerdown', () => {
      audioManager.playButton();
      callback();
    });

    return container;
  }

  startGame() {
    audioManager.playButton();
    audioManager.startBgm();
    this.scene.start('GameScene');
  }

  openCalibration() {
    audioManager.playButton();
    this.scene.start('CalibrationScene');
  }

  openHowToPlay() {
    audioManager.playButton();
    const modal = document.getElementById('how-to-play-modal');
    if (modal) modal.style.display = 'flex';
  }
}

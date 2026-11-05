import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { audioManager } from '../systems/audioManager.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.finalScore || 0;
    this.highScore = data.highScore || 0;
    this.isNewRecord = data.isNewRecord || false;
  }

  create() {
    // Semi-transparent dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);

    // Game Over Panel Box
    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 460, 290, 0x1e293b)
      .setStrokeStyle(4, 0xef4444);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 105, 'GAME OVER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#ef4444',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Pulsing title
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Score display
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 45, `SCORE: ${this.finalScore}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#f8fafc',
    }).setOrigin(0.5);

    // High score display
    const hiText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 15, `BEST: ${this.highScore}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#fbbf24',
    }).setOrigin(0.5);

    // If new record, show glowing banner
    if (this.isNewRecord) {
      const recordBadge = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15, '★ NEW HIGH SCORE! ★', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: '#22c55e',
      }).setOrigin(0.5);

      this.tweens.add({
        targets: recordBadge,
        alpha: 0.2,
        duration: 350,
        yoyo: true,
        repeat: -1,
      });
    }

    // Hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'SHOW [OPEN PALM] OR CLICK TO RETRY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#94a3b8',
    }).setOrigin(0.5);

    // Buttons: TRY AGAIN & MAIN MENU
    this.createButton(GAME_WIDTH / 2 - 110, GAME_HEIGHT / 2 + 95, '↻ TRY AGAIN', () => this.restartGame(), 0x16a34a);
    this.createButton(GAME_WIDTH / 2 + 110, GAME_HEIGHT / 2 + 95, '⌂ MAIN MENU', () => this.returnToMenu(), 0x475569);

    // Open Palm or Space/Enter to retry
    const controller = this.game.registry.get('gestureController');
    this.controller = controller;
    if (controller) {
      this.palmListener = () => {
        if (this.scene.isActive('GameOverScene')) {
          this.restartGame();
        }
      };
      controller.on('openPalm', this.palmListener);
    }

    this.events.once('shutdown', () => {
      if (this.controller && this.palmListener) {
        this.controller.off('openPalm', this.palmListener);
      }
    });

    this.input.keyboard.on('keydown-SPACE', () => this.restartGame());
    this.input.keyboard.on('keydown-ENTER', () => this.restartGame());
    this.input.keyboard.on('keydown-ESC', () => this.returnToMenu());
  }

  createButton(x, y, label, callback, color) {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 180, 40, color).setStrokeStyle(2, 0xffffff);
    const txt = this.add.text(0, 0, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff',
    }).setOrigin(0.5);

    container.add([bg, txt]);
    container.setSize(180, 40);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      audioManager.playButton();
      callback();
    });

    container.on('pointerover', () => {
      container.setScale(1.05);
    });

    container.on('pointerout', () => {
      container.setScale(1.0);
    });

    return container;
  }

  restartGame() {
    audioManager.playButton();
    audioManager.startBgm();
    this.scene.start('GameScene');
  }

  returnToMenu() {
    audioManager.playButton();
    audioManager.stopBgm();
    const hud = this.game.registry.get('hud');
    if (hud) hud.setVisible(false);
    this.scene.start('MenuScene');
  }
}

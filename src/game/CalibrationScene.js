import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { audioManager } from '../systems/audioManager.js';

export class CalibrationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CalibrationScene' });
  }

  create() {
    // Backdrop
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0f172a);

    // Title
    this.add.text(GAME_WIDTH / 2, 40, 'GESTURE CALIBRATION MODE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#38bdf8',
      stroke: '#0369a1',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 70, 'Test your hand gestures in front of the camera', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#94a3b8',
    }).setOrigin(0.5);

    // Status Indicator Light
    this.statusLight = this.add.circle(GAME_WIDTH / 2 - 120, 105, 8, 0xef4444);
    this.statusText = this.add.text(GAME_WIDTH / 2 - 100, 105, 'HAND: NOT DETECTED', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ef4444',
    }).setOrigin(0, 0.5);

    // 3 Test Cards (Open Palm, Index Up, Closed Fist)
    this.cards = {
      OPEN_PALM: this.createGestureCard(160, 210, '✋ OPEN PALM', 'START / RESUME', 'Show open hand with fingers spread'),
      INDEX_UP: this.createGestureCard(400, 210, '☝️ INDEX UP', 'JUMP ACTION', 'Raise only your index finger up'),
      CLOSED_FIST: this.createGestureCard(640, 210, '✊ CLOSED FIST', 'DUCK ACTION', 'Make a tight closed fist'),
    };

    // State tracking for calibrated gestures
    this.tested = {
      OPEN_PALM: false,
      INDEX_UP: false,
      CLOSED_FIST: false,
    };

    // Confirm button
    this.confirmBtn = this.add.container(GAME_WIDTH / 2, 350);
    const btnBg = this.add.rectangle(0, 0, 280, 44, 0x16a34a).setStrokeStyle(3, 0xffffff);
    const btnTxt = this.add.text(0, 0, '✔ CONFIRM & RETURN', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.confirmBtn.add([btnBg, btnTxt]);
    this.confirmBtn.setSize(280, 44);
    this.confirmBtn.setInteractive({ useHandCursor: true });

    this.confirmBtn.on('pointerdown', () => this.returnToMenu());
    this.confirmBtn.on('pointerover', () => btnBg.setFillStyle(0x22c55e));
    this.confirmBtn.on('pointerout', () => btnBg.setFillStyle(0x16a34a));

    // Keyboard return fallback
    this.input.keyboard.on('keydown-ESC', () => this.returnToMenu());
    this.input.keyboard.on('keydown-ENTER', () => this.returnToMenu());

    // Hook to gesture controller
    const controller = this.game.registry.get('gestureController');
    this.controller = controller;
    if (controller) {
      this.gestureListener = ({ gesture }) => {
        this.handleGesture(gesture);
      };
      this.presenceListener = (hasHand) => {
        this.updateHandPresence(hasHand);
      };
      controller.on('gestureChange', this.gestureListener);
      controller.on('handPresenceChange', this.presenceListener);
    }

    this.events.once('shutdown', () => {
      if (this.controller) {
        if (this.gestureListener) this.controller.off('gestureChange', this.gestureListener);
        if (this.presenceListener) this.controller.off('handPresenceChange', this.presenceListener);
      }
    });
  }

  createGestureCard(x, y, title, action, desc) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 210, 160, 0x1e293b)
      .setStrokeStyle(3, 0x475569);

    const titleTxt = this.add.text(0, -50, title, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#f8fafc',
    }).setOrigin(0.5);

    const actionBadge = this.add.text(0, -25, action, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#38bdf8',
    }).setOrigin(0.5);

    const descTxt = this.add.text(0, 10, desc, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#94a3b8',
      align: 'center',
      wordWrap: { width: 190 },
    }).setOrigin(0.5);

    const checkmark = this.add.text(0, 50, '[ NOT TESTED ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#64748b',
    }).setOrigin(0.5);

    container.add([bg, titleTxt, actionBadge, descTxt, checkmark]);
    return { container, bg, checkmark };
  }

  updateHandPresence(hasHand) {
    if (hasHand) {
      this.statusLight.setFillStyle(0x22c55e);
      this.statusText.setText('HAND: DETECTED & TRACKING').setColor('#22c55e');
    } else {
      this.statusLight.setFillStyle(0xef4444);
      this.statusText.setText('HAND: NOT DETECTED').setColor('#ef4444');
    }
  }

  handleGesture(gesture) {
    // Reset borders
    Object.values(this.cards).forEach((card) => {
      card.bg.setStrokeStyle(3, 0x475569);
    });

    if (gesture === 'NO_HAND') {
      this.updateHandPresence(false);
      return;
    }

    if (gesture === 'NEUTRAL') {
      this.statusLight.setFillStyle(0xeab308);
      this.statusText.setText('HAND: DETECTING GESTURE...').setColor('#eab308');
      return;
    }

    this.statusLight.setFillStyle(0x22c55e);
    this.statusText.setText(`ACTIVE: ${gesture}`).setColor('#22c55e');

    if (this.cards[gesture]) {
      const card = this.cards[gesture];
      card.bg.setStrokeStyle(4, 0x22c55e);

      if (!this.tested[gesture]) {
        this.tested[gesture] = true;
        card.checkmark.setText('✔ VERIFIED').setColor('#22c55e');
        audioManager.playCountdownTick(true);

        // Flash card
        this.tweens.add({
          targets: card.container,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 150,
          yoyo: true,
        });
      }
    }
  }

  returnToMenu() {
    audioManager.playButton();
    this.scene.start('MenuScene');
  }
}

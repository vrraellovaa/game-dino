import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './game/config.js';
import { MenuScene } from './game/MenuScene.js';
import { GameScene } from './game/GameScene.js';
import { CalibrationScene } from './game/CalibrationScene.js';
import { GameOverScene } from './game/GameOverScene.js';

import { HandDetector } from './handtracking/handDetector.js';
import { GestureController } from './handtracking/gestureController.js';
import { CameraPreview } from './ui/cameraPreview.js';
import { HUD } from './ui/hud.js';
import { SettingsModal } from './ui/settings.js';
import { audioManager } from './systems/audioManager.js';

window.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Hand Tracking Architecture
  const handDetector = new HandDetector();
  const gestureController = new GestureController(handDetector, 'normal');
  const cameraPreview = new CameraPreview(handDetector, gestureController);
  const hud = new HUD();
  const settingsModal = new SettingsModal(cameraPreview, gestureController);

  // 2. Setup Bottom Gesture Indicator Bar
  const gestureHintName = document.getElementById('current-gesture-name');
  const gestureHintBar = document.getElementById('hud-gesture-hint');

  gestureController.on('gestureChange', ({ gesture, confidence }) => {
    if (!gestureHintName) return;

    let display = 'NO HAND DETECTED';
    let isAction = false;

    switch (gesture) {
      case 'OPEN_PALM':
        display = '✋ OPEN PALM (START / CONFIRM)';
        isAction = true;
        break;
      case 'INDEX_UP':
        display = '☝️ INDEX FINGER UP (JUMP!)';
        isAction = true;
        break;
      case 'CLOSED_FIST':
        display = '✊ CLOSED FIST (DUCK / CROUCH)';
        isAction = true;
        break;
      case 'NEUTRAL':
        display = '👋 DETECTING HAND...';
        break;
      default:
        display = 'NO HAND DETECTED';
        break;
    }

    gestureHintName.textContent = display;
    if (gestureHintBar) {
      if (isAction) {
        gestureHintBar.classList.add('pulse');
      } else {
        gestureHintBar.classList.remove('pulse');
      }
    }
  });

  // 3. Phaser 3 Game Configuration
  const phaserConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    roundPixels: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 }, // Individual sprites configure gravity
        debug: false,
      },
    },
    scene: [MenuScene, GameScene, CalibrationScene, GameOverScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  const game = new Phaser.Game(phaserConfig);

  // Expose managers to Phaser Registry for scenes
  game.registry.set('gestureController', gestureController);
  game.registry.set('handDetector', handDetector);
  game.registry.set('cameraPreview', cameraPreview);
  game.registry.set('hud', hud);

  // 4. Header & Modal UI Bindings
  const btnOpenSettings = document.getElementById('btn-open-settings');
  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      settingsModal.open();
    });
  }

  const btnOpenHelp = document.getElementById('btn-open-help');
  const helpModal = document.getElementById('how-to-play-modal');
  const btnCloseHelp = document.getElementById('btn-close-help');

  if (btnOpenHelp && helpModal) {
    btnOpenHelp.addEventListener('click', () => {
      audioManager.playButton();
      helpModal.style.display = 'flex';
    });
  }

  if (btnCloseHelp && helpModal) {
    btnCloseHelp.addEventListener('click', () => {
      audioManager.playButton();
      helpModal.style.display = 'none';
    });
  }

  // 5. Pause Modal Button Bindings
  const btnPauseResume = document.getElementById('btn-pause-resume');
  const btnPauseRestart = document.getElementById('btn-pause-restart');
  const btnPauseMenu = document.getElementById('btn-pause-menu');

  if (btnPauseResume) {
    btnPauseResume.addEventListener('click', () => {
      audioManager.playButton();
      const activeScene = game.scene.getScene('GameScene');
      if (activeScene && activeScene.resumeGame) {
        activeScene.resumeGame();
      }
    });
  }

  if (btnPauseRestart) {
    btnPauseRestart.addEventListener('click', () => {
      audioManager.playButton();
      const activeScene = game.scene.getScene('GameScene');
      if (activeScene && activeScene.restartGame) {
        activeScene.restartGame();
      }
    });
  }

  if (btnPauseMenu) {
    btnPauseMenu.addEventListener('click', () => {
      audioManager.playButton();
      const activeScene = game.scene.getScene('GameScene');
      if (activeScene && activeScene.returnToMenu) {
        activeScene.returnToMenu();
      }
    });
  }

  // 6. User gesture to ensure AudioContext on first interaction
  const resumeAudioOnInteraction = () => {
    audioManager.ensureContext();
    window.removeEventListener('pointerdown', resumeAudioOnInteraction);
    window.removeEventListener('keydown', resumeAudioOnInteraction);
  };
  window.addEventListener('pointerdown', resumeAudioOnInteraction);
  window.addEventListener('keydown', resumeAudioOnInteraction);
});


import { storageManager } from '../systems/storageManager.js';
import { audioManager } from '../systems/audioManager.js';

export class SettingsModal {
  constructor(cameraPreview, gestureController) {
    this.cameraPreview = cameraPreview;
    this.gestureController = gestureController;

    this.modalEl = document.getElementById('settings-modal');
    this.closeBtn = document.getElementById('settings-close-btn');

    this.musicToggle = document.getElementById('setting-music-toggle');
    this.musicVolSlider = document.getElementById('setting-music-vol');
    this.sfxToggle = document.getElementById('setting-sfx-toggle');
    this.sfxVolSlider = document.getElementById('setting-sfx-vol');
    this.camToggle = document.getElementById('setting-cam-toggle');
    this.sensitivitySelect = document.getElementById('setting-sensitivity');
    this.scanlinesToggle = document.getElementById('setting-scanlines-toggle');

    this.init();
  }

  init() {
    const settings = storageManager.getSettings();

    // Apply stored settings
    if (this.musicToggle) this.musicToggle.checked = settings.musicEnabled;
    if (this.musicVolSlider) this.musicVolSlider.value = Math.round(settings.musicVolume * 100);
    if (this.sfxToggle) this.sfxToggle.checked = settings.sfxEnabled;
    if (this.sfxVolSlider) this.sfxVolSlider.value = Math.round(settings.sfxVolume * 100);
    if (this.camToggle) this.camToggle.checked = settings.cameraPreviewEnabled;
    if (this.sensitivitySelect) this.sensitivitySelect.value = settings.gestureSensitivity || 'normal';
    if (this.scanlinesToggle) this.scanlinesToggle.checked = settings.scanlinesEnabled;

    // Sync audio engine
    audioManager.setMusicEnabled(settings.musicEnabled);
    audioManager.setMusicVolume(settings.musicVolume);
    audioManager.setSfxEnabled(settings.sfxEnabled);
    audioManager.setSfxVolume(settings.sfxVolume);

    if (this.gestureController) {
      this.gestureController.setSensitivity(settings.gestureSensitivity || 'normal');
    }

    if (this.cameraPreview) {
      this.cameraPreview.setVisible(settings.cameraPreviewEnabled);
    }

    this.applyScanlines(settings.scanlinesEnabled);

    // Event listeners
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.saveAndClose();
      });
    }

    if (this.musicToggle) {
      this.musicToggle.addEventListener('change', (e) => {
        audioManager.setMusicEnabled(e.target.checked);
      });
    }

    if (this.musicVolSlider) {
      this.musicVolSlider.addEventListener('input', (e) => {
        audioManager.setMusicVolume(e.target.value / 100);
      });
    }

    if (this.sfxToggle) {
      this.sfxToggle.addEventListener('change', (e) => {
        audioManager.setSfxEnabled(e.target.checked);
      });
    }

    if (this.sfxVolSlider) {
      this.sfxVolSlider.addEventListener('input', (e) => {
        audioManager.setSfxVolume(e.target.value / 100);
      });
    }

    if (this.camToggle) {
      this.camToggle.addEventListener('change', (e) => {
        if (this.cameraPreview) {
          this.cameraPreview.setVisible(e.target.checked);
        }
      });
    }

    if (this.sensitivitySelect) {
      this.sensitivitySelect.addEventListener('change', (e) => {
        if (this.gestureController) {
          this.gestureController.setSensitivity(e.target.value);
        }
      });
    }

    if (this.scanlinesToggle) {
      this.scanlinesToggle.addEventListener('change', (e) => {
        this.applyScanlines(e.target.checked);
      });
    }
  }

  applyScanlines(enabled) {
    const scanlineEl = document.getElementById('scanline-overlay');
    if (scanlineEl) {
      scanlineEl.style.display = enabled ? 'block' : 'none';
    }
  }

  open() {
    audioManager.playButton();
    if (this.modalEl) {
      this.modalEl.style.display = 'flex';
    }
  }

  saveAndClose() {
    audioManager.playButton();
    const newSettings = {
      musicEnabled: this.musicToggle ? this.musicToggle.checked : true,
      musicVolume: this.musicVolSlider ? this.musicVolSlider.value / 100 : 0.5,
      sfxEnabled: this.sfxToggle ? this.sfxToggle.checked : true,
      sfxVolume: this.sfxVolSlider ? this.sfxVolSlider.value / 100 : 0.8,
      cameraPreviewEnabled: this.camToggle ? this.camToggle.checked : true,
      gestureSensitivity: this.sensitivitySelect ? this.sensitivitySelect.value : 'normal',
      scanlinesEnabled: this.scanlinesToggle ? this.scanlinesToggle.checked : false,
    };

    storageManager.saveSettings(newSettings);

    if (this.modalEl) {
      this.modalEl.style.display = 'none';
    }
  }
}


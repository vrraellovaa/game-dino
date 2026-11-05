/**
 * StorageManager: handles local persistence for High Score and Game Settings.
 */
const HIGH_SCORE_KEY = 'jurassic_adventure_highscore';
const SETTINGS_KEY = 'jurassic_adventure_settings';

const DEFAULT_SETTINGS = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  cameraPreviewEnabled: true,
  gestureSensitivity: 'normal', // 'relaxed', 'normal', 'sensitive'
  scanlinesEnabled: false,
};

class StorageManager {
  getHighScore() {
    try {
      const val = localStorage.getItem(HIGH_SCORE_KEY);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch (e) {
      console.warn('LocalStorage error reading high score:', e);
      return 0;
    }
  }

  saveHighScore(score) {
    try {
      const current = this.getHighScore();
      if (score > current) {
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
        return true; // New record!
      }
      return false;
    } catch (e) {
      console.warn('LocalStorage error saving high score:', e);
      return false;
    }
  }

  getSettings() {
    try {
      const val = localStorage.getItem(SETTINGS_KEY);
      if (val) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(val) };
      }
    } catch (e) {
      console.warn('LocalStorage error reading settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage error saving settings:', e);
    }
  }
}

export const storageManager = new StorageManager();


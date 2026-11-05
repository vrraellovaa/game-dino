/**
 * Game HUD Manager
 * Coordinates in-game retro status displays: Score, High Score, Speed, Gesture HUD.
 */
export class HUD {
  constructor() {
    this.scoreEl = document.getElementById('hud-score');
    this.highScoreEl = document.getElementById('hud-highscore');
    this.speedEl = document.getElementById('hud-speed');
    this.gestureHintEl = document.getElementById('hud-gesture-hint');
    this.milestoneBannerEl = document.getElementById('hud-milestone-banner');
    this.hudContainer = document.getElementById('game-hud');
    this.pauseBtn = document.getElementById('hud-pause-btn');

    this.onPauseClick = null;
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => {
        if (this.onPauseClick) this.onPauseClick();
      });
    }
  }

  setVisible(visible) {
    if (this.hudContainer) {
      this.hudContainer.style.display = visible ? 'flex' : 'none';
    }
  }

  formatScore(val) {
    return String(Math.floor(val)).padStart(5, '0');
  }

  update(score, highScore, speed) {
    if (this.scoreEl) {
      this.scoreEl.textContent = this.formatScore(score);
    }
    if (this.highScoreEl) {
      this.highScoreEl.textContent = `HI ${this.formatScore(highScore)}`;
    }
    if (this.speedEl && speed) {
      this.speedEl.textContent = `${(speed / 280).toFixed(1)}x`;
    }
  }

  setGestureHint(text, active = false) {
    if (this.gestureHintEl) {
      this.gestureHintEl.textContent = text;
      if (active) {
        this.gestureHintEl.classList.add('pulse');
      } else {
        this.gestureHintEl.classList.remove('pulse');
      }
    }
  }

  showMilestone(scoreValue) {
    if (this.milestoneBannerEl) {
      this.milestoneBannerEl.textContent = `★ ${scoreValue} PTS REACHED! ★`;
      this.milestoneBannerEl.classList.add('show');
      setTimeout(() => {
        this.milestoneBannerEl.classList.remove('show');
      }, 1500);
    }
  }
}


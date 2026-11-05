import { storageManager } from './storageManager.js';
import { audioManager } from './audioManager.js';

export class ScoreSystem {
  constructor() {
    this.currentScore = 0;
    this.highScore = storageManager.getHighScore();
    this.isNewRecord = false;
    this.lastMilestone = 0;
    this.milestoneInterval = 100;
  }

  reset() {
    this.currentScore = 0;
    this.highScore = storageManager.getHighScore();
    this.isNewRecord = false;
    this.lastMilestone = 0;
  }

  update(deltaSeconds, gameSpeed) {
    // Score increases with survival time and speed
    const scoreIncrement = (gameSpeed / 100) * deltaSeconds * 10;
    this.currentScore += scoreIncrement;

    const roundedScore = Math.floor(this.currentScore);

    // Check milestones
    if (roundedScore > 0 && roundedScore >= this.lastMilestone + this.milestoneInterval) {
      this.lastMilestone = Math.floor(roundedScore / this.milestoneInterval) * this.milestoneInterval;
      audioManager.playMilestone();
      return { isMilestone: true, milestoneValue: this.lastMilestone };
    }

    if (roundedScore > this.highScore) {
      this.isNewRecord = true;
    }

    return { isMilestone: false };
  }

  finalizeScore() {
    const finalScore = Math.floor(this.currentScore);
    const newHighAchieved = storageManager.saveHighScore(finalScore);
    if (newHighAchieved) {
      this.highScore = finalScore;
      this.isNewRecord = true;
    }
    return {
      finalScore,
      highScore: this.highScore,
      isNewRecord: this.isNewRecord,
    };
  }

  getDisplayScore() {
    return Math.floor(this.currentScore);
  }

  getHighScore() {
    return this.highScore;
  }
}


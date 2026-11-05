/**
 * Web Audio API-based Chiptune Sound and Music Engine
 * Produces authentic 8-bit retro sounds and procedural prehistoric jungle chiptune BGM.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;

    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.5;

    this.isPlayingBgm = false;
    this.bgmTimer = null;
    this.currentStep = 0;
    this.tempo = 140; // BPM

    // Prehistoric Jungle Chiptune Pattern: Bassline + Melody notes (in Hz)
    // Scale: A Minor Pentatonic / Prehistoric driving beat
    this.scale = {
      A2: 110.00, C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00,
      A3: 220.00, C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00,
      A4: 440.00, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99
    };

    // 16-step jungle rhythm pattern (step: [bassNote, leadNote, isSnare])
    this.pattern = [
      ['A2', 'A4', false],
      [null, null, true],
      ['A2', 'C5', false],
      [null, 'D5', false],
      ['D3', null, true],
      [null, 'E5', false],
      ['E3', 'D5', false],
      [null, 'C5', true],
      ['G2', 'G4', false],
      [null, null, true],
      ['G2', 'A4', false],
      [null, 'C5', false],
      ['E3', null, true],
      [null, 'G4', false],
      ['E3', 'E4', false],
      [null, null, true],
    ];
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxEnabled ? this.sfxVolume : 0;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.musicEnabled ? this.musicVolume : 0;
      this.bgmGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound Effects ---

  playJump() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // Classic 8-bit rising jump sweep
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.16);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  playDuck() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Downward swoosh
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playStart() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, t + (i + 1) * 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + i * 0.08);
      osc.stop(t + (i + 1) * 0.08 + 0.02);
    });
  }

  playCountdownTick(isFinal = false) {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isFinal ? 'triangle' : 'sine';
    const freq = isFinal ? 880 : 440;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + (isFinal ? 0.35 : 0.15));

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + (isFinal ? 0.36 : 0.16));
  }

  playMilestone() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.07 + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.19);
    });
  }

  playHit() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Noise buffer for retro crash/crunch
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to give it an impact punch
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.22);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 0.25);
  }

  playGameOver() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Sad 8-bit descending arpeggio
    const notes = [392.00, 369.99, 349.23, 311.13, 261.63];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.12 + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.19);
    });
  }

  playButton() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.05);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // --- Background Music System (Procedural Prehistoric Chiptune) ---

  startBgm() {
    if (this.isPlayingBgm) return;
    this.isPlayingBgm = true;
    this.ensureContext();
    this.currentStep = 0;

    const stepIntervalMs = (60 / this.tempo / 4) * 1000; // 16th notes
    this.bgmTimer = setInterval(() => {
      this.tickBgmStep();
    }, stepIntervalMs);
  }

  stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  tickBgmStep() {
    if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') {
      this.currentStep = (this.currentStep + 1) % this.pattern.length;
      return;
    }

    const t = this.ctx.currentTime;
    const [bassKey, leadKey, hasSnare] = this.pattern[this.currentStep];
    const stepDuration = 60 / this.tempo / 4;

    // Bass note
    if (bassKey && this.scale[bassKey]) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(this.scale[bassKey], t);

      gain.gain.setValueAtTime(0.2 * this.musicVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + stepDuration * 1.8);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + stepDuration * 2);
    }

    // Lead melody note
    if (leadKey && this.scale[leadKey]) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(this.scale[leadKey], t);

      gain.gain.setValueAtTime(0.12 * this.musicVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + stepDuration * 0.9);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + stepDuration);
    }

    // Prehistoric tribal snare/shaker
    if (hasSnare) {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.Q.setValueAtTime(2, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15 * this.musicVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      noise.start(t);
      noise.stop(t + 0.06);
    }

    this.currentStep = (this.currentStep + 1) % this.pattern.length;
  }

  // --- Volume & Toggle Controls ---

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(enabled ? this.musicVolume : 0, this.ctx.currentTime);
    }
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(enabled ? this.sfxVolume : 0, this.ctx.currentTime);
    }
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmGain && this.ctx && this.musicEnabled) {
      this.bgmGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx && this.sfxEnabled) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }
}

export const audioManager = new AudioManager();


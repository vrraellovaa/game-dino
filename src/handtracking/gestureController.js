/**
 * GestureController
 * Implements gesture smoothing, debouncing, state management,
 * jump single-trigger cooldown, duck hold states, and keyboard fallbacks.
 */
import { GestureClassifier } from './gestureClassifier.js';

export class GestureController {
  constructor(handDetector, sensitivity = 'normal') {
    this.detector = handDetector;
    this.classifier = new GestureClassifier(sensitivity);

    // Current states
    this.currentGesture = 'NO_HAND';
    this.currentConfidence = 0;
    this.hasHand = false;
    this.isDucking = false;

    // Smoothing & Debouncing
    this.recentGestures = [];
    this.historySize = 3; // Frames for consensus
    this.lastJumpTime = 0;
    this.jumpCooldownMs = 350; // Prevents jump spamming
    this.jumpTriggeredInCurrentGesture = false;

    // Event listeners
    this.listeners = {
      jump: [],
      duckStart: [],
      duckEnd: [],
      openPalm: [],
      gestureChange: [],
      handPresenceChange: [],
    };

    // Attach to hand detector results
    if (this.detector) {
      this.detector.onResultsCallback = (results, fps) => {
        this.processLandmarks(results);
      };
    }

    // Setup keyboard fallback
    this.setupKeyboardFallback();
  }

  setSensitivity(mode) {
    this.classifier.setSensitivity(mode);
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(data));
    }
  }

  processLandmarks(results) {
    const hasHandNow = Boolean(results.landmarks && results.landmarks.length > 0);

    if (hasHandNow !== this.hasHand) {
      this.hasHand = hasHandNow;
      this.emit('handPresenceChange', this.hasHand);
      if (!this.hasHand) {
        if (this.isDucking) {
          this.isDucking = false;
          this.emit('duckEnd');
        }
        this.currentGesture = 'NO_HAND';
        this.emit('gestureChange', { gesture: 'NO_HAND', confidence: 0 });
        this.recentGestures = [];
        return;
      }
    }

    if (!hasHandNow) return;

    // Classify current frame
    const { gesture, confidence } = this.classifier.classify(results.landmarks[0]);

    // Push to history buffer
    this.recentGestures.push(gesture);
    if (this.recentGestures.length > this.historySize) {
      this.recentGestures.shift();
    }

    // Determine consensus gesture
    const consensus = this.getConsensusGesture();

    if (consensus !== this.currentGesture) {
      const prevGesture = this.currentGesture;
      this.currentGesture = consensus;
      this.currentConfidence = confidence;

      // Handle transitions
      this.handleGestureTransition(prevGesture, consensus);
      this.emit('gestureChange', { gesture: consensus, confidence });
    }
  }

  getConsensusGesture() {
    if (this.recentGestures.length === 0) return 'NO_HAND';
    const counts = {};
    for (const g of this.recentGestures) {
      counts[g] = (counts[g] || 0) + 1;
    }
    // Return gesture with maximum occurrences
    let best = this.recentGestures[this.recentGestures.length - 1];
    let max = 0;
    for (const [g, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        best = g;
      }
    }
    return best;
  }

  handleGestureTransition(prev, current) {
    const now = performance.now();

    // 1. JUMP LOGIC (INDEX_UP)
    if (current === 'INDEX_UP') {
      if (!this.jumpTriggeredInCurrentGesture && now - this.lastJumpTime > this.jumpCooldownMs) {
        this.lastJumpTime = now;
        this.jumpTriggeredInCurrentGesture = true;
        this.emit('jump');
      }
    } else {
      // Reset trigger flag when leaving INDEX_UP
      this.jumpTriggeredInCurrentGesture = false;
    }

    // 2. DUCK LOGIC (CLOSED_FIST)
    if (current === 'CLOSED_FIST') {
      if (!this.isDucking) {
        this.isDucking = true;
        this.emit('duckStart');
      }
    } else {
      if (this.isDucking) {
        this.isDucking = false;
        this.emit('duckEnd');
      }
    }

    // 3. OPEN PALM (START / RESUME)
    if (current === 'OPEN_PALM') {
      this.emit('openPalm');
    }
  }

  setupKeyboardFallback() {
    window.addEventListener('keydown', (e) => {
      // Space / ArrowUp: Jump
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        const now = performance.now();
        if (now - this.lastJumpTime > this.jumpCooldownMs) {
          this.lastJumpTime = now;
          this.emit('jump');
        }
      }
      // ArrowDown: Duck
      if (e.code === 'ArrowDown') {
        if (!this.isDucking) {
          this.isDucking = true;
          this.emit('duckStart');
        }
      }
      // Enter: Open Palm equivalent (Start/Resume)
      if (e.code === 'Enter') {
        this.emit('openPalm');
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowDown') {
        if (this.isDucking) {
          this.isDucking = false;
          this.emit('duckEnd');
        }
      }
    });
  }
}

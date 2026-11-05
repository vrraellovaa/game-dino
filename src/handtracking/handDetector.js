/**
 * HandDetector
 * Manages webcam media stream, MediaPipe HandLandmarker lifecycle,
 * landmark skeleton canvas rendering, and real-time inference loop.
 */
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export class HandDetector {
  constructor() {
    this.video = null;
    this.landmarker = null;
    this.isStreaming = false;
    this.isModelLoaded = false;
    this.isLoading = false;
    this.lastVideoTime = -1;
    this.animationFrameId = null;

    // Performance & FPS tracking
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdateTime = performance.now();

    // Callbacks
    this.onResultsCallback = null;
    this.onErrorCallback = null;
    this.onStatusCallback = null;

    // Target preview canvas for skeletal landmark overlay
    this.previewCanvas = null;
    this.previewCtx = null;
  }

  setPreviewCanvas(canvas) {
    this.previewCanvas = canvas;
    if (canvas) {
      this.previewCtx = canvas.getContext('2d');
    }
  }

  notifyStatus(status, message) {
    if (this.onStatusCallback) {
      this.onStatusCallback({ status, message, fps: this.fps });
    }
  }

  notifyError(errorType, message) {
    console.error(`[HandDetector] ${errorType}: ${message}`);
    if (this.onErrorCallback) {
      this.onErrorCallback({ type: errorType, message });
    }
  }

  /**
   * Initializes MediaPipe HandLandmarker
   */
  async initModel() {
    if (this.landmarker || this.isLoading) return;
    this.isLoading = true;
    this.notifyStatus('loading', 'Memuat model MediaPipe HandLandmarker...');

    try {
      let vision;
      try {
        // Attempt local wasm first
        vision = await FilesetResolver.forVisionTasks('./wasm');
      } catch (e) {
        console.warn('Local wasm failed, falling back to CDN...', e);
        vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
      }

      // Try local model task, fallback to CDN if needed
      let modelPath = './assets/models/hand_landmarker.task';
      try {
        const headCheck = await fetch(modelPath, { method: 'HEAD' });
        if (!headCheck.ok) {
          modelPath = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
        }
      } catch {
        modelPath = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
      }

      this.landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: modelPath,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isModelLoaded = true;
      this.isLoading = false;
      this.notifyStatus('ready', 'Model MediaPipe siap digunakan.');
    } catch (err) {
      this.isLoading = false;
      this.notifyError('MODEL_LOAD_ERROR', 'Gagal memuat model MediaPipe: ' + err.message);
      throw err;
    }
  }

  /**
   * Requests webcam access and starts video stream
   */
  async startCamera(videoElement) {
    if (this.isStreaming) return;
    this.video = videoElement || document.createElement('video');
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('muted', '');
    this.video.muted = true;

    if (!this.isModelLoaded) {
      await this.initModel();
    }

    try {
      this.notifyStatus('requesting_camera', 'Meminta izin akses webcam...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      this.video.srcObject = stream;
      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play().then(resolve);
        };
      });

      this.isStreaming = true;
      this.notifyStatus('active', 'Kamera aktif.');
      this.startDetectionLoop();
    } catch (err) {
      this.isStreaming = false;
      let userFriendlyMsg = 'Gagal mengakses kamera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        userFriendlyMsg = 'Izin kamera ditolak oleh pengguna atau browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        userFriendlyMsg = 'Perangkat webcam tidak ditemukan.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        userFriendlyMsg = 'Kamera sedang digunakan oleh aplikasi lain.';
      }
      this.notifyError(err.name, userFriendlyMsg);
      throw new Error(userFriendlyMsg);
    }
  }

  /**
   * Stops webcam stream and detection loop
   */
  stopCamera() {
    this.isStreaming = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.video && this.video.srcObject) {
      const tracks = this.video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      this.video.srcObject = null;
    }

    // Clear preview canvas
    if (this.previewCanvas && this.previewCtx) {
      this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
    }

    this.notifyStatus('stopped', 'Kamera dinonaktifkan.');
  }

  /**
   * Main inference loop decoupled from Phaser rendering
   */
  startDetectionLoop() {
    const loop = (timestamp) => {
      if (!this.isStreaming) return;

      // Update FPS calculation
      this.frameCount++;
      if (timestamp - this.lastFpsUpdateTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdateTime));
        this.frameCount = 0;
        this.lastFpsUpdateTime = timestamp;
      }

      if (this.landmarker && this.video && this.video.readyState >= 2) {
        if (this.video.currentTime !== this.lastVideoTime) {
          this.lastVideoTime = this.video.currentTime;

          const results = this.landmarker.detectForVideo(this.video, timestamp);

          // Draw skeleton on preview canvas if provided
          if (this.previewCanvas && this.previewCtx) {
            this.renderLandmarks(results);
          }

          if (this.onResultsCallback) {
            this.onResultsCallback(results, this.fps);
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Renders the hand skeleton and landmarks directly on the live camera canvas
   */
  renderLandmarks(results) {
    const ctx = this.previewCtx;
    const canvas = this.previewCanvas;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.landmarks || results.landmarks.length === 0) {
      return;
    }

    const landmarks = results.landmarks[0];
    const w = canvas.width;
    const h = canvas.height;

    // Connections between landmarks (MediaPipe hand bone indices)
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [9, 13], [13, 14], [14, 15], [15, 16],// Ring
      [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [0, 17]                               // Palm base
    ];

    // Draw skeletal bones (neon retro pixel lines)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#22c55e'; // Prehistoric neon green
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 4;

    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      // Note: camera preview is mirrored horizontally for natural user perception
      const x1 = (1 - p1.x) * w;
      const y1 = p1.y * h;
      const x2 = (1 - p2.x) * w;
      const y2 = p2.y * h;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Draw landmark joint points (glowing retro dots)
    landmarks.forEach((p, index) => {
      const x = (1 - p.x) * w;
      const y = p.y * h;

      ctx.beginPath();
      // Fingertips: 4, 8, 12, 16, 20 are highlighted in Amber/Yellow
      const isTip = [4, 8, 12, 16, 20].includes(index);
      ctx.fillStyle = isTip ? '#facc15' : '#38bdf8';
      ctx.arc(x, y, isTip ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
  }
}


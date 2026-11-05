/**
 * CameraPreview UI Component
 * Manages the live webcam preview element, skeleton canvas overlay,
 * status badges, and user camera toggle button.
 */
export class CameraPreview {
  constructor(handDetector, gestureController) {
    this.detector = handDetector;
    this.controller = gestureController;

    this.container = document.getElementById('camera-preview-box');
    this.videoEl = document.getElementById('webcam-video');
    this.canvasEl = document.getElementById('webcam-canvas');
    this.statusBadge = document.getElementById('camera-status-badge');
    this.gestureBadge = document.getElementById('camera-gesture-badge');
    this.fpsBadge = document.getElementById('camera-fps-badge');
    this.toggleBtn = document.getElementById('camera-toggle-btn');

    this.isEnabled = true;
    this.init();
  }

  init() {
    if (this.canvasEl && this.detector) {
      this.detector.setPreviewCanvas(this.canvasEl);
    }

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        this.toggleCamera();
      });
    }

    // Subscribe to detector status updates
    if (this.detector) {
      this.detector.onStatusCallback = ({ status, message, fps }) => {
        this.updateStatus(status, message, fps);
      };

      this.detector.onErrorCallback = ({ type, message }) => {
        this.showError(message);
      };
    }

    // Subscribe to controller gesture updates
    if (this.controller) {
      this.controller.on('gestureChange', ({ gesture, confidence }) => {
        this.updateGestureBadge(gesture, confidence);
      });

      this.controller.on('handPresenceChange', (hasHand) => {
        this.updatePresenceBadge(hasHand);
      });
    }
  }

  async enableCamera() {
    try {
      this.updateStatus('starting', 'Menghubungkan kamera...');
      await this.detector.startCamera(this.videoEl);
      this.isEnabled = true;
      if (this.toggleBtn) {
        this.toggleBtn.textContent = 'DISABLE CAM';
        this.toggleBtn.classList.remove('btn-danger');
      }
    } catch (err) {
      this.isEnabled = false;
      if (this.toggleBtn) {
        this.toggleBtn.textContent = 'ENABLE CAM';
      }
    }
  }

  disableCamera() {
    this.detector.stopCamera();
    this.isEnabled = false;
    if (this.toggleBtn) {
      this.toggleBtn.textContent = 'ENABLE CAM';
    }
    this.updateStatus('stopped', 'Kamera nonaktif');
    this.updateGestureBadge('NO_HAND', 0);
  }

  async toggleCamera() {
    if (this.isEnabled) {
      this.disableCamera();
    } else {
      await this.enableCamera();
    }
  }

  setVisible(visible) {
    if (this.container) {
      this.container.style.display = visible ? 'flex' : 'none';
    }
  }

  updateStatus(status, message, fps) {
    if (this.statusBadge) {
      if (status === 'active') {
        this.statusBadge.textContent = 'CAM ACTIVE';
        this.statusBadge.className = 'badge badge-success';
      } else if (status === 'loading' || status === 'starting') {
        this.statusBadge.textContent = 'LOADING...';
        this.statusBadge.className = 'badge badge-warning';
      } else {
        this.statusBadge.textContent = 'CAM OFF';
        this.statusBadge.className = 'badge badge-danger';
      }
    }

    if (this.fpsBadge && fps !== undefined) {
      this.fpsBadge.textContent = `${fps} FPS`;
    }
  }

  updatePresenceBadge(hasHand) {
    if (!this.statusBadge) return;
    if (hasHand) {
      this.statusBadge.textContent = 'HAND DETECTED';
      this.statusBadge.className = 'badge badge-success';
    } else if (this.isEnabled) {
      this.statusBadge.textContent = 'NO HAND';
      this.statusBadge.className = 'badge badge-warning';
    }
  }

  updateGestureBadge(gesture, confidence) {
    if (!this.gestureBadge) return;

    let text = 'NO HAND';
    let badgeClass = 'badge badge-danger';

    switch (gesture) {
      case 'OPEN_PALM':
        text = '✋ OPEN PALM';
        badgeClass = 'badge badge-success';
        break;
      case 'INDEX_UP':
        text = '☝️ JUMP (INDEX UP)';
        badgeClass = 'badge badge-primary';
        break;
      case 'CLOSED_FIST':
        text = '✊ DUCK (FIST)';
        badgeClass = 'badge badge-accent';
        break;
      case 'NEUTRAL':
        text = '👋 DETECTING...';
        badgeClass = 'badge badge-warning';
        break;
      default:
        text = 'NO HAND';
        badgeClass = 'badge badge-danger';
        break;
    }

    this.gestureBadge.textContent = text;
    this.gestureBadge.className = badgeClass;
  }

  showError(message) {
    if (this.statusBadge) {
      this.statusBadge.textContent = 'CAM ERROR';
      this.statusBadge.className = 'badge badge-danger';
    }
    const banner = document.getElementById('error-banner');
    if (banner) {
      banner.textContent = message;
      banner.style.display = 'block';
      setTimeout(() => {
        banner.style.display = 'none';
      }, 6000);
    }
  }
}


/**
 * GestureClassifier
 * Analyzes 21 3D landmarks from MediaPipe Hand Landmarker
 * and classifies gestures: OPEN_PALM, INDEX_UP, CLOSED_FIST, or NEUTRAL.
 */

export class GestureClassifier {
  constructor(sensitivity = 'normal') {
    this.setSensitivity(sensitivity);
  }

  setSensitivity(mode) {
    this.sensitivity = mode;
    // Multipliers for distance and angle ratios
    switch (mode) {
      case 'relaxed':
        this.extendRatioThreshold = 1.15;
        this.curlRatioThreshold = 1.05;
        break;
      case 'sensitive':
        this.extendRatioThreshold = 1.30;
        this.curlRatioThreshold = 0.95;
        break;
      case 'normal':
      default:
        this.extendRatioThreshold = 1.20;
        this.curlRatioThreshold = 1.00;
        break;
    }
  }

  // Euclidean distance between two 2D/3D points
  static dist(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Classify gesture from landmarks array [ {x, y, z}, ... 21 points ]
   * @param {Array} landmarks
   * @returns {{ gesture: string, confidence: number, details: Object }}
   */
  classify(landmarks) {
    if (!landmarks || landmarks.length < 21) {
      return { gesture: 'NO_HAND', confidence: 0, details: {} };
    }

    const wrist = landmarks[0];

    // Thumb
    const thumbCmc = landmarks[1];
    const thumbMcp = landmarks[2];
    const thumbIp = landmarks[3];
    const thumbTip = landmarks[4];

    // Index
    const indexMcp = landmarks[5];
    const indexPip = landmarks[6];
    const indexDip = landmarks[7];
    const indexTip = landmarks[8];

    // Middle
    const middleMcp = landmarks[9];
    const middlePip = landmarks[10];
    const middleDip = landmarks[11];
    const middleTip = landmarks[12];

    // Ring
    const ringMcp = landmarks[13];
    const ringPip = landmarks[14];
    const ringDip = landmarks[15];
    const ringTip = landmarks[16];

    // Pinky
    const pinkyMcp = landmarks[17];
    const pinkyPip = landmarks[18];
    const pinkyDip = landmarks[19];
    const pinkyTip = landmarks[20];

    // Check finger extensions using wrist-to-tip vs wrist-to-pip and mcp-to-tip vs mcp-to-pip
    const isFingerExtended = (mcp, pip, dip, tip) => {
      const dWristTip = GestureClassifier.dist(wrist, tip);
      const dWristPip = GestureClassifier.dist(wrist, pip);
      const dMcpTip = GestureClassifier.dist(mcp, tip);
      const dMcpPip = GestureClassifier.dist(mcp, pip);

      // In screen coords, when finger points up, tip.y < pip.y
      const pointsUp = tip.y < pip.y;
      const isLongEnough = dWristTip > dWristPip * this.extendRatioThreshold && dMcpTip > dMcpPip * 1.1;

      return isLongEnough && pointsUp;
    };

    const isFingerCurled = (mcp, pip, tip) => {
      const dWristTip = GestureClassifier.dist(wrist, tip);
      const dWristPip = GestureClassifier.dist(wrist, pip);
      const dMcpTip = GestureClassifier.dist(mcp, tip);
      const dMcpPip = GestureClassifier.dist(mcp, pip);

      // Curled if tip is closer to wrist/MCP than PIP is
      return dWristTip < dWristPip * this.curlRatioThreshold || dMcpTip < dMcpPip;
    };

    const indexExtended = isFingerExtended(indexMcp, indexPip, indexDip, indexTip);
    const middleExtended = isFingerExtended(middleMcp, middlePip, middleDip, middleTip);
    const ringExtended = isFingerExtended(ringMcp, ringPip, ringDip, ringTip);
    const pinkyExtended = isFingerExtended(pinkyMcp, pinkyPip, pinkyDip, pinkyTip);

    const indexCurled = isFingerCurled(indexMcp, indexPip, indexTip);
    const middleCurled = isFingerCurled(middleMcp, middlePip, middleTip);
    const ringCurled = isFingerCurled(ringMcp, ringPip, ringTip);
    const pinkyCurled = isFingerCurled(pinkyMcp, pinkyPip, pinkyTip);

    // Thumb extension check
    const dThumbTipPinkyMcp = GestureClassifier.dist(thumbTip, pinkyMcp);
    const dThumbMcpPinkyMcp = GestureClassifier.dist(thumbMcp, pinkyMcp);
    const thumbExtended = dThumbTipPinkyMcp > dThumbMcpPinkyMcp * 1.15;
    const thumbCurled = !thumbExtended;

    const details = {
      indexExtended,
      middleExtended,
      ringExtended,
      pinkyExtended,
      thumbExtended,
      indexCurled,
      middleCurled,
      ringCurled,
      pinkyCurled,
      thumbCurled,
    };

    // 1. Check INDEX_UP (JUMP)
    // Index clearly extended, middle/ring/pinky curled
    if (indexExtended && middleCurled && ringCurled && pinkyCurled) {
      // Calculate confidence based on index tip height relative to other tips
      const heightBonus = Math.max(0, (middleTip.y - indexTip.y) * 4);
      const conf = Math.min(1.0, 0.75 + heightBonus);
      return { gesture: 'INDEX_UP', confidence: conf, details };
    }

    // 2. Check CLOSED_FIST (DUCK)
    // All 4 fingers are curled, and thumb is tucked in
    if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
      const conf = 0.90;
      return { gesture: 'CLOSED_FIST', confidence: conf, details };
    }

    // 3. Check OPEN_PALM (START / RESUME)
    // All 4 fingers extended, thumb extended or semi-extended
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      const conf = thumbExtended ? 0.95 : 0.85;
      return { gesture: 'OPEN_PALM', confidence: conf, details };
    }

    // 4. In-between / Neutral Hand
    return { gesture: 'NEUTRAL', confidence: 0.5, details };
  }
}


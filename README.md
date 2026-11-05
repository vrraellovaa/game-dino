# 🦖 JURASSIC ADVENTURE: HAND-CONTROLLED DINO RUN

An authentic 8-bit retro pixel art 2D endless runner where you control a prehistoric dinosaur entirely with real-time hand gestures tracked through your webcam using Google MediaPipe and Phaser 3.

---

## 🎮 Game Concept & Identity

- **Visual Style:** 8-bit Retro Arcade Pixel Art (Prehistoric Jungle, Volcanic Mountains, Parallax Clouds, Dinosaur Fossils).
- **Control Input:** Webcam Hand Tracking powered by **MediaPipe Hand Landmarker** (`@mediapipe/tasks-vision`).
- **Core Engine:** **Phaser 3** (Arcade Physics, TileSprite parallax backgrounds, dynamic hitboxes, particles).
- **Sound Engine:** **Web Audio API** (Procedural retro chiptune sound effects & prehistoric jungle BGM).
- **Platform:** Google Chrome / Modern Chromium browsers (Desktop / Laptop recommended).
- **Architecture:** 100% Client-Side, zero backend or database required.

---

## ✋ Hand Gesture Controls

| Gesture | Real-Life Action | In-Game Command | Purpose / Mechanics |
| :--- | :--- | :--- | :--- |
| **✋ OPEN PALM** | Open hand with all fingers extended and spread | **START / RESUME** | Starts game from menu, skips/confirms, or resumes paused session |
| **☝️ INDEX UP** | Raise index finger up, keep other 3 fingers curled | **JUMP** | Dino leaps over boulders, cacti, fallen logs, and fossils (Debounced with cooldown) |
| **✊ CLOSED FIST** | Clench all fingers into a tight fist | **DUCK / CROUCH** | Dino crouches low, reducing hitbox height to clear low-flying pterodactyls |
| **👋 NEUTRAL** | Transitioning hand | **STAND / RUN** | Dino resumes standard running stride |

### ⌨️ Keyboard Fallback (Testing / Offline)
- **[SPACE]** or **[↑ Arrow Up]**: Jump
- **[↓ Arrow Down]**: Duck / Crouch (Hold to stay ducked)
- **[ENTER]**: Start Game / Confirm / Resume (Open Palm equivalent)
- **[P]** or **[ESC]**: Pause / Resume Game

---

## 🛠️ Project Structure

```
jurassic-adventure/
├── public/
│   ├── assets/
│   │   └── models/
│   │       └── hand_landmarker.task  # MediaPipe Hand Landmarker model
│   └── wasm/                         # MediaPipe WebAssembly binaries
├── src/
│   ├── main.js                       # Game bootstrapper and UI event coordinator
│   ├── style.css                     # Retro 8-bit arcade CSS layout & animations
│   │
│   ├── game/
│   │   ├── config.js                 # Dimensions, physics gravity, speeds & gaps
│   │   ├── DinoPlayer.js             # Dino physics sprite, animations, state machine
│   │   ├── GameScene.js              # Parallax runner, collision, countdown & pause
│   │   ├── MenuScene.js              # Arcade title screen, animated dino, high score
│   │   ├── CalibrationScene.js       # Live gesture testing & sensitivity confirmation
│   │   └── GameOverScene.js          # Collision results, score evaluation & retry
│   │
│   ├── handtracking/
│   │   ├── handDetector.js           # Webcam stream, MediaPipe inference & skeleton overlay
│   │   ├── gestureClassifier.js      # 21-landmark geometric heuristics & classification
│   │   └── gestureController.js      # Smoothing, debouncing, jump cooldown & state emitter
│   │
│   ├── systems/
│   │   ├── audioManager.js           # Web Audio chiptune synthesizer (SFX + jungle BGM)
│   │   ├── scoreSystem.js            # Distance tracking, milestones & high scores
│   │   ├── obstacleSpawner.js        # Dynamic fair spawning (rocks, cacti, logs, pterodactyls)
│   │   └── storageManager.js         # LocalStorage persistence for records and settings
│   │
│   ├── ui/
│   │   ├── cameraPreview.js          # Live webcam widget with skeleton canvas overlay
│   │   ├── hud.js                    # In-game score, speed, gesture pill, milestone banner
│   │   └── settings.js               # Audio sliders, sensitivity, and scanlines toggles
│   │
│   └── utils/
│       └── pixelArtGenerator.js      # Canvas-generated authentic retro pixel art textures
│
├── index.html                        # Application shell & arcade modals
├── package.json                      # Dependencies and scripts
├── vite.config.js                    # Vite bundler configuration
└── README.md                         # Documentation
```

---

## 🚀 Installation & Running the Game

### Prerequisites
- Node.js (version 18+ or 20+ recommended)
- Google Chrome, Microsoft Edge, or any modern Chromium browser with webcam access.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open the local URL displayed in the terminal (typically `http://localhost:5173`).

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🎯 How to Play & Calibration Guide

1. Click **"ENABLE CAM"** on the camera preview box in the top-right corner.
2. When prompted by Google Chrome, click **"Allow"** to grant webcam permission.
3. Position your hand **40 cm to 70 cm** from the camera with good ambient lighting.
4. Watch the top-right camera preview:
   - Green skeleton bones and yellow fingertip dots will track your hand in real-time.
   - Status will show **CAM ACTIVE** and **HAND DETECTED**.
5. Click **"⚙ CALIBRATE"** from the main menu to test each gesture with instant visual checkmarks:
   - Open your palm ✋ until verified.
   - Raise your index finger ☝️ to test jump.
   - Form a closed fist ✊ to test duck.
6. Click **"▶ PLAY GAME"** or simply flash an **Open Palm** ✋ to start the 3-2-1-GO! countdown!
7. Jump over prehistoric rocks, cycad cacti, fallen logs, and dinosaur skeletons.
8. Duck under low-flying pterodactyls!
9. Survive as long as you can to set the ultimate prehistoric high score!

---

## 🛡️ Privacy & Performance

- **100% Client-Side:** All webcam video frames and hand landmark predictions are processed exclusively inside your browser using WebAssembly. No video, audio, or landmark data is ever stored or transmitted to external servers.
- **Independent Loops:** Hand tracking runs decoupled on `requestAnimationFrame` from the Phaser 60 FPS game loop, ensuring silky smooth gameplay and zero input stutter.


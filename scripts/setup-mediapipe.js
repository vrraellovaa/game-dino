import fs from 'fs';
import path from 'path';
import https from 'https';

fs.mkdirSync('./public/wasm', { recursive: true });
fs.mkdirSync('./public/assets/models', { recursive: true });

// Copy wasm files
const wasmDir = './node_modules/@mediapipe/tasks-vision/wasm';
if (fs.existsSync(wasmDir)) {
  fs.readdirSync(wasmDir).forEach(f => {
    fs.copyFileSync(path.join(wasmDir, f), path.join('./public/wasm', f));
  });
  console.log('Copied wasm files to public/wasm.');
}

const modelDest = './public/assets/models/hand_landmarker.task';
if (!fs.existsSync(modelDest) || fs.statSync(modelDest).size === 0) {
  console.log('Downloading hand_landmarker.task...');
  const file = fs.createWriteStream(modelDest);
  https.get('https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task', res => {
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Finished downloading model, size:', fs.statSync(modelDest).size);
    });
  }).on('error', err => {
    console.error('Download error:', err.message);
  });
} else {
  console.log('Model exists, size:', fs.statSync(modelDest).size);
}


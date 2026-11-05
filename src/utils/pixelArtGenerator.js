/**
 * PixelArtGenerator
 * Generates authentic 8-bit retro pixel art assets on Canvas
 * and registers them directly into Phaser TextureManager.
 */

// Helper to draw pixel matrices where each character represents a color index
function drawMatrix(ctx, startX, startY, pixelSize, matrix, palette) {
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    for (let c = 0; c < row.length; c++) {
      const char = row[c];
      if (char !== '.' && palette[char]) {
        ctx.fillStyle = palette[char];
        ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

export class PixelArtGenerator {
  /**
   * Generates all required textures and adds them to the Phaser Scene
   * @param {Phaser.Scene} scene
   */
  static generateTextures(scene) {
    if (scene.textures.exists('dino_sheet')) return;

    this.createDinoSpriteSheet(scene);
    this.createObstacles(scene);
    this.createBackgrounds(scene);
    this.createParticles(scene);
  }

  /**
   * Dino Spritesheet: 48x48 per frame (Total 12 frames: 576 x 48)
   * 0, 1: Idle (2 frames)
   * 2, 3, 4, 5: Run (4 frames)
   * 6: Jump (1 frame)
   * 7: Fall (1 frame)
   * 8, 9: Duck (2 frames)
   * 10, 11: Hit / Game Over (2 frames)
   */
  static createDinoSpriteSheet(scene) {
    const frameW = 48;
    const frameH = 48;
    const totalFrames = 12;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * totalFrames;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const p = {
      'K': '#0f2415', // Dark contour / outline
      'G': '#2e7d32', // Main dinosaur green
      'L': '#4caf50', // Light green highlight
      'Y': '#f59e0b', // Belly / crest yellow
      'O': '#d97706', // Belly shade
      'W': '#ffffff', // Eye white / teeth
      'B': '#111827', // Pupil
      'R': '#ef4444', // Red head crest / feather spike
      'D': '#b91c1c', // Dark red
      'X': '#9ca3af', // Dazed eyes / stars
    };

    // Dino pixel art design (24 cols x 24 rows, drawn at 2px per pixel = 48x48)
    const basePalette = p;

    // Helper: draw 24x24 matrix at frame index
    const drawDinoFrame = (frameIndex, matrix) => {
      const offsetX = frameIndex * frameW;
      drawMatrix(ctx, offsetX, 0, 2, matrix, basePalette);
    };

    // Frame 0: Idle 1
    const idle1 = [
      "........................",
      ".........RRR............",
      "........RRRRR...........",
      ".......KKKKKKKK.........",
      "......KGLLLLWWKK........",
      ".....KGLLLLWWWBK........",
      ".....KGLGGLLWWKK........",
      ".....KGGGGGGKKK.........",
      ".....KGGWGGWK...........",
      ".....KKGGGGKKK..........",
      "....KKGGGGGGYKK.........",
      "...KGGGGGGGGYYK.........",
      "..KGGGGGGGGGGYYK........",
      ".KGGKKGGGGGGGYOK........",
      ".KGK.KGGGGGGGYOK........",
      ".KK..KGGGGGGGYOK........",
      ".....KGGGGGGGYOK........",
      ".....KKGGGGGGKK.........",
      "......KKKKKKKK..........",
      "......KGK..KGK..........",
      "......KGK..KGK..........",
      "......KKK..KKK..........",
      "........................",
      "........................"
    ];

    // Frame 1: Idle 2 (slight tail & crest breath)
    const idle2 = [
      "........................",
      ".........RRRR...........",
      "........RRRRR...........",
      ".......KKKKKKKK.........",
      "......KGLLLLWWKK........",
      ".....KGLLLLWWWBK........",
      ".....KGLGGLLWWKK........",
      ".....KGGGGGGKKK.........",
      ".....KGGWGGWK...........",
      ".....KKGGGGKKK..........",
      "....KKGGGGGGYKK.........",
      "...KGGGGGGGGYYK.........",
      "..KGGGGGGGGGGYYK........",
      ".KGGKKGGGGGGGYOK........",
      "KKGK.KGGGGGGGYOK........",
      "KK...KGGGGGGGYOK........",
      ".....KGGGGGGGYOK........",
      ".....KKGGGGGGKK.........",
      "......KKKKKKKK..........",
      "......KGK..KGK..........",
      "......KGK..KGK..........",
      "......KKK..KKK..........",
      "........................",
      "........................"
    ];

    // Frame 2: Run 1 (Legs forward/back)
    const run1 = [
      "........................",
      "........RRRR............",
      ".......RRRRR............",
      "......KKKKKKKK..........",
      ".....KGLLLLWWKK.........",
      "....KGLLLLWWWBK.........",
      "....KGLGGLLWWKK.........",
      "....KGGGGGGKKK..........",
      "....KGGWGGWK............",
      "....KKGGGGKKK...........",
      "...KKGGGGGGYKK..........",
      "..KGGGGGGGGYYK..........",
      ".KGGGGGGGGGGYYK.........",
      "KGGKKGGGGGGGYOK.........",
      "KGK..KGGGGGGYOK.........",
      "KK...KGGGGGGYOK.........",
      ".....KKGGGGGYOK.........",
      "......KKGGGGGKK.........",
      ".....KKKK.KKKK..........",
      "....KGK.....KGK.........",
      "...KKK.......KKK........",
      "........................",
      "........................",
      "........................"
    ];

    // Frame 3: Run 2 (Passing pose / stride)
    const run2 = [
      "........................",
      ".........RRR............",
      "........RRRRR...........",
      ".......KKKKKKKK.........",
      "......KGLLLLWWKK........",
      ".....KGLLLLWWWBK........",
      ".....KGLGGLLWWKK........",
      ".....KGGGGGGKKK.........",
      ".....KGGWGGWK...........",
      ".....KKGGGGKKK..........",
      "....KKGGGGGGYKK.........",
      "...KGGGGGGGGYYK.........",
      "..KGGGGGGGGGGYYK........",
      ".KGGKKGGGGGGGYOK........",
      "KKGK.KGGGGGGGYOK........",
      "KK...KGGGGGGGYOK........",
      ".....KKGGGGGGKK.........",
      "......KKKKKKKK..........",
      "......KKGKKGKK..........",
      "......KKK.KKK...........",
      "........................",
      "........................",
      "........................",
      "........................"
    ];

    // Frame 4: Run 3 (Opposite legs)
    const run3 = [
      "........................",
      "........RRRR............",
      ".......RRRRR............",
      "......KKKKKKKK..........",
      ".....KGLLLLWWKK.........",
      "....KGLLLLWWWBK.........",
      "....KGLGGLLWWKK.........",
      "....KGGGGGGKKK..........",
      "....KGGWGGWK............",
      "....KKGGGGKKK...........",
      "...KKGGGGGGYKK..........",
      "..KGGGGGGGGYYK..........",
      ".KGGGGGGGGGGYYK.........",
      "KGGKKGGGGGGGYOK.........",
      "KGK..KGGGGGGYOK.........",
      "KK...KGGGGGGYOK.........",
      ".....KKGGGGGYOK.........",
      "......KKGGGGGKK.........",
      ".....KKKK.KKKK..........",
      "......KGK..KGK..........",
      ".....KKK....KKK.........",
      "........................",
      "........................",
      "........................"
    ];

    // Frame 5: Run 4 (High knee stride)
    const run4 = [
      "........................",
      ".........RRR............",
      "........RRRRR...........",
      ".......KKKKKKKK.........",
      "......KGLLLLWWKK........",
      ".....KGLLLLWWWBK........",
      ".....KGLGGLLWWKK........",
      ".....KGGGGGGKKK.........",
      ".....KGGWGGWK...........",
      ".....KKGGGGKKK..........",
      "....KKGGGGGGYKK.........",
      "...KGGGGGGGGYYK.........",
      "..KGGGGGGGGGGYYK........",
      ".KGGKKGGGGGGGYOK........",
      ".KGK.KGGGGGGGYOK........",
      ".KK..KGGGGGGGYOK........",
      ".....KKGGGGGGKK.........",
      "......KKKKKKKK..........",
      ".....KKK...KKK..........",
      "....KKK.....KKK.........",
      "........................",
      "........................",
      "........................",
      "........................"
    ];

    // Frame 6: Jump (Leaping with legs curled up and arms forward)
    const jump = [
      "........................",
      ".........RRRR...........",
      "........RRRRR...........",
      ".......KKKKKKKK.........",
      "......KGLLLLWWKK........",
      ".....KGLLLLWWWBK........",
      ".....KGLGGLLWWKK........",
      ".....KGGGGGGKKK.........",
      ".....KGGWGGWK...........",
      ".....KKGGGGKKK..........",
      "....KKGGGGGGYKK.........",
      "...KGGGGGGGGYYK.........",
      "..KGGGGGGGGGGYYK........",
      ".KGGKKGGGGGGGYOK........",
      "KK...KGGGGGGGYOK........",
      ".....KKGGGGGGKK.........",
      "......KKKKKKKK..........",
      ".....KKGKKGKK...........",
      "....KKKK.KKKK...........",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................"
    ];

    // Frame 7: Fall (Descending pose)
    const fall = [
      "........................",
      "........RRRR............",
      ".......RRRRR............",
      "......KKKKKKKK..........",
      ".....KGLLLLWWKK.........",
      "....KGLLLLWWWBK.........",
      "....KGLGGLLWWKK.........",
      "....KGGGGGGKKK..........",
      "....KGGWGGWK............",
      "....KKGGGGKKK...........",
      "...KKGGGGGGYKK..........",
      "..KGGGGGGGGYYK..........",
      ".KGGGGGGGGGGYYK.........",
      "KGGKKGGGGGGGYOK.........",
      "KGK..KGGGGGGYOK.........",
      "KK...KGGGGGGYOK.........",
      ".....KKGGGGGGKK.........",
      ".....KGK...KGK..........",
      "....KGK.....KGK.........",
      "....KKK.....KKK.........",
      "........................",
      "........................",
      "........................",
      "........................"
    ];

    // Frame 8: Duck 1 (Crouched low to dodge high obstacles)
    const duck1 = [
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      ".............RRRR.......",
      "............RRRRR.......",
      ".....KKKKKKKKKKKKKK.....",
      "....KGLLLLWWKKGGGGYK....",
      "...KGLLLLWWWBKGGGGYYK...",
      "...KGLGGLLWWKKGGGGGYOK..",
      "...KGGGGGGKKKGGGGGGYOK..",
      "...KGGWGGWKKGGGGGGGYOK..",
      "...KKGGGGKKKKGGGGGGYOK..",
      "....KKKKKK..KKKKKKKKK...",
      "....KGK.KGK...KGK.KGK...",
      "....KKK.KKK...KKK.KKK...",
      "........................",
      "........................",
      "........................"
    ];

    // Frame 9: Duck 2 (Low crawl stride)
    const duck2 = [
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "..............RRR.......",
      ".............RRRRR......",
      ".....KKKKKKKKKKKKKK.....",
      "....KGLLLLWWKKGGGGYK....",
      "...KGLLLLWWWBKGGGGYYK...",
      "...KGLGGLLWWKKGGGGGYOK..",
      "...KGGGGGGKKKGGGGGGYOK..",
      "...KGGWGGWKKGGGGGGGYOK..",
      "...KKGGGGKKKKGGGGGGYOK..",
      "....KKKKKK..KKKKKKKKK...",
      ".....KGK........KGK.....",
      "....KKK..........KKK....",
      "........................",
      "........................",
      "........................"
    ];

    // Frame 10: Hit 1 (X eyes, knocked back)
    const hit1 = [
      "........................",
      ".........RRRR...........",
      "........RRRRR...........",
      ".......KKKKKKKK.........",
      "......KGLLLLXXKK........",
      ".....KGLLLLXXXXK........",
      ".....KGLGGLLXXKK........",
      ".....KGGGGGGKKK.........",
      ".....KGGWGGWK...........",
      ".....KKGGGGKKK..........",
      "....KKGGGGGGYKK.........",
      "...KGGGGGGGGYYK.........",
      "..KGGGGGGGGGGYYK........",
      ".KGGKKGGGGGGGYOK........",
      "KK...KGGGGGGGYOK........",
      ".....KKGGGGGGKK.........",
      "......KKKKKKKK..........",
      ".....KGK...KGK..........",
      "....KKK.....KKK.........",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................"
    ];

    // Frame 11: Hit 2 (Tumbled down)
    const hit2 = [
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      ".........KKKKKK.........",
      "........KGLLLLXXK.......",
      ".......KGLLLLXXXXK......",
      ".......KGLGGLLXXKK......",
      ".......KGGGGGGKK........",
      ".....KKKGGGGGGKK........",
      "....KGGGGGGGGYYK........",
      "...KGGGGGGGGGGYYK.......",
      "...KKKKKKKKKKKKK........",
      "........................",
      "........................",
      "........................",
      "........................"
    ];

    const frames = [idle1, idle2, run1, run2, run3, run4, jump, fall, duck1, duck2, hit1, hit2];
    frames.forEach((matrix, idx) => {
      drawDinoFrame(idx, matrix);
    });

    scene.textures.addSpriteSheet('dino_sheet', canvas, {
      frameWidth: frameW,
      frameHeight: frameH
    });
  }

  /**
   * Obstacle Sprites
   */
  static createObstacles(scene) {
    // 1. Rock / Boulder (36 x 32 px)
    const rockCanvas = document.createElement('canvas');
    rockCanvas.width = 36;
    rockCanvas.height = 32;
    const rCtx = rockCanvas.getContext('2d');
    rCtx.imageSmoothingEnabled = false;

    const rockPalette = {
      'K': '#1f2937',
      'G': '#4b5563',
      'L': '#9ca3af',
      'M': '#15803d', // Moss
      'E': '#166534', // Dark moss
      'D': '#374151'
    };

    const rockMatrix = [
      ".......KKKKKKKKKKKKK........",
      ".....KKMMMLLLLLLLLLLKK......",
      "....KEMMMLLLLDDDDDDDDLK.....",
      "...KEMMLLLLDDDDDDDDDDDLK....",
      "..KEMLLLLDDDDDDDDDDDDDDLK...",
      ".KMMLLLDDDDDDDDDDDDDDDDDLK..",
      "KMMLLLDDDDDDDDDDDDDDDDDDDLK.",
      "KMLLLDDDDDDKKKKKDDDDDDDDDLK.",
      "KLLLDDDDDDDKKKKKKDDDDDDDDLK.",
      "KLLDDDDDDDKKK..KKKDDDDDDDLK.",
      "KLDDDDDDDDKK....KKDDDDDDDLK.",
      "KLDDDDDDDDKK....KKDDDDDDDLK.",
      "KLDDDDDDDDDDKKKKKDDDDDDDDLK.",
      "KLDDDDDDDDDDDKKKDDDDDDDDDLK.",
      "KLDDDDDDDDDDDDDDDDDDDDDDDLK.",
      "KKKKKKKKKKKKKKKKKKKKKKKKKKKK"
    ];
    drawMatrix(rCtx, 0, 0, 2, rockMatrix, rockPalette);
    scene.textures.addCanvas('obstacle_rock', rockCanvas);

    // 2. Prehistoric Cactus / Primitive Spiky Cycad (32 x 48 px)
    const cactusCanvas = document.createElement('canvas');
    cactusCanvas.width = 32;
    cactusCanvas.height = 48;
    const cCtx = cactusCanvas.getContext('2d');
    cCtx.imageSmoothingEnabled = false;

    const cactusPalette = {
      'K': '#0f381e',
      'G': '#15803d',
      'L': '#4ade80',
      'Y': '#fef08a', // Spikes
      'D': '#166534'
    };

    const cactusMatrix = [
      ".........KKKK...........",
      "........KLLLGK..........",
      ".......YKLLLGKY.........",
      "........KLLLGK..........",
      "..KKKK..KLLLGK..KKKK....",
      ".KLLLGKYKLLLGKYKLLLGKY..",
      "YKLLLGK.KLLLGK.KLLLGK...",
      ".KLLLGK.KLLLGK.KLLLGK...",
      ".KLLLGK.KLLLGK.KLLLGK...",
      ".KLLDDK.KLLLGK.KDLLGK...",
      "..KKKDKKKLLLGKKKDKKK....",
      "....KKKLLLLLLGKKK.......",
      ".......KLLLLLGK.........",
      ".......YKLLLGKY.........",
      "........KLLLGK..........",
      "........KLLLGK..........",
      ".......YKLLLGKY.........",
      "........KLLLGK..........",
      "........KLLLGK..........",
      ".......YKLLLGKY.........",
      "........KLLLGK..........",
      "........KDLLGK..........",
      "........KKKKKK..........",
      "........................"
    ];
    drawMatrix(cCtx, 0, 0, 2, cactusMatrix, cactusPalette);
    scene.textures.addCanvas('obstacle_cactus', cactusCanvas);

    // 3. Fallen Ancient Log (48 x 26 px)
    const logCanvas = document.createElement('canvas');
    logCanvas.width = 48;
    logCanvas.height = 26;
    const lCtx = logCanvas.getContext('2d');
    lCtx.imageSmoothingEnabled = false;

    const logPalette = {
      'K': '#27170a',
      'B': '#5c3317',
      'L': '#8b5a2b',
      'M': '#22c55e', // Green moss on top
      'D': '#3b220c',
      'H': '#d97706'  // Tree rings
    };

    const logMatrix = [
      "....KKMMMMMMMMMMMMMMMMMMMMMM....",
      "..KKHHKMMMMMMMMMMMMMMMMMMMMMKK..",
      ".KHHBBLKKKKKKKKKKKKKKKKKKKKBBLK.",
      "KHHBBBLLLLLLLLLLLLLLLLLLLLLBBBLK",
      "KHBBDDLLLLLLLLLLLLLLLLLLLLLBDDLK",
      "KHBDDDDLLLLLLLLLLLLLLLLLLLLBDDLK",
      "KHBBDDLLLLLLLLLLLLLLLLLLLLLBDDLK",
      "KHHBBBLLLLLLLLLLLLLLLLLLLLLBBBLK",
      ".KHHBBLKKKKKKKKKKKKKKKKKKKKBBLK.",
      "..KKHHKDDDDDDDDDDDDDDDDDDDDDDKK..",
      "....KKKKKKKKKKKKKKKKKKKKKKKK...."
    ];
    drawMatrix(lCtx, 0, 2, 2, logMatrix, logPalette);
    scene.textures.addCanvas('obstacle_log', logCanvas);

    // 4. Dino Bone / Fossil Skull (38 x 32 px)
    const fossilCanvas = document.createElement('canvas');
    fossilCanvas.width = 38;
    fossilCanvas.height = 32;
    const fCtx = fossilCanvas.getContext('2d');
    fCtx.imageSmoothingEnabled = false;

    const fossilPalette = {
      'K': '#292524',
      'W': '#f5f5f4',
      'S': '#d6d3d1',
      'D': '#a8a29e',
      'E': '#1c1917' // Eye socket
    };

    const fossilMatrix = [
      "....KKKKKKKKKKKKKKKK....",
      "...KWWWWWWWWWWWWWWWWK...",
      "..KWWSSSSSWWWSSSWWWWWK..",
      ".KWWSEEEEEWWSEEEWWWWWWK.",
      ".KWSEEEEEEEWSEEEWWWWWWK.",
      ".KWSEEEEEEEWSWWWWWWWWWK.",
      ".KWWSEEEEEWWSSSWWKKKKKK.",
      "..KWWSSSSSWWWKKWWKWKWKK.",
      "...KWWWWWWWWWKKWWKWKWKK.",
      "....KKKKKKKKKWWWWWWWWK..",
      ".......KWWWWWWWWWWWKK...",
      "........KKKKKKKKKKK....."
    ];
    drawMatrix(fCtx, 0, 4, 2, fossilMatrix, fossilPalette);
    scene.textures.addCanvas('obstacle_fossil', fossilCanvas);

    // 5. Flying Pterodactyl (44 x 32 px, 2 frames: wings up, wings down)
    // Low flying so player must DUCK!
    const pteroCanvas = document.createElement('canvas');
    pteroCanvas.width = 88;
    pteroCanvas.height = 32;
    const ptCtx = pteroCanvas.getContext('2d');
    ptCtx.imageSmoothingEnabled = false;

    const pteroPalette = {
      'K': '#2e1065',
      'P': '#7e22ce',
      'L': '#a855f7',
      'Y': '#facc15', // Beak
      'W': '#ffffff',
      'B': '#000000'
    };

    // Frame 1: Wings Up
    const ptero1 = [
      "..KK....................",
      ".KPLLK..........KKKK....",
      "KPPLLLK........KYYYYK...",
      "KPPPLLLK......KYYYYYYK..",
      ".KPPPLLLK...KKKWBKYYYK..",
      "..KPPPLLLK.KPPPWWKYYK...",
      "...KPPPLLLKKPPLLKKK.....",
      "....KPPPLLKPPLLK........",
      ".....KPPLLKPPLLK........",
      "......KKKKKKKKK........."
    ];

    // Frame 2: Wings Down
    const ptero2 = [
      "................KKKK....",
      "...............KYYYYK...",
      "..............KYYYYYYK..",
      "............KKKWBKYYYK..",
      "...........KPPPWWKYYK...",
      "..KKKKKKKKKKPPLLKKK.....",
      ".KPPPLLLLLLKPPLLK.......",
      "KPPPLLLK...KPPLLK.......",
      "KPLLK.......KKKK........",
      ".KK....................."
    ];

    drawMatrix(ptCtx, 0, 6, 2, ptero1, pteroPalette);
    drawMatrix(ptCtx, 44, 6, 2, ptero2, pteroPalette);

    scene.textures.addSpriteSheet('obstacle_pterodactyl', pteroCanvas, {
      frameWidth: 44,
      frameHeight: 32
    });
  }

  /**
   * Parallax Background Textures
   */
  static createBackgrounds(scene) {
    const w = 800;

    // 1. Sky with retro sun and pixel clouds (800 x 300)
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = w;
    skyCanvas.height = 300;
    const sCtx = skyCanvas.getContext('2d');
    sCtx.imageSmoothingEnabled = false;

    // Prehistoric sky gradient: Deep Amber-Orange to Warm Cyan
    const skyGrad = sCtx.createLinearGradient(0, 0, 0, 300);
    skyGrad.addColorStop(0, '#38bdf8');   // Daylight Cyan
    skyGrad.addColorStop(0.5, '#7dd3fc');
    skyGrad.addColorStop(0.85, '#fed7aa'); // Warm prehistoric horizon
    skyGrad.addColorStop(1, '#ffedd5');
    sCtx.fillStyle = skyGrad;
    sCtx.fillRect(0, 0, w, 300);

    // Retro Prehistoric Sun
    sCtx.fillStyle = '#fef08a';
    sCtx.beginPath();
    sCtx.arc(680, 70, 38, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.fillStyle = '#fde047';
    sCtx.beginPath();
    sCtx.arc(680, 70, 32, 0, Math.PI * 2);
    sCtx.fill();

    // Pixel Clouds
    const cloudCol = '#ffffff';
    const cloudShade = '#e0f2fe';
    const drawCloud = (cx, cy, scale) => {
      sCtx.fillStyle = cloudCol;
      sCtx.fillRect(cx, cy + 8 * scale, 64 * scale, 16 * scale);
      sCtx.fillRect(cx + 8 * scale, cy + 4 * scale, 48 * scale, 22 * scale);
      sCtx.fillRect(cx + 16 * scale, cy, 32 * scale, 26 * scale);
      sCtx.fillStyle = cloudShade;
      sCtx.fillRect(cx + 4 * scale, cy + 20 * scale, 56 * scale, 4 * scale);
    };
    drawCloud(60, 40, 1.2);
    drawCloud(320, 70, 0.9);
    drawCloud(520, 30, 1.4);

    scene.textures.addCanvas('bg_sky', skyCanvas);

    // 2. Far Volcanic Mountains (800 x 240)
    const mtnCanvas = document.createElement('canvas');
    mtnCanvas.width = w;
    mtnCanvas.height = 240;
    const mCtx = mtnCanvas.getContext('2d');
    mCtx.imageSmoothingEnabled = false;

    // Distant jagged prehistoric volcanic mountains
    const peaks = [
      { x: 0, y: 160 }, { x: 90, y: 50 }, { x: 180, y: 180 },
      { x: 280, y: 40 }, { x: 380, y: 190 }, { x: 480, y: 30 },
      { x: 600, y: 170 }, { x: 700, y: 60 }, { x: 800, y: 160 }
    ];

    mCtx.fillStyle = '#64748b'; // Mountain base
    mCtx.beginPath();
    mCtx.moveTo(0, 240);
    peaks.forEach(p => mCtx.lineTo(p.x, p.y));
    mCtx.lineTo(w, 240);
    mCtx.closePath();
    mCtx.fill();

    // Mountain shading (facets)
    mCtx.fillStyle = '#475569';
    mCtx.beginPath();
    mCtx.moveTo(0, 240);
    peaks.forEach((p, idx) => {
      if (idx % 2 === 1) {
        mCtx.lineTo(p.x, p.y);
        mCtx.lineTo(peaks[idx + 1] ? peaks[idx + 1].x : w, 240);
      }
    });
    mCtx.closePath();
    mCtx.fill();

    // Glowing Lava Cracks on peaks!
    mCtx.fillStyle = '#f97316';
    [90, 280, 480, 700].forEach(peakX => {
      mCtx.fillRect(peakX - 6, 45, 12, 6);
      mCtx.fillRect(peakX - 3, 51, 6, 8);
      mCtx.fillStyle = '#ef4444';
      mCtx.fillRect(peakX - 2, 59, 4, 12);
    });

    scene.textures.addCanvas('bg_mountains', mtnCanvas);

    // 3. Prehistoric Jungle Trees / Palms (800 x 220)
    const jungleCanvas = document.createElement('canvas');
    jungleCanvas.width = w;
    jungleCanvas.height = 220;
    const jCtx = jungleCanvas.getContext('2d');
    jCtx.imageSmoothingEnabled = false;

    const drawPalm = (x, y, h) => {
      // Trunk
      jCtx.fillStyle = '#5c3317';
      jCtx.fillRect(x - 6, y - h, 12, h);
      jCtx.fillStyle = '#3e2310';
      for (let ty = y - h; ty < y; ty += 10) {
        jCtx.fillRect(x - 6, ty, 12, 3);
      }
      // Palm fronds
      jCtx.fillStyle = '#166534';
      jCtx.fillRect(x - 36, y - h - 14, 72, 16);
      jCtx.fillRect(x - 50, y - h - 4, 100, 14);
      jCtx.fillStyle = '#22c55e';
      jCtx.fillRect(x - 30, y - h - 12, 60, 6);
      jCtx.fillRect(x - 44, y - h - 2, 88, 6);
    };

    drawPalm(70, 220, 110);
    drawPalm(210, 220, 130);
    drawPalm(360, 220, 100);
    drawPalm(520, 220, 140);
    drawPalm(680, 220, 115);

    // Fern clumps along the bottom
    jCtx.fillStyle = '#14532d';
    for (let fx = 0; fx < w; fx += 25) {
      jCtx.fillRect(fx, 190, 20, 30);
    }

    scene.textures.addCanvas('bg_jungle', jungleCanvas);

    // 4. Ground Surface (800 x 80)
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = w;
    groundCanvas.height = 80;
    const gCtx = groundCanvas.getContext('2d');
    gCtx.imageSmoothingEnabled = false;

    // Grass top layer
    gCtx.fillStyle = '#15803d'; // Rich forest grass
    gCtx.fillRect(0, 0, w, 8);
    // Grass blades pattern
    gCtx.fillStyle = '#4ade80';
    for (let gx = 0; gx < w; gx += 8) {
      gCtx.fillRect(gx, 0, 4, 4);
    }

    // Dirt sub-layers
    gCtx.fillStyle = '#78350f'; // Warm earth brown
    gCtx.fillRect(0, 8, w, 24);
    gCtx.fillStyle = '#451a03'; // Deep fossil stone layer
    gCtx.fillRect(0, 32, w, 48);

    // Pebbles and fossil fragments in earth
    gCtx.fillStyle = '#a8a29e';
    for (let px = 10; px < w; px += 45) {
      gCtx.fillRect(px, 16 + (px % 12), 6, 4);
      gCtx.fillRect(px + 18, 42 + (px % 20), 8, 5);
    }
    // Tiny gold/amber flecks
    gCtx.fillStyle = '#fbbf24';
    for (let ax = 25; ax < w; ax += 70) {
      gCtx.fillRect(ax, 22, 3, 3);
    }

    scene.textures.addCanvas('bg_ground', groundCanvas);
  }

  /**
   * Particles
   */
  static createParticles(scene) {
    // 1. Dust puff
    const dustCanvas = document.createElement('canvas');
    dustCanvas.width = 8;
    dustCanvas.height = 8;
    const dCtx = dustCanvas.getContext('2d');
    dCtx.fillStyle = '#d6d3d1';
    dCtx.fillRect(2, 0, 4, 8);
    dCtx.fillRect(0, 2, 8, 4);
    dCtx.fillStyle = '#a8a29e';
    dCtx.fillRect(2, 2, 4, 4);
    scene.textures.addCanvas('particle_dust', dustCanvas);

    // 2. Star / Milestone Sparkle
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 12;
    starCanvas.height = 12;
    const sCtx = starCanvas.getContext('2d');
    sCtx.fillStyle = '#fde047';
    sCtx.fillRect(4, 0, 4, 12);
    sCtx.fillRect(0, 4, 12, 4);
    sCtx.fillStyle = '#ffffff';
    sCtx.fillRect(4, 4, 4, 4);
    scene.textures.addCanvas('particle_spark', starCanvas);

    // 3. Rock shard
    const shardCanvas = document.createElement('canvas');
    shardCanvas.width = 6;
    shardCanvas.height = 6;
    const shCtx = shardCanvas.getContext('2d');
    shCtx.fillStyle = '#4b5563';
    shCtx.fillRect(1, 1, 4, 4);
    shCtx.fillStyle = '#9ca3af';
    shCtx.fillRect(2, 2, 2, 2);
    scene.textures.addCanvas('particle_rock', shardCanvas);
  }
}


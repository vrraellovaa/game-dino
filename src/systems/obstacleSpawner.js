import { GAME_WIDTH, GROUND_Y, GAME_CONFIG } from '../game/config.js';

export class ObstacleSpawner {
  constructor(scene) {
    this.scene = scene;
    this.obstaclesGroup = scene.physics.add.group();

    this.obstacleTypes = [
      { key: 'obstacle_rock', type: 'ground', width: 34, height: 28, yOffset: -14 },
      { key: 'obstacle_cactus', type: 'ground', width: 28, height: 44, yOffset: -22 },
      { key: 'obstacle_log', type: 'ground', width: 44, height: 22, yOffset: -11 },
      { key: 'obstacle_fossil', type: 'ground', width: 34, height: 26, yOffset: -13 },
      { key: 'obstacle_pterodactyl', type: 'air', width: 38, height: 24, yOffset: -52, animated: true },
    ];

    this.nextSpawnDistance = 600;
    this.distanceTraveledSinceLastSpawn = 0;

    // Create flying pterodactyl flapping animation if not created
    if (!scene.anims.exists('pterodactyl_fly')) {
      scene.anims.create({
        key: 'pterodactyl_fly',
        frames: scene.anims.generateFrameNumbers('obstacle_pterodactyl', { frames: [0, 1] }),
        frameRate: 4,
        repeat: -1,
      });
    }
  }

  reset() {
    this.obstaclesGroup.clear(true, true);
    this.distanceTraveledSinceLastSpawn = 0;
    this.nextSpawnDistance = 550;
  }

  update(deltaSeconds, currentSpeed) {
    const moved = currentSpeed * deltaSeconds;
    this.distanceTraveledSinceLastSpawn += moved;

    // Move existing obstacles to the left
    this.obstaclesGroup.getChildren().forEach((obstacle) => {
      obstacle.x -= moved;
      // Remove obstacles that moved out of bounds
      if (obstacle.x < -80) {
        this.obstaclesGroup.remove(obstacle, true, true);
      }
    });

    // Check if it's time to spawn a new obstacle
    if (this.distanceTraveledSinceLastSpawn >= this.nextSpawnDistance) {
      this.spawnObstacle();
      this.distanceTraveledSinceLastSpawn = 0;

      // Calculate next gap with some randomness, scaling slightly with speed
      const speedRatio = Math.min(1.5, currentSpeed / GAME_CONFIG.initialSpeed);
      const minGap = GAME_CONFIG.minObstacleGap * speedRatio;
      const maxGap = GAME_CONFIG.maxObstacleGap * speedRatio;
      this.nextSpawnDistance = Phaser.Math.Between(minGap, maxGap);
    }
  }

  spawnObstacle() {
    // Pick random obstacle definition
    // Air obstacle (pterodactyl) appears occasionally to introduce ducking
    const choice = Phaser.Utils.Array.GetRandom(this.obstacleTypes);

    const spawnX = GAME_WIDTH + 60;
    const spawnY = GROUND_Y + choice.yOffset;

    let obstacle;
    if (choice.animated) {
      obstacle = this.obstaclesGroup.create(spawnX, spawnY, choice.key);
      obstacle.play('pterodactyl_fly');
    } else {
      obstacle = this.obstaclesGroup.create(spawnX, spawnY, choice.key);
    }

    obstacle.body.setAllowGravity(false);
    obstacle.body.setImmovable(true);
    obstacle.body.setSize(choice.width, choice.height);

    // Fine-tune offset for pixel-perfect collision
    if (choice.type === 'ground') {
      obstacle.body.setOffset(
        (obstacle.width - choice.width) / 2,
        (obstacle.height - choice.height) / 2
      );
    } else {
      // Flying obstacle: safe height clearance so ducking guarantees avoiding it
      obstacle.body.setOffset(4, 4);
    }
  }

  getGroup() {
    return this.obstaclesGroup;
  }
}


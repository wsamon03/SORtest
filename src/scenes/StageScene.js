import { GameConfig } from '../config/GameConfig.js';
import { InputManager } from '../input/InputManager.js';
import { KeyboardInputSource } from '../input/KeyboardInputSource.js';
import { Player } from '../entities/Player.js';
import { Grunt } from '../entities/enemies/Grunt.js';
import { KnifeEnemy } from '../entities/enemies/KnifeEnemy.js';
import { Brute } from '../entities/enemies/Brute.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { WaveSpawner } from '../systems/WaveSpawner.js';
import { CameraController } from '../systems/CameraController.js';
import { EventBus } from '../utils/EventBus.js';

const ENEMY_CLASSES = { grunt: Grunt, shiv: KnifeEnemy, bruiser: Brute };

const WAVES = [
  {
    triggerX: 500,
    lockCamera: true,
    enemies: [
      { type: 'grunt', x: 700, y: 340 },
      { type: 'grunt', x: 760, y: 430 },
    ],
  },
  {
    triggerX: 1400,
    lockCamera: true,
    enemies: [
      { type: 'shiv', x: 1600, y: 360 },
      { type: 'grunt', x: 1660, y: 430 },
      { type: 'shiv', x: 1550, y: 310 },
    ],
  },
  {
    triggerX: 2400,
    lockCamera: true,
    enemies: [
      { type: 'bruiser', x: 2650, y: 390 },
      { type: 'grunt', x: 2600, y: 320 },
    ],
  },
];

export class StageScene extends Phaser.Scene {
  constructor() {
    super('Stage');
  }

  init(data) {
    this.entityRegistry = data.registry;
    this.characterId = data.characterId;
  }

  create() {
    this.score = 0;
    this.buildBackground();

    this.inputManager = new InputManager();
    this.keyboardSource = new KeyboardInputSource(this, this.inputManager);

    this.player = new Player(this, 100, 400, this.characterId, this.inputManager);
    this.enemies = [];

    this.cameraController = new CameraController(this, GameConfig.stageLength);
    this.cameraController.follow(this.player);

    this.combatSystem = new CombatSystem();
    this.waveSpawner = new WaveSpawner(this, WAVES, (type, x, y) => this.spawnEnemy(type, x, y), this.cameraController);

    this.scene.launch('UI');

    this.onPlayerDied = this.onPlayerDied.bind(this);
    EventBus.on('player-died', this.onPlayerDied);
    this.events.once('shutdown', () => EventBus.off('player-died', this.onPlayerDied));
  }

  buildBackground() {
    const { height } = this.scale;
    this.add.rectangle(0, 0, GameConfig.stageLength, height, 0x1c1c26).setOrigin(0, 0);
    this.add
      .rectangle(0, GameConfig.walkableBand.top - 40, GameConfig.stageLength, 4, 0x40404e)
      .setOrigin(0, 0);
    for (let x = 0; x < GameConfig.stageLength; x += 64) {
      this.add.rectangle(x, GameConfig.walkableBand.bottom + 30, 60, 8, 0x30303c).setOrigin(0, 0);
    }
  }

  spawnEnemy(type, x, y) {
    const EnemyClass = ENEMY_CLASSES[type];
    const enemy = new EnemyClass(this, x, y);
    this.enemies.push(enemy);
    return enemy;
  }

  onPlayerDied() {
    const remaining = this.player.loseLife();
    if (remaining) {
      this.time.delayedCall(900, () => this.respawnPlayer());
    } else {
      this.time.delayedCall(900, () => this.endGame('lose'));
    }
  }

  respawnPlayer() {
    this.player.health = this.player.maxHealth;
    this.player.isDead = false;
    if (this.player.body) this.player.body.enable = true;
    this.player.fsm.transition('idle');
    this.player.onHealthChanged();
  }

  endGame(result) {
    this.scene.stop('UI');
    this.scene.start('GameOver', { result, score: this.score });
  }

  update(time, delta) {
    if (this.player.isDead) return;

    this.keyboardSource.update();
    const maxX = this.cameraController.lockedMaxX !== null
      ? this.cameraController.lockedMaxX - 30
      : GameConfig.stageLength - 20;
    this.player.handleInput(time, delta, maxX);

    for (const enemy of this.enemies) {
      if (!enemy.isDead) enemy.updateAI(time, delta, this.player);
    }

    this.combatSystem.update(this.player, this.enemies);

    for (const enemy of this.enemies) {
      if (enemy.isDead && !enemy.scored) {
        enemy.scored = true;
        this.score += 100;
        EventBus.emit('score-changed', { score: this.score });
      }
    }

    this.waveSpawner.update(this.player);

    if (this.waveSpawner.cleared && this.enemies.length > 0 && this.enemies.every((e) => e.isDead)) {
      this.endGame('win');
    }
  }
}

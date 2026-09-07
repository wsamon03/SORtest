import { Entity } from './Entity.js';
import { GameConfig } from '../config/GameConfig.js';
import { EventBus } from '../utils/EventBus.js';

const HOP_DURATION_MS = 450;
const HOP_HEIGHT_PX = 30;

export class Player extends Entity {
  constructor(scene, x, y, id, inputManager) {
    const states = {
      idle: { enter: (p) => p.playAnim('idle') },
      walk: { enter: (p) => p.playAnim('walk') },
      attack1: { enter: (p) => p.startAttack('attack1') },
      attack2: { enter: (p) => p.startAttack('attack2') },
      hurt: {
        enter: (p) => {
          p.playAnim('hurt');
          p.comboStage = 0;
          p.hurtTimer = 0;
        },
        update: (p, dt) => {
          p.hurtTimer += dt;
          if (p.hurtTimer > 350) p.fsm.transition('idle');
        },
      },
      ko: {
        enter: (p) => {
          p.playAnim('ko');
          EventBus.emit('player-died');
        },
      },
    };
    super(scene, x, y, id, states, 'idle');

    this.inputManager = inputManager;
    this.logicalY = y;
    this.isHopping = false;
    this.hopTimer = 0;
    this.comboStage = 0;
    this.comboTimer = 0;
    this.attackTimer = 0;
    this.lives = 3;

    EventBus.emit('health-changed', { who: 'player', health: this.health, maxHealth: this.maxHealth });
    EventBus.emit('lives-changed', { lives: this.lives });
  }

  onHealthChanged() {
    EventBus.emit('health-changed', { who: 'player', health: this.health, maxHealth: this.maxHealth });
  }

  startAttack(animName) {
    this.playAnim(animName, true);
    this.attackTimer = 0;
    this.attackAnimName = animName;
    this.attackApplied = false;
  }

  handleInput(time, delta, maxX = GameConfig.stageLength - 20) {
    if (this.isDead) return;
    this.fsm.update(delta);

    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) this.comboStage = 0;
    }

    if (this.fsm.is('attack1') || this.fsm.is('attack2')) {
      this.attackTimer += delta;
      const def = this.manifest.animations[this.attackAnimName];
      const totalDuration = (1000 / def.frameRate) * def.frameCount;
      if (this.attackTimer >= totalDuration) {
        this.comboTimer = GameConfig.comboWindowMs;
        this.fsm.transition('idle');
      }
      return;
    }

    if (this.fsm.is('hurt') || this.fsm.is('ko')) {
      return;
    }

    if (this.inputManager.justPressed('attack')) {
      if (this.comboStage === 0 || !this.hasAnim('attack2')) {
        this.comboStage = 1;
        this.fsm.transition('attack1');
      } else {
        this.comboStage = 0;
        this.fsm.transition('attack2');
      }
      this.comboTimer = 0;
      return;
    }

    if (this.inputManager.justPressed('jump') && !this.isHopping) {
      this.isHopping = true;
      this.hopTimer = 0;
    }

    const im = this.inputManager;
    let vx = 0;
    let vy = 0;
    if (im.isDown('left')) vx -= 1;
    if (im.isDown('right')) vx += 1;
    if (im.isDown('up')) vy -= 1;
    if (im.isDown('down')) vy += 1;

    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    const distance = (this.walkSpeed * delta) / 1000;
    this.x = Phaser.Math.Clamp(this.x + vx * distance, 20, maxX);
    this.logicalY = Phaser.Math.Clamp(
      this.logicalY + vy * distance,
      GameConfig.walkableBand.top,
      GameConfig.walkableBand.bottom
    );

    if (vx > 0) this.setFacing(1);
    else if (vx < 0) this.setFacing(-1);

    this.fsm.transition(vx !== 0 || vy !== 0 ? 'walk' : 'idle');

    if (this.isHopping) {
      this.hopTimer += delta;
      const t = Math.min(1, this.hopTimer / HOP_DURATION_MS);
      const hop = Math.sin(t * Math.PI) * HOP_HEIGHT_PX;
      this.y = this.logicalY - hop;
      if (t >= 1) this.isHopping = false;
    } else {
      this.y = this.logicalY;
    }
    this.setDepth(this.logicalY);
  }

  loseLife() {
    this.lives -= 1;
    EventBus.emit('lives-changed', { lives: this.lives });
    return this.lives > 0;
  }
}

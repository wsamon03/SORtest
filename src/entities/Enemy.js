import { Entity } from './Entity.js';
import { GameConfig } from '../config/GameConfig.js';

/**
 * Shared AI base for every enemy type. Subclasses (Grunt, KnifeEnemy,
 * Brute) only pass different tuning numbers into the constructor and
 * optionally override getLateralJitter() - none of them duplicate the
 * approach/attack/cooldown state logic below.
 */
export class Enemy extends Entity {
  constructor(scene, x, y, id, options = {}) {
    const states = {
      idle: { enter: (e) => e.playAnim('idle') },
      approach: { enter: (e) => e.playAnim('walk') },
      windup: {
        enter: (e) => {
          e.playAnim('idle');
          e.windupTimer = 0;
        },
      },
      attack: { enter: (e) => e.startAttack() },
      cooldown: {
        enter: (e) => {
          e.playAnim('idle');
          e.cooldownTimer = 0;
        },
        update: (e, dt) => {
          e.cooldownTimer += dt;
          if (e.cooldownTimer >= e.attackCooldownMs) e.fsm.transition('idle');
        },
      },
      hurt: {
        enter: (e) => {
          e.playAnim('hurt');
          e.hurtTimer = 0;
        },
        update: (e, dt) => {
          e.hurtTimer += dt;
          if (e.hurtTimer > 300) e.fsm.transition('idle');
        },
      },
      ko: {
        enter: (e) => {
          e.playAnim('ko');
          if (e.body) e.body.enable = false;
        },
      },
    };
    super(scene, x, y, id, states, 'idle');

    this.aggroRadius = options.aggroRadius ?? 260;
    this.meleeRange = options.meleeRange ?? 46;
    this.attackCooldownMs = options.attackCooldownMs ?? 900;
    this.windUpMs = options.windUpMs ?? 0;
    this.knockbackResist = options.knockbackResist ?? 1;
    this.attackTimer = 0;
    this.windupTimer = 0;
  }

  startAttack() {
    this.attackAnimName = 'attack1';
    this.playAnim('attack1', true);
    this.attackTimer = 0;
    this.attackApplied = false;
  }

  takeDamage(amount, knockbackForce = 0, dirSign) {
    super.takeDamage(amount, knockbackForce * this.knockbackResist, dirSign);
  }

  /** Hook for subclasses (KnifeEnemy) that want erratic side-to-side strafing. */
  getLateralJitter(_delta) {
    return 0;
  }

  approachTarget(target, delta) {
    const targetY = target.logicalY ?? target.y;
    const dx = target.x - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      const distance = (this.walkSpeed * delta) / 1000;
      this.x += (dx / dist) * distance;
      const jitter = this.getLateralJitter(delta);
      this.y = Phaser.Math.Clamp(
        this.y + (dy / dist) * distance + jitter,
        GameConfig.walkableBand.top,
        GameConfig.walkableBand.bottom
      );
    }
    this.setFacing(dx >= 0 ? 1 : -1);
    return dist;
  }

  inMeleeRange(dist) {
    return dist <= this.meleeRange;
  }

  updateAI(time, delta, target) {
    if (this.isDead) return;
    this.fsm.update(delta);

    if (this.fsm.is('hurt') || this.fsm.is('ko') || this.fsm.is('cooldown')) {
      return;
    }

    const targetY = target.logicalY ?? target.y;
    const dist = Math.hypot(target.x - this.x, targetY - this.y);

    if (this.fsm.is('attack')) {
      this.attackTimer += delta;
      const def = this.manifest.animations.attack1;
      const totalDuration = (1000 / def.frameRate) * def.frameCount;
      if (this.attackTimer >= totalDuration) {
        this.fsm.transition('cooldown');
      }
      return;
    }

    if (this.fsm.is('windup')) {
      this.windupTimer += delta;
      if (this.windupTimer >= this.windUpMs) {
        this.fsm.transition('attack');
      }
      return;
    }

    if (dist > this.aggroRadius) {
      this.fsm.transition('idle');
      return;
    }

    if (this.inMeleeRange(dist)) {
      this.setFacing(target.x >= this.x ? 1 : -1);
      this.fsm.transition(this.windUpMs > 0 ? 'windup' : 'attack');
      return;
    }

    this.fsm.transition('approach');
    this.approachTarget(target, delta);
  }
}

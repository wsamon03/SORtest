import { Enemy } from '../Enemy.js';

/** Fast, erratic enemy that strafes side to side before darting in. */
export class KnifeEnemy extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'shiv', {
      aggroRadius: 300,
      meleeRange: 42,
      attackCooldownMs: 600,
      windUpMs: 0,
      knockbackResist: 1.3,
    });
    this.jitterPhase = Math.random() * Math.PI * 2;
  }

  getLateralJitter(delta) {
    this.jitterPhase += delta * 0.012;
    return Math.sin(this.jitterPhase) * 2.2;
  }
}

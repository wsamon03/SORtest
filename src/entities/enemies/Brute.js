import { Enemy } from '../Enemy.js';

/** Slow, tanky enemy with a telegraphed wind-up and knockback resistance. */
export class Brute extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'bruiser', {
      aggroRadius: 240,
      meleeRange: 46,
      attackCooldownMs: 1300,
      windUpMs: 500,
      knockbackResist: 0.35,
    });
  }
}

import { Enemy } from '../Enemy.js';

/** Baseline enemy: approaches steadily and swings on proximity. */
export class Grunt extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'grunt', {
      aggroRadius: 260,
      meleeRange: 40,
      attackCooldownMs: 900,
      windUpMs: 0,
      knockbackResist: 1,
    });
  }
}

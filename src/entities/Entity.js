import { AnimationFactory } from '../systems/AnimationFactory.js';
import { StateMachine } from '../utils/StateMachine.js';

/**
 * Shared base for Player and every Enemy. Everything here is driven by
 * the entity's manifest.json (see docs/ART_PIPELINE.md) - no character
 * or enemy id is ever hardcoded in this file.
 */
export class Entity extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, id, states, initialState = 'idle') {
    super(scene, x, y, id);
    this.id = id;
    this.manifest = AnimationFactory.getManifest(id);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHealth = this.manifest.stats.maxHealth;
    this.health = this.maxHealth;
    this.walkSpeed = this.manifest.stats.walkSpeed;
    this.facing = 1; // 1 = facing right, -1 = facing left
    this.isDead = false;

    const { width, height } = this.manifest.hurtbox;
    this.body.setSize(width, height);
    this.applyHurtboxOffset();

    this.fsm = new StateMachine(initialState, states, this);
    this.playAnim(this.manifest.defaultAnimation ?? 'idle');
  }

  applyHurtboxOffset() {
    const { frameWidth, frameHeight, hurtbox } = this.manifest;
    const dirOffsetX = this.facing === 1 ? hurtbox.offsetX : -hurtbox.offsetX;
    const left = frameWidth / 2 - hurtbox.width / 2 + dirOffsetX;
    const top = frameHeight / 2 - hurtbox.height / 2 + hurtbox.offsetY;
    this.body.setOffset(left, top);
  }

  setFacing(direction) {
    if (direction === this.facing) return;
    this.facing = direction;
    this.setFlipX(direction === -1);
    this.applyHurtboxOffset();
  }

  playAnim(name, ignoreIfPlaying = true) {
    if (!this.hasAnim(name)) return;
    this.play(AnimationFactory.animKey(this.id, name), ignoreIfPlaying);
  }

  hasAnim(name) {
    return AnimationFactory.hasAnimation(this.id, name);
  }

  getAttackData(animName) {
    return this.manifest.attacks?.[animName];
  }

  /** @param dirSign -1 or 1: which way to knock the victim. */
  takeDamage(amount, knockbackForce = 0, dirSign = -this.facing) {
    if (this.isDead) return;
    this.health = Math.max(0, this.health - amount);
    this.onHealthChanged();
    this.x += dirSign * Math.min(knockbackForce, 40) * 0.15;
    this.knockbackForce = dirSign * knockbackForce;
    if (this.health <= 0) {
      this.die();
    } else {
      this.fsm.transition('hurt');
    }
  }

  onHealthChanged() {
    // Overridden by Player to broadcast HUD updates.
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.fsm.transition('ko');
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.setDepth(this.y);
  }
}

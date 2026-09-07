import { AnimationFactory } from './AnimationFactory.js';

/**
 * Fully data-driven melee combat: every attack's hitbox rect, damage and
 * knockback come from the attacker's own manifest.json
 * (`attacks.<animName>`), so this file never branches on a character or
 * enemy id.
 */
export class CombatSystem {
  update(player, enemies) {
    if (!player.isDead) {
      this.checkAttack(
        player,
        enemies.filter((e) => !e.isDead)
      );
    }
    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      this.checkAttack(enemy, [player]);
    }
  }

  checkAttack(attacker, targets) {
    const animName = attacker.attackAnimName;
    if (!animName) return;
    if (!(attacker.fsm.is('attack1') || attacker.fsm.is('attack2') || attacker.fsm.is('attack'))) {
      return;
    }

    const def = attacker.manifest.animations[animName];
    if (!def || def.hitFrame === undefined) return;

    const expectedKey = AnimationFactory.animKey(attacker.id, animName);
    if (!attacker.anims.currentAnim || attacker.anims.currentAnim.key !== expectedKey) return;

    const currentFrameIndex = attacker.anims.currentFrame ? attacker.anims.currentFrame.index - 1 : -1;
    if (currentFrameIndex < def.hitFrame || attacker.attackApplied) return;

    const atk = attacker.getAttackData(animName);
    if (!atk) return;

    const hbX = attacker.x + attacker.facing * atk.offsetX - atk.width / 2;
    const hbY = attacker.y + atk.offsetY - atk.height / 2;

    for (const target of targets) {
      if (target.isDead) continue;
      const b = target.body;
      const overlaps = hbX < b.x + b.width && hbX + atk.width > b.x && hbY < b.y + b.height && hbY + atk.height > b.y;
      if (overlaps) {
        target.takeDamage(atk.damage, atk.knockback, attacker.facing);
      }
    }

    attacker.attackApplied = true;
  }
}

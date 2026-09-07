/**
 * Ordered list of {triggerX, enemies[], lockCamera} waves. When the
 * player crosses a wave's triggerX, its enemies spawn and (optionally)
 * the camera locks so the player can't scroll past until the room is
 * cleared - the classic beat-'em-up "room lock" mechanic - then the
 * camera unlocks and the next wave becomes active.
 */
export class WaveSpawner {
  constructor(scene, waves, spawnEnemyFn, cameraController) {
    this.scene = scene;
    this.waves = waves.map((w) => ({ ...w, triggered: false }));
    this.spawnEnemyFn = spawnEnemyFn;
    this.cameraController = cameraController;
    this.currentWaveIndex = 0;
    this.activeEnemies = [];
  }

  get cleared() {
    return this.currentWaveIndex >= this.waves.length;
  }

  update(player) {
    if (this.cleared) return;
    const wave = this.waves[this.currentWaveIndex];

    if (!wave.triggered) {
      if (player.x >= wave.triggerX) {
        wave.triggered = true;
        this.activeEnemies = wave.enemies.map((cfg) => this.spawnEnemyFn(cfg.type, cfg.x, cfg.y));
        if (wave.lockCamera) {
          this.cameraController.lockMaxX(wave.triggerX + this.scene.scale.width * 0.6);
        }
      }
      return;
    }

    if (this.activeEnemies.length > 0 && this.activeEnemies.every((e) => e.isDead)) {
      if (wave.lockCamera) this.cameraController.unlock();
      this.currentWaveIndex += 1;
    }
  }
}

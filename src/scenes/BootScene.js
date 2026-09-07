export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.json('registry', 'assets/sprites/registry.json');
  }

  create() {
    const registry = this.cache.json.get('registry');
    this.scene.start('Preloader', { registry });
  }
}

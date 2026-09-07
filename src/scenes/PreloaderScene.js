import { AnimationFactory } from '../systems/AnimationFactory.js';

/**
 * Three-phase manifest-driven load, see AnimationFactory.js for why this
 * needs to be split across preload()/create() instead of one pass.
 */
export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  init(data) {
    this.entityRegistry = data.registry;
  }

  preload() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, 300, 24, 0x222222).setStrokeStyle(2, 0xffffff);
    const barFill = this.add.rectangle(width / 2 - 148, height / 2, 4, 16, 0xffdd33).setOrigin(0, 0.5);
    this.add
      .text(width / 2, height / 2 - 30, 'Loading...', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' })
      .setOrigin(0.5);

    this.load.on('progress', (p) => {
      barFill.width = 296 * p;
    });

    // Phase 1: load every entity's manifest.json.
    AnimationFactory.queueManifests(this, this.entityRegistry);
  }

  create() {
    this.load.once('complete', () => {
      // Phase 3: manifests + spritesheets are cached, register animations.
      AnimationFactory.createAllAnimations(this, this.entityRegistry);
      this.scene.start('Title', { registry: this.entityRegistry });
    });

    // Phase 2: manifests are now in the JSON cache - load each spritesheet.
    AnimationFactory.queueSpritesheets(this, this.entityRegistry);
    this.load.start();
  }
}

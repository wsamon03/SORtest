/**
 * Generic, manifest-driven spritesheet + animation loader.
 *
 * No file under src/entities or src/systems ever hardcodes a character or
 * enemy's name/id in a rendering or animation code path - every lookup
 * here is by `id`, driven entirely by assets/sprites/registry.json and
 * each entity's own manifest.json (see docs/ART_PIPELINE.md for the
 * schema). Swapping an entity's art is therefore just replacing its
 * spritesheet.png (and optionally editing its manifest.json) - nothing
 * in this file or any file that uses it needs to change.
 *
 * Loading happens in three phases because Phaser needs frameWidth/
 * frameHeight *at load time* for load.spritesheet(), but those values
 * only exist inside the manifest JSON we haven't loaded yet:
 *   1. queueManifests()      - load every entity's manifest.json
 *   2. queueSpritesheets()   - once manifests are cached, load each PNG
 *   3. createAllAnimations() - once sheets are loaded, register anims
 */
export class AnimationFactory {
  static manifests = new Map();

  static allEntries(registry) {
    return [...registry.characters, ...registry.enemies];
  }

  static queueManifests(scene, registry) {
    for (const entry of AnimationFactory.allEntries(registry)) {
      scene.load.json(AnimationFactory.manifestKey(entry.id), `${entry.path}/manifest.json`);
    }
  }

  static queueSpritesheets(scene, registry) {
    for (const entry of AnimationFactory.allEntries(registry)) {
      const manifest = scene.cache.json.get(AnimationFactory.manifestKey(entry.id));
      AnimationFactory.manifests.set(entry.id, manifest);
      scene.load.spritesheet(entry.id, `${entry.path}/${manifest.spritesheet}`, {
        frameWidth: manifest.frameWidth,
        frameHeight: manifest.frameHeight,
      });
    }
  }

  static createAllAnimations(scene, registry) {
    for (const entry of AnimationFactory.allEntries(registry)) {
      const manifest = AnimationFactory.manifests.get(entry.id);
      const { columns } = manifest;
      for (const [animName, def] of Object.entries(manifest.animations)) {
        const start = def.row * columns;
        const end = start + def.frameCount - 1;
        scene.anims.create({
          key: AnimationFactory.animKey(entry.id, animName),
          frames: scene.anims.generateFrameNumbers(entry.id, { start, end }),
          frameRate: def.frameRate,
          repeat: def.loop ? -1 : 0,
        });
      }
    }
  }

  static manifestKey(id) {
    return `${id}-manifest`;
  }

  static animKey(id, animName) {
    return `${id}-${animName}`;
  }

  static getManifest(id) {
    return AnimationFactory.manifests.get(id);
  }

  static hasAnimation(id, animName) {
    return !!AnimationFactory.manifests.get(id)?.animations?.[animName];
  }
}

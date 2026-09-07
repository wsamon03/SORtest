#!/usr/bin/env node
/**
 * Generates all placeholder spritesheets + manifest.json files for every
 * character/enemy. Re-run any time with `npm run generate:sprites` (or
 * `node tools/generate_sprites.mjs`) to regenerate the placeholder art -
 * it always overwrites, and art + manifest are always written from the
 * same frame-count table so they can never drift out of sync.
 *
 * This script (and everything under tools/) is build-time only and is
 * never loaded by the game in the browser.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PixelCanvas } from './lib/pixel-canvas.mjs';
import { PALETTES } from './lib/palettes.mjs';
import { drawCharacterFrame } from './lib/humanoid-rig.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const COLUMNS = 8;
const ROWS = 6;

// Fixed row-per-animation convention - see docs/ART_PIPELINE.md.
const ANIM_ROW = { idle: 0, walk: 1, attack1: 2, attack2: 3, hurt: 4, ko: 5 };

const ENTITIES = [
  { id: 'rook', group: 'characters', frameSize: 64, hasAttack2: true },
  { id: 'vex', group: 'characters', frameSize: 64, hasAttack2: true },
  { id: 'grunt', group: 'enemies', frameSize: 64, hasAttack2: false },
  { id: 'shiv', group: 'enemies', frameSize: 64, hasAttack2: false },
  { id: 'bruiser', group: 'enemies', frameSize: 80, hasAttack2: false },
];

const STATS = {
  rook: { maxHealth: 100, walkSpeed: 150 },
  vex: { maxHealth: 85, walkSpeed: 175 },
  grunt: { maxHealth: 40, walkSpeed: 90 },
  shiv: { maxHealth: 25, walkSpeed: 150 },
  bruiser: { maxHealth: 90, walkSpeed: 60 },
};

const DISPLAY_NAMES = {
  rook: 'Rook',
  vex: 'Vex',
  grunt: 'Grunt',
  shiv: 'Shiv',
  bruiser: 'Bruiser',
};

function buildAnimations(entity) {
  const animations = {
    idle: { row: ANIM_ROW.idle, frameCount: 4, frameRate: 6, loop: true },
    walk: { row: ANIM_ROW.walk, frameCount: 6, frameRate: 10, loop: true },
    attack1: { row: ANIM_ROW.attack1, frameCount: 4, frameRate: 14, loop: false, hitFrame: 2 },
    hurt: { row: ANIM_ROW.hurt, frameCount: 2, frameRate: 8, loop: false },
    ko: { row: ANIM_ROW.ko, frameCount: 4, frameRate: 6, loop: false, holdLastFrame: true },
  };
  if (entity.hasAttack2) {
    animations.attack2 = { row: ANIM_ROW.attack2, frameCount: 4, frameRate: 14, loop: false, hitFrame: 2 };
  }
  return animations;
}

function buildManifest(entity) {
  const animations = buildAnimations(entity);
  const s = entity.frameSize / 64;
  // offsetX + width/2 is this attack's effective reach in pixels - it
  // needs to comfortably exceed enemies' meleeRange (see src/entities/
  // enemies/*.js) or the attacker can stand in range without ever being
  // hittable back.
  const attacks = {
    attack1: {
      width: Math.round(36 * s),
      height: Math.round(20 * s),
      offsetX: Math.round(30 * s),
      offsetY: Math.round(2 * s),
      damage: 8,
      knockback: 120,
    },
  };
  if (entity.hasAttack2) {
    attacks.attack2 = {
      width: Math.round(42 * s),
      height: Math.round(20 * s),
      offsetX: Math.round(34 * s),
      offsetY: Math.round(16 * s),
      damage: 14,
      knockback: 200,
    };
  }
  return {
    id: entity.id,
    displayName: DISPLAY_NAMES[entity.id],
    spritesheet: 'spritesheet.png',
    frameWidth: entity.frameSize,
    frameHeight: entity.frameSize,
    columns: COLUMNS,
    rows: ROWS,
    defaultAnimation: 'idle',
    animations,
    hurtbox: {
      width: Math.round(20 * s),
      height: Math.round(40 * s),
      offsetX: 0,
      offsetY: Math.round(10 * s),
    },
    attacks,
    stats: STATS[entity.id],
  };
}

async function generateEntity(entity) {
  const palette = PALETTES[entity.id];
  const manifest = buildManifest(entity);
  const sheetWidth = entity.frameSize * COLUMNS;
  const sheetHeight = entity.frameSize * ROWS;
  const canvas = new PixelCanvas(sheetWidth, sheetHeight, [0, 0, 0, 0]);

  for (const [animName, def] of Object.entries(manifest.animations)) {
    for (let frameIndex = 0; frameIndex < def.frameCount; frameIndex++) {
      const ox = frameIndex * entity.frameSize;
      const oy = def.row * entity.frameSize;
      drawCharacterFrame(
        canvas,
        ox,
        oy,
        entity.frameSize,
        { animName, frameIndex, frameCount: def.frameCount, hitFrame: def.hitFrame },
        palette
      );
    }
  }

  const dir = path.join(ROOT, 'assets', 'sprites', entity.group, entity.id);
  await canvas.writePng(path.join(dir, 'spritesheet.png'));
  fs.writeFileSync(path.join(dir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Generated ${entity.id}: ${sheetWidth}x${sheetHeight} -> ${path.relative(ROOT, dir)}`);
}

for (const entity of ENTITIES) {
  await generateEntity(entity);
}
console.log('Done.');

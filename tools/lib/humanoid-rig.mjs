/**
 * Procedural blocky-humanoid rig shared by every placeholder sprite.
 * All body parts are drawn from a fixed base layout designed on a 64x64
 * frame, then scaled to whatever frameSize the entity actually uses
 * (see BASE below). Per-animation, per-frame offsets ("poses") are
 * computed generically so no character/enemy needs its own draw code -
 * only a palette and a couple of size/flags differ per entity.
 *
 * The character always faces right; the game flips left-facing frames
 * at runtime via setFlipX(), so only right-facing art is ever generated.
 */

const BASE = 64;

// Base-64 layout constants (all in "base units", scaled by frameSize/64).
const CENTER_X = 32;
const HEAD_Y = 5;
const HEAD_SIZE = 14;
const SHOULDER_Y = 24;
const HIP_Y = 40;
const LEG_LEN = 18;
const ARM_LEN = 16;
const LIMB_W = 6;
const ARM_W = 5;
const TORSO_Y = 20;
const TORSO_W = 16;
const TORSO_H = 20;

function getPose({ animName, frameIndex, frameCount, hitFrame }) {
  const phase = (2 * Math.PI * frameIndex) / Math.max(1, frameCount);
  const t = frameCount > 1 ? frameIndex / (frameCount - 1) : 0;

  const pose = {
    headDX: 0, headDY: 0,
    torsoDX: 0, torsoDY: 0,
    frontArmDX: 0, frontArmDY: 0, frontArmPunch: 0,
    backArmDX: 0, backArmDY: 0,
    frontLegDX: 0, frontLegDY: 0, frontLegKick: 0,
    backLegDX: 0, backLegDY: 0,
    flash: false,
  };

  switch (animName) {
    case 'idle': {
      const bob = Math.sin(phase) * 1.0;
      pose.torsoDY = bob;
      pose.headDY = bob;
      pose.frontArmDY = -bob * 0.5;
      pose.backArmDY = bob * 0.5;
      break;
    }
    case 'walk': {
      const legAmp = 6;
      const armAmp = 4;
      pose.frontLegDX = Math.sin(phase) * legAmp;
      pose.backLegDX = -Math.sin(phase) * legAmp;
      pose.frontArmDX = -Math.sin(phase) * armAmp;
      pose.backArmDX = Math.sin(phase) * armAmp;
      pose.torsoDY = -Math.abs(Math.sin(phase)) * 1.5;
      pose.headDY = pose.torsoDY;
      break;
    }
    case 'attack1': {
      const peak = hitFrame ?? Math.floor(frameCount / 2);
      const spread = Math.max(1, peak);
      const punch = Math.max(0, 1 - Math.abs(frameIndex - peak) / spread);
      pose.frontArmPunch = punch;
      pose.torsoDX = punch * 3;
      pose.backArmDX = -punch * 2;
      break;
    }
    case 'attack2': {
      const peak = hitFrame ?? Math.floor(frameCount / 2);
      const spread = Math.max(1, peak);
      const kick = Math.max(0, 1 - Math.abs(frameIndex - peak) / spread);
      pose.frontLegKick = kick;
      pose.torsoDX = kick * 2;
      pose.backArmDX = kick * 4;
      pose.frontArmDX = -kick * 4;
      break;
    }
    case 'hurt': {
      const recoil = 3 + frameIndex * 3;
      pose.torsoDX = -recoil;
      pose.headDX = -recoil;
      pose.backArmDX = -3;
      pose.frontArmDX = -3;
      pose.flash = frameIndex === 0;
      break;
    }
    case 'ko': {
      pose.torsoDY = t * 8;
      pose.headDY = t * 10;
      pose.headDX = t * 6;
      pose.frontLegDX = t * 8;
      pose.backLegDX = -t * 6;
      break;
    }
    default:
      break;
  }

  return pose;
}

function part(canvas, x, y, w, h, color, outline) {
  if (outline) {
    canvas.fillRect(x - 1, y - 1, w + 2, h + 2, outline);
  }
  canvas.fillRect(x, y, w, h, color);
}

/**
 * Draws one animation frame for a character/enemy into `canvas` at the
 * given frame-cell origin (ox, oy), scaled to `frameSize`.
 */
export function drawCharacterFrame(canvas, ox, oy, frameSize, animState, palette) {
  const s = frameSize / BASE;
  const pose = getPose(animState);
  const outline = palette.outline;
  const X = (bx) => ox + bx * s;
  const Y = (by) => oy + by * s;
  const W = (bw) => bw * s;
  const H = (bh) => bh * s;

  // Back leg (drawn first, sits behind the torso).
  part(
    canvas,
    X(CENTER_X - LIMB_W + pose.backLegDX),
    Y(HIP_Y + pose.backLegDY),
    W(LIMB_W),
    H(LEG_LEN),
    palette.pants,
    outline
  );

  // Back arm.
  part(
    canvas,
    X(CENTER_X + 9 + pose.backArmDX),
    Y(SHOULDER_Y + pose.backArmDY),
    W(ARM_W),
    H(ARM_LEN),
    palette.torsoShade,
    outline
  );

  // Torso.
  part(
    canvas,
    X(CENTER_X - TORSO_W / 2 + pose.torsoDX),
    Y(TORSO_Y + pose.torsoDY),
    W(TORSO_W),
    H(TORSO_H),
    palette.torso,
    outline
  );

  // Head (skin block + hair cap).
  part(
    canvas,
    X(CENTER_X - HEAD_SIZE / 2 + pose.headDX),
    Y(HEAD_Y + pose.headDY),
    W(HEAD_SIZE),
    H(HEAD_SIZE),
    palette.skin,
    outline
  );
  canvas.fillRect(
    X(CENTER_X - HEAD_SIZE / 2 + pose.headDX),
    Y(HEAD_Y + pose.headDY),
    W(HEAD_SIZE),
    H(5),
    palette.hair
  );

  // Front leg — a normal hanging leg, or a horizontal kick when frontLegKick > 0.
  if (pose.frontLegKick > 0) {
    const kickLen = LEG_LEN * 0.4 + pose.frontLegKick * 20;
    part(
      canvas,
      X(CENTER_X + 1),
      Y(HIP_Y + 6 - pose.frontLegKick * 4),
      W(kickLen),
      H(LIMB_W),
      palette.pants,
      outline
    );
  } else {
    part(
      canvas,
      X(CENTER_X - 1 + pose.frontLegDX),
      Y(HIP_Y + pose.frontLegDY),
      W(LIMB_W),
      H(LEG_LEN),
      palette.pants,
      outline
    );
  }

  // Front arm — a normal hanging arm, or a horizontal punch when frontArmPunch > 0.
  if (pose.frontArmPunch > 0) {
    const punchLen = ARM_W * 3 + pose.frontArmPunch * 16;
    const armY = SHOULDER_Y + 2;
    part(
      canvas,
      X(CENTER_X + 8),
      Y(armY),
      W(punchLen),
      H(ARM_W),
      palette.skin,
      outline
    );
    if (palette.weapon && pose.frontArmPunch > 0.6) {
      // A small blade accessory at the fist, for weapon-carrying enemies.
      canvas.fillRect(X(CENTER_X + 8 + punchLen), Y(armY - 1), W(6), H(ARM_W + 2), palette.weapon);
    }
  } else {
    part(
      canvas,
      X(CENTER_X + 8 + pose.frontArmDX),
      Y(SHOULDER_Y + pose.frontArmDY),
      W(ARM_W),
      H(ARM_LEN),
      palette.skin,
      outline
    );
  }

  // Hit-flash overlay (first hurt frame) to sell "just got hit".
  if (pose.flash) {
    canvas.fillRect(ox, oy, frameSize, frameSize, [255, 255, 255, 90]);
  }
}

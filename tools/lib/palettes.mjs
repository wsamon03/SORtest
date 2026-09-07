/**
 * One color palette per character/enemy id. This is the main thing that
 * visually differentiates the procedurally-drawn placeholder sprites.
 */
export const PALETTES = {
  // Playable characters
  rook: {
    skin: [224, 172, 132, 255],
    hair: [58, 40, 30, 255],
    torso: [40, 96, 200, 255],
    torsoShade: [26, 64, 150, 255],
    pants: [50, 52, 62, 255],
    outline: [18, 18, 22, 255],
  },
  vex: {
    skin: [206, 150, 120, 255],
    hair: [176, 40, 96, 255],
    torso: [160, 32, 96, 255],
    torsoShade: [112, 20, 68, 255],
    pants: [42, 40, 55, 255],
    outline: [18, 18, 22, 255],
  },
  // Enemies
  grunt: {
    skin: [190, 160, 140, 255],
    hair: [50, 50, 50, 255],
    torso: [92, 112, 82, 255],
    torsoShade: [60, 80, 55, 255],
    pants: [70, 60, 50, 255],
    outline: [12, 12, 12, 255],
  },
  shiv: {
    skin: [200, 170, 130, 255],
    hair: [232, 210, 40, 255],
    torso: [45, 45, 45, 255],
    torsoShade: [24, 24, 24, 255],
    pants: [232, 210, 40, 255],
    weapon: [210, 212, 224, 255],
    outline: [10, 10, 10, 255],
  },
  bruiser: {
    skin: [150, 110, 90, 255],
    hair: [30, 20, 20, 255],
    torso: [130, 32, 32, 255],
    torsoShade: [88, 16, 16, 255],
    pants: [42, 32, 32, 255],
    outline: [10, 10, 10, 255],
  },
};

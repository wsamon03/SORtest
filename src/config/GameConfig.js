export const GameConfig = {
  width: 960,
  height: 540,
  // The player/enemies are confined to this Y range to fake depth on a
  // 2D side-on stage (classic beat-'em-up "walkable band").
  walkableBand: { top: 300, bottom: 470 },
  stageLength: 3200,
  comboWindowMs: 500,
};

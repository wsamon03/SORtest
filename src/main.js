import { GameConfig } from './config/GameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloaderScene } from './scenes/PreloaderScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { StageScene } from './scenes/StageScene.js';
import { UIScene } from './scenes/UIScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GameConfig.width,
  height: GameConfig.height,
  backgroundColor: '#0a0a0f',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, PreloaderScene, TitleScene, StageScene, UIScene, GameOverScene],
});

// Exposed for manual debugging in the browser console (e.g.
// window.__game.scene.getScene('Stage')).
window.__game = game;

import { EventBus } from '../utils/EventBus.js';

/** Plain rectangle/text HUD - no art dependency, driven entirely by EventBus. */
export class HUD {
  constructor(scene) {
    this.scene = scene;

    this.barBg = scene.add.rectangle(20, 20, 204, 20, 0x000000).setOrigin(0, 0).setScrollFactor(0);
    this.barFill = scene.add.rectangle(22, 22, 200, 16, 0xdd2222).setOrigin(0, 0).setScrollFactor(0);
    this.livesText = scene.add
      .text(20, 46, 'Lives: 3', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
      .setScrollFactor(0);
    this.scoreText = scene.add
      .text(scene.scale.width - 20, 20, 'Score: 0', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    this.onHealthChanged = this.onHealthChanged.bind(this);
    this.onLivesChanged = this.onLivesChanged.bind(this);
    this.onScoreChanged = this.onScoreChanged.bind(this);

    EventBus.on('health-changed', this.onHealthChanged);
    EventBus.on('lives-changed', this.onLivesChanged);
    EventBus.on('score-changed', this.onScoreChanged);

    scene.events.once('shutdown', () => {
      EventBus.off('health-changed', this.onHealthChanged);
      EventBus.off('lives-changed', this.onLivesChanged);
      EventBus.off('score-changed', this.onScoreChanged);
    });
  }

  onHealthChanged({ who, health, maxHealth }) {
    if (who !== 'player') return;
    const pct = Phaser.Math.Clamp(health / maxHealth, 0, 1);
    this.barFill.width = 200 * pct;
  }

  onLivesChanged({ lives }) {
    this.livesText.setText(`Lives: ${lives}`);
  }

  onScoreChanged({ score }) {
    this.scoreText.setText(`Score: ${score}`);
  }
}

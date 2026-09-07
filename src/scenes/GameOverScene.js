export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.result = data.result;
    this.score = data.score;
  }

  create() {
    const { width, height } = this.scale;
    const isWin = this.result === 'win';

    this.add
      .text(width / 2, height * 0.35, isWin ? 'STAGE CLEAR!' : 'GAME OVER', {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: isWin ? '#66ff66' : '#ff5555',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.5, `Score: ${this.score}`, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.65, 'Press Attack to return to Title', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    this.input.keyboard.once('keydown-J', () => this.returnToTitle());
    this.input.keyboard.once('keydown-Z', () => this.returnToTitle());
    this.input.keyboard.once('keydown-ENTER', () => this.returnToTitle());
  }

  returnToTitle() {
    this.scene.start('Boot');
  }
}

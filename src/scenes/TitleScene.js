export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  init(data) {
    this.entityRegistry = data.registry;
  }

  create() {
    const { width, height } = this.scale;
    this.selectedIndex = 0;

    this.add
      .text(width / 2, height * 0.18, 'RAGE STREETS', { fontFamily: 'monospace', fontSize: '48px', color: '#ffdd33' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.3, 'Choose your fighter', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.portraits = this.entityRegistry.characters.map((entry, i) => {
      const x = width / 2 + (i - (this.entityRegistry.characters.length - 1) / 2) * 180;
      const y = height * 0.55;
      const sprite = this.add.sprite(x, y, entry.id).setScale(2.5);
      sprite.play(`${entry.id}-idle`);
      this.add
        .text(x, y + 90, entry.id.toUpperCase(), { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
        .setOrigin(0.5);
      return { sprite, id: entry.id, x, y };
    });

    this.selectionBox = this.add.rectangle(0, 0, 110, 170).setStrokeStyle(3, 0xffdd33);
    this.updateSelectionBox();

    this.add
      .text(width / 2, height * 0.85, 'Left/Right: choose    Attack/Enter: start', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    const nav = this.input.keyboard.addKeys('LEFT,A,RIGHT,D,ENTER,J,Z');
    this.input.keyboard.on('keydown-LEFT', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-A', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-D', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-ENTER', () => this.start());
    this.input.keyboard.on('keydown-J', () => this.start());
    this.input.keyboard.on('keydown-Z', () => this.start());
    this.navKeys = nav;
  }

  moveSelection(dir) {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + dir, 0, this.portraits.length);
    this.updateSelectionBox();
  }

  updateSelectionBox() {
    const p = this.portraits[this.selectedIndex];
    this.selectionBox.setPosition(p.x, p.y);
  }

  start() {
    const characterId = this.portraits[this.selectedIndex].id;
    this.scene.start('Stage', { registry: this.entityRegistry, characterId });
  }
}

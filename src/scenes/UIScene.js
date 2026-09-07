import { HUD } from '../ui/HUD.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  create() {
    this.hud = new HUD(this);
  }
}

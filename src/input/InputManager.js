const ACTIONS = ['up', 'down', 'left', 'right', 'attack', 'jump', 'pause'];

/**
 * Engine-agnostic action state. Input sources (keyboard now, touch/gamepad
 * later for a mobile build) write into this via setState(); every gameplay
 * class reads from this via isDown()/justPressed() and never touches
 * Phaser's input APIs directly. This is the seam that keeps adding a new
 * input source purely additive.
 */
export class InputManager {
  constructor() {
    this.actions = Object.fromEntries(ACTIONS.map((a) => [a, false]));
    this.prevActions = { ...this.actions };
  }

  setState(partial) {
    this.prevActions = { ...this.actions };
    Object.assign(this.actions, partial);
  }

  isDown(action) {
    return !!this.actions[action];
  }

  justPressed(action) {
    return !!this.actions[action] && !this.prevActions[action];
  }
}

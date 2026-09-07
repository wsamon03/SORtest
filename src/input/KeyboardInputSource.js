/**
 * The only file in the game that talks to scene.input.keyboard directly.
 * Translates key state into the generic InputManager action state each
 * frame. Adding a touch or gamepad source later means writing a sibling
 * class that calls the same inputManager.setState() - no other file needs
 * to change.
 */
export class KeyboardInputSource {
  constructor(scene, inputManager) {
    this.inputManager = inputManager;
    this.keys = scene.input.keyboard.addKeys('W,S,A,D,J,K,P,UP,DOWN,LEFT,RIGHT,Z,X,ESC');
  }

  update() {
    const k = this.keys;
    this.inputManager.setState({
      up: k.W.isDown || k.UP.isDown,
      down: k.S.isDown || k.DOWN.isDown,
      left: k.A.isDown || k.LEFT.isDown,
      right: k.D.isDown || k.RIGHT.isDown,
      attack: k.J.isDown || k.Z.isDown,
      jump: k.K.isDown || k.X.isDown,
      pause: k.P.isDown || k.ESC.isDown,
    });
  }
}

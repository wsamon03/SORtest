/** Thin wrapper around the main camera: X-only scroll-follow plus a
 * lock/unlock API WaveSpawner uses for the classic "room lock" mechanic. */
export class CameraController {
  constructor(scene, stageLength) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    this.stageLength = stageLength;
    this.lockedMaxX = null;
    this.camera.setBounds(0, 0, stageLength, scene.scale.height);
  }

  follow(target) {
    this.camera.startFollow(target, true, 0.12, 0.12);
    this.camera.setDeadzone(120, this.scene.scale.height);
  }

  lockMaxX(x) {
    this.lockedMaxX = Math.min(x, this.stageLength);
    this.camera.setBounds(0, 0, this.lockedMaxX, this.scene.scale.height);
  }

  unlock() {
    this.lockedMaxX = null;
    this.camera.setBounds(0, 0, this.stageLength, this.scene.scale.height);
  }
}

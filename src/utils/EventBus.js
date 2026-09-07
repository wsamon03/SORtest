// A single cross-scene event emitter (health/score/wave/etc. events).
// Phaser is loaded globally via the CDN <script> tag in index.html.
export const EventBus = new Phaser.Events.EventEmitter();

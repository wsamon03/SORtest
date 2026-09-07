/**
 * A tiny generic finite state machine. `states` maps a state name to
 * optional `enter(context)`, `update(context, dt)` and `exit(context)`
 * hooks; `context` is passed through untouched (usually the owning entity).
 */
export class StateMachine {
  constructor(initialState, states, context) {
    this.states = states;
    this.context = context;
    this.state = initialState;
    this.states[this.state]?.enter?.(this.context);
  }

  transition(next, payload) {
    if (next === this.state) return;
    this.states[this.state]?.exit?.(this.context);
    this.state = next;
    this.states[this.state]?.enter?.(this.context, payload);
  }

  update(dt) {
    this.states[this.state]?.update?.(this.context, dt);
  }

  is(name) {
    return this.state === name;
  }
}

import type { State } from "Galena/State";
import type { Middleware } from "Middleware/Middleware";

export class Galena<T extends Record<string, State>> {
  private readonly state: T;
  constructor(initialState: T) {
    this.state = initialState;
  }

  public getState<K extends keyof T>(key: K): T[K] {
    return this.state[key];
  }

  public subscribe(name: keyof T, callback: (nextState: State) => void) {
    const state = this.getState(name);
    return state.subscribe(callback);
  }

  public registerMiddleware(middleware: Middleware) {
    for (const key in this.state) {
      const state = this.getState(key);
      state.registerMiddleware(middleware);
    }
  }
}

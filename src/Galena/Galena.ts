import { AutoIncrementingID } from "@figliolia/event-emitter";

import type { Middleware } from "Middleware/Middleware";

import { State } from "Galena/State";

export class Galena<T extends Record<string, State<any>>> {
  public readonly state = {} as T;
  private middleware: Middleware[] = [];
  private readonly IDs = new AutoIncrementingID();
  private subscriptions = new Map<string, [state: string, ID: string][]>();
  constructor(middleware: Middleware[] = []) {
    this.middleware = middleware;
  }

  public createSlice<S extends any>(name: string, initialState: S): State<S> {
    const state = new State(name, initialState);
    state.registerMiddleware(...this.middleware);
    this.mutable[name] = state;
    this.reindexSubscriptions(name);
    return state;
  }

  private get mutable() {
    return this.state as Record<string, State>;
  }

  public subscribe(callback: (state: Galena<T>) => void) {
    const subscriptionID = this.IDs.get();
    const stateSubscriptions: [state: string, ID: string][] = [];
    for (const key in this.state) {
      stateSubscriptions.push([
        key,
        this.state[key].subscribe(() => {
          callback(this);
        }),
      ]);
    }
    this.subscriptions.set(subscriptionID, stateSubscriptions);
    return subscriptionID;
  }

  public unsubscribe(ID: string) {
    const IDs = this.subscriptions.get(ID);
    if (IDs) {
      for (const [state, ID] of IDs) {
        this.state[state].unsubscribe(ID);
      }
    }
  }

  private reindexSubscriptions(name: string) {
    for (const [ID, value] of this.subscriptions) {
      for (const [state, subscriptionID] of value) {
        const callback = this.state[state]["emitter"]
          .get(state)
          ?.get(subscriptionID);
        if (callback) {
          value.push([
            name,
            this.state[name].subscribe(() => {
              void callback(this.state);
            }),
          ]);
          this.subscriptions.set(ID, value);
          break;
        }
      }
    }
  }
}

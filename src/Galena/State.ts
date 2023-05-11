import { Reactivity } from "./Reactivity";

export class State<T extends any = any> extends Reactivity<T> {
  public readonly name: string;
  public currentState: T;
  public readonly initialState: T;
  constructor(name: string, initialState: T) {
    super();
    this.name = name;
    this.currentState = initialState;
    this.initialState = State.clone(initialState);
  }

  public getState() {
    return this.currentState as Readonly<T>;
  }

  public get<K extends keyof T>(key: K): T[K] {
    return this.currentState[key];
  }

  public default<K extends keyof T>(key: K): T[K] {
    return this.initialState[key];
  }

  public update = this.mutation((func: (state: T) => void) => {
    func(this.currentState);
  });

  public reset = this.mutation(() => {
    this.currentState = State.clone(this.initialState);
  });

  public subscribe(callback: (nextState: State<T>) => void) {
    return this.emitter.on(this.name, callback);
  }

  public unsubscribe(ID: string) {
    return this.emitter.off(this.name, ID);
  }

  public mutation<F extends (...args: any[]) => any>(func: F) {
    return async (...args: Parameters<F>): Promise<ReturnType<F>> => {
      this.onBeforeUpdate(this);
      const returnValue = func(...args);
      await Promise.resolve(this.emitter.emit(this.name, this));
      this.onUpdate(this);
      return returnValue;
    };
  }

  private static clone<T>(state: T): T {
    if (Array.isArray(state)) {
      return [...state] as T;
    }
    if (state instanceof Set) {
      return new Set(state) as T;
    }
    if (state instanceof Map) {
      return new Map(state) as T;
    }
    if (state && typeof state === "object") {
      return { ...state } as T;
    }
    return state;
  }
}

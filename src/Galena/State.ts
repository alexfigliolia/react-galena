import { EventEmitter } from "@figliolia/event-emitter";
import type { Middleware } from "Middleware/Middleware";
import { SupportedEvents } from "Middleware/types";

export class State<
  N extends string = string,
  T extends Record<string, any> = Record<string, any>
> extends EventEmitter<Record<N, State<N, T>>> {
  public readonly name: N;
  protected currentState: T;
  public readonly initialState: T;
  public readonly middlewares: Middleware[] = [];
  constructor(name: N, initialState: T) {
    super();
    this.name = name;
    this.initialState = initialState;
    this.currentState = initialState;
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

  public update = this.mutation(
    <U extends Partial<T>, K extends Extract<keyof U, string>>(
      update: Pick<T, K>
    ) => {
      for (const key in update) {
        this.currentState[key] = update[key];
      }
    }
  );

  public reset = this.mutation(() => {
    this.currentState = this.initialState;
  });

  public mutation<F extends (...args: any[]) => any>(func: F) {
    return async (...args: Parameters<F>): Promise<ReturnType<F>> => {
      this.emitMiddlewareEvents(SupportedEvents.onBeforeUpdate);
      const returnValue = func(...args);
      await Promise.resolve(this.emit(this.name, this));
      this.emitMiddlewareEvents(SupportedEvents.onUpdate);
      return returnValue;
    };
  }

  public subscribe(callback: (nextState: State<N, T>) => void) {
    return this.on(this.name, callback);
  }

  public registerMiddleware(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  private emitMiddlewareEvents(event: SupportedEvents) {
    this.middlewares.forEach((middleware) => {
      middleware[event](this as State);
    });
  }
}

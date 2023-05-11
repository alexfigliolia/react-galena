import { EventEmitter } from "@figliolia/event-emitter";

import type { Middleware } from "Middleware/Middleware";

import type { State } from "Galena/State";

export class Reactivity<T extends any = any> {
  protected readonly emitter = new EventEmitter<{
    [key: State<T>["name"]]: State<T>;
  }>();
  protected readonly middlewares: Middleware[] = [];

  public registerMiddleware(...middleware: Middleware[]) {
    this.middlewares.push(...middleware);
  }

  protected onBeforeUpdate(state: State<T>) {
    this.middlewares.forEach((middleware) => {
      middleware.onBeforeUpdate(state);
    });
  }

  protected onUpdate(state: State<T>) {
    this.middlewares.forEach((middleware) => {
      middleware.onUpdate(state);
    });
  }
}

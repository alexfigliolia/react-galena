import { EventEmitter } from "@figliolia/event-emitter";

import type { State } from "Galena/State";
import type { MiddlewareEvent } from "Middleware/types";
import { SupportedEvents } from "Middleware/types";

export class Middleware {
  public static Emitter = new EventEmitter<MiddlewareEvent>();
  constructor() {
    const extension = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(extension);
    methods.forEach((event) => {
      if (Middleware.validateEvent(event)) {
        Middleware.Emitter.on(SupportedEvents[event], this[event]);
      }
    });
  }

  private static validateEvent(event: string): event is SupportedEvents {
    return event in SupportedEvents;
  }

  onUpdate(state: State) {}
  onBeforeUpdate(state: State) {}
}

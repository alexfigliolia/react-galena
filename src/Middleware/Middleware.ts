import { EventEmitter } from "@figliolia/event-emitter";
import type { State } from "Galena/State";
import type { MiddlewareEvent } from "Middleware/types";
import { SupportedEvents } from "Middleware/types";

export class Middleware<T extends State = State> {
  public static Emitter = new EventEmitter<MiddlewareEvent>();
  constructor() {
    const extension = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(extension);
    methods.forEach((event) => {
      if (Middleware.validateEvent(event)) {
        // @ts-ignore
        Middleware.Emitter.on(SupportedEvents[event], this[event]);
      }
    });
  }

  private static validateEvent(event: string): event is SupportedEvents {
    return event in SupportedEvents;
  }

  onUpdate(nextState: T) {}
  onBeforeUpdate(currentState: T) {}
}

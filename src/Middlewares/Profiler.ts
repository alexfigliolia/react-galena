import { Middleware } from "Middleware/Middleware";
import type { State } from "Galena/State";

export class Profiler extends Middleware {
  private threshold: number;
  private startTime: number | null = null;
  constructor(threshold = 16) {
    super();
    this.threshold = threshold;
  }
  onBeforeUpdate(_: State) {
    this.startTime = performance.now();
  }

  onUpdate(nextState: State) {
    if (this.startTime) {
      const endTime = performance.now();
      const diff = endTime - this.startTime;
      if (diff > this.threshold) {
        console.warn("Slow state transition detected", nextState);
        console.warn(`The last transition took ${diff}ms`);
      }
    }
  }
}

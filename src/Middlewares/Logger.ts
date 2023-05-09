import { Middleware } from "Middleware/Middleware";
import type { State } from "galena/State";

export class Logger extends Middleware {
  private previousState: State | null = null;

  override onBeforeUpdate(currentState: State) {
    this.previousState = currentState;
  }

  override onUpdate(nextState: State) {
    console.log("Mutation:", nextState.name, "@", this.time);
    console.log("      Previous State:", this.previousState);
    console.log("      Next State    :", nextState);
    this.previousState = null;
  }

  private get time() {
    const date = new Date();
    const mHours = date.getHours();
    const hours = mHours > 12 ? mHours - 12 : mHours;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
  }
}

import type { State } from "galena";
import { useEffect } from "react";

export const stateHookFactory = <T extends State>(state: T) => {
  return function useGalenaState<F extends (state: T) => any>(callback: F) {
    useEffect(() => {
      // @ts-ignore
      const ID = state.subscribe(callback);
      return () => {
        state.unsubscribe(ID);
      };
    }, []);
  };
};

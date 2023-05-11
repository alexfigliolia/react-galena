import type { Galena } from "galena";
import { useEffect } from "react";

export const hookFactory = <T extends Galena<any>>(galena: T) => {
  return function useGalena<F extends (state: T["state"]) => any>(callback: F) {
    useEffect(() => {
      const ID = galena.subscribe(callback);
      return () => {
        galena.unsubscribe(ID);
      };
    }, []);
  };
};

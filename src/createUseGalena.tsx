import type { Galena } from "galena";
import { useEffect, useState } from "react";

/**
 * ## Create Use Galena
 *
 * `useState` hook generation for your `Galena` instances! To create
 * a `useState` hook to use in your React Components, simply create
 * your state, then call `createUseGalena()` passing in your `Galena`
 * instance:
 *
 * ```typescript
 * import { Galena } from "galena";
 * import { createUseGalena } from "react-galena";
 *
 * const MyState = new Galena(...middleware);
 *
 * // Create a state fragment
 * MyState.createSlice("listItems", {
 *   list: [1, 2, 3, 4]
 * });
 *
 * export const useMyState = createUseGalena(MyState);
 * ```
 *
 * ### Using the useMyState Hook
 *
 * ```typescript
 * import { useMyState } from "./MyState";
 *
 * const Component = () => {
 *   const total = useMyState(state => state.listItems.get("list").length);
 *
 *   return <div>{total}</div>
 * }
 * ```
 */
export const createUseGalena = <T extends Galena<any>>(galena: T) => {
  return function useGalena<F extends (state: T["state"]) => any>(
    selection: F
  ) {
    const [state, setState] = useState<ReturnType<F>>(selection(galena.state));
    useEffect(() => {
      const ID = galena.subscribe((state) => {
        setState(selection(state));
      });
      return () => {
        galena.unsubscribe(ID);
      };
    }, []);
    return state;
  };
};
import type { State } from "galena";
import { useEffect, useRef, useState } from "react";

/**
 * ## State Hook Factory
 *
 * `useState` hook generation for your `State` instances! To create
 * a `useState` hook to use in your React Components, simply create
 * your slice, then call `createUseState()` passing in your `State`
 * instance:
 *
 * ```typescript
 * import { Galena, State } from "galena";
 * import { createUseState } from "react-galena";
 *
 * const ListItems = new Galena(...middleware).createSlice("listItems", {
 *   list: [1, 2, 3, 4]
 * });
 *
 * // or without using a Galena instance:
 *
 * const ListItems = new State("listItems", {
 *   list: [1, 2, 3, 4]
 * });
 *
 * export const useListItems = createUseState(ListItems);
 * ```
 *
 * ### Using the useListItems Hook
 *
 * ```typescript
 * import { useListItems } from "./ListItems";
 *
 * const Component = () => {
 *   const total = useListItems(state => state.list.length);
 *
 *   return <div>{total}</div>;
 * }
 * ```
 */
export const createUseState = <T extends State>(slice: T) => {
  return function useGalenaState<F extends (slice: T["state"]) => any>(
    selection: F
  ) {
    const instanceRef = useRef(slice);
    const [state, setState] = useState<ReturnType<F>>(
      selection(instanceRef.current.state)
    );
    useEffect(() => {
      const sliceReference = instanceRef.current;
      const ID = sliceReference.subscribe((state) => {
        setState(selection(state.state));
      });
      return () => {
        sliceReference.unsubscribe(ID);
      };
    }, []);
    return state;
  };
};

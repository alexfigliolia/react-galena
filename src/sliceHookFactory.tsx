import type { State } from "galena";
import { useEffect, useState } from "react";

/**
 * ## Slice Hook Factory
 *
 * `useState` hook generation for your `State` instances! To create
 * a `useState` hook to use in your React Components, simply create
 * your slice, then call `sliceHookFactory()` passing in your `State`
 * instance:
 *
 * ```typescript
 * import { Galena, State } from "galena";
 * import { sliceHookFactory } from "react-galena";
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
 * export const useListItems = sliceHookFactory(ListItems);
 * ```
 *
 * ### Using the useListItems Hook
 *
 * ```typescript
 * import { useListItems } from "./ListItems";
 *
 * const Component = () => {
 *   const total = useListItems(state => state.get("list").length);
 *
 *   return <div>{total}</div>
 * }
 * ```
 */
export const sliceHookFactory = <T extends State>(slice: T) => {
  return function useGalenaState<F extends (slice: T) => any>(selection: F) {
    const [state, setState] = useState<ReturnType<F>>(selection(slice));
    useEffect(() => {
      const ID = slice.subscribe((state) => {
        setState(selection(state as T));
      });
      return () => {
        state.unsubscribe(ID);
      };
    }, []);
    return state;
  };
};

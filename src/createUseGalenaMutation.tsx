import type { Galena, State } from "galena";
import { useRef } from "react";

/**
 * ## Create Use Galena Mutation
 *
 * A hook factory for connected arbitrary mutations to your
 * `Galena` instances. To create a `useGalenaMutation` hook,
 * simply declare your state and call `useGalenaMutation()`
 * passing in your `Galena` instance:
 *
 * ```typescript
 * import { Galena } from "galena";
 * import { useGalenaMutation } from "react-galena";
 *
 * const AppState = new Galena();
 *
 * // Create a slice of AppState
 *
 * const ListItems = AppState.createSlice("listItems", {
 *   list: [1, 2, 3, 4]
 * });
 *
 * export const useAppStateMutation = useGalenaMutation(AppState);
 * ```
 *
 * ### Using Your useAppStateMutation Hook
 *
 * ```typescript
 * import { useAppStateMutation } from "./AppState";
 *
 * const MyComponent = () => {
 *   const addListItem = useAppStateMutation("listItems", state => {
 *      state.list.push(state.list.length);
 *   });
 *
 *   return <button onClick={addListItem}>Click Me!</button>;
 * }
 * ```
 */
export const createUseGalenaMutation = <T extends Galena<any>>(state: T) => {
  return function useGalenaMutation<
    K extends keyof T["state"],
    P extends any[],
    M extends (state: T["state"][K]["state"], ...args: P) => any
  >(key: K, mutation: M) {
    const slice = state.getSlice(key);
    const ref = useRef(
      slice.mutation((...args: P) => mutation(slice.state, ...args))
    );
    return ref.current;
  };
};

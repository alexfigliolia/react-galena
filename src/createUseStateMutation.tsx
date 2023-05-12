import type { State } from "galena";
import { useRef } from "react";

/**
 * ## Create Use State Mutation
 *
 * A hook factory for connected arbitrary mutations to your
 * `State` instances. To create a `useStateMutation` hook,
 * simply declare your state and call `createUseStateMutation()`
 * passing in your `State` instance:
 *
 * ```typescript
 * import { State } from "galena";
 * import { createUseStateMutation } from "react-galena";
 *
 * const ListItems = new State("listItems", {
 *   list: [1, 2, 3, 4]
 * });
 *
 * export const useMutateListItems = createUseStateMutation(ListItems);
 * ```
 *
 * ### Using Your useMutateListItems Hook
 *
 * ```typescript
 * import { useMutateListItems } from "./ListItemsState";
 *
 * const MyComponent = () => {
 *   const addListItem = useMutateListItems(state => {
 *      state.list.push(state.list.length);
 *   })
 *
 *   return <button onClick={addListItem}>Click Me!</button>
 * }
 * ```
 */
export const createUseStateMutation = <T extends State<any>>(slice: T) => {
  return function useStateMutation<
    M extends (slice: T["currentState"]) => void | Promise<void>
  >(mutation: M) {
    const ref = useRef(slice.mutation(() => mutation(slice.currentState)));
    return ref.current;
  };
};

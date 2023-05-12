import { Component, type ComponentType } from "react";
import type { State } from "galena";

import type { Subtract } from "./types";

/**
 * ## Connect State
 *
 * A HOC factory for creating React Components connected
 * to your State slices. To create an HOC for your slice
 * of state, simply create your slice, then call `connectState()`
 * passing in your `State` instance:
 *
 * ```typescript
 * import { State, Galena } from "galena";
 * import { connectState } from "react-galena";
 *
 * export const ListItems = new Galena().createSlice("listItems", {
 *   list: [1, 2, 3, 4]
 * });
 *
 * // Or without a `Galena` instance
 *
 * export const ListItems = new State("listItems", {
 *   list: [1, 2, 3, 4]
 * })
 *
 * export const ConnectListItems = connectState(ListItems);
 * ```
 *
 * ### Use Your New Connect Function!
 * Your connect function can then be used in any component
 * that needs to be wired into your ListItems slice:
 *
 * ```typescript
 * import { ConnectListItems, ListItems } from "./ListItems";
 *
 * const MyComponent: FC<{ total: number }> = ({ total }) => {
 *   return <div>{total}</div>
 * }
 *
 * const selectProps = (
 *   state: typeof ListItems,
 *   ownProps
 * ) => {
 *   return { total: state.get("list").length }
 * }
 *
 * export const Counter = ConnectListItems(selectProps)(MyComponent);
 * ```
 *
 * This composition pattern is similar to what one might find in
 * a library like redux, but with a few optimizations!
 *
 * 1. Galena completely bypasses the need for using the Context API
 * to share state across components and features. Unlike the Context
 * API, Galena is built for rapid and frequent state updates. All
 * rendering implications scoped entirely to your connected components!
 * 2. There is also no need to add a `Provider` for Galena anywhere in your
 * React tree. You can declare your state anywhere, at anytime, and your
 * connected components will be able to access it without:
 *    1. Any specific component hierarchies
 *    2. Requiring you to declare all your state while your app is mounting
 */
export const connectState = <StateInstance extends State>(
  state: StateInstance
) => {
  return <
    SelectorFunction extends (
      state: StateInstance["currentState"],
      ownProps: any
    ) => Record<string, any>
  >(
    selection: SelectorFunction
  ) => {
    return <ComponentProps extends ReturnType<SelectorFunction>>(
      WrappedComponent: ComponentType<ComponentProps>
    ): ComponentType<
      Subtract<ComponentProps, ReturnType<SelectorFunction>>
    > => {
      return class GalenaComponent extends Component<
        Subtract<ComponentProps, ReturnType<SelectorFunction>>,
        ReturnType<SelectorFunction>
      > {
        state: any;
        listener: string;
        constructor(
          props: Subtract<ComponentProps, ReturnType<SelectorFunction>>
        ) {
          super(props);
          this.state = selection(state.currentState, this.props);
          this.listener = state.subscribe((nextState) => {
            this.setState(selection(nextState.currentState, this.props));
          });
        }

        componentWillUnmount() {
          state.unsubscribe(this.listener);
        }

        render() {
          return <WrappedComponent {...this.props} {...this.state} />;
        }
      };
    };
  };
};

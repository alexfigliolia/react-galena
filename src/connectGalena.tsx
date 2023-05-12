import { Component, type ComponentType } from "react";
import type { Galena } from "galena";

import type { Subtract } from "./types";

/**
 * ## Connect State
 *
 * A HOC factory for creating React Components connected
 * to your Galena State. To create your HOC simply declare
 * your state, then call `connectGalena()` passing in your
 * `Galena` instance
 *
 * ```typescript
 * import { Galena } from "galena";
 * import { connectGalena } from "react-galena";
 *
 * export const AppState = new Galena(...middleware);
 *
 * AppState.createSlice("listItems", { list: [1, 2, 3, 4] });
 *
 * export const connect = connectGalena(AppState);
 * ```
 * ### Use Your New Connect Function!
 *
 * Your connect function can then be used in any component
 * that needs to be wired into your Galena State:
 *
 * ```typescript
 * import { connect, AppState } from "./AppState";
 *
 * const MyComponent: FC<{ total: number }> = ({ total }) => {
 *   return <div>{total}</div>
 * }
 *
 * const selectProps = (
 *   state: typeof AppState["currentState"],
 *   ownProps
 * ) => {
 *   return { total: state.listItems.get("list").length }
 * }
 *
 * export const Counter = connect(selectProps)(MyComponent);
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
export const connectGalena = <StateInstance extends Galena<any>>(
  state: StateInstance
) => {
  return <
    SelectorFunction extends (
      state: StateInstance["state"],
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
        listener: string;
        state: any;
        constructor(
          props: Subtract<ComponentProps, ReturnType<SelectorFunction>>
        ) {
          super(props);
          this.state = selection(state.state, this.props);
          this.listener = state.subscribe((nextState) => {
            this.setState(selection(nextState.state, this.props));
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

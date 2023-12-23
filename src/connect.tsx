import { Component, type ComponentType } from "react";

import type { ReactiveInterface, Subtract } from "./types";
import { subscribe, unsubscribe } from "./extractAPI";

/**
 * ### Connect
 *
 * A factory for generating Higher Order Components from `Galena`
 * instances and/or units of `State`. `connect()` provides an
 * API for React Components to select state values and receive
 * them as props
 *
 * ### Composing State and HOC's
 *
 * ```typescript
 * // AppState.ts
 * import { Galena } from "@figliolia/galena";
 * import { connect } from "@figliolia/react-galena";
 *
 * const AppState = new Galena();
 *
 * const NavigationState = AppState.composeState("navigation", {
 *   route: "/",
 *   permittedRoutes: "/**"
 * });
 *
 * export const connectAppState = connect(AppState);
 * // or using your Navigation Unit
 * export const connectNavigation = connect(NavigationState);
 * ```
 *
 * ### Using Your Connected HOC's
 * ```tsx
 * import { connectAppState, connectNavigation } from "./AppState";
 *
 * const MyComponent = ({ route }) => {
 *   return (
 *     <div>The current route is {route}</div>
 *   );
 * }
 *
 * export default connectAppState(({ navigation }) => ({
 *   route: navigation.state.route
 * }))(MyComponent);
 *
 * // Or using your `connectNavigation()` method
 * export default connectNavigation((state) => ({
 *   route: state.route
 * }))(MyComponent);
 * ```
 */
export const connect = <StateInstance extends ReactiveInterface>(
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
          this.update = this.update.bind(this);
          this.listener = subscribe(state)(this.update);
          this.state = selection(state.state, this.props);
        }

        static displayName = `GalenaComponent(${
          WrappedComponent.displayName || WrappedComponent.name || "Component"
        })`;

        public override componentWillUnmount() {
          unsubscribe(state)(this.listener);
        }

        private update(nextState: StateInstance["state"]) {
          this.setState(selection(nextState, this.props));
        }

        public override render() {
          return <WrappedComponent {...this.props} {...this.state} />;
        }
      };
    };
  };
};

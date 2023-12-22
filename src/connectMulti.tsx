import { PureComponent, type ComponentType } from "react";
import type { Subtract, DerivedSelector, ReactiveInterface } from "./types";
import { subscribe, unsubscribe } from "./extractAPI";

/**
 * # Connect Multi
 *
 * A HOC factory for generating Higher Order Components from multiple
 * `Galena` instances and/or units of `State`. `connectMulti()`
 * provides an API for React Components to select state values
 * and receive them as props. It's design is to prevent several layers
 * of state-connected HOC's from feeding a single component at a time.
 * `connectMulti()` adds only a single wrapper to your components
 * regardless of the number of state instances you pass it. Think of
 * it as the merging of what *would* be several HOC's!
 *
 * ## Composing State and HOC's
 *
 * ```typescript
 * // AppState.ts
 * import { State } from "@figliolia/galena";
 * import { connectMulti } from "@figliolia/react-galena";
 *
 * const NavigationState = new State("navigation", {
 *   route: "/",
 *   permittedRoutes: "/**"
 * });
 *
 * const SettingsState = new State("settings", {
 *   darkMode: true,
 *   backgroundMusic: false,
 * });
 *
 * export const connectAll = connectMulti(NavigationState, SettingsState);
 * ```
 *
 * ## Using Your Connected HOC's
 * ```tsx
 * import { connectAll } from "./AppState";
 *
 * const MyComponent = ({ route, backgroundMusic }) => {
 *   return (
 *     <div>The current route is {route}</div>
 *     <div>Background music is{backgroundMusic ? " " : " not"} playing</div>
 *   );
 * }
 *
 * const selector = (navigation, settings) => ({
 *   route: navigation.route,
 *   backgroundMusic: settings.backgroundMusic
 * });
 *
 * export default connectAll(selector)(MyComponent);
 * ```
 */
export const connectMulti = <StateInstances extends ReactiveInterface[]>(
  ...states: StateInstances
) => {
  return <Selector extends DerivedSelector<StateInstances>>(
    selector: Selector
  ) => {
    return <ComponentProps extends ReturnType<Selector>>(
      WrappedComponent: ComponentType<ComponentProps>
    ): ComponentType<Subtract<ComponentProps, ReturnType<Selector>>> => {
      return class GalenaMultiComponent extends PureComponent<
        Subtract<ComponentProps, ReturnType<Selector>>,
        ReturnType<Selector>
      > {
        state: any;
        listeners: string[];
        constructor(props: Subtract<ComponentProps, ReturnType<Selector>>) {
          super(props);
          this.state = this.computeSelector();
          this.listeners = this.bindListeners();
        }

        static displayName = `GalenaDerivedComponent(${
          WrappedComponent.displayName || WrappedComponent.name || "Component"
        })`;

        public override componentWillUnmount() {
          states.forEach((state, i) => {
            unsubscribe(state)(this.listeners[i]);
          });
        }

        private bindListeners() {
          return states.map((state) => {
            return subscribe(state)(() => {
              this.setState(this.computeSelector());
            });
          });
        }

        private computeSelector() {
          // @ts-ignore
          return selector(...states.map((s) => s.getState()));
        }

        public override render() {
          return <WrappedComponent {...this.props} {...this.state} />;
        }
      };
    };
  };
};

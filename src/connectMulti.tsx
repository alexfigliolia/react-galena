import { PureComponent, type ComponentType } from "react";

import type {
  Subtract,
  SelectorFuncs,
  ReactiveInterface,
  CombinedReturnTypes,
} from "./types";
import { subscribe, unsubscribe } from "./extractAPI";

/**
 * # Connect Multi (Experimental)
 *
 * A factory for generating Higher Order Components from multiple
 * `Galena` instances and/or units of `State`. `connectMulti()`
 * provides an API for React Components to select state values
 * and receive them as props
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
 * const selectRoute = (navigation) => ({
 *   route: navigation.route
 * });
 *
 * const selectBackgroundMusic = (settings) => ({
 *   backgroundMusic: settings.backgroundMusic
 * });
 *
 * export default connectAll(selectRoute, selectBackgroundMusic)(MyComponent);
 * ```
 */
export const connectMulti = <StateInstances extends ReactiveInterface[]>(
  ...states: StateInstances
) => {
  return <SelectorFunctions extends SelectorFuncs<StateInstances>>(
    ...selections: SelectorFunctions
  ) => {
    return <
      ComponentProps extends CombinedReturnTypes<
        StateInstances,
        SelectorFunctions
      >
    >(
      WrappedComponent: ComponentType<ComponentProps>
    ): ComponentType<
      Subtract<
        ComponentProps,
        CombinedReturnTypes<StateInstances, SelectorFunctions>
      >
    > => {
      return class GalenaMultiComponent extends PureComponent<
        Subtract<
          ComponentProps,
          CombinedReturnTypes<StateInstances, SelectorFunctions>
        >,
        CombinedReturnTypes<StateInstances, SelectorFunctions>
      > {
        state: any;
        listeners: string[];
        constructor(
          props: Subtract<
            ComponentProps,
            CombinedReturnTypes<StateInstances, SelectorFunctions>
          >
        ) {
          super(props);
          this.state = this.initialState;
          this.listeners = this.bindListeners();
        }

        static displayName = `GalenaMultiComponent(${
          WrappedComponent.displayName || WrappedComponent.name || "Component"
        })`;

        override componentWillUnmount() {
          states.forEach((state, i) => {
            unsubscribe(state)(this.listeners[i]);
          });
        }

        private get initialState() {
          return Object.assign(
            {},
            ...states.map((state, i) => {
              const selector = selections[i];
              return selector(state.state, this.props);
            })
          ) as CombinedReturnTypes<StateInstances, SelectorFunctions>;
        }

        private bindListeners() {
          return states.map((state, i) => {
            const selector = selections[i];
            return subscribe(state)((nextState: typeof state) => {
              // @ts-ignore
              this.setState(selector(nextState, this.props));
            });
          });
        }

        render() {
          return <WrappedComponent {...this.props} {...this.state} />;
        }
      };
    };
  };
};

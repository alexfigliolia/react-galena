import { Component, type ComponentType } from "react";
import type { Galena } from "galena";

import type { Subtract } from "./types";

export const connectGalena = <StateInstance extends Galena<any>>(
  state: StateInstance
) => {
  return <
    SelectorFunction extends (
      state: StateInstance["state"],
      ownProps: Record<string, any>
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

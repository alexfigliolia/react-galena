import { Component, type ComponentType } from "react";

import type { ReactiveInterface, Subtract } from "./types";
import { subscribe, unsubscribe } from "./extractAPI";

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

        componentWillUnmount() {
          unsubscribe(state)(this.listener);
        }

        private update(nextState: StateInstance["state"]) {
          this.setState(selection(nextState.state, this.props));
        }

        render() {
          return <WrappedComponent {...this.props} {...this.state} />;
        }
      };
    };
  };
};

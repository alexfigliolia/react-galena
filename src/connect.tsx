import { Component, type ComponentType } from "react";
import type { Galena, State } from "@figliolia/galena";
import type { Subtract } from "./types";

/**
 * ### connect
 *
 * An HOC generator for React Components connected to your state
 *
 * ```typescript
 * import { State, connect } from "@figliolia/galena";
 *
 * const MyState = new State() // or new Galena();
 * const connectMyState = connect(MyState);
 *
 * const MyComponent = props => {}
 *
 * const MyConnectedComponent = connectMyState(
 *   state => ({ data: state })
 * )(MyComponent);
 *
 * // MyConnectedComponent now receives `data` as props
 * ```
 */
export const connect = <StateInstance extends State<any> | Galena<any>>(
  state: StateInstance,
) => {
  type ScopedState = ReturnType<StateInstance["getState"]>;
  return <
    SelectorFunction extends (
      state: ScopedState,
      ownProps: any,
    ) => Record<string, any>,
  >(
    selection: SelectorFunction,
  ) => {
    type Selection = ReturnType<SelectorFunction>;
    return <ComponentProps extends Selection>(
      WrappedComponent: ComponentType<ComponentProps>,
    ): ComponentType<Subtract<ComponentProps, Selection>> => {
      type OwnProps = Subtract<ComponentProps, Selection>;
      return class GalenaComponent extends Component<OwnProps, Selection> {
        override state: any;
        private listener: (() => void) | null = null;
        constructor(props: OwnProps) {
          super(props);
          this.update = this.update.bind(this);
          this.state = selection(state.getState(), this.props);
        }

        static displayName = `GalenaComponent(${
          (WrappedComponent.displayName ?? WrappedComponent.name) || "Component"
        })`;

        public override componentDidMount() {
          this.listener = state.subscribe(state => this.update(state));
        }

        public override UNSAFE_componentWillReceiveProps(nextProps: OwnProps) {
          if (nextProps !== this.props) {
            this.update(state.getState(), nextProps);
          }
        }

        public override shouldComponentUpdate(
          nextProps: OwnProps,
          nextState: Selection,
        ) {
          return nextState !== this.state || nextProps !== this.props;
        }

        public override componentWillUnmount() {
          if (this.listener) {
            this.listener();
            this.listener = null;
          }
        }

        private update(nextState: ScopedState, ownProps = this.props) {
          this.setState(selection(nextState, ownProps));
        }

        public override render() {
          return <WrappedComponent {...this.props} {...this.state} />;
        }
      };
    };
  };
};

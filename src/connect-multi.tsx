import { Component, type ComponentType } from "react";
import type { Galena, State } from "@figliolia/galena";
import type { DerivedArguments, DerivedSelector, Subtract } from "./types";

/**
 * ### connectMulti
 *
 * An HOC generator for React Components connected to multiple
 * instances of state at once
 *
 * ```typescript
 * import { State, connect } from "@figliolia/galena";
 *
 * const MyState1 = new State();
 * const MyState2 = new State();
 * const connectMyState = connectMulti(MyState1, MyState2);
 *
 * const MyComponent = props => {}
 *
 * const MyConnectedComponent = connectMyState(
 *   ([myState1, myState2]) => ({
 *     state1: myState1,
 *     state2: myState2,
 *   })
 * )(MyComponent);
 *
 * // MyConnectedComponent now receives `state1` and `state2` as props
 * ```
 */
export const connectMulti = <
  StateInstances extends (State<any> | Galena<any>)[],
>(
  ...states: StateInstances
) => {
  return <Selector extends DerivedSelector<StateInstances>>(
    selector: Selector,
  ) => {
    return <ComponentProps extends ReturnType<Selector>>(
      WrappedComponent: ComponentType<ComponentProps>,
    ): ComponentType<Subtract<ComponentProps, ReturnType<Selector>>> => {
      type OwnProps = Subtract<ComponentProps, ReturnType<Selector>>;
      return class GalenaMultiComponent extends Component<
        OwnProps,
        ReturnType<Selector>
      > {
        override state: any;
        listeners: (() => void)[] = [];
        constructor(props: OwnProps) {
          super(props);
          this.state = this.computeSelector();
        }

        static displayName = `GalenaMultiComponent(${
          WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"
        })`;

        public override componentDidMount() {
          this.listeners = this.bindListeners();
        }

        public override UNSAFE_componentWillReceiveProps(nextProps: OwnProps) {
          if (nextProps !== this.props) {
            this.setState(this.computeSelector(nextProps));
          }
        }

        public override shouldComponentUpdate(
          nextProps: OwnProps,
          nextState: ReturnType<Selector>,
        ) {
          return nextState !== this.state || nextProps !== this.props;
        }

        public override componentWillUnmount() {
          while (this.listeners.length) {
            this.listeners.pop()?.();
          }
        }

        private bindListeners() {
          return states.map(state => {
            return state.subscribe(() => this.setState(this.computeSelector()));
          });
        }

        private computeSelector(props: OwnProps = this.props) {
          return selector(
            states.map(s => s.getState()) as DerivedArguments<StateInstances>,
            props,
          );
        }

        public override render() {
          return <WrappedComponent {...this.props} {...this.state} />;
        }
      };
    };
  };
};

export type ReactiveStates<T extends ReturnType<typeof connectMulti>> =
  Parameters<Parameters<T>[0]>[0];

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectState = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
/**
 * ## Connect State
 *
 * A HOC factory for creating React Components connected
 * to your Galena State. To create your HOC simply declare
 * your state, then call `connectState()` passing in your
 * `Galena` instance
 *
 * ```typescript
 * import { Galena } from "galena";
 * import { connectState } from "react-galena";
 *
 * export const MyState = new Galena(...middleware);
 *
 * MyState.createSlice("listItems", { list: [1, 2, 3, 4] });
 *
 * export const connect = connectState(MyState);
 * ```
 * ### Use Your New Connect Function!
 *
 * Your connect function can then be used in any component
 * that needs to be wired into your Galena State:
 *
 * ```typescript
 * import { connect, MyState } from "./MyState";
 *
 * const MyComponent: FC<{ total: number }> = ({ total }) => {
 *   return <div>{total}</div>
 * }
 *
 * const selectProps = (
 *   state: typeof MyState["currentState"],
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
const connectState = (state) => {
    return (selection) => {
        return (WrappedComponent) => {
            return class GalenaComponent extends react_1.Component {
                constructor(props) {
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
                    return (0, jsx_runtime_1.jsx)(WrappedComponent, Object.assign({}, this.props, this.state));
                }
            };
        };
    };
};
exports.connectState = connectState;

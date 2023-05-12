"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectState = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const connectState = (state) => {
    return (selection) => {
        return (WrappedComponent) => {
            return class GalenaComponent extends react_1.Component {
                constructor(props) {
                    super(props);
                    this.state = selection(state, this.props);
                    this.listener = state.subscribe((nextState) => {
                        this.setState(selection(nextState, this.props));
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

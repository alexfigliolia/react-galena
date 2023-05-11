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
                    this.state = selection(state);
                    this.listener = state.subscribe((nextState) => {
                        // @ts-ignore
                        this.setState(selection(nextState));
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

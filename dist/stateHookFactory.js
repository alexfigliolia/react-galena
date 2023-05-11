"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateHookFactory = void 0;
const react_1 = require("react");
const stateHookFactory = (state) => {
    return function useGalenaState(callback) {
        (0, react_1.useEffect)(() => {
            // @ts-ignore
            const ID = state.subscribe(callback);
            return () => {
                state.unsubscribe(ID);
            };
        }, []);
    };
};
exports.stateHookFactory = stateHookFactory;

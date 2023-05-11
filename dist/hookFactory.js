"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookFactory = void 0;
const react_1 = require("react");
const hookFactory = (galena) => {
    return function useGalena(callback) {
        (0, react_1.useEffect)(() => {
            const ID = galena.subscribe(callback);
            return () => {
                galena.unsubscribe(ID);
            };
        }, []);
    };
};
exports.hookFactory = hookFactory;

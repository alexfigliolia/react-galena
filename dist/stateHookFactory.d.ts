import type { State } from "galena";
export declare const stateHookFactory: <T extends State<any>>(state: T) => <F extends (state: T) => any>(callback: F) => void;

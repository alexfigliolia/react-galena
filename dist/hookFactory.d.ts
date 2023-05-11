import type { Galena } from "galena";
export declare const hookFactory: <T extends Galena<any>>(galena: T) => <F extends (state: T["state"]) => any>(callback: F) => void;

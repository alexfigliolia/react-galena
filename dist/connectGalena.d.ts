import { type ComponentType } from "react";
import type { Galena } from "galena";
import type { Subtract } from "./types";
export declare const connectGalena: <StateInstance extends Galena<any>>(state: StateInstance) => <SelectorFunction extends (state: StateInstance["state"], ownProps: Record<string, any>) => Record<string, any>>(selection: SelectorFunction) => <ComponentProps extends ReturnType<SelectorFunction>>(WrappedComponent: ComponentType<ComponentProps>) => ComponentType<Subtract<ComponentProps, ReturnType<SelectorFunction>>>;

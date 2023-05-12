import { type ComponentType } from "react";
import type { State } from "galena";
import type { Subtract } from "./types";
export declare const connectState: <StateInstance extends State<any>>(state: StateInstance) => <SelectorFunction extends (state: StateInstance, ownProps: Record<string, any>) => Record<string, any>>(selection: SelectorFunction) => <ComponentProps extends ReturnType<SelectorFunction>>(WrappedComponent: ComponentType<ComponentProps>) => ComponentType<Subtract<ComponentProps, ReturnType<SelectorFunction>>>;

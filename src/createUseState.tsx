import { useEffect, useRef, useState } from "react";
import type { ReactiveInterface } from "./types";
import { subscribe, unsubscribe } from "./extractAPI";

export const createUseState = <StateInstance extends ReactiveInterface>(
  state: StateInstance
) => {
  return function useGalenaState<
    SelectorFunction extends (state: StateInstance["state"]) => any
  >(selection: SelectorFunction) {
    const instanceRef = useRef(state);

    const [props, setProps] = useState<ReturnType<SelectorFunction>>(
      selection(instanceRef.current.state)
    );

    useEffect(() => {
      const state = instanceRef.current;
      const ID = subscribe(state)((state) => setProps(selection(state.state)));
      return () => unsubscribe(state)(ID);
    }, [selection]);

    return props;
  };
};

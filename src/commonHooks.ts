import {
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type { Galena, State } from "@figliolia/galena";

export function useStableSelector<F extends (...args: any[]) => any>(
  selector: F,
) {
  const stableSelector = useRef(selector);

  useEffect(() => {
    stableSelector.current = ((...args: Parameters<typeof selector>) =>
      selector(...args)) as F;
  }, [selector]);

  return stableSelector;
}

export function useStateHookAPI<T extends State<any> | Galena<any>, U>(
  value: T,
  selector: RefObject<(state: ReturnType<T["getState"]>) => U>,
) {
  const state = useSyncExternalStore(value.subscribe, value.getState);
  return useMemo(() => selector.current(state), [state, selector]);
}

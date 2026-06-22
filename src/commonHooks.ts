import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type {
  AppSubscriber,
  Galena,
  State,
  Subscriber,
} from "@figliolia/galena";

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
  instance: T,
  selector: RefObject<(state: ReturnType<T["getState"]>) => U>,
) {
  const subscribe = useCallback(
    (subscriber: Subscriber<any> | AppSubscriber<any>) =>
      instance.subscribe(subscriber),
    [instance],
  );
  const getState = useCallback(() => instance.getState(), [instance]);
  const state = useSyncExternalStore(subscribe, getState);
  return useMemo(() => selector.current(state), [state, selector]);
}

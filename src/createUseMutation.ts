import { useRef } from "react";
import type { ReactiveInterface } from "./types";

export const createUseMutation = <T extends ReactiveInterface>(state: T) => {
  return function useStateMutation(...params: Parameters<T["update"]>) {
    const callbackRef = useRef(() => {
      // @ts-ignore
      return state.update(...params);
    });
    return callbackRef.current;
  };
};

import type { Mutations, ReactiveInterface } from "./types";

export function createUseMutation<T extends ReactiveInterface>(state: T) {
  const mutations: Mutations<T> = {
    update: state.update.bind(state),
    backgroundUpdate: state.backgroundUpdate.bind(state),
    priorityUpdate: state.priorityUpdate.bind(state),
  };
  return function useGalenaMutation() {
    return mutations;
  };
}

import type { Galena, State } from "@figliolia/galena";

export type SetDifference<A, B> = A extends B ? never : A;

export type SetComplement<A, A1 extends A> = SetDifference<A, A1>;

export type Subtract<T extends T1, T1 extends object> = Pick<
  T,
  SetComplement<keyof T, keyof T1>
>;

export type ReactiveInterface = Galena | State;

export interface Mutations<T extends ReactiveInterface> {
  update: T["update"];
  backgroundUpdate: T["backgroundUpdate"];
  priorityUpdate: T["priorityUpdate"];
}

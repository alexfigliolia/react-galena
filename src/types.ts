import type { Galena, State } from "@figliolia/galena";

export type GetKeys<U> = U extends Record<infer K, any> ? K : never;

export type UnionToIntersection<U extends object> = {
  [K in GetKeys<U>]: U extends Record<K, infer T> ? T : never;
};

export type UnionReturnTypes<
  StateInstances extends ReactiveInterface[],
  Selectors extends SelectorFuncs<StateInstances>
> = {
  [I in keyof Selectors]: ReturnType<Selectors[I]>;
}[number];

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

export type SelectorFuncs<StateInstances extends ReactiveInterface[]> = {
  [I in keyof StateInstances]: (
    state: StateInstances[I]["state"],
    ownProps: any
  ) => Record<string, any>;
} & { length: number };

export type CombinedReturnTypes<
  StateInstances extends ReactiveInterface[],
  Selectors extends SelectorFuncs<StateInstances>
> = UnionToIntersection<UnionReturnTypes<StateInstances, Selectors>>;

// Challenge 1.2: Type Gymnastics
// ================================
// Implement utility types FROM SCRATCH.
// Do NOT use built-in utilities: Pick, Omit, Readonly, Partial, Required, Exclude, Extract, etc.
// You may use: extends, keyof, infer, in, mapped types, conditional types, template literals.

// ---- Test Helpers (these are provided — do not modify) ----

/**
 * Expect<T> forces a type error if T is not `true`.
 * Usage: type _test = Expect<Equal<MyType, ExpectedType>>
 */
export type Expect<T extends true> = T;

/**
 * Equal<A, B> returns true if A and B are exactly the same type.
 */
export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// ---- Challenge Types ----

// 1. MyPick<T, K>
// TODO: Implement Pick from scratch.
// It should select only the properties from T whose keys are in K.
// K should be constrained to keys of T.
export type MyPick<T, K extends keyof T> = { [P in K]: T[P] };

// 2. MyOmit<T, K>
// TODO: Implement Omit from scratch.
// It should remove properties from T whose keys are in K.
// Hint: You can use key remapping with `as` in mapped types.
export type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// 3. DeepReadonly<T>
// TODO: Recursively make all properties readonly.
// For nested objects, their properties should also be readonly.
// Primitives and arrays should be handled correctly.
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 4. DeepPartial<T>
// TODO: Recursively make all properties optional.
// For nested objects, their properties should also be optional.
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 5. TupleToUnion<T>
// TODO: Convert a tuple type to a union of its element types.
// [string, number, boolean] => string | number | boolean
export type TupleToUnion<T extends readonly unknown[]> = T[number];

// 6. LastElement<T>
// TODO: Extract the last element type from a tuple.
// [string, number, boolean] => boolean
// [] => never
export type LastElement<T extends readonly unknown[]> = T extends [
  ...infer Rest,
  infer Last,
]
  ? Last
  : never;

// 7. Flatten<T>
// TODO: Flatten a nested array type by one level.
// (number | string[])[] => (number | string)[]
// Hint: Use `infer` with conditional types to unwrap one level of arrays for each union member.
export type Flatten<T extends readonly unknown[]> = T extends (infer U)[]
  ? (U extends (infer Inner)[] ? Inner : U)[]
  : T;

// 8. IsNever<T>
// TODO: Return true if T is never, false otherwise.
// Careful: `never` has special behavior in conditional types (it's the empty union).
export type IsNever<T> = [T] extends [never] ? true : false;

// 9. MergeTypes<T, U>
// TODO: Merge two object types. Properties in U should override those in T.
// Keys unique to T are kept, keys unique to U are added, shared keys use U's type.
export type MergeTypes<T extends object, U extends object> = {
  [P in keyof (MyOmit<T, keyof T & keyof U> & U)]: (MyOmit<
    T,
    keyof T & keyof U
  > &
    U)[P];
};

// 10. PathKeys<T>
// TODO: Get all dot-separated path keys of a nested object.
// { a: { b: { c: number }; d: string } } => "a" | "a.b" | "a.b.c" | "a.d"
// Only recurse into plain object types, not arrays or primitives.
export type PathKeys<T extends object> = {
  [K in keyof T & string]: T[K] extends object
    ? K | `${K}.${PathKeys<T[K]>}`
    : K;
}[keyof T & string];

// ---- Compile-Time Test Cases (these validate your types) ----
// Uncomment these once you implement each type. They should produce NO type errors.

/*
// -- MyPick --
type PickTest = { a: number; b: string; c: boolean };
type _pick1 = Expect<Equal<MyPick<PickTest, "a">, { a: number }>>;
type _pick2 = Expect<Equal<MyPick<PickTest, "a" | "c">, { a: number; c: boolean }>>;

// -- MyOmit --
type _omit1 = Expect<Equal<MyOmit<PickTest, "a">, { b: string; c: boolean }>>;
type _omit2 = Expect<Equal<MyOmit<PickTest, "a" | "b">, { c: boolean }>>;

// -- DeepReadonly --
type DeepObj = { a: { b: { c: number } }; d: string };
type _dr1 = Expect<Equal<DeepReadonly<DeepObj>, { readonly a: { readonly b: { readonly c: number } }; readonly d: string }>>;

// -- DeepPartial --
type _dp1 = Expect<Equal<DeepPartial<{ a: { b: number } }>, { a?: { b?: number } }>>;

// -- TupleToUnion --
type _ttu1 = Expect<Equal<TupleToUnion<[string, number, boolean]>, string | number | boolean>>;
type _ttu2 = Expect<Equal<TupleToUnion<[number]>, number>>;

// -- LastElement --
type _le1 = Expect<Equal<LastElement<[1, 2, 3]>, 3>>;
type _le2 = Expect<Equal<LastElement<[string]>, string>>;
type _le3 = Expect<Equal<LastElement<[]>, never>>;

// -- IsNever --
type _in1 = Expect<Equal<IsNever<never>, true>>;
type _in2 = Expect<Equal<IsNever<string>, false>>;
type _in3 = Expect<Equal<IsNever<undefined>, false>>;

// -- MergeTypes --
type _mt1 = Expect<Equal<MergeTypes<{ a: number; b: string }, { b: number; c: boolean }>, { a: number; b: number; c: boolean }>>;

// -- PathKeys --
type NestedObj = { a: { b: { c: number }; d: string }; e: boolean };
type _pk1 = Expect<Equal<PathKeys<NestedObj>, "a" | "a.b" | "a.b.c" | "a.d" | "e">>;
*/

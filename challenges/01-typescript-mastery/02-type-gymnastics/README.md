# Challenge 1.2: Type Gymnastics

**Difficulty:** Hard | **AI Assistance:** Allowed | **Time Target:** 60 min

## Problem

Implement TypeScript utility types **from scratch** without using any built-in utility types
(`Pick`, `Omit`, `Readonly`, `Partial`, `Required`, etc.). You may only use fundamental
type-level constructs: `extends`, `keyof`, `infer`, `in`, mapped types, conditional types,
and template literal types.

This tests deep understanding of TypeScript's type system, which is critical for building
type-safe SDKs and libraries in the Solana ecosystem (e.g., Metaplex, Anchor type generation).

## Types to Implement

### Basic Utilities
1. **`MyPick<T, K>`** — Recreate `Pick`. Select a subset of properties from `T` whose keys are in `K`.
2. **`MyOmit<T, K>`** — Recreate `Omit`. Remove properties from `T` whose keys are in `K`.

### Deep Utilities
3. **`DeepReadonly<T>`** — Recursively make all properties (and nested objects) `readonly`.
4. **`DeepPartial<T>`** — Recursively make all properties (and nested objects) optional.

### Tuple Manipulation
5. **`TupleToUnion<T>`** — Convert a tuple type `[A, B, C]` to a union `A | B | C`.
6. **`LastElement<T>`** — Extract the last element's type from a tuple. Return `never` for empty tuples.

### Array Types
7. **`Flatten<T>`** — Flatten a nested array type by one level. `(number | string[])[]` becomes `(number | string)[]`.

### Type Predicates
8. **`IsNever<T>`** — Return `true` if `T` is `never`, otherwise return `false`.

### Object Manipulation
9. **`MergeTypes<T, U>`** — Merge two object types. Properties in `U` override those in `T`.
10. **`PathKeys<T>`** — Get all dot-separated path keys of a nested object type. For `{ a: { b: { c: number } } }`, produce `"a" | "a.b" | "a.b.c"`.

## Hints

<details>
<summary>Hint 1: MyOmit</summary>
You can build `MyOmit` using a mapped type with key filtering: `[K in keyof T as K extends ExcludedKeys ? never : K]`.
</details>

<details>
<summary>Hint 2: DeepReadonly</summary>
Use a conditional type to check if `T[K]` is an object before recursing. Be careful with arrays and primitives.
</details>

<details>
<summary>Hint 3: IsNever</summary>
`never` is tricky in conditional types because it's the empty union. Wrap both sides in a tuple: `[T] extends [never] ? true : false`.
</details>

<details>
<summary>Hint 4: PathKeys</summary>
Use template literal types and recursive conditional types. You'll need to handle the base case (primitive values) and the recursive case (object values).
</details>

## Validation

Run `npx vitest run` in this directory. All type-level tests should pass with zero type errors.

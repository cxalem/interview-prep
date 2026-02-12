// Bonus Challenge: Weak Spots Practice
// =====================================
// Focused practice on: infer, & on unions, distribution, extends on objects
// No built-in utility types allowed.

// =====================
// SECTION 1: infer
// =====================

// 1.1 Extract the return type of a function
// GetReturnType<() => string> → string
// GetReturnType<(x: number) => boolean> → boolean
export type GetReturnType<T> = T extends (...args: infer P) => infer R
  ? R
  : never;

// 1.2 Extract the first parameter type of a function
// FirstParam<(a: string, b: number) => void> → string
// FirstParam<() => void> → never
export type FirstParam<T> = T extends (...args: infer P) => any
  ? P extends [infer F, ...any[]] ? F : never
  : never;

// 1.3 Extract the type inside a Promise
// UnwrapPromise<Promise<string>> → string
// UnwrapPromise<Promise<number[]>> → number[]
// UnwrapPromise<string> → string (not a promise, return as-is)
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// 1.4 Extract the element type from an array, or return the type itself
// ElementType<string[]> → string
// ElementType<number> → number
export type ElementType<T> = T extends (infer U)[] ? U : T;

// 1.5 Extract both key and value types from a Map
// MapTypes<Map<string, number>> → [string, number]
// MapTypes<Map<boolean, string[]>> → [boolean, string[]]
export type MapTypes<T> = T extends Map<infer U, infer R> ? [U, R] : never;

// =====================
// SECTION 2: & on unions (intersection keeps common members)
// =====================

// 2.1 Given two unions, return only the members that appear in BOTH
// CommonMembers<"a" | "b" | "c", "b" | "c" | "d"> → "b" | "c"
// CommonMembers<1 | 2 | 3, 3 | 4 | 5> → 3
export type CommonMembers<A, B> = A & B;

// 2.2 Given two unions, return members that are ONLY in the first (not in the second)
// OnlyInFirst<"a" | "b" | "c", "b" | "c" | "d"> → "a"
// OnlyInFirst<1 | 2 | 3, 3 | 4 | 5> → 1 | 2
// Hint: think about what conditional types + distribution can do here
export type OnlyInFirst<A, B> = A extends B ? never : A;

// 2.3 Filter an object's keys to only those that are strings (not number | symbol)
// StringKeysOnly<{ a: number; b: string; 0: boolean }> → { a: number; b: string }
export type StringKeysOnly<T> = {
  [K in keyof T as K extends string ? K : never]: T[K];
};

// =====================
// SECTION 3: Distribution
// =====================

// 3.1 Distribute a conditional that wraps each union member in an array
// ToArrayEach<string | number> → string[] | number[]
// NOT (string | number)[] — each member gets its own array
export type ToArrayEach<T> = T extends any ? T[] : never;

// 3.2 Now do the OPPOSITE — prevent distribution so the whole union is wrapped
// ToArrayWhole<string | number> → (string | number)[]
export type ToArrayWhole<T> = T[];

// 3.3 For each member of a union, wrap it in a Promise
// ToPromiseEach<string | number> → Promise<string> | Promise<number>
export type ToPromiseEach<T> = T extends any ? Promise<T> : never;

// 3.4 Remove undefined and null from a union (using distribution!)
// NoNullish<string | undefined | null | number> → string | number
export type NoNullish<T> = T extends undefined | null ? never : T;

// =====================
// SECTION 4: extends on objects (structural "has at least")
// =====================

// 4.1 Check if type A has at least all properties of type B
// HasAll<{ a: 1; b: 2; c: 3 }, { a: number }> → true
// HasAll<{ a: 1 }, { a: number; b: number }> → false
export type HasAll<A, B> = A extends B ? true : false;

// 4.2 Check if an object has a specific key
// HasKey<{ name: string; age: number }, "name"> → true
// HasKey<{ name: string; age: number }, "email"> → false
export type HasKey<T, K extends string> = K extends keyof T ? true : false; // TODO

// 4.3 Extract from T only properties whose values are strings
// StringValues<{ name: string; age: number; email: string }> → { name: string; email: string }
export type StringValues<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

// 4.4 Make a type that requires AT LEAST these keys (but allows extras)
// Then check if another type satisfies it
// Satisfies<{ a: 1; b: 2; c: 3 }, { a: number; b: number }> → true (has a and b)
// Satisfies<{ a: 1 }, { a: number; b: number }> → false (missing b)
export type Satisfies<T, Requirements> = T extends Requirements ? true : false; // TODO

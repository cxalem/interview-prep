import { describe, it, expectTypeOf } from "vitest";
import type {
  MyPick,
  MyOmit,
  DeepReadonly,
  DeepPartial,
  TupleToUnion,
  LastElement,
  Flatten,
  IsNever,
  MergeTypes,
  PathKeys,
} from "./index";

// ---- Test Data Types ----
interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

interface NestedConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
}

describe("Challenge 1.2: Type Gymnastics", () => {
  // =========================================
  // MyPick
  // =========================================
  describe("MyPick", () => {
    it("should pick a single property", () => {
      expectTypeOf<MyPick<User, "id">>().toEqualTypeOf<{ id: number }>();
    });

    it("should pick multiple properties", () => {
      expectTypeOf<MyPick<User, "id" | "name">>().toEqualTypeOf<{
        id: number;
        name: string;
      }>();
    });

    it("should pick all properties when all keys are specified", () => {
      expectTypeOf<
        MyPick<User, "id" | "name" | "email" | "active">
      >().toEqualTypeOf<User>();
    });

    it("should work with nested object properties", () => {
      expectTypeOf<MyPick<NestedConfig, "database">>().toEqualTypeOf<{
        database: {
          host: string;
          port: number;
          credentials: { username: string; password: string };
        };
      }>();
    });
  });

  // =========================================
  // MyOmit
  // =========================================
  describe("MyOmit", () => {
    it("should omit a single property", () => {
      expectTypeOf<MyOmit<User, "id">>().toEqualTypeOf<{
        name: string;
        email: string;
        active: boolean;
      }>();
    });

    it("should omit multiple properties", () => {
      expectTypeOf<MyOmit<User, "id" | "email">>().toEqualTypeOf<{
        name: string;
        active: boolean;
      }>();
    });

    it("should return empty object when all keys omitted", () => {
      type AllOmitted = MyOmit<
        { a: number; b: string },
        "a" | "b"
      >;
      expectTypeOf<AllOmitted>().toEqualTypeOf<{}>();
    });
  });

  // =========================================
  // DeepReadonly
  // =========================================
  describe("DeepReadonly", () => {
    it("should make top-level properties readonly", () => {
      type Result = DeepReadonly<{ a: number; b: string }>;
      expectTypeOf<Result>().toEqualTypeOf<{
        readonly a: number;
        readonly b: string;
      }>();
    });

    it("should make nested properties readonly", () => {
      type Result = DeepReadonly<{ a: { b: number } }>;
      expectTypeOf<Result>().toEqualTypeOf<{
        readonly a: { readonly b: number };
      }>();
    });

    it("should handle deeply nested objects", () => {
      type Input = { a: { b: { c: { d: number } } } };
      type Result = DeepReadonly<Input>;
      expectTypeOf<Result>().toEqualTypeOf<{
        readonly a: {
          readonly b: { readonly c: { readonly d: number } };
        };
      }>();
    });

    it("should preserve primitive types", () => {
      type Result = DeepReadonly<{ x: string; y: number; z: boolean }>;
      expectTypeOf<Result>().toEqualTypeOf<{
        readonly x: string;
        readonly y: number;
        readonly z: boolean;
      }>();
    });
  });

  // =========================================
  // DeepPartial
  // =========================================
  describe("DeepPartial", () => {
    it("should make top-level properties optional", () => {
      type Result = DeepPartial<{ a: number; b: string }>;
      expectTypeOf<Result>().toEqualTypeOf<{ a?: number; b?: string }>();
    });

    it("should make nested properties optional", () => {
      type Result = DeepPartial<{ a: { b: number; c: string } }>;
      expectTypeOf<Result>().toEqualTypeOf<{
        a?: { b?: number; c?: string };
      }>();
    });

    it("should handle the full NestedConfig type", () => {
      type Result = DeepPartial<NestedConfig>;
      expectTypeOf<Result>().toEqualTypeOf<{
        database?: {
          host?: string;
          port?: number;
          credentials?: {
            username?: string;
            password?: string;
          };
        };
        cache?: {
          enabled?: boolean;
          ttl?: number;
        };
      }>();
    });
  });

  // =========================================
  // TupleToUnion
  // =========================================
  describe("TupleToUnion", () => {
    it("should convert a tuple of primitives to a union", () => {
      expectTypeOf<TupleToUnion<[string, number, boolean]>>().toEqualTypeOf<
        string | number | boolean
      >();
    });

    it("should handle a single-element tuple", () => {
      expectTypeOf<TupleToUnion<[number]>>().toEqualTypeOf<number>();
    });

    it("should handle literal types", () => {
      expectTypeOf<TupleToUnion<["a", "b", "c"]>>().toEqualTypeOf<
        "a" | "b" | "c"
      >();
    });

    it("should handle readonly tuples", () => {
      expectTypeOf<
        TupleToUnion<readonly [string, number]>
      >().toEqualTypeOf<string | number>();
    });
  });

  // =========================================
  // LastElement
  // =========================================
  describe("LastElement", () => {
    it("should get the last element of a multi-element tuple", () => {
      expectTypeOf<LastElement<[1, 2, 3]>>().toEqualTypeOf<3>();
    });

    it("should get the last element of a single-element tuple", () => {
      expectTypeOf<LastElement<[string]>>().toEqualTypeOf<string>();
    });

    it("should return never for an empty tuple", () => {
      expectTypeOf<LastElement<[]>>().toEqualTypeOf<never>();
    });

    it("should handle mixed types", () => {
      expectTypeOf<
        LastElement<[number, string, boolean]>
      >().toEqualTypeOf<boolean>();
    });
  });

  // =========================================
  // Flatten
  // =========================================
  describe("Flatten", () => {
    it("should flatten nested arrays one level", () => {
      // (string[])[] => string[]
      expectTypeOf<Flatten<string[][]>>().toEqualTypeOf<string[]>();
    });

    it("should handle union element types", () => {
      // (number | string[])[] => (number | string)[]
      expectTypeOf<Flatten<(number | string[])[]>>().toEqualTypeOf<
        (number | string)[]
      >();
    });

    it("should not flatten primitives", () => {
      expectTypeOf<Flatten<number[]>>().toEqualTypeOf<number[]>();
    });
  });

  // =========================================
  // IsNever
  // =========================================
  describe("IsNever", () => {
    it("should return true for never", () => {
      expectTypeOf<IsNever<never>>().toEqualTypeOf<true>();
    });

    it("should return false for string", () => {
      expectTypeOf<IsNever<string>>().toEqualTypeOf<false>();
    });

    it("should return false for undefined", () => {
      expectTypeOf<IsNever<undefined>>().toEqualTypeOf<false>();
    });

    it("should return false for null", () => {
      expectTypeOf<IsNever<null>>().toEqualTypeOf<false>();
    });

    it("should return false for unknown", () => {
      expectTypeOf<IsNever<unknown>>().toEqualTypeOf<false>();
    });

    it("should return false for any", () => {
      expectTypeOf<IsNever<any>>().toEqualTypeOf<false>();
    });

    it("should return false for void", () => {
      expectTypeOf<IsNever<void>>().toEqualTypeOf<false>();
    });

    it("should return false for empty object", () => {
      expectTypeOf<IsNever<{}>>().toEqualTypeOf<false>();
    });
  });

  // =========================================
  // MergeTypes
  // =========================================
  describe("MergeTypes", () => {
    it("should merge two disjoint types", () => {
      expectTypeOf<
        MergeTypes<{ a: number }, { b: string }>
      >().toEqualTypeOf<{ a: number; b: string }>();
    });

    it("should let second type override shared keys", () => {
      expectTypeOf<
        MergeTypes<{ a: number; b: string }, { b: boolean; c: number }>
      >().toEqualTypeOf<{ a: number; b: boolean; c: number }>();
    });

    it("should handle one empty type", () => {
      expectTypeOf<
        MergeTypes<{}, { a: number }>
      >().toEqualTypeOf<{ a: number }>();
    });

    it("should handle full override", () => {
      expectTypeOf<
        MergeTypes<{ a: string }, { a: number }>
      >().toEqualTypeOf<{ a: number }>();
    });
  });

  // =========================================
  // PathKeys
  // =========================================
  describe("PathKeys", () => {
    it("should return top-level keys for flat objects", () => {
      expectTypeOf<PathKeys<{ a: number; b: string }>>().toEqualTypeOf<
        "a" | "b"
      >();
    });

    it("should return dot-separated paths for nested objects", () => {
      type Obj = { a: { b: number } };
      expectTypeOf<PathKeys<Obj>>().toEqualTypeOf<"a" | "a.b">();
    });

    it("should handle deeply nested objects", () => {
      type Obj = { a: { b: { c: number } } };
      expectTypeOf<PathKeys<Obj>>().toEqualTypeOf<
        "a" | "a.b" | "a.b.c"
      >();
    });

    it("should handle multiple nested branches", () => {
      type Obj = {
        a: { b: { c: number }; d: string };
        e: boolean;
      };
      expectTypeOf<PathKeys<Obj>>().toEqualTypeOf<
        "a" | "a.b" | "a.b.c" | "a.d" | "e"
      >();
    });
  });
});

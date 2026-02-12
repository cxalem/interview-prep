import { describe, it, expectTypeOf } from "vitest";
import type {
  GetReturnType,
  FirstParam,
  UnwrapPromise,
  ElementType,
  MapTypes,
  CommonMembers,
  OnlyInFirst,
  StringKeysOnly,
  ToArrayEach,
  ToArrayWhole,
  ToPromiseEach,
  NoNullish,
  HasAll,
  HasKey,
  StringValues,
  Satisfies,
} from "./index";

describe("Bonus Challenge: Weak Spots Practice", () => {
  // =====================
  // SECTION 1: infer
  // =====================
  describe("Section 1: infer", () => {
    describe("GetReturnType", () => {
      it("should extract return type of a simple function", () => {
        expectTypeOf<GetReturnType<() => string>>().toEqualTypeOf<string>();
      });

      it("should extract return type with parameters", () => {
        expectTypeOf<
          GetReturnType<(x: number, y: string) => boolean>
        >().toEqualTypeOf<boolean>();
      });

      it("should handle void return", () => {
        expectTypeOf<GetReturnType<() => void>>().toEqualTypeOf<void>();
      });

      it("should handle complex return types", () => {
        expectTypeOf<
          GetReturnType<() => { name: string; age: number }>
        >().toEqualTypeOf<{ name: string; age: number }>();
      });
    });

    describe("FirstParam", () => {
      it("should extract the first parameter", () => {
        expectTypeOf<
          FirstParam<(a: string, b: number) => void>
        >().toEqualTypeOf<string>();
      });

      it("should return never for no-arg functions", () => {
        expectTypeOf<FirstParam<() => void>>().toEqualTypeOf<never>();
      });

      it("should handle single parameter", () => {
        expectTypeOf<
          FirstParam<(x: boolean) => void>
        >().toEqualTypeOf<boolean>();
      });
    });

    describe("UnwrapPromise", () => {
      it("should unwrap Promise<string>", () => {
        expectTypeOf<UnwrapPromise<Promise<string>>>().toEqualTypeOf<string>();
      });

      it("should unwrap Promise<number[]>", () => {
        expectTypeOf<
          UnwrapPromise<Promise<number[]>>
        >().toEqualTypeOf<number[]>();
      });

      it("should return non-promise types as-is", () => {
        expectTypeOf<UnwrapPromise<string>>().toEqualTypeOf<string>();
      });

      it("should unwrap Promise<boolean>", () => {
        expectTypeOf<
          UnwrapPromise<Promise<boolean>>
        >().toEqualTypeOf<boolean>();
      });
    });

    describe("ElementType", () => {
      it("should extract element from string[]", () => {
        expectTypeOf<ElementType<string[]>>().toEqualTypeOf<string>();
      });

      it("should extract element from number[]", () => {
        expectTypeOf<ElementType<number[]>>().toEqualTypeOf<number>();
      });

      it("should return non-array types as-is", () => {
        expectTypeOf<ElementType<number>>().toEqualTypeOf<number>();
      });
    });

    describe("MapTypes", () => {
      it("should extract key and value from Map<string, number>", () => {
        expectTypeOf<
          MapTypes<Map<string, number>>
        >().toEqualTypeOf<[string, number]>();
      });

      it("should extract from Map<boolean, string[]>", () => {
        expectTypeOf<
          MapTypes<Map<boolean, string[]>>
        >().toEqualTypeOf<[boolean, string[]]>();
      });
    });
  });

  // =====================
  // SECTION 2: & on unions
  // =====================
  describe("Section 2: & on unions", () => {
    describe("CommonMembers", () => {
      it("should keep only common string members", () => {
        expectTypeOf<
          CommonMembers<"a" | "b" | "c", "b" | "c" | "d">
        >().toEqualTypeOf<"b" | "c">();
      });

      it("should keep only common number members", () => {
        expectTypeOf<CommonMembers<1 | 2 | 3, 3 | 4 | 5>>().toEqualTypeOf<3>();
      });

      it("should return never when nothing in common", () => {
        expectTypeOf<
          CommonMembers<"a" | "b", "c" | "d">
        >().toEqualTypeOf<never>();
      });
    });

    describe("OnlyInFirst", () => {
      it("should return members only in first union", () => {
        expectTypeOf<
          OnlyInFirst<"a" | "b" | "c", "b" | "c" | "d">
        >().toEqualTypeOf<"a">();
      });

      it("should return multiple unique members", () => {
        expectTypeOf<
          OnlyInFirst<1 | 2 | 3, 3 | 4 | 5>
        >().toEqualTypeOf<1 | 2>();
      });

      it("should return never when all members are shared", () => {
        expectTypeOf<
          OnlyInFirst<"a" | "b", "a" | "b" | "c">
        >().toEqualTypeOf<never>();
      });
    });

    describe("StringKeysOnly", () => {
      it("should filter out non-string keys", () => {
        expectTypeOf<
          StringKeysOnly<{ a: number; b: string; 0: boolean }>
        >().toEqualTypeOf<{ a: number; b: string }>();
      });

      it("should keep all keys if all are strings", () => {
        expectTypeOf<
          StringKeysOnly<{ x: number; y: number }>
        >().toEqualTypeOf<{ x: number; y: number }>();
      });
    });
  });

  // =====================
  // SECTION 3: Distribution
  // =====================
  describe("Section 3: Distribution", () => {
    describe("ToArrayEach", () => {
      it("should wrap each union member in its own array", () => {
        expectTypeOf<
          ToArrayEach<string | number>
        >().toEqualTypeOf<string[] | number[]>();
      });

      it("should handle single types", () => {
        expectTypeOf<ToArrayEach<string>>().toEqualTypeOf<string[]>();
      });

      it("should handle literal unions", () => {
        expectTypeOf<
          ToArrayEach<"a" | "b">
        >().toEqualTypeOf<"a"[] | "b"[]>();
      });
    });

    describe("ToArrayWhole", () => {
      it("should wrap the whole union in one array", () => {
        expectTypeOf<
          ToArrayWhole<string | number>
        >().toEqualTypeOf<(string | number)[]>();
      });

      it("should handle single types", () => {
        expectTypeOf<ToArrayWhole<boolean>>().toEqualTypeOf<boolean[]>();
      });
    });

    describe("ToPromiseEach", () => {
      it("should wrap each member in a Promise", () => {
        expectTypeOf<
          ToPromiseEach<string | number>
        >().toEqualTypeOf<Promise<string> | Promise<number>>();
      });

      it("should handle single types", () => {
        expectTypeOf<
          ToPromiseEach<string>
        >().toEqualTypeOf<Promise<string>>();
      });
    });

    describe("NoNullish", () => {
      it("should remove undefined and null", () => {
        expectTypeOf<
          NoNullish<string | undefined | null | number>
        >().toEqualTypeOf<string | number>();
      });

      it("should handle only undefined", () => {
        expectTypeOf<
          NoNullish<string | undefined>
        >().toEqualTypeOf<string>();
      });

      it("should return never when all nullish", () => {
        expectTypeOf<
          NoNullish<undefined | null>
        >().toEqualTypeOf<never>();
      });
    });
  });

  // =====================
  // SECTION 4: extends on objects
  // =====================
  describe("Section 4: extends on objects", () => {
    describe("HasAll", () => {
      it("should return true when A has all of B's properties", () => {
        expectTypeOf<
          HasAll<{ a: 1; b: 2; c: 3 }, { a: number }>
        >().toEqualTypeOf<true>();
      });

      it("should return false when A is missing properties from B", () => {
        expectTypeOf<
          HasAll<{ a: 1 }, { a: number; b: number }>
        >().toEqualTypeOf<false>();
      });

      it("should return true for exact match", () => {
        expectTypeOf<
          HasAll<{ a: string; b: number }, { a: string; b: number }>
        >().toEqualTypeOf<true>();
      });
    });

    describe("HasKey", () => {
      it("should return true when key exists", () => {
        expectTypeOf<
          HasKey<{ name: string; age: number }, "name">
        >().toEqualTypeOf<true>();
      });

      it("should return false when key is missing", () => {
        expectTypeOf<
          HasKey<{ name: string; age: number }, "email">
        >().toEqualTypeOf<false>();
      });
    });

    describe("StringValues", () => {
      it("should keep only string-valued properties", () => {
        expectTypeOf<
          StringValues<{ name: string; age: number; email: string }>
        >().toEqualTypeOf<{ name: string; email: string }>();
      });

      it("should return empty object when no string values", () => {
        expectTypeOf<
          StringValues<{ a: number; b: boolean }>
        >().toEqualTypeOf<{}>();
      });

      it("should keep all when all are strings", () => {
        expectTypeOf<
          StringValues<{ x: string; y: string }>
        >().toEqualTypeOf<{ x: string; y: string }>();
      });
    });

    describe("Satisfies", () => {
      it("should return true when T meets requirements", () => {
        expectTypeOf<
          Satisfies<{ a: 1; b: 2; c: 3 }, { a: number; b: number }>
        >().toEqualTypeOf<true>();
      });

      it("should return false when T is missing required properties", () => {
        expectTypeOf<
          Satisfies<{ a: 1 }, { a: number; b: number }>
        >().toEqualTypeOf<false>();
      });

      it("should return true for exact match", () => {
        expectTypeOf<
          Satisfies<{ x: string }, { x: string }>
        >().toEqualTypeOf<true>();
      });
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  InstructionBuilder,
  type TransactionInstruction,
  type AccountMeta,
} from "./index";

describe("Challenge 1.3: Type-Safe Builder Pattern", () => {
  const testProgramId = "11111111111111111111111111111111";
  const testAccounts: AccountMeta[] = [
    { pubkey: "Abc123publicKey", isSigner: true, isWritable: true },
    { pubkey: "Def456publicKey", isSigner: false, isWritable: true },
  ];
  const testData = Buffer.from([1, 2, 3, 4]);
  const testSigners = ["signer1", "signer2"];

  describe("complete builds", () => {
    it("should build with all three required fields", () => {
      const ix = new InstructionBuilder()
        .programId(testProgramId)
        .accounts(testAccounts)
        .data(testData)
        .build();

      expect(ix).toBeDefined();
      expect(ix.programId).toBe(testProgramId);
      expect(ix.accounts).toEqual(testAccounts);
      expect(ix.data).toEqual(testData);
    });

    it("should build with all fields including optional signers", () => {
      const ix = new InstructionBuilder()
        .programId(testProgramId)
        .accounts(testAccounts)
        .data(testData)
        .signers(testSigners)
        .build();

      expect(ix.programId).toBe(testProgramId);
      expect(ix.accounts).toEqual(testAccounts);
      expect(ix.data).toEqual(testData);
      expect(ix.signers).toEqual(testSigners);
    });

    it("should allow methods in any order", () => {
      const ix = new InstructionBuilder()
        .data(testData)
        .programId(testProgramId)
        .accounts(testAccounts)
        .build();

      expect(ix.programId).toBe(testProgramId);
      expect(ix.accounts).toEqual(testAccounts);
      expect(ix.data).toEqual(testData);
    });

    it("should allow overriding a previously set field", () => {
      const newProgramId = "22222222222222222222222222222222";
      const ix = new InstructionBuilder()
        .programId(testProgramId)
        .accounts(testAccounts)
        .data(testData)
        .programId(newProgramId)
        .build();

      expect(ix.programId).toBe(newProgramId);
    });
  });

  describe("method chaining", () => {
    it("should return a builder from programId()", () => {
      const builder = new InstructionBuilder().programId(testProgramId);
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(InstructionBuilder);
    });

    it("should return a builder from accounts()", () => {
      const builder = new InstructionBuilder().accounts(testAccounts);
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(InstructionBuilder);
    });

    it("should return a builder from data()", () => {
      const builder = new InstructionBuilder().data(testData);
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(InstructionBuilder);
    });

    it("should return a builder from signers()", () => {
      const builder = new InstructionBuilder().signers(testSigners);
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(InstructionBuilder);
    });
  });

  describe("built instruction correctness", () => {
    it("should produce a valid TransactionInstruction shape", () => {
      const ix: TransactionInstruction = new InstructionBuilder()
        .programId(testProgramId)
        .accounts(testAccounts)
        .data(testData)
        .build();

      expect(ix).toHaveProperty("programId");
      expect(ix).toHaveProperty("accounts");
      expect(ix).toHaveProperty("data");
      expect(typeof ix.programId).toBe("string");
      expect(Array.isArray(ix.accounts)).toBe(true);
      expect(Buffer.isBuffer(ix.data)).toBe(true);
    });

    it("should handle empty accounts array", () => {
      const ix = new InstructionBuilder()
        .programId(testProgramId)
        .accounts([])
        .data(testData)
        .build();

      expect(ix.accounts).toEqual([]);
    });

    it("should handle empty data buffer", () => {
      const ix = new InstructionBuilder()
        .programId(testProgramId)
        .accounts(testAccounts)
        .data(Buffer.alloc(0))
        .build();

      expect(ix.data).toEqual(Buffer.alloc(0));
    });

    it("should not include signers when not set", () => {
      const ix = new InstructionBuilder()
        .programId(testProgramId)
        .accounts(testAccounts)
        .data(testData)
        .build();

      expect(ix.signers).toBeUndefined();
    });
  });

  describe("incomplete builds (runtime safety)", () => {
    it("should throw or be uncallable when programId is missing", () => {
      const builder = new InstructionBuilder()
        .accounts(testAccounts)
        .data(testData);

      // If the type system prevents build() from being called on incomplete builders,
      // this test verifies runtime behavior as a safety net.
      // In a correct implementation, this line should ideally not even compile.
      expect(() => {
        (builder as any).build();
      }).toThrow();
    });

    it("should throw or be uncallable when accounts is missing", () => {
      const builder = new InstructionBuilder()
        .programId(testProgramId)
        .data(testData);

      expect(() => {
        (builder as any).build();
      }).toThrow();
    });

    it("should throw or be uncallable when data is missing", () => {
      const builder = new InstructionBuilder()
        .programId(testProgramId)
        .accounts(testAccounts);

      expect(() => {
        (builder as any).build();
      }).toThrow();
    });

    it("should throw or be uncallable when no fields are set", () => {
      const builder = new InstructionBuilder();

      expect(() => {
        (builder as any).build();
      }).toThrow();
    });
  });
});

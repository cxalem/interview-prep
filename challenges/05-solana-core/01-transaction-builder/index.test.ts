import { describe, it, expect, vi } from "vitest";
import {
  TransactionBuilder,
  compileTransaction,
  estimateFee,
  type PublicKey,
  type Instruction,
  type AccountMeta,
  type Transaction,
  type CompiledMessage,
} from "./index";

// Realistic-looking base58 pubkeys
const ALICE = "A1iceBvMKpLRwKQm5cPEjNzJPMNxVMCj8RL3TGxFPVmz";
const BOB = "B0bXyZ3WdGh7nRtY9qFJk2LmN5pQ8sUvA4cE6iO1KwMx";
const CHARLIE = "ChAr1iE9Kj2mN4pQ7sUvX1yZ3bD6fH8gL0wR5tCeVnAx";
const PROGRAM_A = "Prog1A111111111111111111111111111111111111111";
const PROGRAM_B = "Prog1B222222222222222222222222222222222222222";
const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const BLOCKHASH = "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N";
const BLOCKHASH_2 = "FyTNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN2M";

function makeInstruction(
  programId: PublicKey,
  accounts: AccountMeta[],
  data: number[] = [0]
): Instruction {
  return {
    programId,
    accounts,
    data: new Uint8Array(data),
  };
}

describe("TransactionBuilder", () => {
  describe("setFeePayer", () => {
    it("should set the fee payer and return builder for chaining", () => {
      const builder = new TransactionBuilder();
      const result = builder.setFeePayer(ALICE);
      expect(result).toBe(builder);
    });
  });

  describe("setRecentBlockhash", () => {
    it("should set the blockhash and return builder for chaining", () => {
      const builder = new TransactionBuilder();
      const result = builder.setRecentBlockhash(BLOCKHASH);
      expect(result).toBe(builder);
    });
  });

  describe("addInstruction", () => {
    it("should add an instruction and return builder for chaining", () => {
      const builder = new TransactionBuilder();
      const ix = makeInstruction(PROGRAM_A, [
        { pubkey: ALICE, isSigner: true, isWritable: true },
      ]);
      const result = builder.addInstruction(ix);
      expect(result).toBe(builder);
    });
  });

  describe("addInstructions", () => {
    it("should add multiple instructions at once", () => {
      const builder = new TransactionBuilder();
      const ix1 = makeInstruction(PROGRAM_A, [
        { pubkey: ALICE, isSigner: true, isWritable: true },
      ]);
      const ix2 = makeInstruction(PROGRAM_B, [
        { pubkey: BOB, isSigner: false, isWritable: true },
      ]);
      const result = builder.addInstructions([ix1, ix2]);
      expect(result).toBe(builder);
    });
  });

  describe("build", () => {
    it("should build a valid transaction", () => {
      const ix = makeInstruction(PROGRAM_A, [
        { pubkey: ALICE, isSigner: true, isWritable: true },
        { pubkey: BOB, isSigner: false, isWritable: true },
      ]);

      const tx = new TransactionBuilder()
        .setFeePayer(ALICE)
        .setRecentBlockhash(BLOCKHASH)
        .addInstruction(ix)
        .build();

      expect(tx.feePayer).toBe(ALICE);
      expect(tx.recentBlockhash).toBe(BLOCKHASH);
      expect(tx.instructions).toHaveLength(1);
      expect(tx.signatures).toBeDefined();
      expect(Array.isArray(tx.signatures)).toBe(true);
    });

    it("should build a transaction with multiple instructions", () => {
      const ix1 = makeInstruction(PROGRAM_A, [
        { pubkey: ALICE, isSigner: true, isWritable: true },
      ]);
      const ix2 = makeInstruction(PROGRAM_B, [
        { pubkey: BOB, isSigner: false, isWritable: true },
      ]);

      const tx = new TransactionBuilder()
        .setFeePayer(ALICE)
        .setRecentBlockhash(BLOCKHASH)
        .addInstructions([ix1, ix2])
        .build();

      expect(tx.instructions).toHaveLength(2);
    });

    it("should throw if fee payer is not set", () => {
      const ix = makeInstruction(PROGRAM_A, [
        { pubkey: ALICE, isSigner: true, isWritable: true },
      ]);

      expect(() =>
        new TransactionBuilder()
          .setRecentBlockhash(BLOCKHASH)
          .addInstruction(ix)
          .build()
      ).toThrow();
    });

    it("should throw if recent blockhash is not set", () => {
      const ix = makeInstruction(PROGRAM_A, [
        { pubkey: ALICE, isSigner: true, isWritable: true },
      ]);

      expect(() =>
        new TransactionBuilder()
          .setFeePayer(ALICE)
          .addInstruction(ix)
          .build()
      ).toThrow();
    });

    it("should throw if no instructions are added", () => {
      expect(() =>
        new TransactionBuilder()
          .setFeePayer(ALICE)
          .setRecentBlockhash(BLOCKHASH)
          .build()
      ).toThrow();
    });

    it("should allow overriding fee payer", () => {
      const ix = makeInstruction(PROGRAM_A, [
        { pubkey: BOB, isSigner: true, isWritable: true },
      ]);

      const tx = new TransactionBuilder()
        .setFeePayer(ALICE)
        .setFeePayer(BOB)
        .setRecentBlockhash(BLOCKHASH)
        .addInstruction(ix)
        .build();

      expect(tx.feePayer).toBe(BOB);
    });

    it("should allow overriding recent blockhash", () => {
      const ix = makeInstruction(PROGRAM_A, [
        { pubkey: ALICE, isSigner: true, isWritable: true },
      ]);

      const tx = new TransactionBuilder()
        .setFeePayer(ALICE)
        .setRecentBlockhash(BLOCKHASH)
        .setRecentBlockhash(BLOCKHASH_2)
        .addInstruction(ix)
        .build();

      expect(tx.recentBlockhash).toBe(BLOCKHASH_2);
    });

    it("should support method chaining for all setters", () => {
      const ix = makeInstruction(PROGRAM_A, [
        { pubkey: ALICE, isSigner: true, isWritable: true },
      ]);

      const tx = new TransactionBuilder()
        .setFeePayer(ALICE)
        .setRecentBlockhash(BLOCKHASH)
        .addInstruction(ix)
        .build();

      expect(tx).toBeDefined();
    });
  });
});

describe("compileTransaction", () => {
  it("should place fee payer as the first account key", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: BOB, isSigner: false, isWritable: true },
      { pubkey: ALICE, isSigner: true, isWritable: true },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const compiled = compileTransaction(tx);
    expect(compiled.accountKeys[0]).toBe(ALICE);
  });

  it("should deduplicate accounts that appear in multiple instructions", () => {
    const ix1 = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: false, isWritable: true },
    ]);
    const ix2 = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: CHARLIE, isSigner: false, isWritable: false },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix1, ix2],
      signatures: [],
    };

    const compiled = compileTransaction(tx);
    const aliceCount = compiled.accountKeys.filter((k) => k === ALICE).length;
    expect(aliceCount).toBe(1);
  });

  it("should sort accounts: signers+writable before signers+readonly", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: BOB, isSigner: true, isWritable: false },
      { pubkey: CHARLIE, isSigner: true, isWritable: true },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const compiled = compileTransaction(tx);
    const charlieIdx = compiled.accountKeys.indexOf(CHARLIE);
    const bobIdx = compiled.accountKeys.indexOf(BOB);
    // CHARLIE is signer+writable, BOB is signer+readonly
    expect(charlieIdx).toBeLessThan(bobIdx);
  });

  it("should sort accounts: signers before non-signers", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: BOB, isSigner: false, isWritable: true },
      { pubkey: CHARLIE, isSigner: true, isWritable: true },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const compiled = compileTransaction(tx);
    const charlieIdx = compiled.accountKeys.indexOf(CHARLIE);
    const bobIdx = compiled.accountKeys.indexOf(BOB);
    expect(charlieIdx).toBeLessThan(bobIdx);
  });

  it("should sort accounts: non-signers+writable before non-signers+readonly", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: BOB, isSigner: false, isWritable: false },
      { pubkey: CHARLIE, isSigner: false, isWritable: true },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const compiled = compileTransaction(tx);
    const charlieIdx = compiled.accountKeys.indexOf(CHARLIE);
    const bobIdx = compiled.accountKeys.indexOf(BOB);
    expect(charlieIdx).toBeLessThan(bobIdx);
  });

  it("should include program IDs as non-signer readonly accounts", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const compiled = compileTransaction(tx);
    expect(compiled.accountKeys).toContain(PROGRAM_A);
    // Program should come after fee payer (a signer)
    const programIdx = compiled.accountKeys.indexOf(PROGRAM_A);
    const aliceIdx = compiled.accountKeys.indexOf(ALICE);
    expect(programIdx).toBeGreaterThan(aliceIdx);
  });

  it("should promote account to signer if any instruction marks it as signer", () => {
    const ix1 = makeInstruction(PROGRAM_A, [
      { pubkey: BOB, isSigner: false, isWritable: true },
    ]);
    const ix2 = makeInstruction(PROGRAM_A, [
      { pubkey: BOB, isSigner: true, isWritable: false },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix1, ix2],
      signatures: [],
    };

    const compiled = compileTransaction(tx);
    // BOB should be treated as signer+writable (promoted in both)
    expect(compiled.header.numSigners).toBeGreaterThanOrEqual(2); // ALICE + BOB
  });

  it("should produce correct header counts", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: true, isWritable: false },
      { pubkey: CHARLIE, isSigner: false, isWritable: true },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const compiled = compileTransaction(tx);
    expect(compiled.header.numSigners).toBe(2); // ALICE, BOB
    expect(compiled.header.numReadonlySigners).toBe(1); // BOB
    // PROGRAM_A is readonly non-signer
    expect(compiled.header.numReadonly).toBeGreaterThanOrEqual(1);
  });

  it("should map instruction account references to correct indexes", () => {
    const ix = makeInstruction(
      PROGRAM_A,
      [
        { pubkey: ALICE, isSigner: true, isWritable: true },
        { pubkey: BOB, isSigner: false, isWritable: true },
      ],
      [1, 2, 3]
    );

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const compiled = compileTransaction(tx);
    const aliceIdx = compiled.accountKeys.indexOf(ALICE);
    const bobIdx = compiled.accountKeys.indexOf(BOB);
    const programIdx = compiled.accountKeys.indexOf(PROGRAM_A);

    expect(compiled.instructions[0].programIdIndex).toBe(programIdx);
    expect(compiled.instructions[0].accountKeyIndexes).toContain(aliceIdx);
    expect(compiled.instructions[0].accountKeyIndexes).toContain(bobIdx);
    expect(compiled.instructions[0].data).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("should handle multiple instructions with shared and unique accounts", () => {
    const ix1 = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: false, isWritable: true },
    ]);
    const ix2 = makeInstruction(PROGRAM_B, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: CHARLIE, isSigner: false, isWritable: false },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix1, ix2],
      signatures: [],
    };

    const compiled = compileTransaction(tx);
    // Should have: ALICE, BOB, CHARLIE, PROGRAM_A, PROGRAM_B = 5 unique accounts
    expect(compiled.accountKeys).toHaveLength(5);
    expect(compiled.instructions).toHaveLength(2);
  });
});

describe("estimateFee", () => {
  it("should calculate fee based on unique signers", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: false, isWritable: true },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const fee = estimateFee(tx, 5000);
    // 1 unique signer (ALICE is fee payer + signer) = 5000
    expect(fee).toBe(5000);
  });

  it("should count multiple unique signers", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: true, isWritable: true },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const fee = estimateFee(tx, 5000);
    // 2 unique signers (ALICE + BOB) = 10000
    expect(fee).toBe(10000);
  });

  it("should not double-count fee payer if also a signer in instructions", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const fee = estimateFee(tx, 5000);
    expect(fee).toBe(5000); // ALICE counted once
  });

  it("should count fee payer as a signer even if not explicitly in instructions", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: BOB, isSigner: false, isWritable: true },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const fee = estimateFee(tx, 5000);
    // Fee payer is always a signer
    expect(fee).toBe(5000);
  });

  it("should handle different lamportsPerSignature values", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: true, isWritable: false },
      { pubkey: CHARLIE, isSigner: true, isWritable: true },
    ]);

    const tx: Transaction = {
      feePayer: ALICE,
      recentBlockhash: BLOCKHASH,
      instructions: [ix],
      signatures: [],
    };

    const fee = estimateFee(tx, 10000);
    // 3 unique signers = 30000
    expect(fee).toBe(30000);
  });
});

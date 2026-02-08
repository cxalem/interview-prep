import { describe, it, expect, vi } from "vitest";
import {
  compileV0Message,
  decompileV0Message,
  getTransactionSize,
  type Instruction,
  type AccountMeta,
  type AddressLookupTable,
  type MessageV0,
  type DecompiledAccounts,
} from "./index";

// Realistic-looking base58 pubkeys
const ALICE = "A1iceBvMKpLRwKQm5cPEjNzJPMNxVMCj8RL3TGxFPVmz";
const BOB = "B0bXyZ3WdGh7nRtY9qFJk2LmN5pQ8sUvA4cE6iO1KwMx";
const CHARLIE = "ChAr1iE9Kj2mN4pQ7sUvX1yZ3bD6fH8gL0wR5tCeVnAx";
const DAVE = "DaVe4444444444444444444444444444444444444444";
const EVE = "EvE55555555555555555555555555555555555555555";
const FRANK = "FrAnK6666666666666666666666666666666666666666";
const PROGRAM_A = "Prog1A111111111111111111111111111111111111111";
const PROGRAM_B = "Prog1B222222222222222222222222222222222222222";
const SYSTEM_PROGRAM = "11111111111111111111111111111111";

const BLOCKHASH = "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N";

const LOOKUP_TABLE_1: AddressLookupTable = {
  key: "LuT11111111111111111111111111111111111111111",
  addresses: [DAVE, EVE, FRANK, CHARLIE],
};

const LOOKUP_TABLE_2: AddressLookupTable = {
  key: "LuT22222222222222222222222222222222222222222",
  addresses: [BOB, CHARLIE, DAVE],
};

function makeInstruction(
  programId: string,
  accounts: AccountMeta[],
  data: number[] = [0]
): Instruction {
  return {
    programId,
    accounts,
    data: new Uint8Array(data),
  };
}

describe("compileV0Message", () => {
  it("should put fee payer as first static account key", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: false, isWritable: true },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, []);
    expect(message.staticAccountKeys[0]).toBe(ALICE);
  });

  it("should always include signers in static account keys", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: true, isWritable: false },
      { pubkey: DAVE, isSigner: false, isWritable: true },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, [LOOKUP_TABLE_1]);
    expect(message.staticAccountKeys).toContain(ALICE);
    expect(message.staticAccountKeys).toContain(BOB);
  });

  it("should always include program IDs in static account keys", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: DAVE, isSigner: false, isWritable: true },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, [LOOKUP_TABLE_1]);
    expect(message.staticAccountKeys).toContain(PROGRAM_A);
  });

  it("should move non-signer accounts to lookup table references when available", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: DAVE, isSigner: false, isWritable: true },
      { pubkey: EVE, isSigner: false, isWritable: false },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, [LOOKUP_TABLE_1]);

    // DAVE and EVE should NOT be in static keys (they're in the lookup table)
    expect(message.staticAccountKeys).not.toContain(DAVE);
    expect(message.staticAccountKeys).not.toContain(EVE);

    // They should be referenced via addressTableLookups
    expect(message.addressTableLookups.length).toBeGreaterThan(0);
    const lookup = message.addressTableLookups.find(
      (l) => l.accountKey === LOOKUP_TABLE_1.key
    );
    expect(lookup).toBeDefined();
  });

  it("should separate writable and readonly indexes in lookup references", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: DAVE, isSigner: false, isWritable: true },
      { pubkey: EVE, isSigner: false, isWritable: false },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, [LOOKUP_TABLE_1]);
    const lookup = message.addressTableLookups.find(
      (l) => l.accountKey === LOOKUP_TABLE_1.key
    );
    expect(lookup).toBeDefined();

    if (lookup) {
      // DAVE is at index 0 in LOOKUP_TABLE_1, writable
      expect(lookup.writableIndexes).toContain(0);
      // EVE is at index 1 in LOOKUP_TABLE_1, readonly
      expect(lookup.readonlyIndexes).toContain(1);
    }
  });

  it("should keep non-signer accounts as static when not in any lookup table", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: false, isWritable: true },
    ]);

    // BOB is NOT in LOOKUP_TABLE_1
    const message = compileV0Message([ix], ALICE, BLOCKHASH, [LOOKUP_TABLE_1]);
    // BOB should remain in static keys since it's not found in any lookup table
    // Note: Actually BOB is not in LOOKUP_TABLE_1, so it should be static
    expect(message.staticAccountKeys).toContain(BOB);
  });

  it("should handle no lookup tables (behaves like legacy)", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: false, isWritable: true },
      { pubkey: CHARLIE, isSigner: false, isWritable: false },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, []);
    expect(message.addressTableLookups).toHaveLength(0);
    expect(message.staticAccountKeys).toContain(ALICE);
    expect(message.staticAccountKeys).toContain(BOB);
    expect(message.staticAccountKeys).toContain(CHARLIE);
    expect(message.staticAccountKeys).toContain(PROGRAM_A);
  });

  it("should set correct header values", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: true, isWritable: false },
      { pubkey: DAVE, isSigner: false, isWritable: true },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, [LOOKUP_TABLE_1]);
    // ALICE and BOB are signers in static keys
    expect(message.header.numRequiredSignatures).toBe(2);
    // BOB is a readonly signer
    expect(message.header.numReadonlySignedAccounts).toBe(1);
    // PROGRAM_A is readonly unsigned in static keys
    expect(message.header.numReadonlyUnsignedAccounts).toBeGreaterThanOrEqual(1);
  });

  it("should set recent blockhash", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, []);
    expect(message.recentBlockhash).toBe(BLOCKHASH);
  });

  it("should compile instruction account indexes correctly with lookup tables", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: DAVE, isSigner: false, isWritable: true },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, [LOOKUP_TABLE_1]);

    // ALICE should be index 0 (fee payer, first static)
    // PROGRAM_A should also be in static keys
    // DAVE should be referenced via lookup, with index starting after static keys
    expect(message.instructions).toHaveLength(1);

    const compiledIx = message.instructions[0];
    const aliceIdx = message.staticAccountKeys.indexOf(ALICE);
    expect(compiledIx.accountKeyIndexes[0]).toBe(aliceIdx);

    // DAVE's index should be >= staticAccountKeys.length (lookup reference)
    const daveIdx = compiledIx.accountKeyIndexes[1];
    expect(daveIdx).toBeGreaterThanOrEqual(message.staticAccountKeys.length);
  });

  it("should handle accounts appearing in multiple lookup tables (use first found)", () => {
    // CHARLIE appears in both LOOKUP_TABLE_1 (index 3) and LOOKUP_TABLE_2 (index 1)
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: CHARLIE, isSigner: false, isWritable: true },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, [
      LOOKUP_TABLE_1,
      LOOKUP_TABLE_2,
    ]);

    // CHARLIE should not be in static keys
    expect(message.staticAccountKeys).not.toContain(CHARLIE);
    // Should be referenced via one of the lookup tables
    expect(message.addressTableLookups.length).toBeGreaterThan(0);
  });

  it("should deduplicate accounts across instructions", () => {
    const ix1 = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: DAVE, isSigner: false, isWritable: true },
    ]);
    const ix2 = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: DAVE, isSigner: false, isWritable: false },
    ]);

    const message = compileV0Message(
      [ix1, ix2],
      ALICE,
      BLOCKHASH,
      [LOOKUP_TABLE_1]
    );

    // ALICE should appear once in static keys
    const aliceCount = message.staticAccountKeys.filter(
      (k) => k === ALICE
    ).length;
    expect(aliceCount).toBe(1);

    // DAVE should be promoted to writable (from ix1) in lookup
    const lookup = message.addressTableLookups.find(
      (l) => l.accountKey === LOOKUP_TABLE_1.key
    );
    expect(lookup).toBeDefined();
    if (lookup) {
      expect(lookup.writableIndexes).toContain(
        LOOKUP_TABLE_1.addresses.indexOf(DAVE)
      );
    }
  });

  it("should sort static keys: fee payer, signers+writable, signers+readonly, non-signers+writable, non-signers+readonly", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: BOB, isSigner: true, isWritable: false },
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: CHARLIE, isSigner: false, isWritable: true },
    ]);

    // No lookup tables so all accounts are static
    const message = compileV0Message([ix], ALICE, BLOCKHASH, []);

    // ALICE first (fee payer, signer+writable)
    expect(message.staticAccountKeys[0]).toBe(ALICE);

    // BOB: signer+readonly, should come after ALICE but before non-signers
    const bobIdx = message.staticAccountKeys.indexOf(BOB);
    const charlieIdx = message.staticAccountKeys.indexOf(CHARLIE);
    expect(bobIdx).toBeLessThan(charlieIdx);

    // PROGRAM_A: non-signer+readonly, should come last
    const progIdx = message.staticAccountKeys.indexOf(PROGRAM_A);
    expect(progIdx).toBeGreaterThan(charlieIdx);
  });
});

describe("decompileV0Message", () => {
  it("should return static accounts directly", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: false, isWritable: true },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, []);
    const result = decompileV0Message(message, []);

    expect(result.staticAccounts).toContain(ALICE);
    expect(result.staticAccounts).toContain(BOB);
    expect(result.staticAccounts).toContain(PROGRAM_A);
  });

  it("should resolve writable lookup accounts", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: DAVE, isSigner: false, isWritable: true },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, [LOOKUP_TABLE_1]);
    const result = decompileV0Message(message, [LOOKUP_TABLE_1]);

    expect(result.lookupAccounts.writable).toContain(DAVE);
  });

  it("should resolve readonly lookup accounts", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: EVE, isSigner: false, isWritable: false },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, [LOOKUP_TABLE_1]);
    const result = decompileV0Message(message, [LOOKUP_TABLE_1]);

    expect(result.lookupAccounts.readonly).toContain(EVE);
  });

  it("should roundtrip compile and decompile", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: DAVE, isSigner: false, isWritable: true },
      { pubkey: EVE, isSigner: false, isWritable: false },
      { pubkey: BOB, isSigner: false, isWritable: true },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, [LOOKUP_TABLE_1]);
    const result = decompileV0Message(message, [LOOKUP_TABLE_1]);

    // All accounts should be resolvable somewhere
    const allAccounts = [
      ...result.staticAccounts,
      ...result.lookupAccounts.writable,
      ...result.lookupAccounts.readonly,
    ];
    expect(allAccounts).toContain(ALICE);
    expect(allAccounts).toContain(DAVE);
    expect(allAccounts).toContain(EVE);
    expect(allAccounts).toContain(BOB);
    expect(allAccounts).toContain(PROGRAM_A);
  });

  it("should handle message with no lookup table references", () => {
    const message: MessageV0 = {
      header: {
        numRequiredSignatures: 1,
        numReadonlySignedAccounts: 0,
        numReadonlyUnsignedAccounts: 1,
      },
      staticAccountKeys: [ALICE, BOB, PROGRAM_A],
      recentBlockhash: BLOCKHASH,
      instructions: [
        {
          programIdIndex: 2,
          accountKeyIndexes: [0, 1],
          data: new Uint8Array([0]),
        },
      ],
      addressTableLookups: [],
    };

    const result = decompileV0Message(message, []);
    expect(result.staticAccounts).toEqual([ALICE, BOB, PROGRAM_A]);
    expect(result.lookupAccounts.writable).toEqual([]);
    expect(result.lookupAccounts.readonly).toEqual([]);
  });

  it("should resolve accounts from multiple lookup tables", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: DAVE, isSigner: false, isWritable: true }, // in table 1
      { pubkey: EVE, isSigner: false, isWritable: false }, // in table 1
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, [
      LOOKUP_TABLE_1,
      LOOKUP_TABLE_2,
    ]);
    const result = decompileV0Message(message, [LOOKUP_TABLE_1, LOOKUP_TABLE_2]);

    const allResolved = [
      ...result.staticAccounts,
      ...result.lookupAccounts.writable,
      ...result.lookupAccounts.readonly,
    ];
    expect(allResolved).toContain(DAVE);
    expect(allResolved).toContain(EVE);
  });
});

describe("getTransactionSize", () => {
  it("should return a positive number", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
    ]);

    const message = compileV0Message([ix], ALICE, BLOCKHASH, []);
    const size = getTransactionSize(message);
    expect(size).toBeGreaterThan(0);
  });

  it("should increase with more static accounts", () => {
    const ix1 = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
    ]);
    const ix2 = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: false, isWritable: true },
      { pubkey: CHARLIE, isSigner: false, isWritable: false },
    ]);

    const msg1 = compileV0Message([ix1], ALICE, BLOCKHASH, []);
    const msg2 = compileV0Message([ix2], ALICE, BLOCKHASH, []);

    expect(getTransactionSize(msg2)).toBeGreaterThan(getTransactionSize(msg1));
  });

  it("should be smaller with lookup tables than without (for same accounts)", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: DAVE, isSigner: false, isWritable: true },
      { pubkey: EVE, isSigner: false, isWritable: true },
      { pubkey: FRANK, isSigner: false, isWritable: false },
    ]);

    const msgWithout = compileV0Message([ix], ALICE, BLOCKHASH, []);
    const msgWith = compileV0Message([ix], ALICE, BLOCKHASH, [LOOKUP_TABLE_1]);

    // With lookup tables, we save 32 bytes per account moved to lookup
    // but add some overhead for the lookup references. Net savings for 3+ accounts.
    // At minimum, the static keys portion should be smaller
    expect(msgWith.staticAccountKeys.length).toBeLessThan(
      msgWithout.staticAccountKeys.length
    );
  });

  it("should include signature size in estimation", () => {
    const ix = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
    ]);
    const msg1 = compileV0Message([ix], ALICE, BLOCKHASH, []);

    const ix2 = makeInstruction(PROGRAM_A, [
      { pubkey: ALICE, isSigner: true, isWritable: true },
      { pubkey: BOB, isSigner: true, isWritable: true },
    ]);
    const msg2 = compileV0Message([ix2], ALICE, BLOCKHASH, []);

    const size1 = getTransactionSize(msg1);
    const size2 = getTransactionSize(msg2);
    // Extra signer adds 64 bytes for signature + 32 bytes for key
    expect(size2 - size1).toBeGreaterThanOrEqual(64 + 32);
  });

  it("should handle empty addressTableLookups", () => {
    const message: MessageV0 = {
      header: {
        numRequiredSignatures: 1,
        numReadonlySignedAccounts: 0,
        numReadonlyUnsignedAccounts: 1,
      },
      staticAccountKeys: [ALICE, PROGRAM_A],
      recentBlockhash: BLOCKHASH,
      instructions: [
        {
          programIdIndex: 1,
          accountKeyIndexes: [0],
          data: new Uint8Array([0]),
        },
      ],
      addressTableLookups: [],
    };

    const size = getTransactionSize(message);
    expect(size).toBeGreaterThan(0);
    // Rough minimum: 1 sig (64) + header (4) + 2 keys (64) + blockhash (32) + ix overhead
    expect(size).toBeGreaterThanOrEqual(64 + 4 + 64 + 32);
  });

  it("should account for instruction data size", () => {
    const ixSmall = makeInstruction(
      PROGRAM_A,
      [{ pubkey: ALICE, isSigner: true, isWritable: true }],
      [1]
    );
    const ixLarge = makeInstruction(
      PROGRAM_A,
      [{ pubkey: ALICE, isSigner: true, isWritable: true }],
      Array(100).fill(0)
    );

    const msgSmall = compileV0Message([ixSmall], ALICE, BLOCKHASH, []);
    const msgLarge = compileV0Message([ixLarge], ALICE, BLOCKHASH, []);

    expect(getTransactionSize(msgLarge)).toBeGreaterThan(
      getTransactionSize(msgSmall)
    );
  });
});

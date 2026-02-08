import { describe, it, expect, vi } from "vitest";
import {
  TOKEN_PROGRAM_ID,
  encodeU64LE,
  decodeU64LE,
  createTransferInstruction,
  createApproveInstruction,
  createMintToInstruction,
  createInitializeAccountInstruction,
  parseTokenInstruction,
  type Instruction,
  type ParsedTokenInstruction,
} from "./index";

const ALICE = "A1iceBvMKpLRwKQm5cPEjNzJPMNxVMCj8RL3TGxFPVmz";
const BOB = "B0bXyZ3WdGh7nRtY9qFJk2LmN5pQ8sUvA4cE6iO1KwMx";
const CHARLIE = "ChAr1iE9Kj2mN4pQ7sUvX1yZ3bD6fH8gL0wR5tCeVnAx";
const MINT = "MiNt1111111111111111111111111111111111111111";
const TOKEN_ACC = "ToKn2222222222222222222222222222222222222222";
const AUTHORITY = "AuTh3333333333333333333333333333333333333333";

describe("encodeU64LE / decodeU64LE", () => {
  it("should encode 0n correctly", () => {
    const encoded = encodeU64LE(0n);
    expect(encoded).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
    expect(encoded.length).toBe(8);
  });

  it("should encode 1n correctly", () => {
    const encoded = encodeU64LE(1n);
    expect(encoded[0]).toBe(1);
    expect(encoded.slice(1).every((b) => b === 0)).toBe(true);
  });

  it("should encode 256n correctly", () => {
    const encoded = encodeU64LE(256n);
    expect(encoded[0]).toBe(0);
    expect(encoded[1]).toBe(1);
  });

  it("should encode max u64 correctly", () => {
    const maxU64 = 18446744073709551615n;
    const encoded = encodeU64LE(maxU64);
    expect(encoded.every((b) => b === 0xff)).toBe(true);
  });

  it("should roundtrip various values", () => {
    const values = [0n, 1n, 255n, 256n, 1_000_000n, 1_000_000_000n, 18446744073709551615n];
    for (const val of values) {
      expect(decodeU64LE(encodeU64LE(val))).toBe(val);
    }
  });

  it("should decode known bytes", () => {
    // 1000 = 0x03E8 -> LE: [0xE8, 0x03, 0, 0, 0, 0, 0, 0]
    const bytes = new Uint8Array([0xe8, 0x03, 0, 0, 0, 0, 0, 0]);
    expect(decodeU64LE(bytes)).toBe(1000n);
  });

  it("should always produce 8 bytes", () => {
    expect(encodeU64LE(0n).length).toBe(8);
    expect(encodeU64LE(42n).length).toBe(8);
    expect(encodeU64LE(18446744073709551615n).length).toBe(8);
  });
});

describe("createTransferInstruction", () => {
  it("should set programId to TOKEN_PROGRAM_ID", () => {
    const ix = createTransferInstruction(ALICE, BOB, CHARLIE, 100n);
    expect(ix.programId).toBe(TOKEN_PROGRAM_ID);
  });

  it("should have correct data layout: tag 3 + u64 LE amount", () => {
    const ix = createTransferInstruction(ALICE, BOB, CHARLIE, 1000n);
    expect(ix.data.length).toBe(9);
    expect(ix.data[0]).toBe(3); // transfer tag
    const amountBytes = ix.data.slice(1);
    expect(decodeU64LE(amountBytes)).toBe(1000n);
  });

  it("should have 3 accounts in correct order", () => {
    const ix = createTransferInstruction(ALICE, BOB, CHARLIE, 100n);
    expect(ix.accounts).toHaveLength(3);

    // source: writable, not signer
    expect(ix.accounts[0].pubkey).toBe(ALICE);
    expect(ix.accounts[0].isWritable).toBe(true);
    expect(ix.accounts[0].isSigner).toBe(false);

    // destination: writable, not signer
    expect(ix.accounts[1].pubkey).toBe(BOB);
    expect(ix.accounts[1].isWritable).toBe(true);
    expect(ix.accounts[1].isSigner).toBe(false);

    // owner: signer, not writable
    expect(ix.accounts[2].pubkey).toBe(CHARLIE);
    expect(ix.accounts[2].isSigner).toBe(true);
    expect(ix.accounts[2].isWritable).toBe(false);
  });

  it("should encode zero amount correctly", () => {
    const ix = createTransferInstruction(ALICE, BOB, CHARLIE, 0n);
    expect(ix.data[0]).toBe(3);
    expect(decodeU64LE(ix.data.slice(1))).toBe(0n);
  });
});

describe("createApproveInstruction", () => {
  it("should set programId to TOKEN_PROGRAM_ID", () => {
    const ix = createApproveInstruction(ALICE, BOB, CHARLIE, 500n);
    expect(ix.programId).toBe(TOKEN_PROGRAM_ID);
  });

  it("should have correct data layout: tag 4 + u64 LE amount", () => {
    const ix = createApproveInstruction(ALICE, BOB, CHARLIE, 500n);
    expect(ix.data.length).toBe(9);
    expect(ix.data[0]).toBe(4); // approve tag
    expect(decodeU64LE(ix.data.slice(1))).toBe(500n);
  });

  it("should have 3 accounts in correct order", () => {
    const ix = createApproveInstruction(ALICE, BOB, CHARLIE, 500n);
    expect(ix.accounts).toHaveLength(3);

    // source: writable, not signer
    expect(ix.accounts[0].pubkey).toBe(ALICE);
    expect(ix.accounts[0].isWritable).toBe(true);
    expect(ix.accounts[0].isSigner).toBe(false);

    // delegate: not writable, not signer
    expect(ix.accounts[1].pubkey).toBe(BOB);
    expect(ix.accounts[1].isWritable).toBe(false);
    expect(ix.accounts[1].isSigner).toBe(false);

    // owner: signer, not writable
    expect(ix.accounts[2].pubkey).toBe(CHARLIE);
    expect(ix.accounts[2].isSigner).toBe(true);
    expect(ix.accounts[2].isWritable).toBe(false);
  });
});

describe("createMintToInstruction", () => {
  it("should set programId to TOKEN_PROGRAM_ID", () => {
    const ix = createMintToInstruction(MINT, TOKEN_ACC, AUTHORITY, 1_000_000n);
    expect(ix.programId).toBe(TOKEN_PROGRAM_ID);
  });

  it("should have correct data layout: tag 7 + u64 LE amount", () => {
    const ix = createMintToInstruction(MINT, TOKEN_ACC, AUTHORITY, 1_000_000n);
    expect(ix.data.length).toBe(9);
    expect(ix.data[0]).toBe(7); // mintTo tag
    expect(decodeU64LE(ix.data.slice(1))).toBe(1_000_000n);
  });

  it("should have 3 accounts in correct order", () => {
    const ix = createMintToInstruction(MINT, TOKEN_ACC, AUTHORITY, 1_000_000n);
    expect(ix.accounts).toHaveLength(3);

    // mint: writable, not signer
    expect(ix.accounts[0].pubkey).toBe(MINT);
    expect(ix.accounts[0].isWritable).toBe(true);
    expect(ix.accounts[0].isSigner).toBe(false);

    // destination: writable, not signer
    expect(ix.accounts[1].pubkey).toBe(TOKEN_ACC);
    expect(ix.accounts[1].isWritable).toBe(true);
    expect(ix.accounts[1].isSigner).toBe(false);

    // authority: signer, not writable
    expect(ix.accounts[2].pubkey).toBe(AUTHORITY);
    expect(ix.accounts[2].isSigner).toBe(true);
    expect(ix.accounts[2].isWritable).toBe(false);
  });
});

describe("createInitializeAccountInstruction", () => {
  it("should set programId to TOKEN_PROGRAM_ID", () => {
    const ix = createInitializeAccountInstruction(TOKEN_ACC, MINT, ALICE);
    expect(ix.programId).toBe(TOKEN_PROGRAM_ID);
  });

  it("should have correct data layout: tag 1 only", () => {
    const ix = createInitializeAccountInstruction(TOKEN_ACC, MINT, ALICE);
    expect(ix.data.length).toBe(1);
    expect(ix.data[0]).toBe(1); // initializeAccount tag
  });

  it("should have 3 accounts in correct order", () => {
    const ix = createInitializeAccountInstruction(TOKEN_ACC, MINT, ALICE);
    expect(ix.accounts).toHaveLength(3);

    // account: writable, not signer
    expect(ix.accounts[0].pubkey).toBe(TOKEN_ACC);
    expect(ix.accounts[0].isWritable).toBe(true);
    expect(ix.accounts[0].isSigner).toBe(false);

    // mint: not writable, not signer
    expect(ix.accounts[1].pubkey).toBe(MINT);
    expect(ix.accounts[1].isWritable).toBe(false);
    expect(ix.accounts[1].isSigner).toBe(false);

    // owner: not writable, not signer
    expect(ix.accounts[2].pubkey).toBe(ALICE);
    expect(ix.accounts[2].isWritable).toBe(false);
    expect(ix.accounts[2].isSigner).toBe(false);
  });
});

describe("parseTokenInstruction", () => {
  it("should parse transfer instruction", () => {
    const ix = createTransferInstruction(ALICE, BOB, CHARLIE, 999n);
    const parsed = parseTokenInstruction(ix.data);
    expect(parsed.type).toBe("transfer");
    if (parsed.type === "transfer") {
      expect(parsed.amount).toBe(999n);
    }
  });

  it("should parse approve instruction", () => {
    const ix = createApproveInstruction(ALICE, BOB, CHARLIE, 500n);
    const parsed = parseTokenInstruction(ix.data);
    expect(parsed.type).toBe("approve");
    if (parsed.type === "approve") {
      expect(parsed.amount).toBe(500n);
    }
  });

  it("should parse mintTo instruction", () => {
    const ix = createMintToInstruction(MINT, TOKEN_ACC, AUTHORITY, 1_000_000n);
    const parsed = parseTokenInstruction(ix.data);
    expect(parsed.type).toBe("mintTo");
    if (parsed.type === "mintTo") {
      expect(parsed.amount).toBe(1_000_000n);
    }
  });

  it("should parse initializeAccount instruction", () => {
    const ix = createInitializeAccountInstruction(TOKEN_ACC, MINT, ALICE);
    const parsed = parseTokenInstruction(ix.data);
    expect(parsed.type).toBe("initializeAccount");
  });

  it("should return unknown for unrecognized tags", () => {
    const data = new Uint8Array([99, 0, 0, 0, 0, 0, 0, 0, 0]);
    const parsed = parseTokenInstruction(data);
    expect(parsed.type).toBe("unknown");
    if (parsed.type === "unknown") {
      expect(parsed.tag).toBe(99);
    }
  });

  it("should roundtrip transfer with max u64 amount", () => {
    const maxU64 = 18446744073709551615n;
    const ix = createTransferInstruction(ALICE, BOB, CHARLIE, maxU64);
    const parsed = parseTokenInstruction(ix.data);
    expect(parsed.type).toBe("transfer");
    if (parsed.type === "transfer") {
      expect(parsed.amount).toBe(maxU64);
    }
  });
});

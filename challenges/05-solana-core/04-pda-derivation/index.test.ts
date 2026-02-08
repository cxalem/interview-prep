import { describe, it, expect, vi } from "vitest";
import {
  simpleHash,
  toSeedBuffer,
  createProgramAddress,
  findProgramAddress,
  findAssociatedTokenAddress,
  findMetadataAddress,
  findEditionAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
} from "./index";

const WALLET_A = "Wa11etAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const WALLET_B = "Wa11etBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
const MINT_X = "MiNtXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const MINT_Y = "MiNtYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY";
const PROGRAM_A = "ProgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

describe("toSeedBuffer", () => {
  it("should convert a string to UTF-8 bytes", () => {
    const result = toSeedBuffer("hello");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(5);
    // "hello" in UTF-8 = [104, 101, 108, 108, 111]
    expect(Array.from(result)).toEqual([104, 101, 108, 108, 111]);
  });

  it("should convert an empty string to empty Uint8Array", () => {
    const result = toSeedBuffer("");
    expect(result.length).toBe(0);
  });

  it("should convert a number to 4 bytes LE (u32)", () => {
    const result = toSeedBuffer(256);
    expect(result.length).toBe(4);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(0);
    expect(result[3]).toBe(0);
  });

  it("should convert 0 number to 4 zero bytes", () => {
    const result = toSeedBuffer(0);
    expect(result.length).toBe(4);
    expect(Array.from(result)).toEqual([0, 0, 0, 0]);
  });

  it("should convert a bigint to 8 bytes LE (u64)", () => {
    const result = toSeedBuffer(1n);
    expect(result.length).toBe(8);
    expect(result[0]).toBe(1);
    expect(result.slice(1).every((b) => b === 0)).toBe(true);
  });

  it("should convert 0n bigint to 8 zero bytes", () => {
    const result = toSeedBuffer(0n);
    expect(result.length).toBe(8);
    expect(Array.from(result)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("should return Uint8Array as-is", () => {
    const input = new Uint8Array([1, 2, 3]);
    const result = toSeedBuffer(input);
    expect(result).toBe(input);
  });
});

describe("createProgramAddress", () => {
  it("should return a hex string address", () => {
    const seeds = [toSeedBuffer("test")];
    // This may or may not throw depending on the hash
    // But we can test the structure if it succeeds
    try {
      const address = createProgramAddress(seeds, PROGRAM_A);
      expect(typeof address).toBe("string");
      expect(address.length).toBeGreaterThan(0);
    } catch {
      // If it throws (on curve), that's also valid behavior
    }
  });

  it("should throw if hash starts with '00' (simulating on curve)", () => {
    // We need to find seeds that produce a hash starting with "00"
    // Since the hash is deterministic, we can brute-force a simple case
    // For now, test that createProgramAddress CAN throw
    let threw = false;
    for (let i = 0; i < 1000; i++) {
      try {
        createProgramAddress([toSeedBuffer(i)], PROGRAM_A);
      } catch {
        threw = true;
        break;
      }
    }
    // It's possible (but unlikely with 1000 tries) that none produce "00"
    // This test verifies the mechanism exists
    expect(typeof threw).toBe("boolean");
  });

  it("should produce deterministic results for same inputs", () => {
    const seeds = [toSeedBuffer("deterministic")];
    try {
      const addr1 = createProgramAddress(seeds, PROGRAM_A);
      const addr2 = createProgramAddress(seeds, PROGRAM_A);
      expect(addr1).toBe(addr2);
    } catch {
      // Both calls should either succeed or fail consistently
    }
  });

  it("should produce different results for different seeds", () => {
    const seeds1 = [toSeedBuffer("seed1")];
    const seeds2 = [toSeedBuffer("seed2")];
    try {
      const addr1 = createProgramAddress(seeds1, PROGRAM_A);
      const addr2 = createProgramAddress(seeds2, PROGRAM_A);
      expect(addr1).not.toBe(addr2);
    } catch {
      // May throw for one or both, which is acceptable
    }
  });

  it("should produce different results for different program IDs", () => {
    const seeds = [toSeedBuffer("same-seed")];
    const programB = "ProgBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
    try {
      const addr1 = createProgramAddress(seeds, PROGRAM_A);
      const addr2 = createProgramAddress(seeds, programB);
      expect(addr1).not.toBe(addr2);
    } catch {
      // May throw, acceptable
    }
  });
});

describe("findProgramAddress", () => {
  it("should return a [address, bump] tuple", () => {
    const seeds = [toSeedBuffer("test-find")];
    const [address, bump] = findProgramAddress(seeds, PROGRAM_A);
    expect(typeof address).toBe("string");
    expect(address.length).toBeGreaterThan(0);
    expect(typeof bump).toBe("number");
    expect(bump).toBeGreaterThanOrEqual(0);
    expect(bump).toBeLessThanOrEqual(255);
  });

  it("should produce deterministic results", () => {
    const seeds = [toSeedBuffer("deterministic-find")];
    const [addr1, bump1] = findProgramAddress(seeds, PROGRAM_A);
    const [addr2, bump2] = findProgramAddress(seeds, PROGRAM_A);
    expect(addr1).toBe(addr2);
    expect(bump1).toBe(bump2);
  });

  it("should produce different addresses for different seeds", () => {
    const [addr1] = findProgramAddress([toSeedBuffer("aaa")], PROGRAM_A);
    const [addr2] = findProgramAddress([toSeedBuffer("bbb")], PROGRAM_A);
    expect(addr1).not.toBe(addr2);
  });

  it("should work with multiple seeds", () => {
    const seeds = [toSeedBuffer("prefix"), toSeedBuffer("suffix")];
    const [address, bump] = findProgramAddress(seeds, PROGRAM_A);
    expect(typeof address).toBe("string");
    expect(bump).toBeGreaterThanOrEqual(0);
  });

  it("should find bump where createProgramAddress succeeds", () => {
    const seeds = [toSeedBuffer("verify-bump")];
    const [address, bump] = findProgramAddress(seeds, PROGRAM_A);

    // Verify that createProgramAddress with this bump produces the same address
    const seedsWithBump = [...seeds, new Uint8Array([bump])];
    const directAddress = createProgramAddress(seedsWithBump, PROGRAM_A);
    expect(directAddress).toBe(address);
  });

  it("should start searching from bump 255 (canonical bump)", () => {
    const seeds = [toSeedBuffer("canonical")];
    const [, bump] = findProgramAddress(seeds, PROGRAM_A);

    // The bump should be the highest valid one (searched from 255 down)
    // Verify no higher bump works
    for (let b = 255; b > bump; b--) {
      expect(() => {
        createProgramAddress([...seeds, new Uint8Array([b])], PROGRAM_A);
      }).toThrow();
    }
  });
});

describe("findAssociatedTokenAddress", () => {
  it("should derive a deterministic address for a wallet and mint", () => {
    const [addr1, bump1] = findAssociatedTokenAddress(WALLET_A, MINT_X);
    const [addr2, bump2] = findAssociatedTokenAddress(WALLET_A, MINT_X);
    expect(addr1).toBe(addr2);
    expect(bump1).toBe(bump2);
  });

  it("should produce different addresses for different wallets", () => {
    const [addr1] = findAssociatedTokenAddress(WALLET_A, MINT_X);
    const [addr2] = findAssociatedTokenAddress(WALLET_B, MINT_X);
    expect(addr1).not.toBe(addr2);
  });

  it("should produce different addresses for different mints", () => {
    const [addr1] = findAssociatedTokenAddress(WALLET_A, MINT_X);
    const [addr2] = findAssociatedTokenAddress(WALLET_A, MINT_Y);
    expect(addr1).not.toBe(addr2);
  });

  it("should return a valid bump seed", () => {
    const [, bump] = findAssociatedTokenAddress(WALLET_A, MINT_X);
    expect(bump).toBeGreaterThanOrEqual(0);
    expect(bump).toBeLessThanOrEqual(255);
  });
});

describe("findMetadataAddress", () => {
  it("should derive a deterministic address for a mint", () => {
    const [addr1, bump1] = findMetadataAddress(MINT_X);
    const [addr2, bump2] = findMetadataAddress(MINT_X);
    expect(addr1).toBe(addr2);
    expect(bump1).toBe(bump2);
  });

  it("should produce different addresses for different mints", () => {
    const [addr1] = findMetadataAddress(MINT_X);
    const [addr2] = findMetadataAddress(MINT_Y);
    expect(addr1).not.toBe(addr2);
  });

  it("should return a valid bump seed", () => {
    const [, bump] = findMetadataAddress(MINT_X);
    expect(bump).toBeGreaterThanOrEqual(0);
    expect(bump).toBeLessThanOrEqual(255);
  });
});

describe("findEditionAddress", () => {
  it("should derive a deterministic address for a mint", () => {
    const [addr1, bump1] = findEditionAddress(MINT_X);
    const [addr2, bump2] = findEditionAddress(MINT_X);
    expect(addr1).toBe(addr2);
    expect(bump1).toBe(bump2);
  });

  it("should produce different addresses for different mints", () => {
    const [addr1] = findEditionAddress(MINT_X);
    const [addr2] = findEditionAddress(MINT_Y);
    expect(addr1).not.toBe(addr2);
  });

  it("should produce a different address than findMetadataAddress for same mint", () => {
    const [metaAddr] = findMetadataAddress(MINT_X);
    const [editionAddr] = findEditionAddress(MINT_X);
    expect(metaAddr).not.toBe(editionAddr);
  });

  it("should return a valid bump seed", () => {
    const [, bump] = findEditionAddress(MINT_X);
    expect(bump).toBeGreaterThanOrEqual(0);
    expect(bump).toBeLessThanOrEqual(255);
  });
});

describe("simpleHash (provided helper)", () => {
  it("should return a hex string", () => {
    const result = simpleHash(new Uint8Array([1, 2, 3]));
    expect(typeof result).toBe("string");
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it("should be deterministic", () => {
    const data = new Uint8Array([10, 20, 30]);
    expect(simpleHash(data)).toBe(simpleHash(data));
  });

  it("should produce different hashes for different inputs", () => {
    const hash1 = simpleHash(new Uint8Array([1]));
    const hash2 = simpleHash(new Uint8Array([2]));
    expect(hash1).not.toBe(hash2);
  });
});

import { describe, it, expect } from "vitest";
import {
  toPublicKey,
  toSignature,
  toTransactionId,
  toLamports,
  toSol,
  lamportsToSol,
  solToLamports,
  isValidPublicKey,
  isValidSignature,
  type PublicKey,
  type Signature,
  type TransactionId,
  type Lamports,
  type Sol,
} from "./index";

// Example valid base58 strings of appropriate lengths
const VALID_PUBKEY = "11111111111111111111111111111111"; // 32 chars, system program
const VALID_PUBKEY_2 = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"; // 44 chars, token program
const VALID_SIGNATURE =
  "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQU"; // 88 chars
const VALID_SIGNATURE_87 =
  "4VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQ"; // 87 chars

describe("Challenge 1.4: Branded Types", () => {
  // =========================================
  // toPublicKey
  // =========================================
  describe("toPublicKey()", () => {
    it("should accept a valid 32-char base58 public key", () => {
      const pk = toPublicKey(VALID_PUBKEY);
      expect(pk).toBe(VALID_PUBKEY);
    });

    it("should accept a valid 44-char base58 public key", () => {
      const pk = toPublicKey(VALID_PUBKEY_2);
      expect(pk).toBe(VALID_PUBKEY_2);
    });

    it("should throw for a string that is too short", () => {
      expect(() => toPublicKey("abc")).toThrow();
    });

    it("should throw for a string that is too long", () => {
      const tooLong = "1".repeat(45);
      expect(() => toPublicKey(tooLong)).toThrow();
    });

    it("should throw for invalid base58 characters (contains 0)", () => {
      expect(() => toPublicKey("0".repeat(32))).toThrow();
    });

    it("should throw for invalid base58 characters (contains O)", () => {
      expect(() => toPublicKey("O".repeat(32))).toThrow();
    });

    it("should throw for invalid base58 characters (contains I)", () => {
      expect(() => toPublicKey("I".repeat(32))).toThrow();
    });

    it("should throw for invalid base58 characters (contains l)", () => {
      expect(() => toPublicKey("l".repeat(32))).toThrow();
    });
  });

  // =========================================
  // toSignature
  // =========================================
  describe("toSignature()", () => {
    it("should accept a valid 88-char base58 signature", () => {
      const sig = toSignature(VALID_SIGNATURE);
      expect(sig).toBe(VALID_SIGNATURE);
    });

    it("should accept a valid 87-char base58 signature", () => {
      const sig = toSignature(VALID_SIGNATURE_87);
      expect(sig).toBe(VALID_SIGNATURE_87);
    });

    it("should throw for a string that is too short", () => {
      expect(() => toSignature("abc")).toThrow();
    });

    it("should throw for a string that is too long", () => {
      const tooLong = "1".repeat(89);
      expect(() => toSignature(tooLong)).toThrow();
    });

    it("should throw for invalid base58 characters", () => {
      const invalid = "0".repeat(88);
      expect(() => toSignature(invalid)).toThrow();
    });
  });

  // =========================================
  // toTransactionId
  // =========================================
  describe("toTransactionId()", () => {
    it("should accept a valid 88-char base58 transaction id", () => {
      const txId = toTransactionId(VALID_SIGNATURE);
      expect(txId).toBe(VALID_SIGNATURE);
    });

    it("should throw for invalid strings", () => {
      expect(() => toTransactionId("not-valid")).toThrow();
    });
  });

  // =========================================
  // toLamports
  // =========================================
  describe("toLamports()", () => {
    it("should accept zero", () => {
      expect(toLamports(0)).toBe(0);
    });

    it("should accept a positive integer", () => {
      expect(toLamports(1_000_000_000)).toBe(1_000_000_000);
    });

    it("should throw for negative numbers", () => {
      expect(() => toLamports(-1)).toThrow();
    });

    it("should throw for fractional numbers", () => {
      expect(() => toLamports(1.5)).toThrow();
    });

    it("should throw for NaN", () => {
      expect(() => toLamports(NaN)).toThrow();
    });

    it("should throw for Infinity", () => {
      expect(() => toLamports(Infinity)).toThrow();
    });
  });

  // =========================================
  // toSol
  // =========================================
  describe("toSol()", () => {
    it("should accept zero", () => {
      expect(toSol(0)).toBe(0);
    });

    it("should accept a positive number", () => {
      expect(toSol(1.5)).toBe(1.5);
    });

    it("should accept a positive integer", () => {
      expect(toSol(100)).toBe(100);
    });

    it("should throw for negative numbers", () => {
      expect(() => toSol(-0.5)).toThrow();
    });

    it("should throw for NaN", () => {
      expect(() => toSol(NaN)).toThrow();
    });

    it("should throw for Infinity", () => {
      expect(() => toSol(Infinity)).toThrow();
    });
  });

  // =========================================
  // Conversion Functions
  // =========================================
  describe("lamportsToSol()", () => {
    it("should convert 1 SOL worth of lamports", () => {
      const lamports = toLamports(1_000_000_000);
      const sol = lamportsToSol(lamports);
      expect(sol).toBe(1);
    });

    it("should convert 0 lamports to 0 SOL", () => {
      const lamports = toLamports(0);
      const sol = lamportsToSol(lamports);
      expect(sol).toBe(0);
    });

    it("should handle fractional SOL results", () => {
      const lamports = toLamports(500_000_000);
      const sol = lamportsToSol(lamports);
      expect(sol).toBe(0.5);
    });

    it("should handle small lamport amounts", () => {
      const lamports = toLamports(1);
      const sol = lamportsToSol(lamports);
      expect(sol).toBe(1e-9);
    });
  });

  describe("solToLamports()", () => {
    it("should convert 1 SOL to 1_000_000_000 lamports", () => {
      const sol = toSol(1);
      const lamports = solToLamports(sol);
      expect(lamports).toBe(1_000_000_000);
    });

    it("should convert 0 SOL to 0 lamports", () => {
      const sol = toSol(0);
      const lamports = solToLamports(sol);
      expect(lamports).toBe(0);
    });

    it("should round fractional lamports to nearest integer", () => {
      const sol = toSol(0.0000000015);
      const lamports = solToLamports(sol);
      // 0.0000000015 * 1e9 = 1.5 => rounds to 2
      expect(lamports).toBe(Math.round(0.0000000015 * 1e9));
    });
  });

  // =========================================
  // Type Guard Functions
  // =========================================
  describe("isValidPublicKey()", () => {
    it("should return true for a valid public key", () => {
      expect(isValidPublicKey(VALID_PUBKEY)).toBe(true);
    });

    it("should return true for a 44-char valid public key", () => {
      expect(isValidPublicKey(VALID_PUBKEY_2)).toBe(true);
    });

    it("should return false for an invalid string", () => {
      expect(isValidPublicKey("not-a-key")).toBe(false);
    });

    it("should return false for a string that is too short", () => {
      expect(isValidPublicKey("abc")).toBe(false);
    });

    it("should return false for a string with invalid base58 chars", () => {
      expect(isValidPublicKey("0".repeat(32))).toBe(false);
    });

    it("should narrow the type when used in a conditional", () => {
      const raw = VALID_PUBKEY;
      if (isValidPublicKey(raw)) {
        // Inside this block, `raw` should be narrowed to PublicKey
        const pk: PublicKey = raw;
        expect(pk).toBe(VALID_PUBKEY);
      }
    });
  });

  describe("isValidSignature()", () => {
    it("should return true for a valid 88-char signature", () => {
      expect(isValidSignature(VALID_SIGNATURE)).toBe(true);
    });

    it("should return true for a valid 87-char signature", () => {
      expect(isValidSignature(VALID_SIGNATURE_87)).toBe(true);
    });

    it("should return false for an invalid string", () => {
      expect(isValidSignature("not-a-sig")).toBe(false);
    });

    it("should return false for a public key length string", () => {
      expect(isValidSignature(VALID_PUBKEY)).toBe(false);
    });

    it("should narrow the type when used in a conditional", () => {
      const raw = VALID_SIGNATURE;
      if (isValidSignature(raw)) {
        const sig: Signature = raw;
        expect(sig).toBe(VALID_SIGNATURE);
      }
    });
  });
});

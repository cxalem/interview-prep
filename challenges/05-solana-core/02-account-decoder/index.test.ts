import { describe, it, expect, vi } from "vitest";
import {
  BufferReader,
  BufferWriter,
  decodeTokenAccount,
  encodeTokenAccount,
  type TokenAccount,
} from "./index";

// Helper to create a hex string of n bytes
function hexKey(byte: number): string {
  return Array(32).fill(byte.toString(16).padStart(2, "0")).join("");
}

describe("BufferReader", () => {
  describe("readU8", () => {
    it("should read a single byte", () => {
      const reader = new BufferReader(new Uint8Array([42]));
      expect(reader.readU8()).toBe(42);
    });

    it("should advance offset by 1", () => {
      const reader = new BufferReader(new Uint8Array([10, 20, 30]));
      reader.readU8();
      expect(reader.offset).toBe(1);
      reader.readU8();
      expect(reader.offset).toBe(2);
    });

    it("should throw when reading past end of buffer", () => {
      const reader = new BufferReader(new Uint8Array([]));
      expect(() => reader.readU8()).toThrow();
    });
  });

  describe("readU16LE", () => {
    it("should read 2 bytes in little-endian order", () => {
      // 0x0100 in LE = [0x00, 0x01] = 256
      const reader = new BufferReader(new Uint8Array([0x00, 0x01]));
      expect(reader.readU16LE()).toBe(256);
    });

    it("should read 0xFFFF correctly", () => {
      const reader = new BufferReader(new Uint8Array([0xff, 0xff]));
      expect(reader.readU16LE()).toBe(65535);
    });

    it("should advance offset by 2", () => {
      const reader = new BufferReader(new Uint8Array([0x01, 0x00, 0x02, 0x00]));
      reader.readU16LE();
      expect(reader.offset).toBe(2);
    });
  });

  describe("readU32LE", () => {
    it("should read 4 bytes in little-endian order", () => {
      // 1 in LE = [0x01, 0x00, 0x00, 0x00]
      const reader = new BufferReader(new Uint8Array([0x01, 0x00, 0x00, 0x00]));
      expect(reader.readU32LE()).toBe(1);
    });

    it("should read large values correctly", () => {
      // 0xDEADBEEF in LE = [0xEF, 0xBE, 0xAD, 0xDE]
      const reader = new BufferReader(new Uint8Array([0xef, 0xbe, 0xad, 0xde]));
      expect(reader.readU32LE()).toBe(0xdeadbeef);
    });

    it("should advance offset by 4", () => {
      const reader = new BufferReader(new Uint8Array(8));
      reader.readU32LE();
      expect(reader.offset).toBe(4);
    });
  });

  describe("readU64LE", () => {
    it("should read 8 bytes as bigint in little-endian order", () => {
      const bytes = new Uint8Array([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const reader = new BufferReader(bytes);
      expect(reader.readU64LE()).toBe(1n);
    });

    it("should handle large bigint values", () => {
      // 1_000_000_000n = 0x3B9ACA00 in LE = [0x00, 0xCA, 0x9A, 0x3B, 0x00, 0x00, 0x00, 0x00]
      const bytes = new Uint8Array([0x00, 0xca, 0x9a, 0x3b, 0x00, 0x00, 0x00, 0x00]);
      const reader = new BufferReader(bytes);
      expect(reader.readU64LE()).toBe(1_000_000_000n);
    });

    it("should handle max u64", () => {
      const bytes = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
      const reader = new BufferReader(bytes);
      expect(reader.readU64LE()).toBe(18446744073709551615n);
    });

    it("should advance offset by 8", () => {
      const reader = new BufferReader(new Uint8Array(16));
      reader.readU64LE();
      expect(reader.offset).toBe(8);
    });
  });

  describe("readBool", () => {
    it("should return false for 0", () => {
      const reader = new BufferReader(new Uint8Array([0]));
      expect(reader.readBool()).toBe(false);
    });

    it("should return true for 1", () => {
      const reader = new BufferReader(new Uint8Array([1]));
      expect(reader.readBool()).toBe(true);
    });

    it("should return true for any non-zero value", () => {
      const reader = new BufferReader(new Uint8Array([255]));
      expect(reader.readBool()).toBe(true);
    });
  });

  describe("readString", () => {
    it("should read a length-prefixed string", () => {
      const str = "hello";
      const encoded = new TextEncoder().encode(str);
      const buf = new Uint8Array(4 + encoded.length);
      // Write length as u32 LE
      buf[0] = encoded.length;
      buf[1] = 0;
      buf[2] = 0;
      buf[3] = 0;
      buf.set(encoded, 4);

      const reader = new BufferReader(buf);
      expect(reader.readString()).toBe("hello");
    });

    it("should read an empty string", () => {
      const buf = new Uint8Array([0, 0, 0, 0]);
      const reader = new BufferReader(buf);
      expect(reader.readString()).toBe("");
    });

    it("should handle UTF-8 characters", () => {
      const str = "cafe\u0301"; // café with combining accent
      const encoded = new TextEncoder().encode(str);
      const buf = new Uint8Array(4 + encoded.length);
      buf[0] = encoded.length;
      buf[1] = 0;
      buf[2] = 0;
      buf[3] = 0;
      buf.set(encoded, 4);

      const reader = new BufferReader(buf);
      expect(reader.readString()).toBe(str);
    });
  });

  describe("readPublicKey", () => {
    it("should read 32 bytes as hex string", () => {
      const bytes = new Uint8Array(32);
      bytes[0] = 0xab;
      bytes[1] = 0xcd;
      bytes[31] = 0xef;

      const reader = new BufferReader(bytes);
      const hex = reader.readPublicKey();
      expect(hex).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(hex.startsWith("abcd")).toBe(true);
      expect(hex.endsWith("ef")).toBe(true);
    });

    it("should advance offset by 32", () => {
      const reader = new BufferReader(new Uint8Array(64));
      reader.readPublicKey();
      expect(reader.offset).toBe(32);
    });
  });

  describe("readOption", () => {
    it("should return null when tag is 0", () => {
      const reader = new BufferReader(new Uint8Array([0]));
      const result = reader.readOption(() => reader.readU8());
      expect(result).toBeNull();
    });

    it("should return value when tag is 1", () => {
      const reader = new BufferReader(new Uint8Array([1, 42]));
      const result = reader.readOption(() => reader.readU8());
      expect(result).toBe(42);
    });
  });

  describe("readVec", () => {
    it("should read a vector of u8 values", () => {
      // Length = 3 (u32 LE), then [10, 20, 30]
      const buf = new Uint8Array([3, 0, 0, 0, 10, 20, 30]);
      const reader = new BufferReader(buf);
      const result = reader.readVec(() => reader.readU8());
      expect(result).toEqual([10, 20, 30]);
    });

    it("should return empty array for length 0", () => {
      const buf = new Uint8Array([0, 0, 0, 0]);
      const reader = new BufferReader(buf);
      const result = reader.readVec(() => reader.readU8());
      expect(result).toEqual([]);
    });

    it("should work with complex reader functions", () => {
      // Length = 2, then two u16 LE values: [1, 0] and [2, 0]
      const buf = new Uint8Array([2, 0, 0, 0, 1, 0, 2, 0]);
      const reader = new BufferReader(buf);
      const result = reader.readVec(() => reader.readU16LE());
      expect(result).toEqual([1, 2]);
    });
  });

  describe("remaining", () => {
    it("should return total length when nothing has been read", () => {
      const reader = new BufferReader(new Uint8Array(10));
      expect(reader.remaining()).toBe(10);
    });

    it("should decrease as data is read", () => {
      const reader = new BufferReader(new Uint8Array(10));
      reader.readU8();
      expect(reader.remaining()).toBe(9);
    });

    it("should return 0 when all data has been read", () => {
      const reader = new BufferReader(new Uint8Array(1));
      reader.readU8();
      expect(reader.remaining()).toBe(0);
    });
  });
});

describe("BufferWriter", () => {
  describe("writeU8 / readU8 roundtrip", () => {
    it("should write and read back a u8", () => {
      const writer = new BufferWriter();
      writer.writeU8(255);
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      expect(reader.readU8()).toBe(255);
    });
  });

  describe("writeU16LE / readU16LE roundtrip", () => {
    it("should write and read back a u16", () => {
      const writer = new BufferWriter();
      writer.writeU16LE(12345);
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      expect(reader.readU16LE()).toBe(12345);
    });
  });

  describe("writeU32LE / readU32LE roundtrip", () => {
    it("should write and read back a u32", () => {
      const writer = new BufferWriter();
      writer.writeU32LE(0xdeadbeef);
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      expect(reader.readU32LE()).toBe(0xdeadbeef);
    });
  });

  describe("writeU64LE / readU64LE roundtrip", () => {
    it("should write and read back a u64", () => {
      const writer = new BufferWriter();
      writer.writeU64LE(9_000_000_000_000_000_000n);
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      expect(reader.readU64LE()).toBe(9_000_000_000_000_000_000n);
    });

    it("should handle zero", () => {
      const writer = new BufferWriter();
      writer.writeU64LE(0n);
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      expect(reader.readU64LE()).toBe(0n);
    });
  });

  describe("writeBool / readBool roundtrip", () => {
    it("should roundtrip true", () => {
      const writer = new BufferWriter();
      writer.writeBool(true);
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      expect(reader.readBool()).toBe(true);
    });

    it("should roundtrip false", () => {
      const writer = new BufferWriter();
      writer.writeBool(false);
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      expect(reader.readBool()).toBe(false);
    });
  });

  describe("writeString / readString roundtrip", () => {
    it("should roundtrip a string", () => {
      const writer = new BufferWriter();
      writer.writeString("Solana");
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      expect(reader.readString()).toBe("Solana");
    });

    it("should roundtrip an empty string", () => {
      const writer = new BufferWriter();
      writer.writeString("");
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      expect(reader.readString()).toBe("");
    });
  });

  describe("writePublicKey / readPublicKey roundtrip", () => {
    it("should roundtrip a public key", () => {
      const key = hexKey(0xab);
      const writer = new BufferWriter();
      writer.writePublicKey(key);
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      expect(reader.readPublicKey()).toBe(key);
    });
  });

  describe("writeOption / readOption roundtrip", () => {
    it("should roundtrip Some value", () => {
      const writer = new BufferWriter();
      writer.writeOption(42, (v) => writer.writeU8(v));
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      const result = reader.readOption(() => reader.readU8());
      expect(result).toBe(42);
    });

    it("should roundtrip None", () => {
      const writer = new BufferWriter();
      writer.writeOption(null, (v: number) => writer.writeU8(v));
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      const result = reader.readOption(() => reader.readU8());
      expect(result).toBeNull();
    });
  });

  describe("writeVec / readVec roundtrip", () => {
    it("should roundtrip a vector", () => {
      const writer = new BufferWriter();
      writer.writeVec([100, 200, 255], (v) => writer.writeU8(v));
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      const result = reader.readVec(() => reader.readU8());
      expect(result).toEqual([100, 200, 255]);
    });

    it("should roundtrip an empty vector", () => {
      const writer = new BufferWriter();
      writer.writeVec([], (v: number) => writer.writeU8(v));
      const data = writer.toUint8Array();
      const reader = new BufferReader(data);
      const result = reader.readVec(() => reader.readU8());
      expect(result).toEqual([]);
    });
  });

  describe("toUint8Array", () => {
    it("should return a Uint8Array", () => {
      const writer = new BufferWriter();
      writer.writeU8(1);
      const result = writer.toUint8Array();
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it("should return correct length for multiple writes", () => {
      const writer = new BufferWriter();
      writer.writeU8(1); // 1 byte
      writer.writeU32LE(100); // 4 bytes
      writer.writeU64LE(200n); // 8 bytes
      const result = writer.toUint8Array();
      expect(result.length).toBe(13);
    });
  });
});

describe("TokenAccount encode/decode", () => {
  const sampleAccount: TokenAccount = {
    mint: hexKey(0x01),
    owner: hexKey(0x02),
    amount: 1_000_000_000n,
    delegate: hexKey(0x03),
    state: 1,
    isNative: null,
    delegatedAmount: 500_000n,
  };

  const accountWithoutDelegate: TokenAccount = {
    mint: hexKey(0x0a),
    owner: hexKey(0x0b),
    amount: 0n,
    delegate: null,
    state: 0,
    isNative: 1_000_000n,
    delegatedAmount: 0n,
  };

  it("should encode and decode a token account with delegate", () => {
    const encoded = encodeTokenAccount(sampleAccount);
    const decoded = decodeTokenAccount(encoded);
    expect(decoded.mint).toBe(sampleAccount.mint);
    expect(decoded.owner).toBe(sampleAccount.owner);
    expect(decoded.amount).toBe(sampleAccount.amount);
    expect(decoded.delegate).toBe(sampleAccount.delegate);
    expect(decoded.state).toBe(sampleAccount.state);
    expect(decoded.isNative).toBe(sampleAccount.isNative);
    expect(decoded.delegatedAmount).toBe(sampleAccount.delegatedAmount);
  });

  it("should encode and decode a token account without delegate", () => {
    const encoded = encodeTokenAccount(accountWithoutDelegate);
    const decoded = decodeTokenAccount(encoded);
    expect(decoded.mint).toBe(accountWithoutDelegate.mint);
    expect(decoded.owner).toBe(accountWithoutDelegate.owner);
    expect(decoded.amount).toBe(0n);
    expect(decoded.delegate).toBeNull();
    expect(decoded.state).toBe(0);
    expect(decoded.isNative).toBe(1_000_000n);
    expect(decoded.delegatedAmount).toBe(0n);
  });

  it("should produce consistent encoding length", () => {
    const encoded1 = encodeTokenAccount(sampleAccount);
    const encoded2 = encodeTokenAccount(accountWithoutDelegate);
    // With delegate: 32 + 32 + 8 + (1+32) + 1 + (1+0) + 8 = 115
    // Without delegate: 32 + 32 + 8 + (1+0) + 1 + (1+8) + 8 = 91
    expect(encoded1.length).toBeGreaterThan(0);
    expect(encoded2.length).toBeGreaterThan(0);
    // Account with delegate should be larger due to extra 32 bytes for delegate key
    // vs 8 bytes for isNative
    expect(encoded1.length).not.toBe(encoded2.length);
  });

  it("should throw when decoding from empty buffer", () => {
    expect(() => decodeTokenAccount(new Uint8Array([]))).toThrow();
  });

  it("should throw when buffer is too short", () => {
    expect(() => decodeTokenAccount(new Uint8Array(10))).toThrow();
  });
});

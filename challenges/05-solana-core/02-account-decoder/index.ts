// Challenge 5.2: Account Data Decoder
// Implement binary data decoder for Solana account data (Borsh-like).

export class BufferReader {
  private data: Uint8Array;
  public offset: number;

  constructor(data: Uint8Array) {
    this.data = data;
    this.offset = 0;
  }

  /** Read 1 byte as unsigned integer. */
  readU8(): number {
    // TODO: Read a single byte and advance offset
    throw new Error("Not implemented");
  }

  /** Read 2 bytes as unsigned integer (little-endian). */
  readU16LE(): number {
    // TODO: Read 2 bytes in little-endian order
    throw new Error("Not implemented");
  }

  /** Read 4 bytes as unsigned integer (little-endian). */
  readU32LE(): number {
    // TODO: Read 4 bytes in little-endian order
    throw new Error("Not implemented");
  }

  /** Read 8 bytes as bigint (little-endian). */
  readU64LE(): bigint {
    // TODO: Read 8 bytes in little-endian order, return as bigint
    throw new Error("Not implemented");
  }

  /** Read 1 byte as boolean (non-zero = true). */
  readBool(): boolean {
    // TODO: Read 1 byte and return boolean
    throw new Error("Not implemented");
  }

  /** Read a length-prefixed string (u32 length + UTF-8 bytes). */
  readString(): string {
    // TODO: Read u32 length, then that many bytes as UTF-8 string
    throw new Error("Not implemented");
  }

  /** Read 32 bytes and return as hex string. */
  readPublicKey(): string {
    // TODO: Read 32 bytes, convert to hex string
    throw new Error("Not implemented");
  }

  /**
   * Read an optional value.
   * 1-byte tag: 0 = null, 1 = read value using provided reader function.
   */
  readOption<T>(reader: () => T): T | null {
    // TODO: Read tag byte, if 1 call reader, if 0 return null
    throw new Error("Not implemented");
  }

  /**
   * Read a vector of values.
   * u32 length prefix, then call reader that many times.
   */
  readVec<T>(reader: () => T): T[] {
    // TODO: Read u32 length, then read that many items
    throw new Error("Not implemented");
  }

  /** Number of bytes remaining in the buffer. */
  remaining(): number {
    // TODO: Return bytes remaining
    throw new Error("Not implemented");
  }
}

export class BufferWriter {
  private chunks: number[];

  constructor() {
    this.chunks = [];
  }

  /** Write 1 byte. */
  writeU8(value: number): void {
    // TODO: Write a single byte
    throw new Error("Not implemented");
  }

  /** Write 2 bytes (little-endian). */
  writeU16LE(value: number): void {
    // TODO: Write 2 bytes in little-endian order
    throw new Error("Not implemented");
  }

  /** Write 4 bytes (little-endian). */
  writeU32LE(value: number): void {
    // TODO: Write 4 bytes in little-endian order
    throw new Error("Not implemented");
  }

  /** Write 8 bytes as bigint (little-endian). */
  writeU64LE(value: bigint): void {
    // TODO: Write 8 bytes in little-endian order from bigint
    throw new Error("Not implemented");
  }

  /** Write a boolean as 1 byte. */
  writeBool(value: boolean): void {
    // TODO: Write 1 byte (1 for true, 0 for false)
    throw new Error("Not implemented");
  }

  /** Write a length-prefixed string (u32 length + UTF-8 bytes). */
  writeString(value: string): void {
    // TODO: Write u32 length prefix, then UTF-8 bytes
    throw new Error("Not implemented");
  }

  /** Write 32 bytes from a hex string. */
  writePublicKey(hex: string): void {
    // TODO: Convert hex string to 32 bytes and write
    throw new Error("Not implemented");
  }

  /** Write an optional value. Tag byte 0 for null, 1 + value for present. */
  writeOption<T>(value: T | null, writer: (v: T) => void): void {
    // TODO: Write tag byte, then value if present
    throw new Error("Not implemented");
  }

  /** Write a vector. u32 length prefix, then each item. */
  writeVec<T>(items: T[], writer: (v: T) => void): void {
    // TODO: Write u32 length, then write each item
    throw new Error("Not implemented");
  }

  /** Return the written data as a Uint8Array. */
  toUint8Array(): Uint8Array {
    // TODO: Return the final buffer
    throw new Error("Not implemented");
  }
}

export interface TokenAccount {
  mint: string; // PublicKey as hex (32 bytes)
  owner: string; // PublicKey as hex (32 bytes)
  amount: bigint; // u64
  delegate: string | null; // Option<PublicKey>
  state: number; // u8: 0=uninitialized, 1=initialized, 2=frozen
  isNative: bigint | null; // Option<u64>
  delegatedAmount: bigint; // u64
}

/**
 * Decode a TokenAccount from raw bytes.
 */
export function decodeTokenAccount(data: Uint8Array): TokenAccount {
  // TODO: Use BufferReader to decode each field in order
  throw new Error("Not implemented");
}

/**
 * Encode a TokenAccount to raw bytes.
 */
export function encodeTokenAccount(account: TokenAccount): Uint8Array {
  // TODO: Use BufferWriter to encode each field in order
  throw new Error("Not implemented");
}

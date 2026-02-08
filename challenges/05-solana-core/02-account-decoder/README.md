# Challenge 5.2: Account Data Decoder

## Difficulty: Hard
## AI Assistance: None
## Time Limit: 60 minutes

## Description

Implement a binary data decoder for Solana account data, similar to Borsh deserialization. Solana programs store data in accounts as raw bytes. To read this data in a client, you need to deserialize it according to the account's schema.

This challenge requires implementing a `BufferReader` and `BufferWriter` that understand common Solana data types, then using them to decode a simulated SPL Token account.

## Requirements

### BufferReader Class
Reads from a `Uint8Array` sequentially:
- `readU8()` — read 1 byte as unsigned integer
- `readU16LE()` — read 2 bytes as unsigned integer (little-endian)
- `readU32LE()` — read 4 bytes as unsigned integer (little-endian)
- `readU64LE()` — read 8 bytes as `bigint` (little-endian)
- `readBool()` — read 1 byte, return `true` if non-zero
- `readString()` — read a u32 length prefix, then that many UTF-8 bytes
- `readPublicKey()` — read 32 bytes, return as hex string
- `readOption<T>(reader: () => T)` — read 1-byte tag; if 1, call reader and return value; if 0, return null
- `readVec<T>(reader: () => T)` — read u32 length, then call reader that many times, return array
- `remaining()` — number of bytes remaining
- `offset` — current read position (publicly accessible)

### BufferWriter Class
Writes to a growable buffer:
- `writeU8(value)`, `writeU16LE(value)`, `writeU32LE(value)`, `writeU64LE(value: bigint)`
- `writeBool(value)`
- `writeString(value)` — write u32 length prefix + UTF-8 bytes
- `writePublicKey(hex: string)` — write 32 bytes from hex string
- `writeOption<T>(value: T | null, writer: (v: T) => void)` — write tag + value if present
- `writeVec<T>(items: T[], writer: (v: T) => void)` — write u32 length + items
- `toUint8Array()` — return the final buffer

### TokenAccount Struct
Define and decode:
```typescript
interface TokenAccount {
  mint: string;        // PublicKey (32 bytes)
  owner: string;       // PublicKey (32 bytes)
  amount: bigint;      // u64
  delegate: string | null;  // Option<PublicKey>
  state: number;       // u8 (0=uninitialized, 1=initialized, 2=frozen)
  isNative: bigint | null;  // Option<u64>
  delegatedAmount: bigint;  // u64
}
```

- `decodeTokenAccount(data: Uint8Array): TokenAccount`
- `encodeTokenAccount(account: TokenAccount): Uint8Array`

## Hints
- Little-endian means least significant byte first
- For u64, use `BigInt` and shift operations or `DataView`
- String encoding uses `TextEncoder` / `TextDecoder`
- Option fields use a 1-byte tag: 0 = None, 1 = Some
- Be careful with buffer bounds — throw on read past end

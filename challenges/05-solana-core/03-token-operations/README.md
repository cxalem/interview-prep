# Challenge 5.3: Token Operations

## Difficulty: Medium
## AI Assistance: None
## Time Limit: 45 minutes

## Description

Implement helpers to construct SPL Token program instructions. The SPL Token program uses specific byte layouts for instruction data. This challenge tests your understanding of how Solana instructions are structured and how programs use discriminators (tags) to identify which operation to perform.

Each instruction has a specific byte layout: a 1-byte instruction tag followed by any parameters encoded as little-endian bytes.

## Requirements

### Constants
- `TOKEN_PROGRAM_ID` = `"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"`

### Types
```typescript
type PublicKey = string;

interface AccountMeta {
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
}

interface Instruction {
  programId: PublicKey;
  accounts: AccountMeta[];
  data: Uint8Array;
}
```

### Instruction Builders
- `createTransferInstruction(source, destination, owner, amount: bigint)` -> `Instruction`
  - Data layout: `[3]` (transfer tag) + amount as u64 LE (8 bytes) = 9 bytes total
  - Accounts: source (writable, not signer), destination (writable, not signer), owner (signer, not writable)

- `createApproveInstruction(source, delegate, owner, amount: bigint)` -> `Instruction`
  - Data layout: `[4]` (approve tag) + amount as u64 LE = 9 bytes total
  - Accounts: source (writable, not signer), delegate (not writable, not signer), owner (signer, not writable)

- `createMintToInstruction(mint, destination, authority, amount: bigint)` -> `Instruction`
  - Data layout: `[7]` (mintTo tag) + amount as u64 LE = 9 bytes total
  - Accounts: mint (writable, not signer), destination (writable, not signer), authority (signer, not writable)

- `createInitializeAccountInstruction(account, mint, owner)` -> `Instruction`
  - Data layout: `[1]` (initializeAccount tag) = 1 byte total
  - Accounts: account (writable, not signer), mint (not writable, not signer), owner (not writable, not signer)

### Parser
- `parseTokenInstruction(data: Uint8Array)` -> tagged union:
  ```typescript
  | { type: "transfer"; amount: bigint }
  | { type: "approve"; amount: bigint }
  | { type: "mintTo"; amount: bigint }
  | { type: "initializeAccount" }
  | { type: "unknown"; tag: number }
  ```

### Helpers
- `encodeU64LE(value: bigint): Uint8Array` — encode a bigint as 8 bytes little-endian
- `decodeU64LE(bytes: Uint8Array): bigint` — decode 8 bytes little-endian to bigint

## Hints
- Little-endian means least significant byte first
- Use bitwise operations with BigInt: `value & 0xFFn`, `value >> 8n`
- The instruction tag is always the first byte
- Account ordering matters — it must match what the on-chain program expects

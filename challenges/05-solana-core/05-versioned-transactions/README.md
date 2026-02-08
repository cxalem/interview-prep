# Challenge 5.5: Versioned Transactions

## Difficulty: Hard
## AI Assistance: None
## Time Limit: 60 minutes

## Description

Implement the versioned transaction format (V0 with Address Lookup Tables). This tests deep understanding of Solana's newer transaction format, which was introduced to overcome the account limit in legacy transactions.

In legacy transactions, all account keys are included directly in the message. This limits the number of accounts a transaction can reference (due to the 1232-byte size limit). V0 transactions solve this by using Address Lookup Tables (ALTs) — accounts stored on-chain that contain lists of public keys. Instead of including the full key in the transaction, V0 messages can reference keys by their index in a lookup table.

## Requirements

### Types

```typescript
interface AddressLookupTable {
  key: string;          // The lookup table's own address
  addresses: string[];  // The public keys stored in this table
}

interface MessageHeader {
  numRequiredSignatures: number;
  numReadonlySignedAccounts: number;
  numReadonlyUnsignedAccounts: number;
}

interface CompiledInstructionV0 {
  programIdIndex: number;
  accountKeyIndexes: number[];
  data: Uint8Array;
}

interface AddressTableLookup {
  accountKey: string;        // The lookup table address
  writableIndexes: number[]; // Indexes into the table for writable accounts
  readonlyIndexes: number[]; // Indexes into the table for readonly accounts
}

interface MessageV0 {
  header: MessageHeader;
  staticAccountKeys: string[];
  recentBlockhash: string;
  instructions: CompiledInstructionV0[];
  addressTableLookups: AddressTableLookup[];
}
```

### Input Types

```typescript
interface AccountMeta {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}

interface Instruction {
  programId: string;
  accounts: AccountMeta[];
  data: Uint8Array;
}
```

### Functions

- `compileV0Message(instructions, feePayer, recentBlockhash, lookupTables)` -> `MessageV0`
  - Accounts that appear in lookup tables should reference the table (via `addressTableLookups`) instead of being in `staticAccountKeys`
  - **Exception**: Fee payer, program IDs, and signers MUST always be in `staticAccountKeys`
  - Deduplicate accounts; promote to signer/writable if any instruction marks them as such
  - Sort static accounts: fee payer first, then signers+writable, signers+readonly, non-signers+writable, non-signers+readonly
  - Instruction account indexes reference: first static keys (0..N-1), then writable lookup keys, then readonly lookup keys

- `decompileV0Message(message, lookupTables)` -> resolved account list
  - Resolve all account references back to public key strings
  - Static keys are used directly
  - Lookup references are resolved using the provided tables
  - Return `{ staticAccounts: string[], lookupAccounts: { writable: string[], readonly: string[] } }`

- `getTransactionSize(message)` -> `number`
  - Estimate the serialized size of the message
  - Each signature: 64 bytes
  - Header: 3 bytes
  - Each static account key: 32 bytes
  - Recent blockhash: 32 bytes
  - Each instruction: variable (1 byte programIdIndex + compact array of account indexes + compact array of data)
  - Each address table lookup: 32 bytes (key) + compact arrays of indexes
  - Use a simplified estimation model

## Hints
- The key insight is deciding which accounts go in `staticAccountKeys` vs lookup table references
- Signers MUST be static because they need to sign the transaction
- Program IDs MUST be static (Solana runtime requirement)
- The fee payer is always static and always first
- When resolving indexes in instructions, indexes 0..N-1 map to static keys, N..N+W-1 map to writable lookup keys, N+W..end map to readonly lookup keys
- Address table lookups group indexes by which table they come from

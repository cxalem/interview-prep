# Challenge 1.3: Type-Safe Builder Pattern

**Difficulty:** Hard | **AI Assistance:** Allowed | **Time Target:** 60 min

## Problem

Build a **type-safe transaction instruction builder** where the TypeScript compiler tracks
which fields have been set, and only allows calling `.build()` when all required fields
are present.

This pattern is used extensively in Solana SDKs (e.g., `@solana/web3.js` `TransactionMessage`,
Anchor's instruction builders) and is a common interview topic at companies like Anza and Helius.

## Requirements

### The Instruction Interface
```typescript
interface TransactionInstruction {
  programId: string;
  accounts: AccountMeta[];
  data: Buffer;
  signers?: string[];
}

interface AccountMeta {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}
```

### The Builder Must:

1. **Track set fields at the type level** using a generic state parameter (e.g., `Builder<State>` where `State` records which fields are set).
2. Provide these chainable methods:
   - `.programId(id: string)` — sets the program ID
   - `.accounts(accounts: AccountMeta[])` — sets the accounts
   - `.data(data: Buffer)` — sets the instruction data
   - `.signers(signers: string[])` — sets the signers (optional)
3. Each method returns a **new builder type** that records the field was set.
4. **`.build()` is only callable** when `programId`, `accounts`, AND `data` have all been set. `signers` is optional.
5. Calling `.build()` on an incomplete builder should be a **compile-time error**.
6. Methods should be idempotent (calling `.programId()` twice just overrides the value).

### Example Usage
```typescript
// This should compile:
const ix = new InstructionBuilder()
  .programId("11111111111111111111111111111111")
  .accounts([{ pubkey: "abc", isSigner: true, isWritable: true }])
  .data(Buffer.from([1, 2, 3]))
  .build();

// This should NOT compile (missing data):
const ix2 = new InstructionBuilder()
  .programId("abc")
  .accounts([])
  .build(); // <-- Type error!
```

## Hints

<details>
<summary>Hint 1: State Tracking</summary>
Use a type parameter like `State extends Record<string, boolean>` to track which fields are set. For example: `{ programId: true; accounts: false; data: false; signers: false }`.
</details>

<details>
<summary>Hint 2: Conditional Build</summary>
Use a conditional type or intersection to only expose `.build()` when the required state flags are all `true`. You could use method overloading or a conditional return type.
</details>

<details>
<summary>Hint 3: Implementation</summary>
Store field values in a private object. Each setter method creates a new builder instance (or returns `this` with a type assertion) with the updated state type.
</details>

## Validation

Run `npx vitest run` in this directory. All tests should pass.

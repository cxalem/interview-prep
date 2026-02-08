# Challenge 5.1: Transaction Builder

## Difficulty: Hard
## AI Assistance: None
## Time Limit: 60 minutes

## Description

Build a transaction builder that constructs Solana-like transactions from scratch. This challenge tests your understanding of Solana's transaction format, account ordering rules, and fee estimation.

Solana transactions contain a list of instructions, each referencing accounts and a program. The transaction must specify a fee payer, a recent blockhash, and collect signatures from all required signers. When compiled to the wire format, accounts are deduplicated and sorted in a specific order.

## Requirements

### Types
- `PublicKey` — a string (base58 representation)
- `AccountMeta` — `{ pubkey: PublicKey, isSigner: boolean, isWritable: boolean }`
- `Instruction` — `{ programId: PublicKey, accounts: AccountMeta[], data: Uint8Array }`
- `Transaction` — `{ instructions: Instruction[], recentBlockhash: string, feePayer: PublicKey, signatures: string[] }`

### TransactionBuilder Class
- `setFeePayer(pubkey: PublicKey)` — sets the fee payer for the transaction
- `setRecentBlockhash(hash: string)` — sets the recent blockhash
- `addInstruction(instruction: Instruction)` — adds a single instruction
- `addInstructions(instructions: Instruction[])` — adds multiple instructions
- `build()` — validates all requirements and returns a `Transaction`

### Validation Rules (enforced in `build()`)
- Fee payer is required
- Recent blockhash is required
- At least one instruction must be present
- No duplicate signers in the final signature list
- All signer accounts must be present in the instructions

### compileTransaction(tx: Transaction)
Compiles a transaction to message format:
1. Deduplicate accounts across all instructions
2. Sort accounts: fee payer first, then signers+writable, then signers+readonly, then non-signers+writable, then non-signers+readonly
3. Return `{ header: { numSigners, numReadonlySigners, numReadonly }, accountKeys: string[], instructions: CompiledInstruction[] }`

### estimateFee(tx: Transaction, lamportsPerSignature: number)
Count unique signers and multiply by the per-signature fee.

## Hints
- The fee payer is always the first account and always a signer + writable
- Program IDs referenced by instructions are accounts too (non-signer, readonly)
- When deduplicating, if the same account appears as both signer and non-signer, keep it as signer
- If the same account appears as both writable and readonly, keep it as writable

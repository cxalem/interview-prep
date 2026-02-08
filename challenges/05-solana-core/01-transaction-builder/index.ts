// Challenge 5.1: Transaction Builder
// Build a transaction builder that constructs Solana-like transactions.

export type PublicKey = string;

export interface AccountMeta {
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
}

export interface Instruction {
  programId: PublicKey;
  accounts: AccountMeta[];
  data: Uint8Array;
}

export interface Transaction {
  instructions: Instruction[];
  recentBlockhash: string;
  feePayer: PublicKey;
  signatures: string[];
}

export interface CompiledInstruction {
  programIdIndex: number;
  accountKeyIndexes: number[];
  data: Uint8Array;
}

export interface MessageHeader {
  numSigners: number;
  numReadonlySigners: number;
  numReadonly: number;
}

export interface CompiledMessage {
  header: MessageHeader;
  accountKeys: PublicKey[];
  instructions: CompiledInstruction[];
}

export class TransactionBuilder {
  /**
   * Set the fee payer for the transaction.
   */
  setFeePayer(pubkey: PublicKey): this {
    // TODO: Store the fee payer
    throw new Error("Not implemented");
  }

  /**
   * Set the recent blockhash.
   */
  setRecentBlockhash(hash: string): this {
    // TODO: Store the recent blockhash
    throw new Error("Not implemented");
  }

  /**
   * Add a single instruction to the transaction.
   */
  addInstruction(instruction: Instruction): this {
    // TODO: Add instruction to the list
    throw new Error("Not implemented");
  }

  /**
   * Add multiple instructions to the transaction.
   */
  addInstructions(instructions: Instruction[]): this {
    // TODO: Add all instructions to the list
    throw new Error("Not implemented");
  }

  /**
   * Validate and build the transaction.
   *
   * Validation rules:
   * - Fee payer is required
   * - Recent blockhash is required
   * - At least one instruction must be present
   * - No duplicate signers
   * - All signer accounts must be present
   */
  build(): Transaction {
    // TODO: Validate all requirements and return a Transaction
    throw new Error("Not implemented");
  }
}

/**
 * Compile a transaction to message format.
 *
 * 1. Deduplicate accounts across all instructions
 *    - If same pubkey appears as signer and non-signer, keep as signer
 *    - If same pubkey appears as writable and readonly, keep as writable
 * 2. Sort accounts:
 *    - Fee payer first
 *    - Signers + writable
 *    - Signers + readonly
 *    - Non-signers + writable
 *    - Non-signers + readonly
 * 3. Program IDs are added as non-signer, readonly accounts
 * 4. Return compiled message with header, account keys, and instructions
 *    referencing accounts by index.
 */
export function compileTransaction(tx: Transaction): CompiledMessage {
  // TODO: Implement account deduplication, sorting, and compilation
  throw new Error("Not implemented");
}

/**
 * Estimate the transaction fee.
 * Fee = number of unique signers × lamportsPerSignature
 */
export function estimateFee(
  tx: Transaction,
  lamportsPerSignature: number
): number {
  // TODO: Count unique signers and multiply by fee
  throw new Error("Not implemented");
}

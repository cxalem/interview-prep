// Challenge 5.3: Token Operations
// Implement SPL Token program instruction builders.

export const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

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

export type ParsedTokenInstruction =
  | { type: "transfer"; amount: bigint }
  | { type: "approve"; amount: bigint }
  | { type: "mintTo"; amount: bigint }
  | { type: "initializeAccount" }
  | { type: "unknown"; tag: number };

/**
 * Encode a bigint as 8 bytes in little-endian order.
 */
export function encodeU64LE(value: bigint): Uint8Array {
  // TODO: Convert bigint to 8 bytes LE
  throw new Error("Not implemented");
}

/**
 * Decode 8 bytes in little-endian order to a bigint.
 */
export function decodeU64LE(bytes: Uint8Array): bigint {
  // TODO: Convert 8 bytes LE to bigint
  throw new Error("Not implemented");
}

/**
 * Create a Transfer instruction for the SPL Token program.
 *
 * Data: [3] + [amount as u64 LE]
 * Accounts: source (writable), destination (writable), owner (signer)
 */
export function createTransferInstruction(
  source: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: bigint
): Instruction {
  // TODO: Build transfer instruction with correct data and accounts
  throw new Error("Not implemented");
}

/**
 * Create an Approve instruction for the SPL Token program.
 *
 * Data: [4] + [amount as u64 LE]
 * Accounts: source (writable), delegate (readonly), owner (signer)
 */
export function createApproveInstruction(
  source: PublicKey,
  delegate: PublicKey,
  owner: PublicKey,
  amount: bigint
): Instruction {
  // TODO: Build approve instruction with correct data and accounts
  throw new Error("Not implemented");
}

/**
 * Create a MintTo instruction for the SPL Token program.
 *
 * Data: [7] + [amount as u64 LE]
 * Accounts: mint (writable), destination (writable), authority (signer)
 */
export function createMintToInstruction(
  mint: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  amount: bigint
): Instruction {
  // TODO: Build mintTo instruction with correct data and accounts
  throw new Error("Not implemented");
}

/**
 * Create an InitializeAccount instruction for the SPL Token program.
 *
 * Data: [1]
 * Accounts: account (writable), mint (readonly), owner (readonly)
 */
export function createInitializeAccountInstruction(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey
): Instruction {
  // TODO: Build initializeAccount instruction with correct data and accounts
  throw new Error("Not implemented");
}

/**
 * Parse raw instruction data into a typed instruction.
 * Uses the first byte as the instruction tag.
 */
export function parseTokenInstruction(
  data: Uint8Array
): ParsedTokenInstruction {
  // TODO: Read tag byte, decode accordingly
  throw new Error("Not implemented");
}

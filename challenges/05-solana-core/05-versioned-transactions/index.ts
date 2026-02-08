// Challenge 5.5: Versioned Transactions
// Implement V0 transaction format with Address Lookup Tables.

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

export interface AddressLookupTable {
  key: string;
  addresses: string[];
}

export interface MessageHeader {
  numRequiredSignatures: number;
  numReadonlySignedAccounts: number;
  numReadonlyUnsignedAccounts: number;
}

export interface CompiledInstructionV0 {
  programIdIndex: number;
  accountKeyIndexes: number[];
  data: Uint8Array;
}

export interface AddressTableLookup {
  accountKey: string;
  writableIndexes: number[];
  readonlyIndexes: number[];
}

export interface MessageV0 {
  header: MessageHeader;
  staticAccountKeys: string[];
  recentBlockhash: string;
  instructions: CompiledInstructionV0[];
  addressTableLookups: AddressTableLookup[];
}

export interface DecompiledAccounts {
  staticAccounts: string[];
  lookupAccounts: {
    writable: string[];
    readonly: string[];
  };
}

/**
 * Compile instructions into a V0 message using Address Lookup Tables.
 *
 * Rules:
 * 1. Deduplicate accounts across all instructions. If same pubkey is both
 *    signer and non-signer, keep as signer. Same for writable/readonly.
 * 2. Fee payer, program IDs, and signers MUST be in staticAccountKeys.
 * 3. Non-signer accounts that exist in a lookup table should reference the
 *    table via addressTableLookups instead of being in staticAccountKeys.
 * 4. Sort static accounts: fee payer first, then signers+writable,
 *    signers+readonly, non-signers+writable, non-signers+readonly.
 * 5. Instruction account indexes: 0..S-1 for static keys, then S..S+W-1
 *    for writable lookup accounts, then S+W.. for readonly lookup accounts.
 * 6. Group address table lookups by which table they come from.
 */
export function compileV0Message(
  instructions: Instruction[],
  feePayer: PublicKey,
  recentBlockhash: string,
  lookupTables: AddressLookupTable[]
): MessageV0 {
  // TODO: Implement V0 message compilation
  throw new Error("Not implemented");
}

/**
 * Decompile a V0 message back to resolved account lists.
 *
 * 1. Static accounts are returned directly.
 * 2. For each addressTableLookup, resolve the indexes using the
 *    provided lookup tables to get the actual public key strings.
 * 3. Return separated lists of static accounts and lookup accounts
 *    (writable and readonly).
 */
export function decompileV0Message(
  message: MessageV0,
  lookupTables: AddressLookupTable[]
): DecompiledAccounts {
  // TODO: Resolve all account references back to pubkey strings
  throw new Error("Not implemented");
}

/**
 * Estimate the serialized size of a V0 message.
 *
 * Simplified size estimation:
 * - Signatures: numRequiredSignatures * 64 bytes
 * - Header: 3 bytes (+ 1 byte for version prefix)
 * - Static account keys: count * 32 bytes (+ compact u16 length prefix)
 * - Recent blockhash: 32 bytes
 * - Instructions: for each instruction:
 *   - 1 byte program ID index
 *   - compact u16 for account indexes count + account indexes (1 byte each)
 *   - compact u16 for data length + data bytes
 * - Address table lookups: for each lookup:
 *   - 32 bytes for the table key
 *   - compact u16 for writable indexes count + writable indexes (1 byte each)
 *   - compact u16 for readonly indexes count + readonly indexes (1 byte each)
 *
 * Compact u16 encoding: 1 byte for values < 128, 2 bytes for < 16384, 3 bytes otherwise.
 *
 * Legacy transaction size limit: 1232 bytes.
 */
export function getTransactionSize(message: MessageV0): number {
  // TODO: Estimate serialized transaction size
  throw new Error("Not implemented");
}

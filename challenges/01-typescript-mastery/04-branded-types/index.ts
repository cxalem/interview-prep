// Challenge 1.4: Branded Types for Solana Primitives
// ====================================================
// Implement branded/nominal types to prevent mixing up Solana primitives
// that share the same underlying JavaScript type.

// ---- Brand Helper ----

// TODO: Implement a Brand<T, B> generic type.
// It should create a nominal type by intersecting T with a phantom brand field.
// The brand field should never exist at runtime — it's purely a type-level tag.
//
// Example approach:
// type Brand<T, B extends string> = T & { readonly __brand: B };
//
export type Brand<T, B extends string> = unknown; // TODO: implement

// ---- Branded Types ----

// TODO: Define these branded types using your Brand helper.
// Each should be based on its underlying JS type but nominally distinct.

export type PublicKey = unknown; // TODO: Brand<string, "PublicKey">
export type Signature = unknown; // TODO: Brand<string, "Signature">
export type TransactionId = unknown; // TODO: Brand<string, "TransactionId">
export type Lamports = unknown; // TODO: Brand<number, "Lamports">
export type Sol = unknown; // TODO: Brand<number, "Sol">

// ---- Base58 Validation ----

// TODO: Implement a base58 regex check.
// Base58 alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
// (excludes: 0, O, I, l)
const BASE58_REGEX = /TODO/; // TODO: implement the regex

// ---- Validator/Constructor Functions ----

// TODO: Implement toPublicKey
// - Validate that the string is base58 and 32-44 characters long
// - Throw an error if invalid
// - Return the branded PublicKey type
export function toPublicKey(raw: string): PublicKey {
  throw new Error("Not implemented");
}

// TODO: Implement toSignature
// - Validate that the string is base58 and 87-88 characters long
// - Throw an error if invalid
// - Return the branded Signature type
export function toSignature(raw: string): Signature {
  throw new Error("Not implemented");
}

// TODO: Implement toTransactionId
// - Validate that the string is base58 and 87-88 characters long
// - Throw an error if invalid
// - Return the branded TransactionId type
export function toTransactionId(raw: string): TransactionId {
  throw new Error("Not implemented");
}

// TODO: Implement toLamports
// - Validate that the number is a non-negative integer
// - Throw an error if invalid (negative, NaN, Infinity, or fractional)
// - Return the branded Lamports type
export function toLamports(raw: number): Lamports {
  throw new Error("Not implemented");
}

// TODO: Implement toSol
// - Validate that the number is non-negative and finite
// - Throw an error if invalid (negative, NaN, Infinity)
// - Return the branded Sol type
export function toSol(raw: number): Sol {
  throw new Error("Not implemented");
}

// ---- Conversion Functions ----

// TODO: Implement lamportsToSol
// - Divide lamports by 1_000_000_000 (1e9)
// - Return a branded Sol value
export function lamportsToSol(lamports: Lamports): Sol {
  throw new Error("Not implemented");
}

// TODO: Implement solToLamports
// - Multiply SOL by 1_000_000_000 (1e9)
// - Round to nearest integer (lamports are always whole numbers)
// - Return a branded Lamports value
export function solToLamports(sol: Sol): Lamports {
  throw new Error("Not implemented");
}

// ---- Type Guard / Predicate Functions ----

// TODO: Implement isValidPublicKey
// - Return true if the string is valid base58 and 32-44 chars
// - Use TypeScript's `raw is PublicKey` return type for type narrowing
export function isValidPublicKey(raw: string): raw is PublicKey {
  throw new Error("Not implemented");
}

// TODO: Implement isValidSignature
// - Return true if the string is valid base58 and 87-88 chars
// - Use TypeScript's `raw is Signature` return type for type narrowing
export function isValidSignature(raw: string): raw is Signature {
  throw new Error("Not implemented");
}

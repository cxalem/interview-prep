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
export type Brand<T, B extends string> = T & { readonly __brand: B };

// ---- Branded Types ----

// TODO: Define these branded types using your Brand helper.
// Each should be based on its underlying JS type but nominally distinct.

export type PublicKey = Brand<string, "PublicKey">;
export type Signature = Brand<string, "Signature">;
export type TransactionId = Brand<string, "TransactionId">;
export type Lamports = Brand<number, "Lamports">;
export type Sol = Brand<number, "Sol">;

// ---- Base58 Validation ----

// TODO: Implement a base58 regex check.
// Base58 alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
// (excludes: 0, O, I, l)
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

// ---- Helpers ----

const isPublicKeyLength = (_publicKey: string) => {
  if (_publicKey.length > 31 && _publicKey.length < 45) {
    return true;
  }

  return false;
};

const isSignatureLength = (_signature: string) => {
  if (_signature.length > 86 && _signature.length < 89) {
    return true;
  }

  return false;
};

const isPositive = (amount: number) => {
  if (amount >= 0) {
    return true;
  }
  return false;
};

// ---- Validator/Constructor Functions ----

// TODO: Implement toPublicKey
// - Validate that the string is base58 and 32-44 characters long
// - Throw an error if invalid
// - Return the branded PublicKey type
export function toPublicKey(raw: string): PublicKey {
  if (isValidPublicKey(raw)) {
    return raw as PublicKey;
  }
  throw new Error("Please add a valid public key");
}

// TODO: Implement toSignature
// - Validate that the string is base58 and 87-88 characters long
// - Throw an error if invalid
// - Return the branded Signature type
export function toSignature(raw: string): Signature {
  if (isValidSignature(raw)) {
    return raw as Signature;
  }

  throw new Error("Please add a valid signature");
}

// TODO: Implement toTransactionId
// - Validate that the string is base58 and 87-88 characters long
// - Throw an error if invalid
// - Return the branded TransactionId type
export function toTransactionId(raw: string): TransactionId {
  if (isSignatureLength(raw) && BASE58_REGEX.test(raw)) {
    return raw as TransactionId;
  }
  throw new Error("Please add a valid transaction ID");
}

// TODO: Implement toLamports
// - Validate that the number is a non-negative integer
// - Throw an error if invalid (negative, NaN, Infinity, or fractional)
// - Return the branded Lamports type
export function toLamports(raw: number): Lamports {
  if (
    typeof raw === "number" &&
    isPositive(raw) &&
    Number.isInteger(raw) &&
    Number.isFinite(raw)
  ) {
    return raw as Lamports;
  }
  throw new Error("Enter a valid lamport ammount");
}

// TODO: Implement toSol
// - Validate that the number is non-negative and finite
// - Throw an error if invalid (negative, NaN, Infinity)
// - Return the branded Sol type
export function toSol(raw: number): Sol {
  if (typeof raw === "number" && isPositive(raw) && Number.isFinite(raw)) {
    return raw as Sol;
  }
  throw new Error("Enter a valid SOL ammount");
}

// ---- Conversion Functions ----

// TODO: Implement lamportsToSol
// - Divide lamports by 1_000_000_000 (1e9)
// - Return a branded Sol value
export function lamportsToSol(lamports: Lamports): Sol {
  return (lamports / 1_000_000_000) as Sol;
}

// TODO: Implement solToLamports
// - Multiply SOL by 1_000_000_000 (1e9)
// - Round to nearest integer (lamports are always whole numbers)
// - Return a branded Lamports value
export function solToLamports(sol: Sol): Lamports {
  return Math.round(sol * 1_000_000_000) as Lamports;
}

// ---- Type Guard / Predicate Functions ----

// TODO: Implement isValidPublicKey
// - Return true if the string is valid base58 and 32-44 chars
// - Use TypeScript's `raw is PublicKey` return type for type narrowing
export function isValidPublicKey(raw: string): raw is PublicKey {
  if (BASE58_REGEX.test(raw) && isPublicKeyLength(raw)) {
    return true;
  }
  return false;
}

// TODO: Implement isValidSignature
// - Return true if the string is valid base58 and 87-88 chars
// - Use TypeScript's `raw is Signature` return type for type narrowing
export function isValidSignature(raw: string): raw is Signature {
  if (isSignatureLength(raw) && BASE58_REGEX.test(raw)) {
    return true;
  }

  return false;
}

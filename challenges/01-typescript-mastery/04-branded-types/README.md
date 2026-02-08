# Challenge 1.4: Branded Types for Solana Primitives

**Difficulty:** Medium | **AI Assistance:** Allowed | **Time Target:** 30 min

## Problem

Implement **branded (nominal) types** that prevent accidentally mixing up values that share
the same underlying JavaScript type but have different semantic meanings.

In Solana development, it's easy to accidentally pass a transaction signature where a public
key is expected, or mix up Lamports with SOL amounts -- both are just strings or numbers at
runtime. Branded types catch these mistakes at compile time.

This pattern is used in production by `@solana/web3.js` v2 and is a common interview topic.

## Requirements

### Branded Type Helper
Create a generic `Brand<T, B>` type that makes `T` nominally unique using brand `B`. The
branded value should still be usable as its base type in most contexts, but two differently
branded types should NOT be assignable to each other.

### Types to Create

| Branded Type      | Base Type | Description                  |
|-------------------|-----------|------------------------------|
| `PublicKey`       | `string`  | Base58-encoded public key    |
| `Signature`       | `string`  | Base58-encoded signature     |
| `TransactionId`   | `string`  | Base58-encoded transaction ID|
| `Lamports`        | `number`  | Amount in lamports           |
| `Sol`             | `number`  | Amount in SOL                |

### Validator/Constructor Functions

Each branded type needs a function that validates the raw value and returns the branded type:

- **`toPublicKey(raw: string): PublicKey`** — validates base58 format and length (32-44 chars)
- **`toSignature(raw: string): Signature`** — validates base58 format and length (87-88 chars)
- **`toTransactionId(raw: string): TransactionId`** — validates base58 format and length (87-88 chars)
- **`toLamports(raw: number): Lamports`** — validates non-negative integer
- **`toSol(raw: number): Sol`** — validates non-negative number

### Conversion Functions

- **`lamportsToSol(lamports: Lamports): Sol`** — converts lamports to SOL (divide by 1e9)
- **`solToLamports(sol: Sol): Lamports`** — converts SOL to lamports (multiply by 1e9)

### Predicate Functions

- **`isValidPublicKey(raw: string): raw is PublicKey`** — type guard
- **`isValidSignature(raw: string): raw is Signature`** — type guard

## Hints

<details>
<summary>Hint 1: Brand Pattern</summary>

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };
```

The `__brand` property never exists at runtime — it's purely a type-level tag.
</details>

<details>
<summary>Hint 2: Base58 Validation</summary>
Base58 characters are: `123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz` (no 0, O, I, l).
Use a regex like `/^[1-9A-HJ-NP-Za-km-z]+$/`.
</details>

## Validation

Run `npx vitest run` in this directory. All tests should pass.

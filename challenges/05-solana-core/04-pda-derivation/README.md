# Challenge 5.4: PDA Derivation

## Difficulty: Medium
## AI Assistance: None
## Time Limit: 40 minutes

## Description

Implement PDA (Program Derived Address) derivation logic. PDAs are a core Solana concept — they are deterministic addresses derived from a combination of seeds and a program ID, guaranteed to not lie on the Ed25519 curve (so no private key exists for them).

Since we cannot easily use actual Ed25519 curve checks in pure TypeScript, we simulate the concept: hash the seeds together and use a simple check to determine if the result is "off curve." The important thing is understanding the algorithm: try bump seeds from 255 down to 0, and return the first address that passes the off-curve check.

## Requirements

### Provided Helper
A `simpleHash(data: Uint8Array): string` function is provided that you can use for hashing. It returns a hex string.

### Core Functions
- `createProgramAddress(seeds: Uint8Array[], programId: string): string`
  - Concatenate all seeds + programId bytes, hash the result
  - If the hash starts with "00" (simulating "on curve"), throw an error
  - Otherwise return the hash as the derived address

- `findProgramAddress(seeds: Uint8Array[], programId: string): [string, number]`
  - Try bump seeds from 255 down to 0
  - For each bump, append `[bump]` to the seeds array, then call `createProgramAddress`
  - Return the first successful `[address, bump]` pair
  - If no valid bump is found (all 256 fail), throw an error

### Seed Helper
- `toSeedBuffer(value: string | number | bigint | Uint8Array): Uint8Array`
  - `string` -> UTF-8 encode
  - `number` -> 4 bytes little-endian (u32)
  - `bigint` -> 8 bytes little-endian (u64)
  - `Uint8Array` -> return as-is

### Common PDA Patterns
- `findAssociatedTokenAddress(wallet: string, mint: string): [string, number]`
  - Seeds: [wallet bytes, TOKEN_PROGRAM_ID bytes, mint bytes]
  - Program: ASSOCIATED_TOKEN_PROGRAM_ID

- `findMetadataAddress(mint: string): [string, number]`
  - Seeds: ["metadata", TOKEN_METADATA_PROGRAM_ID, mint bytes]
  - Program: TOKEN_METADATA_PROGRAM_ID

- `findEditionAddress(mint: string): [string, number]`
  - Seeds: ["metadata", TOKEN_METADATA_PROGRAM_ID, mint bytes, "edition"]
  - Program: TOKEN_METADATA_PROGRAM_ID

### Constants
- `ASSOCIATED_TOKEN_PROGRAM_ID = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"`
- `TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"`
- `TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"`

## Hints
- PDAs are deterministic — same seeds + program always produce the same address
- The bump seed is a single byte (0-255) appended to the seeds
- In real Solana, `createProgramAddress` checks if the result is on the Ed25519 curve
- We simulate this by checking if the hash starts with "00"
- The bump search starts at 255 and goes down — this is called the "canonical bump"
- For `toSeedBuffer` with strings, use `TextEncoder`

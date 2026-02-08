# Challenge 2.2: Merkle Tree

| Difficulty | AI Assistance | Time Limit |
|------------|--------------|------------|
| Hard       | Partial      | 60 min     |

## Problem

Implement a **Merkle Tree**, a fundamental data structure used heavily in Solana for **compressed NFTs** and **state compression** (via the SPL Account Compression program).

A Merkle tree is a binary tree where each leaf node contains a hash of data, and each internal node contains the hash of its two children. The root hash provides a compact, tamper-proof fingerprint of all the data in the tree.

## Requirements

### Helper Function

A `simpleHash(data: string): string` function is provided. Use it for all hashing operations.

### MerkleTree Class

- **Constructor** — Takes an array of leaf values (strings) and builds the tree.
- **`getRoot()`** — Returns the root hash of the tree.
- **`getProof(index: number)`** — Returns a Merkle proof for the leaf at the given index. The proof is an array of `{ hash: string, direction: "left" | "right" }` objects.
- **`verify(leaf: string, proof: Proof[], root: string)`** — Static method that verifies a Merkle proof against a root hash.
- **`addLeaf(value: string)`** — Adds a new leaf to the tree and rebuilds it.
- **`getLeaves()`** — Returns all leaf hashes as an array.

### Edge Cases

- When there is an **odd number of leaves**, duplicate the last leaf to make it even.
- Handle a tree with a **single leaf**.
- Handle an **empty tree** (no leaves).

## How Merkle Trees Work

```
        Root Hash
       /         \
    Hash(0-1)   Hash(2-3)
    /    \       /    \
  H(0)  H(1)  H(2)  H(3)    <-- leaf hashes
   |     |     |     |
  "A"   "B"   "C"   "D"      <-- original data
```

A proof for leaf "C" (index 2) would be:
1. `{ hash: H(3), direction: "right" }` — sibling
2. `{ hash: Hash(0-1), direction: "left" }` — uncle

To verify: hash("C") -> combine with proof steps -> should equal root.

## Example

```typescript
const tree = new MerkleTree(["A", "B", "C", "D"]);

const root = tree.getRoot();
const proof = tree.getProof(2); // proof for "C"

MerkleTree.verify("C", proof, root); // true
MerkleTree.verify("X", proof, root); // false
```

## Relevance to Solana

Solana's state compression uses concurrent Merkle trees to store large amounts of data (like NFT metadata) off-chain while keeping a small on-chain footprint (just the root hash). Understanding Merkle proofs is essential for working with compressed NFTs, Bubblegum, and the Account Compression program.

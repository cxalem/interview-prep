/**
 * Challenge 2.2: Merkle Tree
 *
 * Implement a Merkle Tree for proof generation and verification.
 * Relevant to Solana compressed NFTs and state compression.
 */

/**
 * Simple hash function for the Merkle tree.
 * Produces a deterministic hex-like string from input data.
 *
 * This is NOT cryptographically secure — it's a simple hash for learning purposes.
 * In production Solana code, you'd use SHA-256 or Keccak-256.
 */
export function simpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  // Convert to positive hex string
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export interface ProofStep {
  hash: string;
  direction: "left" | "right";
}

export class MerkleTree {
  /**
   * Build a Merkle tree from an array of leaf values.
   *
   * @param leaves - Array of string values to use as leaves
   */
  constructor(leaves: string[]) {
    // TODO: Implement
    // - Hash each leaf using simpleHash
    // - If odd number of leaves, duplicate the last one
    // - Build the tree bottom-up by hashing pairs of nodes
    // - Store the tree structure so you can generate proofs
    throw new Error("Not implemented");
  }

  /**
   * Returns the root hash of the Merkle tree.
   * Returns an empty string if the tree has no leaves.
   */
  getRoot(): string {
    // TODO: Implement
    throw new Error("Not implemented");
  }

  /**
   * Generate a Merkle proof for the leaf at the given index.
   *
   * The proof is an array of { hash, direction } objects that describe
   * the path from the leaf to the root.
   *
   * - direction "left" means the proof hash is on the left side
   * - direction "right" means the proof hash is on the right side
   *
   * @param index - The index of the leaf (0-based, in the original leaves array)
   */
  getProof(index: number): ProofStep[] {
    // TODO: Implement
    // - Walk from the leaf up to the root
    // - At each level, include the sibling node's hash and its direction
    throw new Error("Not implemented");
  }

  /**
   * Verify a Merkle proof against a root hash.
   *
   * @param leaf - The original leaf value (not hashed)
   * @param proof - The Merkle proof (array of ProofStep)
   * @param root - The expected root hash
   * @returns true if the proof is valid
   */
  static verify(leaf: string, proof: ProofStep[], root: string): boolean {
    // TODO: Implement
    // - Hash the leaf
    // - Walk through the proof, combining hashes according to direction
    // - Compare final hash with the root
    throw new Error("Not implemented");
  }

  /**
   * Add a new leaf to the tree and rebuild.
   *
   * @param value - The string value for the new leaf
   */
  addLeaf(value: string): void {
    // TODO: Implement
    // - Add the new leaf value to the leaves array
    // - Rebuild the entire tree
    throw new Error("Not implemented");
  }

  /**
   * Returns all leaf hashes (the bottom level of the tree).
   */
  getLeaves(): string[] {
    // TODO: Implement
    throw new Error("Not implemented");
  }
}

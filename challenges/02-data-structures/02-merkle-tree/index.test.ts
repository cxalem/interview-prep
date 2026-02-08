import { describe, it, expect, vi } from "vitest";
import { MerkleTree, simpleHash } from "./index";

describe("simpleHash", () => {
  it("should produce a deterministic hash", () => {
    expect(simpleHash("hello")).toBe(simpleHash("hello"));
  });

  it("should produce different hashes for different inputs", () => {
    expect(simpleHash("hello")).not.toBe(simpleHash("world"));
  });

  it("should return an 8-character hex string", () => {
    const hash = simpleHash("test");
    expect(hash).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe("MerkleTree", () => {
  // ─── Construction & Root ──────────────────────────────────────

  it("should build a tree from an array of leaves", () => {
    const tree = new MerkleTree(["A", "B", "C", "D"]);
    const root = tree.getRoot();
    expect(root).toBeDefined();
    expect(typeof root).toBe("string");
    expect(root.length).toBeGreaterThan(0);
  });

  it("should produce a consistent root for the same leaves", () => {
    const tree1 = new MerkleTree(["A", "B", "C", "D"]);
    const tree2 = new MerkleTree(["A", "B", "C", "D"]);
    expect(tree1.getRoot()).toBe(tree2.getRoot());
  });

  it("should produce different roots for different leaves", () => {
    const tree1 = new MerkleTree(["A", "B", "C", "D"]);
    const tree2 = new MerkleTree(["A", "B", "C", "E"]);
    expect(tree1.getRoot()).not.toBe(tree2.getRoot());
  });

  it("should handle a single leaf", () => {
    const tree = new MerkleTree(["only"]);
    expect(tree.getRoot()).toBe(simpleHash("only"));
  });

  it("should handle an empty tree", () => {
    const tree = new MerkleTree([]);
    expect(tree.getRoot()).toBe("");
  });

  // ─── Odd number of leaves ────────────────────────────────────

  it("should handle odd number of leaves by duplicating the last", () => {
    const tree = new MerkleTree(["A", "B", "C"]);
    const root = tree.getRoot();
    expect(root).toBeDefined();
    expect(root.length).toBeGreaterThan(0);
  });

  it("should produce a valid root for 5 leaves", () => {
    const tree = new MerkleTree(["A", "B", "C", "D", "E"]);
    const root = tree.getRoot();
    expect(root).toBeDefined();
    expect(typeof root).toBe("string");
  });

  // ─── getLeaves ───────────────────────────────────────────────

  it("should return all leaf hashes", () => {
    const tree = new MerkleTree(["A", "B", "C", "D"]);
    const leaves = tree.getLeaves();
    expect(leaves).toHaveLength(4);
    expect(leaves[0]).toBe(simpleHash("A"));
    expect(leaves[1]).toBe(simpleHash("B"));
    expect(leaves[2]).toBe(simpleHash("C"));
    expect(leaves[3]).toBe(simpleHash("D"));
  });

  // ─── Proof Generation ────────────────────────────────────────

  it("should generate a proof for a leaf", () => {
    const tree = new MerkleTree(["A", "B", "C", "D"]);
    const proof = tree.getProof(0);

    expect(Array.isArray(proof)).toBe(true);
    expect(proof.length).toBeGreaterThan(0);

    for (const step of proof) {
      expect(step).toHaveProperty("hash");
      expect(step).toHaveProperty("direction");
      expect(["left", "right"]).toContain(step.direction);
    }
  });

  it("should generate a proof with log2(n) steps for a balanced tree", () => {
    const tree = new MerkleTree(["A", "B", "C", "D"]);
    const proof = tree.getProof(2);
    // 4 leaves => log2(4) = 2 steps
    expect(proof).toHaveLength(2);
  });

  it("should throw for an invalid leaf index", () => {
    const tree = new MerkleTree(["A", "B", "C", "D"]);
    expect(() => tree.getProof(-1)).toThrow();
    expect(() => tree.getProof(4)).toThrow();
  });

  // ─── Proof Verification ──────────────────────────────────────

  it("should verify a valid proof", () => {
    const tree = new MerkleTree(["A", "B", "C", "D"]);
    const root = tree.getRoot();

    for (let i = 0; i < 4; i++) {
      const proof = tree.getProof(i);
      const leaf = ["A", "B", "C", "D"][i];
      expect(MerkleTree.verify(leaf, proof, root)).toBe(true);
    }
  });

  it("should reject a proof with a wrong leaf", () => {
    const tree = new MerkleTree(["A", "B", "C", "D"]);
    const root = tree.getRoot();
    const proof = tree.getProof(0); // proof for "A"

    expect(MerkleTree.verify("Z", proof, root)).toBe(false);
  });

  it("should reject a proof with a wrong root", () => {
    const tree = new MerkleTree(["A", "B", "C", "D"]);
    const proof = tree.getProof(0);

    expect(MerkleTree.verify("A", proof, "wrong_root")).toBe(false);
  });

  it("should verify proofs for odd-numbered leaf trees", () => {
    const leaves = ["A", "B", "C", "D", "E"];
    const tree = new MerkleTree(leaves);
    const root = tree.getRoot();

    for (let i = 0; i < leaves.length; i++) {
      const proof = tree.getProof(i);
      expect(MerkleTree.verify(leaves[i], proof, root)).toBe(true);
    }
  });

  // ─── addLeaf ─────────────────────────────────────────────────

  it("should add a new leaf and update the root", () => {
    const tree = new MerkleTree(["A", "B", "C", "D"]);
    const oldRoot = tree.getRoot();

    tree.addLeaf("E");

    expect(tree.getRoot()).not.toBe(oldRoot);
    expect(tree.getLeaves()).toHaveLength(5);
  });

  it("should produce valid proofs after adding a leaf", () => {
    const tree = new MerkleTree(["A", "B"]);
    tree.addLeaf("C");

    const root = tree.getRoot();
    const proof = tree.getProof(2);
    expect(MerkleTree.verify("C", proof, root)).toBe(true);
  });

  // ─── Tree integrity ──────────────────────────────────────────

  it("should produce a different root if any leaf changes", () => {
    const tree1 = new MerkleTree(["A", "B", "C", "D"]);
    const tree2 = new MerkleTree(["A", "X", "C", "D"]);

    expect(tree1.getRoot()).not.toBe(tree2.getRoot());
  });
});

import { describe, it, expect, vi } from "vitest";
import {
  orderTransactions,
  detectCycles,
  getParallelBatches,
  Transaction,
} from "./index";

describe("Challenge 3.1: Transaction Ordering", () => {
  describe("orderTransactions", () => {
    it("should handle a single transaction with no dependencies", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 100 },
      ];
      const result = orderTransactions(transactions);
      expect(result).toEqual(["A"]);
    });

    it("should handle a linear chain of dependencies", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 100 },
        { id: "B", dependsOn: ["A"], fee: 200 },
        { id: "C", dependsOn: ["B"], fee: 300 },
      ];
      const result = orderTransactions(transactions);
      expect(result).toEqual(["A", "B", "C"]);
    });

    it("should prefer higher fee transactions when multiple are ready", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 100 },
        { id: "B", dependsOn: [], fee: 300 },
        { id: "C", dependsOn: [], fee: 200 },
      ];
      const result = orderTransactions(transactions);
      expect(result).toEqual(["B", "C", "A"]);
    });

    it("should handle diamond dependency pattern", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 100 },
        { id: "B", dependsOn: ["A"], fee: 200 },
        { id: "C", dependsOn: ["A"], fee: 300 },
        { id: "D", dependsOn: ["B", "C"], fee: 150 },
      ];
      const result = orderTransactions(transactions);

      // A must come first
      expect(result[0]).toBe("A");
      // D must come last
      expect(result[3]).toBe("D");
      // B and C can be in any order, but C has higher fee so should come first
      expect(result[1]).toBe("C");
      expect(result[2]).toBe("B");
    });

    it("should throw on a simple cycle", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: ["B"], fee: 100 },
        { id: "B", dependsOn: ["A"], fee: 200 },
      ];
      expect(() => orderTransactions(transactions)).toThrow();
    });

    it("should throw on a longer cycle", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 100 },
        { id: "B", dependsOn: ["A", "D"], fee: 200 },
        { id: "C", dependsOn: ["B"], fee: 300 },
        { id: "D", dependsOn: ["C"], fee: 150 },
      ];
      expect(() => orderTransactions(transactions)).toThrow();
    });

    it("should handle empty transaction list", () => {
      const result = orderTransactions([]);
      expect(result).toEqual([]);
    });

    it("should handle multiple independent chains", () => {
      const transactions: Transaction[] = [
        { id: "A1", dependsOn: [], fee: 100 },
        { id: "A2", dependsOn: ["A1"], fee: 200 },
        { id: "B1", dependsOn: [], fee: 300 },
        { id: "B2", dependsOn: ["B1"], fee: 400 },
      ];
      const result = orderTransactions(transactions);

      // A1 must come before A2
      expect(result.indexOf("A1")).toBeLessThan(result.indexOf("A2"));
      // B1 must come before B2
      expect(result.indexOf("B1")).toBeLessThan(result.indexOf("B2"));
      // B1 has higher fee than A1, so B1 should come first among roots
      expect(result.indexOf("B1")).toBeLessThan(result.indexOf("A1"));
    });

    it("should respect dependency order even when fee would suggest otherwise", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 10 },
        { id: "B", dependsOn: ["A"], fee: 1000 },
      ];
      const result = orderTransactions(transactions);
      expect(result).toEqual(["A", "B"]);
    });
  });

  describe("detectCycles", () => {
    it("should return empty array when no cycles exist", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 100 },
        { id: "B", dependsOn: ["A"], fee: 200 },
        { id: "C", dependsOn: ["B"], fee: 300 },
      ];
      const result = detectCycles(transactions);
      expect(result).toEqual([]);
    });

    it("should detect a simple two-node cycle", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: ["B"], fee: 100 },
        { id: "B", dependsOn: ["A"], fee: 200 },
      ];
      const result = detectCycles(transactions);
      expect(result.length).toBeGreaterThan(0);

      // Each cycle should start and end with the same node
      for (const cycle of result) {
        expect(cycle[0]).toBe(cycle[cycle.length - 1]);
      }
    });

    it("should detect a three-node cycle", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: ["C"], fee: 100 },
        { id: "B", dependsOn: ["A"], fee: 200 },
        { id: "C", dependsOn: ["B"], fee: 300 },
      ];
      const result = detectCycles(transactions);
      expect(result.length).toBeGreaterThan(0);

      // Verify cycle path validity
      for (const cycle of result) {
        expect(cycle.length).toBeGreaterThanOrEqual(2);
        expect(cycle[0]).toBe(cycle[cycle.length - 1]);
      }
    });

    it("should handle graph with both cyclic and acyclic parts", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 100 },
        { id: "B", dependsOn: ["A"], fee: 200 },
        { id: "C", dependsOn: ["D"], fee: 300 },
        { id: "D", dependsOn: ["C"], fee: 150 },
      ];
      const result = detectCycles(transactions);
      expect(result.length).toBeGreaterThan(0);

      // Cycle should involve C and D, not A and B
      const cycleNodes = result.flat();
      expect(cycleNodes).toContain("C");
      expect(cycleNodes).toContain("D");
    });

    it("should return empty array for empty input", () => {
      const result = detectCycles([]);
      expect(result).toEqual([]);
    });
  });

  describe("getParallelBatches", () => {
    it("should place independent transactions in the same batch", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 100 },
        { id: "B", dependsOn: [], fee: 200 },
        { id: "C", dependsOn: [], fee: 300 },
      ];
      const result = getParallelBatches(transactions);
      expect(result).toHaveLength(1);
      // Sorted by fee descending
      expect(result[0]).toEqual(["C", "B", "A"]);
    });

    it("should separate transactions with dependencies into different batches", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 100 },
        { id: "B", dependsOn: ["A"], fee: 200 },
        { id: "C", dependsOn: ["B"], fee: 300 },
      ];
      const result = getParallelBatches(transactions);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(["A"]);
      expect(result[1]).toEqual(["B"]);
      expect(result[2]).toEqual(["C"]);
    });

    it("should handle diamond dependencies correctly", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 100 },
        { id: "B", dependsOn: ["A"], fee: 200 },
        { id: "C", dependsOn: ["A"], fee: 300 },
        { id: "D", dependsOn: ["B", "C"], fee: 150 },
      ];
      const result = getParallelBatches(transactions);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(["A"]);
      // B and C in same batch, C first (higher fee)
      expect(result[1]).toEqual(["C", "B"]);
      expect(result[2]).toEqual(["D"]);
    });

    it("should throw on cyclic dependencies", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: ["B"], fee: 100 },
        { id: "B", dependsOn: ["A"], fee: 200 },
      ];
      expect(() => getParallelBatches(transactions)).toThrow();
    });

    it("should handle empty input", () => {
      const result = getParallelBatches([]);
      expect(result).toEqual([]);
    });

    it("should sort within batches by fee descending", () => {
      const transactions: Transaction[] = [
        { id: "root", dependsOn: [], fee: 50 },
        { id: "A", dependsOn: ["root"], fee: 100 },
        { id: "B", dependsOn: ["root"], fee: 500 },
        { id: "C", dependsOn: ["root"], fee: 250 },
      ];
      const result = getParallelBatches(transactions);
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual(["B", "C", "A"]);
    });

    it("should handle complex multi-level graph", () => {
      const transactions: Transaction[] = [
        { id: "A", dependsOn: [], fee: 100 },
        { id: "B", dependsOn: [], fee: 200 },
        { id: "C", dependsOn: ["A"], fee: 300 },
        { id: "D", dependsOn: ["A", "B"], fee: 150 },
        { id: "E", dependsOn: ["C", "D"], fee: 250 },
      ];
      const result = getParallelBatches(transactions);

      // Batch 0: A, B (no deps) — B first (higher fee)
      expect(result[0]).toEqual(["B", "A"]);
      // Batch 1: C, D (depend on batch 0) — C first (higher fee)
      expect(result[1]).toEqual(["C", "D"]);
      // Batch 2: E (depends on batch 1)
      expect(result[2]).toEqual(["E"]);
    });
  });
});

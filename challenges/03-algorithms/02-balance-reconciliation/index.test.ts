import { describe, it, expect, vi } from "vitest";
import {
  reconcile,
  findMissingTransactions,
  buildBalanceTimeline,
  BalanceTransaction,
  Snapshot,
} from "./index";

describe("Challenge 3.2: Balance Reconciliation", () => {
  describe("reconcile", () => {
    it("should return no discrepancies when balances match", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 1000, balances: { SOL: 10 } },
      ];
      const transactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 500, amount: 10, type: "credit", token: "SOL" },
      ];
      const result = reconcile(snapshots, transactions);
      expect(result).toEqual([]);
    });

    it("should detect a discrepancy when expected differs from actual", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 1000, balances: { SOL: 10 } },
        { timestamp: 2000, balances: { SOL: 7 } },
      ];
      const transactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 500, amount: 10, type: "credit", token: "SOL" },
        { id: "tx2", timestamp: 1500, amount: 5, type: "debit", token: "SOL" },
      ];
      const result = reconcile(snapshots, transactions);

      // At t=1000: expected=10, actual=10 -> OK
      // At t=2000: expected=10-5=5, actual=7 -> discrepancy
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        token: "SOL",
        expected: 5,
        actual: 7,
        timestamp: 2000,
      });
    });

    it("should handle multiple tokens independently", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 2000, balances: { SOL: 8, USDC: 100 } },
      ];
      const transactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 500, amount: 10, type: "credit", token: "SOL" },
        { id: "tx2", timestamp: 800, amount: 2, type: "debit", token: "SOL" },
        { id: "tx3", timestamp: 600, amount: 100, type: "credit", token: "USDC" },
      ];
      const result = reconcile(snapshots, transactions);

      // SOL: expected=10-2=8, actual=8 -> OK
      // USDC: expected=100, actual=100 -> OK
      expect(result).toEqual([]);
    });

    it("should handle discrepancies across multiple tokens", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 2000, balances: { SOL: 5, USDC: 90 } },
      ];
      const transactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 500, amount: 10, type: "credit", token: "SOL" },
        { id: "tx2", timestamp: 600, amount: 100, type: "credit", token: "USDC" },
      ];
      const result = reconcile(snapshots, transactions);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({
        token: "SOL",
        expected: 10,
        actual: 5,
        timestamp: 2000,
      });
      expect(result).toContainEqual({
        token: "USDC",
        expected: 100,
        actual: 90,
        timestamp: 2000,
      });
    });

    it("should only count transactions up to the snapshot timestamp", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 1000, balances: { SOL: 10 } },
      ];
      const transactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 500, amount: 10, type: "credit", token: "SOL" },
        { id: "tx2", timestamp: 1500, amount: 5, type: "debit", token: "SOL" },
      ];
      const result = reconcile(snapshots, transactions);
      // tx2 is after snapshot, should not be counted
      // expected=10, actual=10 -> OK
      expect(result).toEqual([]);
    });

    it("should handle snapshots with tokens not in any transaction", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 1000, balances: { BONK: 500 } },
      ];
      const transactions: BalanceTransaction[] = [];
      const result = reconcile(snapshots, transactions);

      // No transactions for BONK, expected=0, actual=500
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        token: "BONK",
        expected: 0,
        actual: 500,
        timestamp: 1000,
      });
    });

    it("should handle empty inputs", () => {
      expect(reconcile([], [])).toEqual([]);
      expect(reconcile([], [
        { id: "tx1", timestamp: 500, amount: 10, type: "credit", token: "SOL" },
      ])).toEqual([]);
    });
  });

  describe("findMissingTransactions", () => {
    it("should return empty when all changes are explained", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 1000, balances: { SOL: 10 } },
        { timestamp: 2000, balances: { SOL: 7 } },
      ];
      const knownTransactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 1500, amount: 3, type: "debit", token: "SOL" },
      ];
      const result = findMissingTransactions(snapshots, knownTransactions);
      expect(result).toEqual([]);
    });

    it("should infer a missing credit transaction", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 1000, balances: { SOL: 10 } },
        { timestamp: 2000, balances: { SOL: 15 } },
      ];
      const knownTransactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 1500, amount: 2, type: "credit", token: "SOL" },
      ];
      const result = findMissingTransactions(snapshots, knownTransactions);

      // Balance went up by 5, but we only know of +2. Missing: +3
      expect(result).toHaveLength(1);
      expect(result[0].token).toBe("SOL");
      expect(result[0].amount).toBe(3);
      expect(result[0].type).toBe("credit");
      expect(result[0].timestampRange).toEqual([1000, 2000]);
    });

    it("should infer a missing debit transaction", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 1000, balances: { SOL: 10 } },
        { timestamp: 2000, balances: { SOL: 4 } },
      ];
      const knownTransactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 1200, amount: 3, type: "debit", token: "SOL" },
      ];
      const result = findMissingTransactions(snapshots, knownTransactions);

      // Balance went down by 6, known debit is 3. Missing debit of 3.
      expect(result).toHaveLength(1);
      expect(result[0].token).toBe("SOL");
      expect(result[0].amount).toBe(3);
      expect(result[0].type).toBe("debit");
      expect(result[0].timestampRange).toEqual([1000, 2000]);
    });

    it("should handle multiple tokens with missing transactions", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 1000, balances: { SOL: 10, USDC: 100 } },
        { timestamp: 2000, balances: { SOL: 10, USDC: 120 } },
      ];
      const knownTransactions: BalanceTransaction[] = [];
      const result = findMissingTransactions(snapshots, knownTransactions);

      // SOL unchanged, no missing. USDC went up 20, no known tx -> missing credit of 20
      expect(result).toHaveLength(1);
      expect(result[0].token).toBe("USDC");
      expect(result[0].amount).toBe(20);
      expect(result[0].type).toBe("credit");
    });

    it("should handle multiple consecutive snapshot windows", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 1000, balances: { SOL: 10 } },
        { timestamp: 2000, balances: { SOL: 15 } },
        { timestamp: 3000, balances: { SOL: 12 } },
      ];
      const knownTransactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 1500, amount: 5, type: "credit", token: "SOL" },
        // No known transactions for 2000-3000 window
      ];
      const result = findMissingTransactions(snapshots, knownTransactions);

      // Window [1000,2000]: change=+5, known=+5 -> OK
      // Window [2000,3000]: change=-3, known=0 -> missing debit of 3
      expect(result).toHaveLength(1);
      expect(result[0].token).toBe("SOL");
      expect(result[0].amount).toBe(3);
      expect(result[0].type).toBe("debit");
      expect(result[0].timestampRange).toEqual([2000, 3000]);
    });

    it("should return empty when there are fewer than 2 snapshots", () => {
      const snapshots: Snapshot[] = [
        { timestamp: 1000, balances: { SOL: 10 } },
      ];
      const result = findMissingTransactions(snapshots, []);
      expect(result).toEqual([]);
    });
  });

  describe("buildBalanceTimeline", () => {
    it("should build a timeline from a single transaction", () => {
      const transactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 1000, amount: 5, type: "credit", token: "SOL" },
      ];
      const result = buildBalanceTimeline(transactions, { SOL: 10 });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        timestamp: 1000,
        transactionId: "tx1",
        balances: { SOL: 15 },
      });
    });

    it("should build a timeline sorted by timestamp", () => {
      const transactions: BalanceTransaction[] = [
        { id: "tx2", timestamp: 2000, amount: 3, type: "debit", token: "SOL" },
        { id: "tx1", timestamp: 1000, amount: 10, type: "credit", token: "SOL" },
      ];
      const result = buildBalanceTimeline(transactions, { SOL: 0 });

      expect(result).toHaveLength(2);
      expect(result[0].transactionId).toBe("tx1");
      expect(result[0].balances.SOL).toBe(10);
      expect(result[1].transactionId).toBe("tx2");
      expect(result[1].balances.SOL).toBe(7);
    });

    it("should handle multiple tokens", () => {
      const transactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 1000, amount: 5, type: "credit", token: "SOL" },
        { id: "tx2", timestamp: 1500, amount: 100, type: "credit", token: "USDC" },
        { id: "tx3", timestamp: 2000, amount: 2, type: "debit", token: "SOL" },
      ];
      const result = buildBalanceTimeline(transactions, { SOL: 10, USDC: 0 });

      expect(result).toHaveLength(3);
      expect(result[0].balances).toEqual({ SOL: 15, USDC: 0 });
      expect(result[1].balances).toEqual({ SOL: 15, USDC: 100 });
      expect(result[2].balances).toEqual({ SOL: 13, USDC: 100 });
    });

    it("should introduce new tokens not in starting balance", () => {
      const transactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 1000, amount: 50, type: "credit", token: "BONK" },
      ];
      const result = buildBalanceTimeline(transactions, { SOL: 10 });

      expect(result).toHaveLength(1);
      expect(result[0].balances).toEqual({ SOL: 10, BONK: 50 });
    });

    it("should return immutable balance objects (each entry is a new object)", () => {
      const transactions: BalanceTransaction[] = [
        { id: "tx1", timestamp: 1000, amount: 5, type: "credit", token: "SOL" },
        { id: "tx2", timestamp: 2000, amount: 3, type: "debit", token: "SOL" },
      ];
      const result = buildBalanceTimeline(transactions, { SOL: 10 });

      // Each entry should have its own balance object
      expect(result[0].balances).not.toBe(result[1].balances);
      // Modifying one should not affect the other
      result[0].balances.SOL = 999;
      expect(result[1].balances.SOL).toBe(12);
    });

    it("should handle empty transaction list", () => {
      const result = buildBalanceTimeline([], { SOL: 10 });
      expect(result).toEqual([]);
    });
  });
});

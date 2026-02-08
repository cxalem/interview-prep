import { describe, it, expect, vi } from "vitest";
import { PriorityQueue } from "./index";

describe("PriorityQueue", () => {
  // ─── Basic operations with numbers (min-heap) ────────────────

  it("should create an empty queue", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    expect(q.size).toBe(0);
    expect(q.isEmpty()).toBe(true);
  });

  it("should enqueue and dequeue a single item", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    q.enqueue(42);
    expect(q.size).toBe(1);
    expect(q.isEmpty()).toBe(false);
    expect(q.dequeue()).toBe(42);
    expect(q.isEmpty()).toBe(true);
  });

  it("should dequeue items in ascending order (min-heap)", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    q.enqueue(5);
    q.enqueue(1);
    q.enqueue(3);
    q.enqueue(4);
    q.enqueue(2);

    expect(q.dequeue()).toBe(1);
    expect(q.dequeue()).toBe(2);
    expect(q.dequeue()).toBe(3);
    expect(q.dequeue()).toBe(4);
    expect(q.dequeue()).toBe(5);
  });

  it("should return undefined when dequeuing from an empty queue", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    expect(q.dequeue()).toBeUndefined();
  });

  // ─── peek ─────────────────────────────────────────────────────

  it("should peek at the highest priority item without removing it", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    q.enqueue(3);
    q.enqueue(1);
    q.enqueue(2);

    expect(q.peek()).toBe(1);
    expect(q.size).toBe(3); // peek should not remove
  });

  it("should return undefined when peeking at an empty queue", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    expect(q.peek()).toBeUndefined();
  });

  // ─── Max-heap via inverted comparator ─────────────────────────

  it("should support max-heap with inverted comparator", () => {
    const q = new PriorityQueue<number>((a, b) => b - a);
    q.enqueue(1);
    q.enqueue(5);
    q.enqueue(3);

    expect(q.dequeue()).toBe(5);
    expect(q.dequeue()).toBe(3);
    expect(q.dequeue()).toBe(1);
  });

  // ─── Object comparator (transaction fees) ────────────────────

  interface Transaction {
    id: string;
    fee: number;
  }

  it("should order transactions by highest fee first", () => {
    const q = new PriorityQueue<Transaction>((a, b) => b.fee - a.fee);
    q.enqueue({ id: "tx1", fee: 5000 });
    q.enqueue({ id: "tx2", fee: 15000 });
    q.enqueue({ id: "tx3", fee: 10000 });
    q.enqueue({ id: "tx4", fee: 20000 });

    expect(q.dequeue()?.id).toBe("tx4");
    expect(q.dequeue()?.id).toBe("tx2");
    expect(q.dequeue()?.id).toBe("tx3");
    expect(q.dequeue()?.id).toBe("tx1");
  });

  // ─── toArray ──────────────────────────────────────────────────

  it("should return a sorted array without modifying the queue", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    q.enqueue(3);
    q.enqueue(1);
    q.enqueue(4);
    q.enqueue(1);
    q.enqueue(5);

    const sorted = q.toArray();
    expect(sorted).toEqual([1, 1, 3, 4, 5]);
    expect(q.size).toBe(5); // queue should be unmodified
  });

  it("should return an empty array for an empty queue", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    expect(q.toArray()).toEqual([]);
  });

  // ─── changePriority ──────────────────────────────────────────

  it("should replace an item and re-heapify", () => {
    const q = new PriorityQueue<Transaction>((a, b) => b.fee - a.fee);
    q.enqueue({ id: "tx1", fee: 5000 });
    q.enqueue({ id: "tx2", fee: 10000 });
    q.enqueue({ id: "tx3", fee: 15000 });

    // Bump tx1's fee to highest
    const found = q.changePriority(
      (item) => item.id === "tx1",
      { id: "tx1", fee: 50000 }
    );

    expect(found).toBe(true);
    expect(q.dequeue()?.id).toBe("tx1"); // tx1 now has highest fee
  });

  it("should return false if predicate matches nothing", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    q.enqueue(1);
    q.enqueue(2);

    const found = q.changePriority((item) => item === 99, 0);
    expect(found).toBe(false);
  });

  it("should maintain heap property after changePriority lowers priority", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    q.enqueue(1);
    q.enqueue(3);
    q.enqueue(5);
    q.enqueue(7);

    // Replace 1 (highest priority) with 10 (lowest priority)
    q.changePriority((item) => item === 1, 10);

    expect(q.dequeue()).toBe(3);
    expect(q.dequeue()).toBe(5);
    expect(q.dequeue()).toBe(7);
    expect(q.dequeue()).toBe(10);
  });

  // ─── Edge cases ───────────────────────────────────────────────

  it("should handle duplicate values", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    q.enqueue(3);
    q.enqueue(3);
    q.enqueue(3);

    expect(q.size).toBe(3);
    expect(q.dequeue()).toBe(3);
    expect(q.dequeue()).toBe(3);
    expect(q.dequeue()).toBe(3);
  });

  it("should handle a large number of items", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    const items = Array.from({ length: 1000 }, () =>
      Math.floor(Math.random() * 10000)
    );

    for (const item of items) {
      q.enqueue(item);
    }

    expect(q.size).toBe(1000);

    let prev = -Infinity;
    while (!q.isEmpty()) {
      const current = q.dequeue()!;
      expect(current).toBeGreaterThanOrEqual(prev);
      prev = current;
    }
  });

  it("should handle interleaved enqueue and dequeue", () => {
    const q = new PriorityQueue<number>((a, b) => a - b);
    q.enqueue(5);
    q.enqueue(3);
    expect(q.dequeue()).toBe(3);
    q.enqueue(1);
    q.enqueue(4);
    expect(q.dequeue()).toBe(1);
    expect(q.dequeue()).toBe(4);
    expect(q.dequeue()).toBe(5);
  });
});

import { describe, it, expect, vi } from "vitest";
import { LRUCache } from "./index";

describe("LRUCache", () => {
  // ─── Constructor ──────────────────────────────────────────────

  it("should create a cache with the given capacity", () => {
    const cache = new LRUCache<string>(3);
    expect(cache.size).toBe(0);
  });

  it("should throw if capacity is <= 0", () => {
    expect(() => new LRUCache<string>(0)).toThrow();
    expect(() => new LRUCache<string>(-1)).toThrow();
  });

  // ─── Basic get / put ──────────────────────────────────────────

  it("should store and retrieve a value", () => {
    const cache = new LRUCache<string>(3);
    cache.put("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("should return undefined for a missing key", () => {
    const cache = new LRUCache<string>(3);
    expect(cache.get("nonexistent")).toBeUndefined();
  });

  it("should update an existing key", () => {
    const cache = new LRUCache<number>(3);
    cache.put("balance", 100);
    cache.put("balance", 200);
    expect(cache.get("balance")).toBe(200);
    expect(cache.size).toBe(1);
  });

  // ─── Eviction ─────────────────────────────────────────────────

  it("should evict the least recently used item when at capacity", () => {
    const cache = new LRUCache<string>(3);
    cache.put("a", "1");
    cache.put("b", "2");
    cache.put("c", "3");
    cache.put("d", "4"); // should evict "a"

    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe("2");
    expect(cache.get("c")).toBe("3");
    expect(cache.get("d")).toBe("4");
    expect(cache.size).toBe(3);
  });

  it("should evict correctly after a get refreshes recency", () => {
    const cache = new LRUCache<string>(3);
    cache.put("a", "1");
    cache.put("b", "2");
    cache.put("c", "3");

    cache.get("a"); // "a" is now most recent

    cache.put("d", "4"); // should evict "b" (now least recent)

    expect(cache.get("a")).toBe("1");
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe("3");
    expect(cache.get("d")).toBe("4");
  });

  it("should evict correctly after a put updates an existing key", () => {
    const cache = new LRUCache<string>(3);
    cache.put("a", "1");
    cache.put("b", "2");
    cache.put("c", "3");

    cache.put("a", "updated"); // "a" refreshed

    cache.put("d", "4"); // should evict "b"

    expect(cache.get("a")).toBe("updated");
    expect(cache.get("b")).toBeUndefined();
  });

  // ─── has ──────────────────────────────────────────────────────

  it("should return true for existing keys without updating recency", () => {
    const cache = new LRUCache<string>(3);
    cache.put("a", "1");
    cache.put("b", "2");
    cache.put("c", "3");

    expect(cache.has("a")).toBe(true);

    // "a" should still be LRU since has() doesn't update recency
    cache.put("d", "4"); // should evict "a"
    expect(cache.get("a")).toBeUndefined();
  });

  it("should return false for non-existing keys", () => {
    const cache = new LRUCache<string>(3);
    expect(cache.has("missing")).toBe(false);
  });

  // ─── delete ───────────────────────────────────────────────────

  it("should delete an existing key and return true", () => {
    const cache = new LRUCache<string>(3);
    cache.put("a", "1");
    expect(cache.delete("a")).toBe(true);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it("should return false when deleting a non-existing key", () => {
    const cache = new LRUCache<string>(3);
    expect(cache.delete("nope")).toBe(false);
  });

  // ─── clear ────────────────────────────────────────────────────

  it("should clear all entries", () => {
    const cache = new LRUCache<string>(3);
    cache.put("a", "1");
    cache.put("b", "2");
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
  });

  // ─── TTL (Time-to-Live) ──────────────────────────────────────

  it("should expire entries after the default TTL", () => {
    vi.useFakeTimers();

    const cache = new LRUCache<string>(5, 1000); // 1s default TTL
    cache.put("key", "value");

    expect(cache.get("key")).toBe("value");

    vi.advanceTimersByTime(1001);

    expect(cache.get("key")).toBeUndefined();
    expect(cache.size).toBe(0);

    vi.useRealTimers();
  });

  it("should support per-entry TTL that overrides default", () => {
    vi.useFakeTimers();

    const cache = new LRUCache<string>(5, 1000); // 1s default
    cache.put("short", "gone soon", 500);
    cache.put("long", "stays longer", 2000);
    cache.put("default", "uses default");

    vi.advanceTimersByTime(600);

    expect(cache.get("short")).toBeUndefined();
    expect(cache.get("long")).toBe("stays longer");
    expect(cache.get("default")).toBe("uses default");

    vi.advanceTimersByTime(500); // now at 1100ms

    expect(cache.get("default")).toBeUndefined();
    expect(cache.get("long")).toBe("stays longer");

    vi.useRealTimers();
  });

  it("should treat expired entries as non-existent in has()", () => {
    vi.useFakeTimers();

    const cache = new LRUCache<string>(5, 500);
    cache.put("temp", "data");

    expect(cache.has("temp")).toBe(true);

    vi.advanceTimersByTime(600);

    expect(cache.has("temp")).toBe(false);

    vi.useRealTimers();
  });

  // ─── entries() iteration ──────────────────────────────────────

  it("should iterate from most recently used to least recently used", () => {
    const cache = new LRUCache<string>(5);
    cache.put("a", "1");
    cache.put("b", "2");
    cache.put("c", "3");

    cache.get("a"); // a is now most recent

    const result = [...cache.entries()];
    expect(result).toEqual([
      ["a", "1"],
      ["c", "3"],
      ["b", "2"],
    ]);
  });

  it("should skip expired entries during iteration", () => {
    vi.useFakeTimers();

    const cache = new LRUCache<string>(5);
    cache.put("a", "1", 500);
    cache.put("b", "2", 2000);
    cache.put("c", "3", 2000);

    vi.advanceTimersByTime(600);

    const result = [...cache.entries()];
    expect(result).toEqual([
      ["c", "3"],
      ["b", "2"],
    ]);

    vi.useRealTimers();
  });

  // ─── Edge cases ───────────────────────────────────────────────

  it("should handle a cache of capacity 1", () => {
    const cache = new LRUCache<number>(1);
    cache.put("only", 42);
    expect(cache.get("only")).toBe(42);

    cache.put("new", 99); // evicts "only"
    expect(cache.get("only")).toBeUndefined();
    expect(cache.get("new")).toBe(99);
  });
});

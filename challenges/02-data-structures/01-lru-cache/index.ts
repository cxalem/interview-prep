/**
 * Challenge 2.1: LRU Cache
 *
 * Implement an LRU (Least Recently Used) Cache with O(1) get and put operations.
 * Supports TTL (time-to-live) per entry.
 *
 * Hint: Use a doubly linked list + hash map combination.
 */

interface CacheEntry<V> {
  key: string;
  value: V;
  expiresAt: number | null; // timestamp in ms, null means no expiration
}

export class LRUCache<V> {
  private capacity: number;
  private defaultTTL: number | undefined;

  /**
   * @param capacity - Maximum number of entries the cache can hold
   * @param defaultTTL - Optional default time-to-live in milliseconds
   */
  constructor(capacity: number, defaultTTL?: number) {
    if (capacity <= 0) {
      throw new Error("Capacity must be greater than 0");
    }
    this.capacity = capacity;
    this.defaultTTL = defaultTTL;

    // TODO: Initialize your data structures (doubly linked list + hash map)
  }

  /**
   * Retrieve a value by key. Returns undefined if not found or expired.
   * Marks the entry as recently used.
   *
   * Must be O(1) time complexity.
   */
  get(key: string): V | undefined {
    // TODO: Implement
    // - Check if key exists in the map
    // - Check if entry has expired (if so, delete it and return undefined)
    // - Move the entry to the head (most recently used)
    // - Return the value
    throw new Error("Not implemented");
  }

  /**
   * Insert or update a key-value pair.
   * If at capacity, evict the least recently used entry.
   *
   * Must be O(1) time complexity.
   *
   * @param key - Cache key
   * @param value - Value to store
   * @param ttl - Optional per-entry TTL in milliseconds (overrides defaultTTL)
   */
  put(key: string, value: V, ttl?: number): void {
    // TODO: Implement
    // - If key already exists, update value and TTL, move to head
    // - If at capacity, evict the tail (least recently used)
    // - Create new entry and add to head
    // - Calculate expiresAt based on ttl or defaultTTL
    throw new Error("Not implemented");
  }

  /**
   * Check if a key exists in the cache without updating its recency.
   * Returns false for expired entries (and removes them).
   */
  has(key: string): boolean {
    // TODO: Implement
    // - Check existence in map
    // - Check if expired (if so, delete and return false)
    // - Do NOT update recency
    throw new Error("Not implemented");
  }

  /**
   * Remove a specific entry from the cache.
   * Returns true if the entry existed, false otherwise.
   */
  delete(key: string): boolean {
    // TODO: Implement
    // - Check if key exists
    // - Remove from linked list and map
    throw new Error("Not implemented");
  }

  /**
   * Remove all entries from the cache.
   */
  clear(): void {
    // TODO: Implement
    // - Reset the linked list and map
    throw new Error("Not implemented");
  }

  /**
   * Returns the current number of (non-expired) entries in the cache.
   */
  get size(): number {
    // TODO: Implement
    throw new Error("Not implemented");
  }

  /**
   * Iterate entries from most recently used to least recently used.
   * Yields [key, value] pairs. Skips expired entries.
   */
  *entries(): IterableIterator<[string, V]> {
    // TODO: Implement
    // - Walk the linked list from head to tail
    // - Skip (and remove) expired entries
    // - Yield [key, value] pairs
    throw new Error("Not implemented");
  }
}

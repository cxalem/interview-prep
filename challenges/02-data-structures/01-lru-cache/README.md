# Challenge 2.1: LRU Cache

| Difficulty | AI Assistance | Time Limit |
|------------|--------------|------------|
| Medium     | Partial      | 45 min     |

## Problem

Implement an **LRU (Least Recently Used) Cache** for caching Solana RPC responses. Both `get` and `put` operations must run in **O(1)** time.

In a Solana dApp, RPC calls (e.g., `getAccountInfo`, `getBalance`) are expensive and rate-limited. An LRU cache allows you to store recent responses and evict the least recently accessed entries when the cache reaches capacity.

## Requirements

### Core Operations (O(1) time complexity)

- **`get(key: string)`** — Returns the cached value or `undefined` if not found. Marks the entry as recently used.
- **`put(key: string, value: V, ttl?: number)`** — Inserts or updates an entry. If the cache is at capacity, evicts the least recently used entry. Optionally accepts a per-entry TTL in milliseconds.
- **`has(key: string)`** — Returns `true` if the key exists and is not expired, without updating recency.
- **`delete(key: string)`** — Removes a specific entry. Returns `true` if the entry existed.
- **`clear()`** — Removes all entries from the cache.
- **`size`** — Getter that returns the current number of entries.

### TTL (Time-to-Live) Support

- The constructor accepts an optional `defaultTTL` in milliseconds.
- Each `put` call can override the default TTL with a per-entry TTL.
- Expired entries should be treated as non-existent and evicted on access.

### Iteration

- **`entries()`** — Returns an iterator that yields `[key, value]` pairs from most recently used to least recently used.

## Hints

- Use a **doubly linked list** combined with a **hash map** to achieve O(1) for all operations.
- The head of the list represents the most recently used entry; the tail represents the least recently used.
- On `get` or `put`, move the accessed node to the head of the list.
- On eviction, remove from the tail.
- Store timestamps alongside values to handle TTL expiration.

## Example

```typescript
const cache = new LRUCache<string>(3, 5000); // capacity 3, 5s default TTL

cache.put("acct:abc", "100 SOL");
cache.put("acct:def", "50 SOL");
cache.put("acct:ghi", "25 SOL");

cache.get("acct:abc"); // "100 SOL" — moves to most recent

cache.put("acct:jkl", "10 SOL"); // evicts "acct:def" (least recently used)

cache.get("acct:def"); // undefined — was evicted
```

# Challenge 2.3: Priority Queue (Min-Heap)

| Difficulty | AI Assistance | Time Limit |
|------------|--------------|------------|
| Medium     | Partial      | 40 min     |

## Problem

Implement a **min-heap priority queue** with a custom comparator. This models how Solana validators order transactions by **priority fee** — transactions with higher fees are processed first.

## Requirements

### Generic Class

`PriorityQueue<T>` — works with any type, ordered by a comparator function.

The comparator follows the same convention as `Array.prototype.sort`:
- Returns a **negative** number if `a` has **higher** priority than `b`
- Returns a **positive** number if `b` has higher priority than `a`
- Returns `0` if they have equal priority

### Operations

- **`enqueue(item: T)`** — Add an item to the queue. O(log n).
- **`dequeue()`** — Remove and return the highest priority item (smallest per comparator). Returns `undefined` if empty. O(log n).
- **`peek()`** — View the highest priority item without removing it. Returns `undefined` if empty. O(1).
- **`size`** — Getter for the current number of items. O(1).
- **`isEmpty()`** — Returns `true` if the queue has no items. O(1).
- **`toArray()`** — Returns all items sorted by priority (does NOT modify the internal queue). O(n log n).
- **`changePriority(predicate: (item: T) => boolean, newItem: T)`** — Finds the first item matching the predicate, replaces it with `newItem`, and re-heapifies. Returns `true` if found, `false` otherwise.

## Hints

- Implement the heap as an array where for index `i`:
  - Parent: `Math.floor((i - 1) / 2)`
  - Left child: `2 * i + 1`
  - Right child: `2 * i + 2`
- **Bubble up** after insertion (swap with parent while higher priority).
- **Sink down** after removal (swap with smallest child while lower priority).
- For `toArray()`, clone the heap and dequeue everything.
- For `changePriority`, after replacing the item, you may need to bubble up OR sink down.

## Example

```typescript
// Simple number queue (min first)
const q = new PriorityQueue<number>((a, b) => a - b);
q.enqueue(5);
q.enqueue(1);
q.enqueue(3);
q.dequeue(); // 1
q.dequeue(); // 3
q.dequeue(); // 5

// Transaction priority (highest fee first — max-heap via inverted comparator)
interface Transaction {
  id: string;
  fee: number;
}
const txQueue = new PriorityQueue<Transaction>((a, b) => b.fee - a.fee);
txQueue.enqueue({ id: "tx1", fee: 5000 });
txQueue.enqueue({ id: "tx2", fee: 15000 });
txQueue.enqueue({ id: "tx3", fee: 10000 });
txQueue.dequeue(); // { id: "tx2", fee: 15000 }
```

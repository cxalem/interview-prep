# Challenge 2.5: Concurrent Task Queue

| Difficulty | AI Assistance | Time Limit |
|------------|--------------|------------|
| Hard       | Partial      | 60 min     |

## Problem

Implement a **concurrent task queue** with a configurable maximum concurrency. This is essential for Solana dApps that need to make many RPC calls without overwhelming the endpoint's rate limits.

For example, if you need to fetch account data for 1,000 wallets but the RPC allows only 10 concurrent requests, a task queue lets you process them efficiently within the rate limit.

## Requirements

### Constructor

```typescript
new TaskQueue<T>(maxConcurrency: number)
```

### Core Operations

- **`add(task: () => Promise<T>, options?: TaskOptions)`** — Adds a task to the queue. Returns a `Promise<T>` that resolves when the task completes (or rejects if it fails after all retries).
- **`addBatch(tasks: (() => Promise<T>)[])`** — Adds multiple tasks. Returns `Promise<T[]>` that resolves with all results in order.

### Control Flow

- **`pause()`** — Pauses processing. Currently running tasks continue, but no new tasks start.
- **`resume()`** — Resumes processing paused tasks.
- **`clear()`** — Clears all pending (not yet started) tasks. Running tasks are not affected. Pending task promises should reject with an error.

### Status

- **`running`** — Getter returning the count of currently executing tasks.
- **`pending`** — Getter returning the count of queued (not yet started) tasks.

### Events

- **`onDrain(callback: () => void)`** — Registers a callback that fires when the queue is fully drained (no running and no pending tasks).

### Retry Support

```typescript
interface TaskOptions {
  retries?: number;      // Number of retry attempts (default: 0)
  retryDelay?: number;   // Delay between retries in ms (default: 0)
}
```

When a task fails, it should be retried up to `retries` times with `retryDelay` ms between attempts. If all retries are exhausted, the returned promise rejects with the last error.

## Hints

- Use an internal queue (array or linked list) to hold pending tasks.
- Track how many tasks are currently running to enforce concurrency.
- After each task completes, check if there are pending tasks to start.
- For `add()`, return a new Promise and store its resolve/reject callbacks alongside the task in the queue.
- For pause/resume, use a boolean flag that the "process next" logic checks.
- For retry, wrap the task execution in a loop with try/catch.

## Example

```typescript
const queue = new TaskQueue<string>(2); // max 2 concurrent

// These run 2 at a time
const results = await queue.addBatch([
  () => fetchAccountInfo("wallet1"),
  () => fetchAccountInfo("wallet2"),
  () => fetchAccountInfo("wallet3"),
  () => fetchAccountInfo("wallet4"),
]);

// With retry
const result = await queue.add(
  () => unreliableRpcCall(),
  { retries: 3, retryDelay: 1000 }
);
```

## Relevance to Solana

Solana RPC providers (Helius, QuickNode, Triton) enforce rate limits. A concurrent task queue is a foundational building block for:
- Batch-fetching account data
- Processing transaction histories
- Monitoring multiple wallets
- Sending transactions without hitting rate limits

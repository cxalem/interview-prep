# Challenge 4.1: useAsyncData Hook (Pure Logic)

| Difficulty | AI Assistance | Time Limit |
|------------|---------------|------------|
| Medium     | Minimal       | 45 min     |

## Overview

Implement the core logic of a data fetching hook (like `useQuery` but simplified). This tests your understanding of async state management — a key skill for building wallet UIs that need to fetch balances, transaction history, and token metadata.

## Requirements

### `AsyncDataManager<T>` class

Manages async data state with the shape:

```ts
{
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isStale: boolean;
}
```

### Core Methods

- **`fetch(fetcher: (signal: AbortSignal) => Promise<T>)`** — Execute an async fetcher function, managing state transitions (idle -> loading -> success/error). The fetcher receives an `AbortSignal` for cancellation support.
- **`refetch()`** — Re-run the last fetcher function.
- **`mutate(data: T)`** — Optimistically set data without fetching. Clears error state.
- **`invalidate()`** — Mark the current data as stale without clearing it.
- **`cancel()`** — Cancel the in-flight request using AbortController.
- **`subscribe(listener: (state) => void)`** — Register a listener that is notified on every state change. Returns an unsubscribe function.
- **`getState()`** — Returns the current state snapshot.

### Advanced Features

- **Stale-while-revalidate**: When data is stale and a new fetch starts, keep showing old data while loading new data. `isStale` remains `true` and `isLoading` becomes `true` simultaneously.
- **Deduplication**: If a fetch is already in flight, calling `fetch()` again with a new fetcher should not start a duplicate request — return the existing promise instead.
- **Auto-refetch**: Support a configurable `refetchInterval` (in ms). When set, automatically re-fetch data on that interval. Provide `startAutoRefetch(intervalMs)` and `stopAutoRefetch()`.
- **Cancellation**: Use the AbortController pattern. When `cancel()` is called, abort the in-flight request and set `isLoading` to false without changing data.

## Solana Context

This pattern is used in every Solana dApp for:
- Fetching wallet balances with auto-refresh
- Loading transaction history with stale-while-revalidate
- Token metadata fetching with deduplication (same token fetched by multiple components)

## Running Tests

```bash
npx vitest run challenges/04-react-patterns/01-use-async-data
```

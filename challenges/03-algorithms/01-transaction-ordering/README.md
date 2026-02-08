# Challenge 3.1: Transaction Ordering

## Difficulty: Medium

## AI Assistance: Partial

## Time Limit: 45 minutes

## Problem

Given a list of transactions with dependencies (tx B depends on tx A), determine a valid execution order. This is **topological sort** — core to understanding how Solana's runtime schedules transactions.

Solana's Sealevel runtime can execute transactions in parallel when they don't touch the same accounts. Understanding how to determine valid orderings and detect parallelism opportunities is fundamental to building efficient Solana programs and clients.

## Requirements

### `orderTransactions(transactions: Transaction[]): string[]`

- Returns an array of transaction IDs in a valid execution order
- A transaction can only execute after all of its dependencies have executed
- When multiple valid orderings exist, prefer higher fee transactions first (greedy)
- Throws an error if a cycle is detected in the dependency graph

### `detectCycles(transactions: Transaction[]): string[][]`

- Returns an array of cycle paths (each cycle is an array of transaction IDs)
- Returns an empty array if no cycles exist
- Each cycle path should start and end with the same transaction ID

### `getParallelBatches(transactions: Transaction[]): string[][]`

- Groups transactions into batches that can execute in parallel
- Each batch contains transactions whose dependencies are all satisfied by previous batches
- Within each batch, transactions are sorted by fee (highest first)
- Throws an error if cycles are detected

## Type Definitions

```typescript
interface Transaction {
  id: string;
  dependsOn: string[];
  fee: number;
}
```

## Examples

```typescript
const transactions = [
  { id: "A", dependsOn: [], fee: 100 },
  { id: "B", dependsOn: ["A"], fee: 200 },
  { id: "C", dependsOn: ["A"], fee: 300 },
  { id: "D", dependsOn: ["B", "C"], fee: 150 },
];

orderTransactions(transactions);
// => ["A", "C", "B", "D"]
// A first (no deps), then C before B (higher fee), then D

getParallelBatches(transactions);
// => [["A"], ["C", "B"], ["D"]]
// Batch 1: A (no deps)
// Batch 2: B and C can run in parallel (both only depend on A)
// Batch 3: D (depends on B and C)
```

## Hints

- This is a classic topological sort problem — consider Kahn's algorithm (BFS-based)
- For fee-based priority, use a max-heap or sort candidates by fee at each step
- Cycle detection can use DFS with coloring (white/gray/black)
- Parallel batches correspond to "levels" in the topological ordering

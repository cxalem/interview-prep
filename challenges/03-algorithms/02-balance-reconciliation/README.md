# Challenge 3.2: Balance Reconciliation

## Difficulty: Medium

## AI Assistance: Partial

## Time Limit: 45 minutes

## Problem

Given a stream of balance changes (credits/debits) and periodic snapshots, reconcile discrepancies. This is a real wallet problem — Phantom and other wallets need to reconcile on-chain state with cached state to ensure users see accurate balances.

When a wallet caches balances locally and also listens to on-chain events, mismatches can occur due to missed transactions, delayed updates, or RPC inconsistencies. Your job is to build the reconciliation logic.

## Requirements

### `reconcile(snapshots: Snapshot[], transactions: BalanceTransaction[]): Discrepancy[]`

- Compares expected balances (computed from transactions) with actual balances (from snapshots)
- Returns an array of discrepancies, each describing the token, expected balance, actual balance, and the snapshot timestamp
- Transactions are applied in timestamp order up to each snapshot timestamp
- Must handle multiple tokens independently

### `findMissingTransactions(snapshots: Snapshot[], knownTransactions: BalanceTransaction[]): InferredTransaction[]`

- Compares consecutive snapshots and known transactions to infer missing transactions
- If the balance change between two snapshots cannot be explained by known transactions, infer a missing transaction
- Returns an array of inferred missing transactions with estimated amounts and time ranges

### `buildBalanceTimeline(transactions: BalanceTransaction[], startingBalance: Record<string, number>): TimelineEntry[]`

- Creates a time-series of balance states from a list of transactions
- Each entry includes the timestamp, the transaction that caused the change, and the resulting balances for all tokens
- Entries are sorted by timestamp ascending

## Type Definitions

```typescript
interface BalanceTransaction {
  id: string;
  timestamp: number;
  amount: number;
  type: "credit" | "debit";
  token: string;
}

interface Snapshot {
  timestamp: number;
  balances: Record<string, number>;
}

interface Discrepancy {
  token: string;
  expected: number;
  actual: number;
  timestamp: number;
}

interface InferredTransaction {
  token: string;
  amount: number;
  type: "credit" | "debit";
  timestampRange: [number, number]; // between these two snapshot times
}

interface TimelineEntry {
  timestamp: number;
  transactionId: string;
  balances: Record<string, number>;
}
```

## Examples

```typescript
const snapshots: Snapshot[] = [
  { timestamp: 1000, balances: { SOL: 10 } },
  { timestamp: 2000, balances: { SOL: 7 } },
];

const transactions: BalanceTransaction[] = [
  { id: "tx1", timestamp: 500, amount: 10, type: "credit", token: "SOL" },
  { id: "tx2", timestamp: 1500, amount: 5, type: "debit", token: "SOL" },
];

reconcile(snapshots, transactions);
// At timestamp 1000: expected SOL = 10 (from tx1), actual = 10. OK.
// At timestamp 2000: expected SOL = 5 (10 - 5), actual = 7. Discrepancy!
// => [{ token: "SOL", expected: 5, actual: 7, timestamp: 2000 }]
```

## Hints

- Sort transactions by timestamp before processing
- Process each token independently to simplify logic
- For `findMissingTransactions`, compute the delta between snapshots and compare with known transaction sums
- Consider edge cases: what if a snapshot has a token not seen in any transaction?

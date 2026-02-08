# Challenge 6.5: Activity Feed

## Difficulty: Hard
## AI Assistance: None recommended
## Time: 60 minutes

---

## Overview

Build the data layer for a real-time activity feed showing transaction history. This challenge tests your ability to manage a real-time data feed with deduplication, grouping, summarization, and optimistic state updates.

**Important:** This is a design engineering challenge. We test the **state logic**, not the rendering.

---

## Requirements

### `ActivityFeedManager`

#### Activity Types

- `transfer` — Token transfer
- `swap` — Token swap
- `nftSale` — NFT sale
- `nftListing` — NFT listing
- `staking` — Staking operation
- `programInteraction` — Generic program interaction

#### Activity Shape

```typescript
{
  id: string;
  type: ActivityType;
  timestamp: number;
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  details: Record<string, unknown>;
  token?: string;
  amount?: number;
  counterparty?: string;
  read: boolean;
}
```

#### Methods

- **`loadHistory(before?, limit?)`** — Paginated fetch of historical activities using a provided fetcher. `before` is a cursor (timestamp or ID) for pagination.
- **`addRealTimeUpdate(activity)`** — Prepend a new activity to the feed (simulating a WebSocket event). Must handle deduplication.
- **`getActivities(filters?)`** — Returns activities, optionally filtered by type, token, status, or date range.
- **`groupByDate(activities)`** — Groups activities into buckets: "Today", "Yesterday", "This Week", "This Month", "Older".
- **`getActivitySummary(timeRange)`** — Returns per-token summary: `{ totalIn, totalOut, netChange, txCount }`.
  - `timeRange` is `{ start: number; end: number }` (timestamps).
  - Positive amounts = incoming, negative amounts = outgoing (or use the `counterparty` and transfer direction to determine).
- **`markAsRead(id)`** — Mark an activity as read.
- **`getUnreadCount()`** — Returns count of unread activities.
- **`updateStatus(id, status)`** — Update an activity's status (for optimistic updates: pending -> confirmed/failed).
- **`getActivityBySignature(sig)`** — Look up an activity by its transaction signature.
- **`subscribe(listener)`** — Register a callback for feed changes. Returns an unsubscribe function.

#### Behaviors

- **Deduplication:** When a real-time update arrives with a signature that already exists in the feed, update the existing entry rather than creating a duplicate.
- **Ordering:** Activities are displayed newest-first (descending by timestamp).
- **Optimistic updates:** New activities can start as "pending" and later be updated to "confirmed" or "failed".

---

## Examples

```typescript
const fetcher = async (before, limit) => ({ activities: [...], hasMore: true });
const feed = new ActivityFeedManager(fetcher);

await feed.loadHistory(undefined, 20);

feed.addRealTimeUpdate({
  id: 'tx-1',
  type: 'swap',
  timestamp: Date.now(),
  signature: '5xyz...',
  status: 'pending',
  details: { from: 'SOL', to: 'USDC' },
  token: 'SOL',
  amount: -1.5,
});

feed.updateStatus('tx-1', 'confirmed');

const grouped = feed.groupByDate(feed.getActivities());
// { "Today": [...], "Yesterday": [...], ... }
```

---

## Evaluation Criteria

- Correct deduplication logic for real-time + historical data
- Proper date grouping relative to "now"
- Accurate per-token summary calculations
- Read/unread tracking
- Optimistic status updates that merge correctly
- Clean subscriber notification pattern

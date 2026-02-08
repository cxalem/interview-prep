# Challenge 3.5: Optimistic Updates

## Difficulty: Hard

## AI Assistance: Minimal

## Time Limit: 60 minutes

## Problem

Implement an optimistic update system with rollback capabilities. This is a core UX pattern for Solana wallets and dApps — when a user initiates a transaction, the UI immediately reflects the expected outcome while waiting for on-chain confirmation.

If the transaction succeeds, the optimistic update is confirmed. If it fails, the update is rolled back and the state reverts. This pattern is critical for responsive UX in blockchain applications where confirmations can take several seconds.

## Requirements

### `OptimisticStore<T>`

A generic state store that supports optimistic mutations with confirm/rollback semantics.

Constructor: `new OptimisticStore<T>(initialState: T)`

Methods:

- `getState(): T` — returns current state with all pending optimistic updates applied
- `getConfirmedState(): T` — returns only the confirmed (committed) state
- `applyOptimistic(id: string, mutator: (state: T) => T): () => void`
  - Applies an optimistic mutation identified by `id`
  - The `mutator` function receives the current state and returns the new state
  - Returns a rollback function that removes this specific optimistic update
  - Throws if an update with the same `id` already exists
- `confirm(id: string): void`
  - Confirms an optimistic update, making it part of the confirmed state
  - The mutation is applied permanently to the confirmed state
  - Throws if `id` does not exist
- `rollback(id: string): void`
  - Rolls back a specific optimistic update
  - Subsequent optimistic updates are re-applied on top of the state without the rolled-back update
  - Throws if `id` does not exist
- `rollbackAll(): void`
  - Rolls back all pending optimistic updates
  - State reverts to the confirmed state
- `subscribe(listener: (state: T) => void): () => void`
  - Registers a listener that is called whenever state changes (optimistic or confirmed)
  - Returns an unsubscribe function
  - Listener receives the current state (with optimistic updates applied)

## Key Behaviors

1. **Immutability** — `getState()` and `getConfirmedState()` should return new objects. Never mutate state in place.
2. **Ordering** — Optimistic updates are applied in the order they were added, on top of the confirmed state.
3. **Out-of-order confirmations** — If updates A and B are pending (A applied first), confirming B should work correctly. B's mutation is applied to confirmed state, and A remains as a pending optimistic update.
4. **Conflicting updates** — Two optimistic updates may modify the same field. When one is rolled back, the other should still apply correctly based on its position in the queue.
5. **Subscriptions** — Listeners are notified on every state change (apply, confirm, rollback).

## Type Definitions

```typescript
class OptimisticStore<T> {
  constructor(initialState: T);
  getState(): T;
  getConfirmedState(): T;
  applyOptimistic(id: string, mutator: (state: T) => T): () => void;
  confirm(id: string): void;
  rollback(id: string): void;
  rollbackAll(): void;
  subscribe(listener: (state: T) => void): () => void;
}
```

## Examples

```typescript
interface WalletState {
  balance: number;
  nfts: string[];
}

const store = new OptimisticStore<WalletState>({
  balance: 100,
  nfts: ["nft-1"],
});

// User sends 20 SOL
const rollback = store.applyOptimistic("send-20", (state) => ({
  ...state,
  balance: state.balance - 20,
}));

store.getState();          // { balance: 80, nfts: ["nft-1"] }
store.getConfirmedState(); // { balance: 100, nfts: ["nft-1"] }

// Transaction confirmed on-chain
store.confirm("send-20");
store.getState();          // { balance: 80, nfts: ["nft-1"] }
store.getConfirmedState(); // { balance: 80, nfts: ["nft-1"] }

// Or if it failed:
// rollback();
// store.getState();       // { balance: 100, nfts: ["nft-1"] }
```

## Hints

- Store the confirmed state separately from optimistic mutations
- Keep an ordered list of pending `{ id, mutator }` entries
- To compute current state: start from confirmed state, apply all pending mutators in order
- For out-of-order confirmation: apply the mutator to the confirmed state, remove from pending list, and recompute
- Use `structuredClone()` or spread operators to ensure immutability
- For subscriptions, maintain a `Set` of listener functions

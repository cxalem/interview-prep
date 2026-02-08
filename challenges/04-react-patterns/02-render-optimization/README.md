# Challenge 4.2: Render Optimization (Selector Pattern)

| Difficulty | AI Assistance | Time Limit |
|------------|---------------|------------|
| Hard       | Minimal       | 60 min     |

## Overview

Implement a state store with selector-based subscriptions (like Zustand). This tests understanding of React rendering optimization — critical for performance in wallets showing hundreds of tokens where you need fine-grained reactivity.

## Requirements

### `createStore<T>(initialState: T)` function

Returns a store object with the following API:

### Core Methods

- **`getState(): T`** — Returns the current state snapshot.
- **`setState(partial: Partial<T> | (prev: T) => Partial<T>)`** — Update state via shallow merge. Accepts either a partial state object or an updater function.
- **`subscribe(listener: (state: T, prevState: T) => void): Unsubscribe`** — Listen to ALL state changes. Returns an unsubscribe function.
- **`subscribe(selector, listener, equalityFn?)`** — Listen only when the selected slice of state changes. The `selector` extracts a value from state, and the `listener` is only called when that selected value changes according to the `equalityFn`.
- **`destroy()`** — Cleanup all subscriptions.

### Selector Subscriptions

```ts
// Only fires when `balance` changes
store.subscribe(
  (state) => state.balance,
  (balance, prevBalance) => console.log(balance)
);
```

### Equality Functions

- **Default**: `Object.is` — strict reference equality
- **Custom**: Pass your own equality function
- **`shallowEqual(a, b)`** — Provided utility for shallow comparison of objects/arrays

### `shallowEqual(a, b)` utility

- Returns `true` if `a` and `b` have the same keys with the same values (using `Object.is` per key).
- Handles primitives, `null`, `undefined`.
- Does NOT do deep comparison — only one level deep.

### Batched Updates

Multiple `setState` calls within the same microtask should be batched: listeners are notified only once after all updates have been applied.

```ts
store.setState({ a: 1 });
store.setState({ b: 2 });
store.setState({ c: 3 });
// Listeners fire once with { a: 1, b: 2, c: 3 }
```

## Solana Context

This pattern is used in wallet apps to:
- Only re-render token list items when their specific token balance changes
- Avoid re-rendering the entire app when a single piece of state changes
- Efficiently manage hundreds of subscriptions for token/NFT displays

## Running Tests

```bash
npx vitest run challenges/04-react-patterns/02-render-optimization
```

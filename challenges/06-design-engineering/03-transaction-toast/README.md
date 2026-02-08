# Challenge 6.3: Transaction Toast System

## Difficulty: Medium
## AI Assistance: None recommended
## Time: 45 minutes

---

## Overview

Build a toast notification system optimized for blockchain transaction status updates. This challenge tests your ability to manage a queue-based notification system with auto-dismiss timers, in-place updates, and transaction lifecycle tracking.

**Important:** This is a design engineering challenge. We test the **state logic**, not the rendering.

---

## Requirements

### `ToastManager`

#### Toast Types

- `info` — General information
- `success` — Success notification
- `warning` — Warning notification
- `error` — Error notification
- `loading` — Loading/pending state (persistent by default)

#### Methods

- **`show(config)`** — Create and display a toast. Returns a unique toast ID.
  - Config: `{ type, title, description?, duration?, persistent?, action? }`
  - Default `duration` is 5000ms.
  - `loading` type toasts are `persistent` by default (no auto-dismiss).
- **`update(id, partial)`** — Update an existing toast in place. Useful for transitioning a loading toast to success/error.
- **`dismiss(id)`** — Remove a toast (with exit animation delay consideration).
- **`dismissAll()`** — Remove all toasts (visible and queued).
- **`getVisible()`** — Returns the list of currently visible toasts.
- **`getQueue()`** — Returns toasts waiting to be displayed.
- **`subscribe(listener)`** — Register a callback for any toast state changes. Returns an unsubscribe function.

#### Behaviors

- **Max visible toasts:** Configurable (default 3). When the max is reached, new toasts go into a queue.
- **Queue promotion:** When a visible toast is dismissed, the next queued toast becomes visible.
- **Auto-dismiss:** Non-persistent toasts auto-dismiss after their `duration`. Loading toasts do not auto-dismiss unless explicitly given a duration.
- **Updating type resets auto-dismiss:** If you update a loading toast to success, it should start a new auto-dismiss timer.

### `TransactionToast` Helper

A convenience wrapper for common transaction notification patterns.

- **`showTransaction(signature)`** — Shows a loading toast like "Transaction pending..." and returns an object with:
  - `confirm()` — Update toast to success ("Transaction confirmed")
  - `fail(error)` — Update toast to error with the error message
  - `expire()` — Update toast to warning ("Transaction expired")
  - `id` — The underlying toast ID

---

## Examples

```typescript
const manager = new ToastManager({ maxVisible: 3 });

const id = manager.show({ type: 'loading', title: 'Swapping tokens...' });
// Later...
manager.update(id, { type: 'success', title: 'Swap complete!', persistent: false });

// Or using the helper:
const txToast = new TransactionToast(manager);
const tx = txToast.showTransaction('5UfDuX...');
// Later...
tx.confirm();
```

---

## Evaluation Criteria

- Correct queue management with max visible limit
- Auto-dismiss timing with proper cleanup
- In-place toast updates that reset auto-dismiss behavior
- TransactionToast lifecycle helper correctness
- Clean subscriber notification pattern

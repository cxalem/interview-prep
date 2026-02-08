# Challenge 6.1: Token Swap UI State

## Difficulty: Hard
## AI Assistance: None recommended
## Time: 90 minutes

---

## Overview

Build the complete state management for a token swap interface, similar to Jupiter or Phantom swap. This challenge tests your ability to manage complex, interconnected UI state including debounced async operations, state machines, and derived calculations.

**Important:** This is a design engineering challenge. We test the **state logic**, not the rendering.

---

## Requirements

### `SwapManager` class

Construct with a `quoteFetcher` function and optional config.

#### State Shape

```typescript
{
  inputToken: Token | null;
  outputToken: Token | null;
  inputAmount: string;
  outputAmount: string;
  slippage: number;
  route: Route | null;
  priceImpact: number | null;
  isLoading: boolean;
  error: string | null;
  status: 'idle' | 'approving' | 'swapping' | 'confirming' | 'success' | 'failed';
}
```

#### Methods

- **`setInputToken(token)`** / **`setOutputToken(token)`** — Switching tokens should clear amounts and reset the quote.
- **`setInputAmount(amount)`** — Triggers a debounced quote fetch (300ms debounce).
- **`flipTokens()`** — Swap input/output tokens and their amounts.
- **`setSlippage(value)`** — Accepts values from 0.1% to 50%. Reject values outside this range.
- **`fetchQuote()`** — Async quote fetch using the injected `quoteFetcher` function.
- **`executeSwap()`** — Drives a state machine: `idle -> approving -> swapping -> confirming -> success | failed`.
- **`getMinimumReceived()`** — Returns `outputAmount * (1 - slippage / 100)`.
- **`subscribe(listener)`** — Register a callback for state changes. Returns an unsubscribe function.
- **`getState()`** — Returns current state snapshot.

#### Behaviors

- Debounce quote fetches with a 300ms delay.
- Cancel stale quote requests when new input arrives before the previous quote resolves.
- Validate: sufficient balance, valid amounts, route existence.
- Notify subscribers on every state change.

---

## Examples

```typescript
const manager = new SwapManager(mockQuoteFetcher);
manager.setInputToken({ symbol: 'SOL', mint: '...', decimals: 9, balance: 10 });
manager.setOutputToken({ symbol: 'USDC', mint: '...', decimals: 6, balance: 0 });
manager.setInputAmount('1.5');
// After debounce, fetches quote and updates outputAmount, route, priceImpact
```

---

## Evaluation Criteria

- Correct debounce behavior with cancellation of stale requests
- Proper state machine transitions during swap execution
- Accurate minimum received calculation accounting for slippage
- Input validation (slippage range, amounts, balances)
- Clean subscriber notification pattern

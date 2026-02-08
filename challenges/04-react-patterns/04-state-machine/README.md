# Challenge 4.4: State Machine (Transaction Lifecycle)

| Difficulty | AI Assistance | Time Limit |
|------------|---------------|------------|
| Hard       | Minimal       | 60 min     |

## Overview

Implement a finite state machine for transaction lifecycle management. This is exactly how wallet apps manage transaction state — from building the transaction, through signing and sending, to confirmation or failure.

## Requirements

### `StateMachine<TState, TEvent, TContext>` class

A generic, configurable finite state machine.

**Constructor**: `StateMachineConfig`

```ts
{
  initial: TState;
  context: TContext;
  states: {
    [state in TState]: {
      on?: {
        [event in TEvent]?: {
          target: TState;
          guard?: (context: TContext) => boolean;
          action?: (context: TContext) => TContext;
        } | TState;  // shorthand: just the target state
      };
      entry?: (context: TContext) => TContext;  // runs when entering this state
      exit?: (context: TContext) => TContext;    // runs when leaving this state
    };
  };
}
```

**Methods**:
- **`send(event: TEvent)`** — Process an event. If a valid transition exists from the current state for this event, transition to the target state. Run exit action of old state, transition action, then entry action of new state. If no valid transition exists, throw an error.
- **`getState()`** — Returns `{ value: TState, context: TContext }`.
- **`matches(state: TState)`** — Returns true if the machine is in the given state.
- **`canSend(event: TEvent)`** — Returns true if the event has a valid transition from the current state (including guard check).
- **`subscribe(listener: (state) => void)`** — Notify on transitions. Returns unsubscribe function.

**Guards**: A guard is a function that receives the context and returns a boolean. If a guard returns false, the transition is blocked (as if no transition exists for that event).

**Context**: Extended state data that persists across transitions. Actions can update it by returning a new context object.

**Entry/Exit Actions**: Functions that run when entering/leaving a state. They receive the current context and return an updated context.

### `createTransactionMachine()` factory function

Returns a pre-configured `StateMachine` for the Solana transaction lifecycle:

**States**: `idle`, `building`, `signing`, `sending`, `confirming`, `confirmed`, `failed`

**Events**: `BUILD`, `SIGN`, `SEND`, `CONFIRM`, `FAIL`, `RETRY`, `RESET`

**Transitions**:
```
idle       --BUILD-->   building
building   --SIGN-->    signing
signing    --SEND-->    sending
sending    --CONFIRM--> confirming
sending    --FAIL-->    failed
confirming --CONFIRM--> confirmed
confirming --FAIL-->    failed
failed     --RETRY-->   idle
confirmed  --RESET-->   idle
failed     --RESET-->   idle
```

**Context**:
```ts
{
  signature: string | null;
  error: string | null;
  retryCount: number;
}
```

**Guard**: RETRY should only be allowed if `retryCount < 3`.

**Actions**:
- FAIL action: set `error` in context
- RETRY action: increment `retryCount`
- RESET action: reset context to initial values
- SEND action: set `signature` in context (simulated)

## Solana Context

Every Solana wallet manages this exact lifecycle:
1. Build transaction (set recent blockhash, add instructions)
2. Sign with wallet adapter
3. Send to RPC node
4. Confirm via commitment level (processed/confirmed/finalized)
5. Handle failures with retry logic

## Running Tests

```bash
npx vitest run challenges/04-react-patterns/04-state-machine
```

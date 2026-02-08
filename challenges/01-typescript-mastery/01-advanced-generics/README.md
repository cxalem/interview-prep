# Challenge 1.1: Type-Safe Event System

**Difficulty:** Medium | **AI Assistance:** Allowed | **Time Target:** 45 min

## Problem

Build a fully type-safe event emitter where:
- Event names and their payload types are defined in a single interface
- `emit()` enforces the correct payload type for each event
- `on()` callback receives the correctly typed payload
- `off()` works with the exact same function reference
- Support a `once()` method
- Support a wildcard `"*"` listener that receives all events

This is a common interview question at companies like Phantom and Anza because
event systems are core to wallet browser extensions (content script ↔ background
communication).

## Requirements

```typescript
interface WalletEvents {
  connect: { publicKey: string };
  disconnect: void;
  accountChanged: { publicKey: string };
  transaction: { signature: string; status: "confirmed" | "failed" };
}
```

Your `TypedEventEmitter<T>` class must:
1. Enforce that only keys of `T` can be emitted/listened to
2. Payloads must match the type defined for each event key
3. `once()` auto-removes after first call
4. Wildcard listener receives `{ event: string; data: unknown }`
5. Return `this` from `on`/`off`/`once` for chaining

## Hints

<details>
<summary>Hint 1</summary>
Use `keyof T` to constrain event names. Use conditional types to handle the `void` payload case (no argument needed).
</details>

<details>
<summary>Hint 2</summary>
For the wildcard, use a union type or overloaded signatures. Consider `T[K] extends void ? () => void : (data: T[K]) => void` for callback signatures.
</details>

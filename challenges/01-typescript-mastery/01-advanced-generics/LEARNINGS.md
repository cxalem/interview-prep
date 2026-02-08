# Challenge 1.1: Learnings & Review

## Concepts Covered

### 1. Conditional Types

**What:** A type-level ternary that produces different types based on a condition.

```typescript
type EventCallback<Payload> = Payload extends void
  ? () => void
  : (data: Payload) => void;
```

**Why:** The `WalletEvents` interface has events with payloads (`connect`) and events without (`disconnect`). The callback signature needs to change depending on which event you're listening to. Conditional types let us express "if no payload, take no arguments; otherwise, take the payload as an argument."

**Where I had questions:** Initially unsure how to build this type. The key insight was that `extends` in a type position works like a condition check — "is Payload assignable to void?"

---

### 2. Indexed Access Types (`T[K]`)

**What:** Access the type of a specific property in an interface, using bracket notation — same syntax as JavaScript property access, but at the type level.

```typescript
type ConnectPayload = WalletEvents["connect"]; // { publicKey: string }
type DisconnectPayload = WalletEvents["disconnect"]; // void
```

**Why:** In methods like `on()`, we have `T` (the full events interface) and `K` (a specific event name). We need to get the payload type for that event to type the callback correctly. `T[K]` does exactly that.

**Where I had questions:** First tried `EventCallback<keyof K>` — but `K` is already a key (a string like `"connect"`), so `keyof K` doesn't make sense. The correct answer is `EventCallback<T[K]>` — index into the interface `T` with key `K`.

---

### 3. Generic Constraints (`K extends keyof T`)

**What:** Restricts a generic parameter to only accept certain types.

```typescript
on<K extends keyof T>(event: K, callback: EventCallback<T[K]>): this
```

**Why:** Without the constraint, `K` could be any type. With `K extends keyof T`, TypeScript only allows valid event names. If you try `emitter.on("invalidEvent", ...)`, it's a compile-time error.

---

### 4. Rest Parameter Tuples for `emit()`

**What:** Using a conditional type with rest parameters to control how many arguments a function accepts.

```typescript
emit<K extends keyof T>(
  event: K,
  ...args: T[K] extends void ? [] : [T[K]]
): void
```

**Why:** `emit("connect")` should require a payload argument, but `emit("disconnect")` should accept zero arguments. By making `...args` a conditional tuple type:
- `T[K] extends void` → `[]` → no extra arguments allowed
- Otherwise → `[T[K]]` → exactly one argument of the payload type

**Key detail:** `args` is an array (rest parameter), so when calling callbacks we need `callback(...args)` (spread), not `callback(args)` (would pass the array itself).

---

### 5. Return `this` for Method Chaining

**What:** Returning the instance from methods so calls can be chained.

```typescript
emitter
  .on("connect", handleConnect)
  .on("disconnect", handleDisconnect)
  .on("transaction", handleTransaction);
```

**Why:** Each method returns `this` (the emitter), so the next method call operates on the same object. The return type `this` (rather than `TypedEventEmitter<T>`) also works correctly with subclasses.

**Where I had questions:** Wasn't familiar with this pattern. It's common in jQuery, builders, and most event emitter libraries.

---

## The Event Emitter Pattern

**Where I had questions:** Needed to understand the core concept before diving into implementation.

### What it is
A pattern where **subscribers** register callbacks for specific events, and **emitters** fire those events later. The event emitter connects the two.

### The three operations
| Method | Role | What it does |
|--------|------|-------------|
| `on()` | Subscribe | **Stores** the callback in the listeners map |
| `emit()` | Notify | **Finds and calls** all callbacks for that event |
| `off()` | Unsubscribe | **Removes** a callback from the listeners map |

### Why multiple handlers per event?
Different parts of an app care about the same event. When a wallet connects:
- The header shows the address
- The portfolio fetches balances
- The activity feed starts polling

All three register separate handlers for `"connect"`.

### Why remove handlers (`off()`)?
- **Component unmounting** — React components must clean up listeners in `useEffect` return
- **Memory leaks** — the emitter holds references to handlers forever otherwise
- **Ghost updates** — handlers fire on UI that no longer exists
- **Wallet disconnect** — stop listening for account changes when disconnected

### Why wildcard listeners (`onAny()`)?
- **Debugging** — log every event flowing through the system
- **Analytics** — track all user actions without subscribing individually
- **Middleware** — intercept events to add timestamps, validation, etc.

---

## Data Structure Decisions

### Map vs Object for listeners
Chose `Map<keyof T, Array<Function>>` because:
- Map keys can be any type (`keyof T` could be `string | number | symbol`)
- Cleaner API (`.get()`, `.set()`, `.has()`, `.delete()`)
- No prototype pollution (event named `"toString"` won't collide)

### Array for wildcard listeners
Simple list, no key-value mapping needed — wildcards aren't tied to specific events.

### Set for once tracking
Need fast membership checks: "is this handler a once-handler?" Set gives O(1) lookups.

**Where I had questions:** Initially tried `Set<keyof T>` (storing event names) — but that would make the entire event "once". Need to track individual function references, so `Set<Function>`.

### Why `Function` type for internal storage?
The public API (`on`, `off`, `emit`) already enforces correct types through `EventCallback<T[K]>`. Internal storage doesn't need to re-enforce — it just holds references. Using `Function` keeps it simple.

---

## Implementation Details

### The `on()` pattern: ensure-then-push

```typescript
if (!this.listeners.has(event)) {
  this.listeners.set(event, []);
}
this.listeners.get(event)!.push(callback as Function);
```

Ensure the array exists first, then always push. One flow, no branching.

**Where I had questions:** First tried `try/catch` around `.get()` — but `.get()` returns `undefined` for missing keys, it doesn't throw. Then tried an if/else that returned early when the array existed (forgetting to actually add the callback).

### The `off()` pattern: find-and-splice

```typescript
const callbacks = this.listeners.get(event);
if (!callbacks) return this;
const index = callbacks.indexOf(callback as Function);
if (index !== -1) {
  callbacks.splice(index, 1);
}
```

**Where I had questions:**
- `.slice()` vs `.splice()` — slice returns a copy, splice modifies in place. Need splice here.
- `.indexOf()` returns `-1` when not found, not `undefined`. Check `!== -1`.
- Store `.get(event)` in a variable instead of calling it multiple times.

### The `emit()` gotcha: iterating while modifying

```typescript
for (const callback of [...callbacks]) { // iterate copy
  callback(...args);
  if (this.onceSet.has(callback)) {
    callbacks.splice(index, 1); // modify original
  }
}
```

Splicing from an array while iterating it skips elements. Solution: iterate over a **copy** (`[...callbacks]`), modify the **original**.

### The `emit()` wildcard gotcha: early return

Wildcard listeners must fire even when no event-specific listeners exist. Don't `return` early before the wildcard loop — use `if (callbacks) { ... }` instead.

---

## Solana / Interview Relevance

- Phantom's `window.solana.on("connect", handler)` uses this exact pattern
- wallet-standard events work the same way
- Content script ↔ background script communication in browser extensions is event-driven
- Knowing **why** the API exists (not just how) shows real-world experience
- Trade-off discussions (Map vs Object, type safety boundary) score interview points

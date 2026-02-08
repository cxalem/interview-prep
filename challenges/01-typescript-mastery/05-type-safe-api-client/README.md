# Challenge 1.5: Type-Safe RPC API Client

**Difficulty:** Hard | **AI Assistance:** Allowed | **Time Target:** 60 min

## Problem

Build a **type-safe JSON-RPC client** where method names, parameter types, and return types
are all inferred from a single schema definition. The client should make it impossible to
call a non-existent RPC method or pass incorrect parameters.

This directly models how Solana JSON-RPC clients work (`@solana/web3.js`'s `Connection` class,
Helius SDK, etc.) and is a strong interview signal for senior TypeScript developers.

## Requirements

### RPC Schema Definition

Define a schema interface that maps RPC method names to their parameter and return types.
Model a simplified Solana JSON-RPC with these methods:

| Method                | Params                                    | Return Type                                    |
|-----------------------|-------------------------------------------|------------------------------------------------|
| `getBalance`          | `{ address: string }`                     | `{ value: number }`                            |
| `getAccountInfo`      | `{ address: string; encoding?: string }`  | `{ value: AccountInfo \| null }`               |
| `getLatestBlockhash`  | `{}`  (no params)                         | `{ blockhash: string; lastValidBlockHeight: number }` |
| `sendTransaction`     | `{ transaction: string; encoding?: string }` | `{ signature: string }`                     |
| `getTransaction`      | `{ signature: string }`                   | `{ transaction: TransactionDetail \| null }`   |

### The Client Must:

1. **Only allow calling methods defined in the schema** — calling `client.call("fakeMethod", ...)` should be a type error.
2. **Enforce correct parameter types** — `client.call("getBalance", { wrong: 123 })` should be a type error.
3. **Return correctly typed responses** — `client.call("getBalance", { address: "..." })` should return `Promise<{ value: number }>`.
4. **Support middleware/interceptors** — allow registering functions that run before or after each RPC call (e.g., for logging, retries, auth headers).
5. **Use a generic `call` method** — `client.call<MethodName>(method, params): Promise<ReturnType>`.

### Middleware Interface

```typescript
interface RpcMiddleware {
  beforeRequest?(method: string, params: unknown): void;
  afterResponse?(method: string, response: unknown): void;
}
```

### Architecture

```
Schema (type) --> RpcClient<Schema> --> .call("methodName", params) --> Promise<Response>
                       |
                  middlewares[]
                       |
                  fetch (injected)
```

## Hints

<details>
<summary>Hint 1: Schema Shape</summary>

```typescript
interface RpcSchema {
  [methodName: string]: {
    params: Record<string, unknown>;
    response: unknown;
  };
}
```

Then your client is `RpcClient<S extends RpcSchema>` and the `call` method uses `keyof S` to constrain method names.
</details>

<details>
<summary>Hint 2: Call Signature</summary>

```typescript
call<M extends keyof S & string>(
  method: M,
  params: S[M]["params"]
): Promise<S[M]["response"]>
```
</details>

<details>
<summary>Hint 3: Testing with Mocked Fetch</summary>
Inject `fetch` as a constructor parameter so tests can provide a mock implementation using `vi.fn()`.
</details>

## Validation

Run `npx vitest run` in this directory. All tests should pass.

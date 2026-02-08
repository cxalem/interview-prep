# Challenge 6.2: Wallet Connect Flow

## Difficulty: Medium
## AI Assistance: None recommended
## Time: 60 minutes

---

## Overview

Build the state machine for a multi-step wallet connection flow, similar to Phantom's connect modal. This challenge tests your ability to implement a clean state machine with timeouts, persistence, and error recovery.

**Important:** This is a design engineering challenge. We test the **state logic**, not the rendering.

---

## Requirements

### `WalletConnectionManager`

#### States

- `idle` — No wallet connected, not in any flow
- `selecting` — User is choosing a wallet from the list
- `connecting` — Attempting to connect to the chosen wallet
- `approving` — Waiting for user to approve the connection in the external wallet
- `connected` — Wallet is connected and ready
- `disconnecting` — Disconnecting from the current wallet
- `error` — Something went wrong

#### Methods

- **`listWallets()`** — Returns available wallets (injected via config at construction).
- **`connect(walletId)`** — Start the connection flow. Transitions: `idle/selecting -> connecting -> approving -> connected`.
- **`approve()`** — Signal that the user approved in the external wallet.
- **`reject()`** — Signal that the user rejected in the external wallet. Transitions to `error`.
- **`disconnect()`** — Disconnect the current wallet. Transitions: `connected -> disconnecting -> idle`.
- **`switchWallet(walletId)`** — Disconnect current wallet, then connect to a new one.
- **`tryAutoConnect()`** — Check the storage for a previously connected wallet and attempt reconnection.
- **`onStateChange(listener)`** — Register a callback for state changes. Returns an unsubscribe function.
- **`getState()`** — Returns current connection state.
- **`getAccount()`** — Returns `{ publicKey, label? }` when connected, or `null` otherwise.

#### Timeout

- If `connecting` or `approving` takes longer than a configurable timeout (default 30s), automatically transition to `error` state.

### `WalletStorageManager`

- **`save(walletId)`** — Persist the wallet ID.
- **`load()`** — Retrieve the last connected wallet ID, or `null`.
- **`clear()`** — Remove the persisted wallet ID.
- Uses an injected storage interface (`{ getItem, setItem, removeItem }`) rather than actual `localStorage`.

---

## Examples

```typescript
const wallets = [
  { id: 'phantom', name: 'Phantom', icon: '...' },
  { id: 'solflare', name: 'Solflare', icon: '...' },
];
const storage = new WalletStorageManager(mockStorage);
const manager = new WalletConnectionManager(wallets, mockConnector, storage);

await manager.connect('phantom');
// State transitions: idle -> connecting -> approving
manager.approve();
// State: connected
manager.getAccount(); // { publicKey: '...', label: 'Phantom' }
```

---

## Evaluation Criteria

- Clean state machine with valid transitions only
- Proper timeout handling that cleans up correctly
- Auto-reconnect from persisted storage
- Correct wallet switching (disconnect then connect)
- Error state handling and recovery

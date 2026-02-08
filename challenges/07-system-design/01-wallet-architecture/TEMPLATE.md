# Wallet Architecture — Your Design

## High-Level Architecture

(Draw the component diagram here)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Key Components

### Key Management Service

- **Storage approach:**

- **Encryption scheme:**

- **Derivation path strategy:**

- **Seed phrase generation:**

- **Key deletion / secure memory:**

### Message Bus

- **Content Script -> Background:**

- **Background -> Popup:**

- **dApp -> Wallet:**

- **Message format / protocol:**

- **Error propagation:**

### Transaction Pipeline

- **Simulation:**

- **Signing:**

- **Broadcasting:**

- **Confirmation tracking:**

- **Error handling / retry:**

### State Management

- **Persistence layer:**

- **Cross-tab sync:**

- **Cache strategy:**

- **Popup lifecycle (destroyed on close):**

- **What state lives where:**

| State | Location | Reason |
|-------|----------|--------|
| Private keys | | |
| Account balances | | |
| Transaction history | | |
| User preferences | | |
| Connected dApps | | |
| Pending requests | | |

### Security Model

- **Key isolation:**

- **CSP policy:**

- **Auto-lock:**

- **Input validation:**

- **Build pipeline security:**

### Multi-Chain Abstraction

- **Chain adapter interface:**

```typescript
// Sketch your chain adapter interface here
interface ChainAdapter {
  //
}
```

- **Adding a new chain (steps):**

1.
2.
3.
4.

- **Shared vs chain-specific UI:**

## Approval Flow (Sequence)

Describe the full sequence when a dApp requests a transaction signature:

```
dApp -> Content Script -> ... -> User sees popup -> ... -> dApp receives signature
```

1.
2.
3.
4.
5.
6.
7.

## Trade-offs & Decisions

| Decision | Option A | Option B | Your Choice | Why? |
|----------|----------|----------|-------------|------|
| Key storage | IndexedDB | chrome.storage | | |
| State management | Redux | Zustand | | |
| Message passing | chrome.runtime | MessageChannel | | |
| Encryption lib | Web Crypto API | tweetnacl | | |
| Manifest version | MV2 | MV3 | | |
| Serialization | JSON | Protobuf | | |

## Failure Scenarios

How does your system handle each of these?

- **Background service worker terminated (MV3):**

- **User closes popup mid-signing:**

- **Malicious dApp sends crafted transaction:**

- **RPC node is down:**

- **Extension update while user has pending approval:**

## Performance Considerations

- **Popup startup time target:**

- **Memory budget:**

- **Bundle size strategy:**

## Open Questions / Things You'd Investigate

-
-
-

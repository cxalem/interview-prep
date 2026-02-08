# System Design: Browser Extension Wallet Architecture

**Difficulty:** Hard | **Time:** 60 min | **Format:** Whiteboard

Design the architecture for a Solana browser extension wallet (like Phantom).

## Requirements

- Secure key management (seed phrase, derivation, encryption at rest)
- Multi-chain support (Solana, Ethereum, Bitcoin)
- Content script <-> background script <-> popup communication
- dApp connection and approval flow (wallet-standard)
- Transaction simulation before signing
- State persistence and syncing across tabs
- Auto-lock after inactivity

## Discussion Points

1. How do you isolate private keys from dApp-accessible code?
2. How does the message passing work between content script, background service worker, and popup?
3. How do you handle the approval flow when a dApp requests a transaction signature?
4. How would you implement transaction simulation?
5. How do you manage state across popup opens/closes (popup is destroyed each time)?
6. How would you add a new chain with minimal code changes?
7. What are the security considerations for the build/publish pipeline?

## Evaluation Criteria

- Security-first thinking (key isolation, encryption, CSP)
- Clean separation of concerns
- Extensibility for multi-chain
- Understanding of browser extension APIs (MV3)
- Performance considerations (startup time, memory)

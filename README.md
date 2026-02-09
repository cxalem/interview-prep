# Solana Senior Interview Prep

A structured, progressive challenge set to prepare for senior SWE and Design Engineer
roles in the Solana ecosystem.

## How to Use

```bash
# Install dependencies
npm install

# Run all tests (they'll all fail initially — that's the point)
npm test

# Run a specific challenge
npx vitest run challenges/01-typescript-mastery/01-advanced-generics

# Watch mode for a challenge you're working on
npx vitest challenges/01-typescript-mastery/01-advanced-generics

# Type-check everything
npm run typecheck
```

### Workflow per Challenge

1. Read the `README.md` — understand the problem, requirements, and constraints
2. Look at the test file (`index.test.ts`) — tests define the contract
3. Implement your solution in `index.ts` — replace the TODOs and "Not implemented" stubs
4. Run the tests — iterate until all pass
5. Run typecheck — make sure no type errors

---

## Challenge Map

### Phase 1: TypeScript Mastery — *AI Assistance OK*
> Build your TypeScript muscle. These challenges focus on the type system and
> patterns that senior engineers use daily.

| #   | Challenge              | Key Concept                        | Time  | Difficulty |
| --- | ---------------------- | ---------------------------------- | ----- | ---------- |
| 1.1 | Advanced Generics      | Type-safe event emitter            | 45min | Medium     |
| 1.2 | Type Gymnastics        | Implement utility types from scratch | 60min | Hard       |
| 1.3 | Builder Pattern        | Compile-time state tracking        | 60min | Hard       |
| 1.4 | Branded Types          | Nominal typing for Solana types    | 30min | Medium     |
| 1.5 | Type-Safe API Client   | Inferred RPC client types          | 60min | Hard       |

### Phase 2: Data Structures — *Reduce AI Assistance*
> Implement core data structures from scratch. These appear directly in interviews
> and are the building blocks of wallet infrastructure.

| #   | Challenge              | Key Concept                        | Time  | Difficulty |
| --- | ---------------------- | ---------------------------------- | ----- | ---------- |
| 2.1 | LRU Cache              | O(1) cache with TTL               | 45min | Medium     |
| 2.2 | Merkle Tree            | Proofs & verification (cNFTs)     | 60min | Hard       |
| 2.3 | Priority Queue         | Min-heap for tx fee ordering       | 40min | Medium     |
| 2.4 | Trie Autocomplete      | Token search with frequency        | 45min | Medium     |
| 2.5 | Concurrent Task Queue  | Rate-limited async with retry      | 60min | Hard       |

### Phase 3: Algorithms — *Minimal AI Assistance*
> Algorithm challenges themed around real Solana/wallet problems.

| #   | Challenge              | Key Concept                        | Time  | Difficulty |
| --- | ---------------------- | ---------------------------------- | ----- | ---------- |
| 3.1 | Transaction Ordering   | Topological sort with priorities   | 45min | Medium     |
| 3.2 | Balance Reconciliation | Stream processing & inference      | 45min | Medium     |
| 3.3 | Token Swap Router      | Graph algorithms (shortest path)   | 60min | Hard       |
| 3.4 | Rate Limiter           | Token bucket, sliding window       | 40min | Medium     |
| 3.5 | Optimistic Updates     | CRDT-like state with rollback      | 60min | Hard       |

### Phase 4: React Patterns — *Start Going Solo*
> These test the state logic behind React patterns — no DOM required.
> The patterns here are what separate senior React engineers from mid-level.

| #   | Challenge              | Key Concept                        | Time  | Difficulty |
| --- | ---------------------- | ---------------------------------- | ----- | ---------- |
| 4.1 | Async Data Manager     | SWR-like fetch with dedup          | 45min | Medium     |
| 4.2 | Selector Store         | Zustand-like with batched updates  | 60min | Hard       |
| 4.3 | Compound Components    | Disclosure + stack + focus trap    | 45min | Medium     |
| 4.4 | State Machine          | FSM for transaction lifecycle      | 60min | Hard       |
| 4.5 | Virtual List           | Windowing for large lists          | 60min | Hard       |

### Phase 5: Solana Core — *Going Solo*
> Deep Solana protocol knowledge. These challenges simulate what you'd build
> inside a wallet or on-chain client.

| #   | Challenge              | Key Concept                        | Time  | Difficulty |
| --- | ---------------------- | ---------------------------------- | ----- | ---------- |
| 5.1 | Transaction Builder    | Compile & validate transactions    | 60min | Hard       |
| 5.2 | Account Data Decoder   | Binary serialization (Borsh-like)  | 60min | Hard       |
| 5.3 | Token Operations       | SPL Token instruction encoding     | 45min | Medium     |
| 5.4 | PDA Derivation         | Program Derived Addresses          | 40min | Medium     |
| 5.5 | Versioned Transactions | V0 messages & address lookup tables| 60min | Hard       |

### Phase 6: Design Engineering — *Fully Solo*
> Build the state layer for real wallet UI components. These test your ability
> to manage complex, interconnected state with good UX.

| #   | Challenge              | Key Concept                        | Time  | Difficulty |
| --- | ---------------------- | ---------------------------------- | ----- | ---------- |
| 6.1 | Token Swap UI          | Complex form state + debounce      | 90min | Hard       |
| 6.2 | Wallet Connect Flow    | Multi-step state machine           | 60min | Medium     |
| 6.3 | Transaction Toast      | Queue management + lifecycle       | 45min | Medium     |
| 6.4 | NFT Gallery            | Pagination, filter, search, select | 60min | Hard       |
| 6.5 | Activity Feed          | Real-time + history + grouping     | 60min | Hard       |

### Phase 7: System Design — *Fully Solo, Whiteboard Style*
> No code — think architecture. Fill in the TEMPLATE.md for each challenge.
> Practice explaining your design out loud as if you're in an interview.

| #   | Challenge              | Key Concept                        | Time  | Difficulty |
| --- | ---------------------- | ---------------------------------- | ----- | ---------- |
| 7.1 | Wallet Architecture    | Browser extension, key management  | 60min | Hard       |
| 7.2 | Transaction Indexer    | Real-time ingestion at scale       | 60min | Hard       |
| 7.3 | RPC Load Balancer      | Routing, failover, circuit breaker | 45min | Medium     |
| 7.4 | Token Price Aggregator | Multi-source aggregation, anomaly  | 45min | Medium     |
| 7.5 | Notification System    | Event-driven at scale              | 60min | Hard       |

---

## Progress Tracker

Copy this to track your progress:

```
Phase 1: TypeScript    [ ] 1.1  [ ] 1.2  [ ] 1.3  [ ] 1.4  [ ] 1.5
Phase 2: Data Structs  [ ] 2.1  [ ] 2.2  [ ] 2.3  [ ] 2.4  [ ] 2.5
Phase 3: Algorithms    [ ] 3.1  [ ] 3.2  [ ] 3.3  [ ] 3.4  [ ] 3.5
Phase 4: React         [ ] 4.1  [ ] 4.2  [ ] 4.3  [ ] 4.4  [ ] 4.5
Phase 5: Solana        [ ] 5.1  [ ] 5.2  [ ] 5.3  [ ] 5.4  [ ] 5.5
Phase 6: Design Eng    [ ] 6.1  [ ] 6.2  [ ] 6.3  [ ] 6.4  [ ] 6.5
Phase 7: System Design [ ] 7.1  [ ] 7.2  [ ] 7.3  [ ] 7.4  [ ] 7.5
```

## Tips

- **Don't skip phases.** Each phase builds on the previous one.
- **Time yourself.** Interview pressure is real. Practice under constraints.
- **Read the tests first.** The tests ARE the spec. Understand what's expected before coding.
- **For system design:** Practice speaking your answer out loud. Record yourself. The ability to articulate trade-offs clearly is what separates senior from mid-level.
- **When stuck:** Re-read the hints in the README, think for 10 more minutes, THEN look at references. The struggle is where learning happens.
- **After completing all challenges:** Try doing 2-3 random ones again from memory with a strict timer. That's your interview simulation.

## What Senior Interviewers Look For

1. **Type safety** — Do you leverage TypeScript's type system, or fight it?
2. **Edge cases** — Do you handle errors, empty states, and boundary conditions?
3. **Performance awareness** — Do you know the Big-O of your approach? Can you optimize?
4. **Clean abstractions** — Is your code readable, maintainable, extensible?
5. **Trade-off articulation** — Can you explain WHY you chose approach A over B?
6. **Solana knowledge** — Do you understand accounts, PDAs, transactions, programs?
7. **UX thinking** — Do you consider loading states, optimistic updates, error recovery?

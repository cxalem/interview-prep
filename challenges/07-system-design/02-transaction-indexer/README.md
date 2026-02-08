# System Design: Real-Time Transaction Indexer

**Difficulty:** Hard | **Time:** 60 min | **Format:** Whiteboard

Design a system that indexes Solana transactions in real-time for a wallet's activity feed.

## Requirements

- Index transactions for millions of wallet addresses
- Sub-second latency for new transactions
- Historical backfill capability
- Filter by: token, program, transaction type, time range
- Support both REST API and WebSocket subscriptions
- Handle Solana's ~400 TPS (peaks to 4000+)
- 99.9% uptime SLA

## Discussion Points

1. How do you ingest transactions from Solana? (RPC polling vs Geyser plugin vs validator firehose)
2. What's your data model? How do you parse different transaction types?
3. How do you handle reorgs/slot skips?
4. What's your storage strategy? (Hot/warm/cold tiers)
5. How do you scale WebSocket subscriptions to millions of wallets?
6. How do you handle backfill without impacting real-time performance?
7. What's your caching strategy?

## Evaluation Criteria

- Understanding of Solana's data model (slots, blocks, transactions, instructions)
- Scalability thinking (horizontal scaling, sharding)
- Real-time vs batch processing trade-offs
- Data modeling for efficient queries
- Operational considerations (monitoring, failure recovery)

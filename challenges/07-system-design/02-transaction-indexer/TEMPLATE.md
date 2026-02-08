# Transaction Indexer — Your Design

## Architecture Diagram

(Draw the full system architecture here)

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
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Ingestion Pipeline

- **Source (how you get transactions from Solana):**

- **Ingestion method:**

- **Parsing strategy (how you decode different transaction types):**

- **Throughput target:**

- **Backpressure handling:**

### Ingestion Flow

```
Solana Validator -> ... -> ... -> ... -> Storage
```

1.
2.
3.
4.
5.

### Handling Reorgs / Slot Skips

- **Detection:**

- **Resolution:**

- **Impact on downstream consumers:**

## Data Model

### Transaction Table

| Column | Type | Index? | Notes |
|--------|------|--------|-------|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

### Instruction Table

| Column | Type | Index? | Notes |
|--------|------|--------|-------|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

### Account Activity Table (for wallet lookups)

| Column | Type | Index? | Notes |
|--------|------|--------|-------|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

### Token Transfer Table

| Column | Type | Index? | Notes |
|--------|------|--------|-------|
| | | | |
| | | | |
| | | | |
| | | | |

- **Primary database technology:**

- **Why this choice:**

## Query Layer

### REST API Endpoints

```
GET  /v1/...
GET  /v1/...
GET  /v1/...
POST /v1/...
```

- **Pagination strategy:**

- **Rate limiting:**

- **Response format:**

### Query Optimization

- **Common query patterns and how you optimize each:**

1.
2.
3.

## WebSocket Service

- **Subscription model:**

- **How clients subscribe:**

- **Fan-out strategy (millions of wallets):**

- **Connection management:**

- **Backpressure on slow consumers:**

- **Reconnection protocol:**

## Storage Strategy

### Tiered Storage

| Tier | Age of Data | Storage | Access Pattern | Latency |
|------|-------------|---------|----------------|---------|
| Hot | | | | |
| Warm | | | | |
| Cold | | | | |

### Caching

- **L1 cache (in-process):**

- **L2 cache (distributed):**

- **Cache invalidation strategy:**

- **Cache hit rate target:**

## Scaling Strategy

- **Horizontal scaling approach:**

- **Sharding key:**

- **How you scale ingestion:**

- **How you scale queries:**

- **How you scale WebSockets:**

### Capacity Estimates

| Metric | Value | Calculation |
|--------|-------|-------------|
| Transactions / day | | |
| Storage / month | | |
| Read QPS | | |
| WebSocket connections | | |

## Backfill Strategy

- **How backfill works without impacting real-time:**

- **Backfill throughput:**

- **Progress tracking:**

- **Resumability:**

## Failure Handling

| Failure | Detection | Recovery | Data Impact |
|---------|-----------|----------|-------------|
| Ingestion node crash | | | |
| Database failure | | | |
| Network partition | | | |
| Solana RPC unavailable | | | |
| Corrupted data | | | |

## Monitoring & Observability

- **Key metrics to track:**

1.
2.
3.
4.
5.

- **Alerting thresholds:**

## Trade-offs & Decisions

| Decision | Option A | Option B | Your Choice | Why? |
|----------|----------|----------|-------------|------|
| Ingestion | Geyser plugin | RPC polling | | |
| Primary DB | PostgreSQL | ScyllaDB | | |
| Message queue | Kafka | Redis Streams | | |
| WebSocket fan-out | Per-connection | Pub/sub | | |
| Sharding | By wallet | By time | | |
| Backfill | Separate pipeline | Same pipeline | | |

## Open Questions / Things You'd Investigate

-
-
-

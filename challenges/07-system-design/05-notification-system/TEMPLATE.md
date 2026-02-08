# Notification System — Your Design

## Architecture

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
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Event Detection

### On-Chain Event Sources

| Event Type | Detection Method | Source | Latency Target |
|-----------|-----------------|--------|----------------|
| Incoming SOL transfer | | | |
| SPL token transfer | | | |
| NFT received | | | |
| Governance proposal | | | |
| Staking rewards | | | |
| Account authority change | | | |

- **How you monitor the chain:**

- **Event parsing and classification:**

- **Deduplication of events:**

### Price Alert Evaluation

- **How you evaluate millions of price alerts efficiently:**

- **Data structure for alert matching:**

- **Batch evaluation strategy:**

```
Price Update -> ... -> Matching Alerts -> ... -> Notifications
```

### Security Event Detection

- **What constitutes a security alert:**

1.
2.
3.
4.

- **How security alerts bypass normal flow:**

## Routing Engine

### Channel Selection Logic

```
Event -> Classify -> Check Preferences -> Select Channels -> Deliver
```

- **How routing decisions are made:**

- **Priority override rules:**

| Priority | Types | Behavior |
|----------|-------|----------|
| Critical | Security alerts | |
| High | Incoming transfers | |
| Medium | NFT activity, governance | |
| Low | Price alerts, digests | |

### Delivery Channel Details

| Channel | Technology | Latency | Reliability | Notes |
|---------|-----------|---------|-------------|-------|
| Push (mobile) | | | | |
| Browser extension | | | | |
| Email digest | | | | |
| In-app feed | | | | |

## Preference Management

### User Preference Model

```typescript
// Sketch your preference schema
interface UserPreferences {
  //
}
```

### Preference Storage & Lookup

- **Storage:**

- **Caching strategy (millions of users):**

- **Update propagation:**

### Quiet Hours

- **How quiet hours work:**

- **Timezone handling:**

- **What bypasses quiet hours:**

### Threshold Amounts

- **How amount thresholds filter notifications:**

- **Per-token thresholds:**

## Delivery Pipeline

### Pipeline Stages

```
Event Detection -> ... -> ... -> ... -> ... -> Delivered
```

1.
2.
3.
4.
5.
6.

### Delivery Guarantees

- **Guarantee level (at-least-once / exactly-once):**

- **How you achieve this:**

- **Idempotency strategy:**

### Push Notification Delivery

- **Push provider (FCM, APNs, etc.):**

- **Token management:**

- **Payload format:**

- **Handling failed deliveries:**

### Browser Extension Delivery

- **How you reach the extension:**

- **Badge count management:**

- **What happens when extension is closed:**

### Email Digest

- **Digest frequency options:**

- **Digest generation (real-time aggregation vs batch job):**

- **Template system:**

## Batching Logic

### When to Batch

| Scenario | Batching Window | Example |
|----------|----------------|---------|
| Multiple small transfers | | "You received 10 transfers totaling 5 SOL" |
| Repeated NFT activity | | |
| Multiple governance votes | | |
| Price crossing threshold | | |

### Batching Algorithm

- **How you accumulate events for batching:**

- **When to flush the batch:**

- **How you compose the batched notification message:**

### What Should Never Be Batched

-
-

## Data Model

### Notifications Table

| Column | Type | Notes |
|--------|------|-------|
| | | |
| | | |
| | | |
| | | |
| | | |
| | | |
| | | |
| | | |

### Delivery Attempts Table

| Column | Type | Notes |
|--------|------|-------|
| | | |
| | | |
| | | |
| | | |
| | | |

### User Devices Table

| Column | Type | Notes |
|--------|------|-------|
| | | |
| | | |
| | | |
| | | |

### Price Alerts Table

| Column | Type | Notes |
|--------|------|-------|
| | | |
| | | |
| | | |
| | | |
| | | |
| | | |

- **Read state management:**

- **Notification history retention policy:**

## Scaling Strategy

### Per-Component Scaling

| Component | Scaling Approach | Bottleneck |
|-----------|-----------------|------------|
| Event detection | | |
| Preference lookup | | |
| Routing engine | | |
| Push delivery | | |
| WebSocket connections | | |
| Database | | |

### Capacity Estimates

| Metric | Estimate | Calculation |
|--------|----------|-------------|
| Events / second | | |
| Notifications / day | | |
| Push deliveries / second | | |
| Price alerts to evaluate | | |
| Storage / month | | |

### Partitioning / Sharding

- **Sharding key:**

- **How price alerts are partitioned:**

## Notification Fatigue Management

- **Daily/hourly caps per user:**

- **Importance scoring:**

- **Grouping similar notifications:**

- **Unsubscribe / mute flows:**

- **Smart notification frequency (learn from user behavior):**

## Failure Handling

| Failure | Detection | Recovery | User Impact |
|---------|-----------|----------|-------------|
| Event detection lag | | | |
| Push provider outage | | | |
| Database failure | | | |
| Preference cache miss | | | |
| Message queue backlog | | | |

### Dead Letter Queue

- **What goes to DLQ:**

- **DLQ processing:**

- **Alerting on DLQ growth:**

## Monitoring & Observability

### Key Metrics

| Metric | Type | Alert Threshold |
|--------|------|-----------------|
| Event-to-delivery latency | | |
| Push delivery success rate | | |
| Notification volume / sec | | |
| Preference cache hit rate | | |
| DLQ depth | | |
| WebSocket connection count | | |

### Delivery Tracking

- **How you track whether a notification was delivered:**

- **How you track whether it was seen/read:**

- **Analytics on notification engagement:**

## Trade-offs & Decisions

| Decision | Option A | Option B | Your Choice | Why? |
|----------|----------|----------|-------------|------|
| Message queue | Kafka | SQS/SNS | | |
| Push delivery | FCM only | Multi-provider | | |
| Preference storage | Redis | DynamoDB | | |
| Batching | Client-side | Server-side | | |
| Price alert eval | Push-based | Pull-based | | |
| Delivery guarantee | At-least-once | Exactly-once | | |
| Notification store | SQL | NoSQL | | |

## Open Questions / Things You'd Investigate

-
-
-

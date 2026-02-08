# Token Price Aggregator — Your Design

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
└─────────────────────────────────────────────────────────┘
```

## Price Sources

| Source | Type | Update Freq | Reliability | Cost | Notes |
|--------|------|-------------|-------------|------|-------|
| Jupiter | | | | | |
| Birdeye | | | | | |
| CoinGecko | | | | | |
| On-chain DEX pools | | | | | |

- **Fallback chain order:**

1.
2.
3.
4.

## Price Aggregation Algorithm

### How do you determine the "correct" price?

- **Aggregation method (median, weighted average, VWAP, etc.):**

- **Source weighting strategy:**

| Source | Weight | Why |
|--------|--------|-----|
| | | |
| | | |
| | | |
| | | |

- **Minimum sources required for confidence:**

- **Handling disagreement between sources:**

### Token Tiers

| Tier | Tokens | Update Freq | Sources | Staleness Threshold |
|------|--------|-------------|---------|---------------------|
| Top 100 | SOL, USDC, ... | 5s | | |
| Mid-cap | | 60s | | |
| Long-tail | | | | |
| New / unverified | | | | |

- **How tokens move between tiers:**

## Anomaly Detection

### Detection Methods

- **Statistical approach:**

- **Cross-source validation:**

- **Rate of change limits:**

### Configuration

| Check | Threshold | Action |
|-------|-----------|--------|
| Price deviation from median | | |
| Price change in N seconds | | |
| Single-source outlier | | |
| Volume anomaly | | |

### Handling Low-Liquidity Tokens

- **Definition of low-liquidity:**

- **Special pricing rules:**

- **Confidence score:**

### Price Manipulation Detection

- **Wash trading signals:**

- **Flash loan price distortion:**

- **Response when detected:**

## Caching Layers

```
Client -> ... -> ... -> ... -> Price Sources
```

| Layer | Technology | TTL | What's Cached | Hit Rate Target |
|-------|-----------|-----|---------------|-----------------|
| L1 | | | | |
| L2 | | | | |
| L3 | | | | |

- **Cache invalidation strategy:**

- **Cache warming:**

- **Stale-while-revalidate:**

## Data Model

### Current Price Table

| Column | Type | Notes |
|--------|------|-------|
| | | |
| | | |
| | | |
| | | |
| | | |
| | | |

### Price History / Candles

| Column | Type | Notes |
|--------|------|-------|
| | | |
| | | |
| | | |
| | | |
| | | |
| | | |
| | | |

- **Candle generation approach:**

- **Downsampling strategy for older data:**

### Currency Conversion

- **How you handle USD/EUR/other fiat:**

- **FX rate update frequency:**

- **Token-denominated prices (e.g., SOL-denominated):**

## API Design

### REST Endpoints

```
GET  /v1/prices/:token_mint          — single token price
GET  /v1/prices?mints=A,B,C          — batch token prices
GET  /v1/prices/:token_mint/history   — candle data
POST /v1/portfolio/value              — portfolio valuation
```

- **Response format:**

```json
{
  // sketch your response shape
}
```

### WebSocket Feed

- **Subscription model:**

- **Message format:**

- **Throttling / batching updates to clients:**

### Portfolio Valuation Endpoint

- **Input:**

- **Calculation approach:**

- **How you handle tokens with no price:**

- **Response time target:**

## Scaling Strategy

- **Horizontal scaling approach:**

- **Partitioning (by token, by source, etc.):**

- **Expected load:**

| Metric | Estimate |
|--------|----------|
| Price updates / second | |
| API requests / second | |
| WebSocket connections | |
| Storage / month | |

## Failure Handling

| Scenario | Detection | Response | User Impact |
|----------|-----------|----------|-------------|
| Single source down | | | |
| All sources down | | | |
| Stale prices | | | |
| Anomalous price spike | | | |
| Database failure | | | |

- **Last-known-good price policy:**

- **Maximum staleness before hiding price:**

## Trade-offs & Decisions

| Decision | Option A | Option B | Your Choice | Why? |
|----------|----------|----------|-------------|------|
| Aggregation | Median | Weighted avg | | |
| Primary storage | Redis | TimescaleDB | | |
| Candle generation | Real-time | Batch job | | |
| Client updates | WebSocket | SSE | | |
| Anomaly detection | Statistical | ML-based | | |
| FX rates | API service | Hardcoded | | |

## Open Questions / Things You'd Investigate

-
-
-

# RPC Load Balancer — Your Design

## Component Architecture

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
└─────────────────────────────────────────────────────────┘
```

## Provider Registry

### Provider Configuration

```typescript
// Sketch your provider config here
interface ProviderConfig {
  //
}
```

| Provider | Rate Limit | Cost Tier | Priority Methods | Notes |
|----------|------------|-----------|------------------|-------|
| Helius | | | | |
| QuickNode | | | | |
| Triton | | | | |
| Public RPC | | | | |

## Routing Algorithm

### Request Classification

| Priority | Methods | Routing Preference |
|----------|---------|-------------------|
| Critical | sendTransaction, ... | |
| High | getBalance, ... | |
| Medium | getAccountInfo, ... | |
| Low | getBlockHeight, ... | |

### Routing Logic

Describe your routing decision flow:

```
Incoming Request
  -> Step 1:
  -> Step 2:
  -> Step 3:
  -> Step 4:
  -> Selected Provider
```

### Scoring Function

How do you score/rank providers for a given request?

```
Score = f( ... )
```

- **Factors and weights:**

| Factor | Weight | How Measured |
|--------|--------|-------------|
| Latency | | |
| Error rate | | |
| Rate limit headroom | | |
| Cost | | |
| | | |

## Health Check System

- **Active health checks:**

  - Interval:
  - Method:
  - Timeout:
  - Healthy threshold:
  - Unhealthy threshold:

- **Passive health checks (from real traffic):**

- **Health state machine:**

```
Healthy -> ... -> ... -> Unhealthy
```

## Circuit Breaker Design

### States

| State | Description | Transitions |
|-------|-------------|-------------|
| Closed | | |
| Open | | |
| Half-Open | | |

### Configuration

- **Failure threshold to open:**

- **Open duration before half-open:**

- **Success threshold to close:**

- **What counts as a failure:**

### Per-Provider vs Global

- **How circuit breakers are scoped:**

## Rate Limit Management

- **How you track remaining quota per provider:**

- **What happens when approaching limits:**

- **Rate limit header parsing:**

- **Pre-emptive throttling vs reactive:**

## Deduplication Strategy

- **Request fingerprint calculation:**

```typescript
// How do you generate a dedup key?
function deduplicationKey(request: RpcRequest): string {
  //
}
```

- **Dedup window (ms):**

- **How concurrent callers share the response:**

- **Memory management for dedup cache:**

## Retry Strategy

- **Max retries:**

- **Backoff formula:**

- **Same provider vs different provider:**

- **Non-retryable errors:**

| Error Type | Retryable? | Strategy |
|-----------|------------|----------|
| Timeout | | |
| 429 Rate Limited | | |
| 5xx Server Error | | |
| 4xx Client Error | | |
| Network Error | | |
| Invalid Response | | |

## Failover Behavior

- **Primary -> fallback chain:**

- **How fast does failover happen:**

- **Failback strategy (returning to primary):**

## Metrics & Observability

### Key Metrics

| Metric | Type | Purpose |
|--------|------|---------|
| | counter | |
| | histogram | |
| | gauge | |
| | counter | |
| | gauge | |

### Dashboard Panels

What would you put on the operations dashboard?

1.
2.
3.
4.

### Alerting Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| | | |
| | | |
| | | |

## Configuration

How is the load balancer configured? (static config, dynamic, feature flags)

```yaml
# Sketch your config format
```

## Trade-offs & Decisions

| Decision | Option A | Option B | Your Choice | Why? |
|----------|----------|----------|-------------|------|
| Architecture | Client-side (in wallet) | Proxy server | | |
| Routing | Weighted random | Least connections | | |
| Dedup | In-memory map | LRU cache | | |
| Health check | Active probing | Passive only | | |
| Config | Static | Dynamic (remote) | | |
| Circuit breaker | Per-method | Per-provider | | |

## Edge Cases

How does your system handle these scenarios?

- **All providers are down:**

- **One provider returns stale data:**

- **Rate limit spike across all providers simultaneously:**

- **Provider returns success but with wrong data:**

- **Clock skew affecting rate limit windows:**

## Open Questions / Things You'd Investigate

-
-
-

# System Design: Intelligent RPC Load Balancer

**Difficulty:** Medium | **Time:** 45 min | **Format:** Whiteboard

Design an intelligent RPC request router for a wallet that uses multiple Solana RPC providers.

## Requirements

- Route requests across multiple RPC providers (Helius, QuickNode, Triton, public RPC)
- Health checking and automatic failover
- Rate limit management per provider
- Request prioritization (sendTransaction > getBalance > getAccountInfo)
- Cost optimization (prefer cheaper providers for non-critical requests)
- Latency-based routing
- Request deduplication (identical requests within Nms window)
- Circuit breaker pattern for failing providers
- Retry with exponential backoff
- Metrics and observability

## Discussion Points

1. How do you measure and track provider health?
2. How do you implement the circuit breaker?
3. How do you handle provider-specific rate limits?
4. How do you deduplicate concurrent identical requests?
5. What's your retry strategy? When do you retry on a different provider?
6. How do you weigh cost vs latency vs reliability in routing decisions?

## Evaluation Criteria

- Understanding of circuit breaker and load balancing patterns
- Practical knowledge of RPC provider behavior and rate limits
- Clean abstraction boundaries
- Graceful degradation under failure
- Observability and debuggability

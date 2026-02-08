# System Design: Token Price Aggregation Service

**Difficulty:** Medium | **Time:** 45 min | **Format:** Whiteboard

Design a service that aggregates token prices from multiple sources for display in a wallet.

## Requirements

- Support 10,000+ Solana tokens
- Price sources: Jupiter, Birdeye, CoinGecko, on-chain DEX pools
- Update frequency: top 100 tokens every 5s, rest every 60s
- Price history (1h, 24h, 7d, 30d candles)
- Anomaly detection (reject outlier prices)
- Fallback chain when primary source is unavailable
- USD, EUR, and token-denominated prices
- WebSocket feed for real-time price updates to clients
- Portfolio valuation endpoint (given list of holdings, return total value)

## Discussion Points

1. How do you determine the "correct" price from multiple sources?
2. How do you handle low-liquidity tokens with volatile prices?
3. How do you tier your update frequency?
4. What's your caching strategy? (CDN, Redis, in-memory)
5. How do you detect and handle price manipulation?
6. How do you calculate historical candles efficiently?
7. What happens when all price sources are down?

## Evaluation Criteria

- Practical understanding of price aggregation challenges
- Data pipeline design (ingestion, processing, serving)
- Caching and performance optimization
- Anomaly detection thinking
- Resilience and fallback strategies

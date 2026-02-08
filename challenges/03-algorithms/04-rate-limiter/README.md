# Challenge 3.4: Rate Limiter

## Difficulty: Medium

## AI Assistance: Minimal

## Time Limit: 40 minutes

## Problem

Implement multiple rate limiting strategies for managing RPC call rates. On Solana, RPC providers impose rate limits, and clients need to manage their request rates to avoid being throttled (HTTP 429 errors).

You will implement three different rate limiting algorithms, each with different trade-offs:

1. **Token Bucket** — smooth rate limiting with burst capacity
2. **Sliding Window** — precise request counting within a time window
3. **Adaptive** — dynamically adjusts rate based on server responses

## Requirements

### `TokenBucketLimiter`

A token bucket rate limiter. Tokens accumulate at a fixed rate. Each request consumes one token. If no tokens are available, the request is rejected or must wait.

Constructor: `{ maxTokens: number, refillRate: number, refillInterval: number }`
- `maxTokens` — maximum tokens the bucket can hold (burst capacity)
- `refillRate` — number of tokens added per refill
- `refillInterval` — milliseconds between refills

Methods:
- `tryAcquire(): boolean` — returns `true` if a token is available and consumes it, `false` otherwise
- `waitForToken(): Promise<void>` — returns a Promise that resolves when a token becomes available
- `getAvailableTokens(): number` — returns the current number of tokens

### `SlidingWindowLimiter`

A sliding window counter rate limiter. Tracks requests within a rolling time window.

Constructor: `{ maxRequests: number, windowMs: number }`
- `maxRequests` — maximum requests allowed per window
- `windowMs` — window duration in milliseconds

Methods:
- `tryAcquire(): boolean` — returns `true` if under the limit and records the request, `false` otherwise
- `getRemainingRequests(): number` — how many more requests can be made in the current window
- `getResetTime(): number` — milliseconds until the oldest request exits the window

### `AdaptiveRateLimiter`

A rate limiter that adapts its rate based on server response feedback. Backs off on failures (429 errors) and gradually speeds up on consecutive successes.

Constructor: `{ initialRate: number, minRate: number, maxRate: number }`
- `initialRate` — starting requests per second
- `minRate` — minimum requests per second (floor)
- `maxRate` — maximum requests per second (ceiling)

Methods:
- `tryAcquire(): boolean` — returns `true` if the current rate allows a request
- `recordSuccess(): void` — records a successful response; gradually increases rate
- `recordFailure(retryAfterMs?: number): void` — records a failure; halves the rate (or uses retryAfterMs hint)
- `getCurrentRate(): number` — returns current allowed requests per second

## Examples

```typescript
// Token Bucket
const bucket = new TokenBucketLimiter({ maxTokens: 10, refillRate: 1, refillInterval: 1000 });
bucket.tryAcquire(); // true — consumes a token
bucket.getAvailableTokens(); // 9

// Sliding Window
const slider = new SlidingWindowLimiter({ maxRequests: 5, windowMs: 1000 });
slider.tryAcquire(); // true
slider.getRemainingRequests(); // 4

// Adaptive
const adaptive = new AdaptiveRateLimiter({ initialRate: 10, minRate: 1, maxRate: 50 });
adaptive.tryAcquire(); // true
adaptive.recordSuccess();
adaptive.getCurrentRate(); // slightly above 10
adaptive.recordFailure();
adaptive.getCurrentRate(); // 5 (halved)
```

## Hints

- Use `Date.now()` for timestamps (mockable with `vi.useFakeTimers()`)
- Token bucket: calculate tokens to add based on elapsed time since last refill
- Sliding window: store timestamps of each request and filter out expired ones
- Adaptive: use exponential backoff on failure and linear increase on success
- `waitForToken()` should use `setTimeout` wrapped in a Promise

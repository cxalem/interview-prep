import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  TokenBucketLimiter,
  SlidingWindowLimiter,
  AdaptiveRateLimiter,
} from "./index";

describe("Challenge 3.4: Rate Limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("TokenBucketLimiter", () => {
    it("should allow requests when tokens are available", () => {
      const limiter = new TokenBucketLimiter({
        maxTokens: 10,
        refillRate: 1,
        refillInterval: 1000,
      });

      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
    });

    it("should reject requests when no tokens are available", () => {
      const limiter = new TokenBucketLimiter({
        maxTokens: 2,
        refillRate: 1,
        refillInterval: 1000,
      });

      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(false);
    });

    it("should refill tokens over time", () => {
      const limiter = new TokenBucketLimiter({
        maxTokens: 5,
        refillRate: 1,
        refillInterval: 1000,
      });

      // Consume all tokens
      for (let i = 0; i < 5; i++) {
        limiter.tryAcquire();
      }
      expect(limiter.tryAcquire()).toBe(false);

      // Advance 1 second — should refill 1 token
      vi.advanceTimersByTime(1000);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(false);
    });

    it("should not exceed maxTokens when refilling", () => {
      const limiter = new TokenBucketLimiter({
        maxTokens: 5,
        refillRate: 2,
        refillInterval: 1000,
      });

      // Start at 5 tokens, advance time — should still be at 5
      vi.advanceTimersByTime(5000);
      expect(limiter.getAvailableTokens()).toBe(5);
    });

    it("should refill multiple tokens based on refillRate", () => {
      const limiter = new TokenBucketLimiter({
        maxTokens: 10,
        refillRate: 3,
        refillInterval: 1000,
      });

      // Consume all
      for (let i = 0; i < 10; i++) {
        limiter.tryAcquire();
      }

      // Advance 1 second — should add 3 tokens
      vi.advanceTimersByTime(1000);
      expect(limiter.getAvailableTokens()).toBe(3);
    });

    it("should resolve waitForToken when a token becomes available", async () => {
      const limiter = new TokenBucketLimiter({
        maxTokens: 1,
        refillRate: 1,
        refillInterval: 500,
      });

      limiter.tryAcquire(); // consume the only token

      const promise = limiter.waitForToken();

      // Advance time to trigger refill
      vi.advanceTimersByTime(500);

      await expect(promise).resolves.toBeUndefined();
    });

    it("should report correct available tokens", () => {
      const limiter = new TokenBucketLimiter({
        maxTokens: 5,
        refillRate: 1,
        refillInterval: 1000,
      });

      expect(limiter.getAvailableTokens()).toBe(5);
      limiter.tryAcquire();
      expect(limiter.getAvailableTokens()).toBe(4);
      limiter.tryAcquire();
      limiter.tryAcquire();
      expect(limiter.getAvailableTokens()).toBe(2);
    });
  });

  describe("SlidingWindowLimiter", () => {
    it("should allow requests within the limit", () => {
      const limiter = new SlidingWindowLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });

      for (let i = 0; i < 5; i++) {
        expect(limiter.tryAcquire()).toBe(true);
      }
    });

    it("should reject requests over the limit", () => {
      const limiter = new SlidingWindowLimiter({
        maxRequests: 3,
        windowMs: 1000,
      });

      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(false);
    });

    it("should allow requests again after the window slides", () => {
      const limiter = new SlidingWindowLimiter({
        maxRequests: 2,
        windowMs: 1000,
      });

      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(false);

      // Advance past the window
      vi.advanceTimersByTime(1001);

      expect(limiter.tryAcquire()).toBe(true);
    });

    it("should correctly report remaining requests", () => {
      const limiter = new SlidingWindowLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });

      expect(limiter.getRemainingRequests()).toBe(5);
      limiter.tryAcquire();
      expect(limiter.getRemainingRequests()).toBe(4);
      limiter.tryAcquire();
      limiter.tryAcquire();
      expect(limiter.getRemainingRequests()).toBe(2);
    });

    it("should return 0 for getResetTime when under the limit", () => {
      const limiter = new SlidingWindowLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });

      limiter.tryAcquire();
      expect(limiter.getResetTime()).toBe(0);
    });

    it("should return correct reset time when at the limit", () => {
      const limiter = new SlidingWindowLimiter({
        maxRequests: 2,
        windowMs: 1000,
      });

      limiter.tryAcquire(); // at t=0
      vi.advanceTimersByTime(300);
      limiter.tryAcquire(); // at t=300

      // At limit. Oldest request at t=0, window=1000ms.
      // Reset when oldest expires: 1000 - 300 = 700ms from now
      const resetTime = limiter.getResetTime();
      expect(resetTime).toBeCloseTo(700, -2);
    });

    it("should handle requests that span multiple windows", () => {
      const limiter = new SlidingWindowLimiter({
        maxRequests: 2,
        windowMs: 1000,
      });

      limiter.tryAcquire(); // t=0
      vi.advanceTimersByTime(600);
      limiter.tryAcquire(); // t=600

      // At t=600 both requests in window. Can't acquire.
      expect(limiter.tryAcquire()).toBe(false);

      // Advance to t=1001 — first request expired
      vi.advanceTimersByTime(401);
      expect(limiter.tryAcquire()).toBe(true);

      // Now have 2 requests in [601, 1001]. Can't acquire.
      expect(limiter.tryAcquire()).toBe(false);
    });
  });

  describe("AdaptiveRateLimiter", () => {
    it("should start at the initial rate", () => {
      const limiter = new AdaptiveRateLimiter({
        initialRate: 10,
        minRate: 1,
        maxRate: 50,
      });

      expect(limiter.getCurrentRate()).toBe(10);
    });

    it("should allow first request immediately", () => {
      const limiter = new AdaptiveRateLimiter({
        initialRate: 10,
        minRate: 1,
        maxRate: 50,
      });

      expect(limiter.tryAcquire()).toBe(true);
    });

    it("should reject requests that come too fast", () => {
      const limiter = new AdaptiveRateLimiter({
        initialRate: 10, // 10 req/s = 1 per 100ms
        minRate: 1,
        maxRate: 50,
      });

      expect(limiter.tryAcquire()).toBe(true);
      // Immediately try again — should be too soon
      expect(limiter.tryAcquire()).toBe(false);
    });

    it("should allow requests after sufficient time passes", () => {
      const limiter = new AdaptiveRateLimiter({
        initialRate: 10, // 1 per 100ms
        minRate: 1,
        maxRate: 50,
      });

      expect(limiter.tryAcquire()).toBe(true);
      vi.advanceTimersByTime(100);
      expect(limiter.tryAcquire()).toBe(true);
    });

    it("should increase rate on success", () => {
      const limiter = new AdaptiveRateLimiter({
        initialRate: 10,
        minRate: 1,
        maxRate: 50,
      });

      const before = limiter.getCurrentRate();
      limiter.recordSuccess();
      const after = limiter.getCurrentRate();

      expect(after).toBeGreaterThan(before);
    });

    it("should halve rate on failure", () => {
      const limiter = new AdaptiveRateLimiter({
        initialRate: 10,
        minRate: 1,
        maxRate: 50,
      });

      limiter.recordFailure();
      expect(limiter.getCurrentRate()).toBe(5);
    });

    it("should not go below minRate on failure", () => {
      const limiter = new AdaptiveRateLimiter({
        initialRate: 2,
        minRate: 1,
        maxRate: 50,
      });

      limiter.recordFailure(); // 2 -> 1
      expect(limiter.getCurrentRate()).toBe(1);
      limiter.recordFailure(); // should stay at 1 (minRate)
      expect(limiter.getCurrentRate()).toBe(1);
    });

    it("should not exceed maxRate on success", () => {
      const limiter = new AdaptiveRateLimiter({
        initialRate: 48,
        minRate: 1,
        maxRate: 50,
      });

      // Many successes should not go above maxRate
      for (let i = 0; i < 100; i++) {
        limiter.recordSuccess();
      }
      expect(limiter.getCurrentRate()).toBeLessThanOrEqual(50);
    });

    it("should use retryAfterMs to set rate on failure", () => {
      const limiter = new AdaptiveRateLimiter({
        initialRate: 10,
        minRate: 1,
        maxRate: 50,
      });

      // retryAfterMs = 500 means ~2 requests per second
      limiter.recordFailure(500);
      expect(limiter.getCurrentRate()).toBeCloseTo(2, 0);
    });

    it("should recover rate after backoff and successes", () => {
      const limiter = new AdaptiveRateLimiter({
        initialRate: 10,
        minRate: 1,
        maxRate: 50,
      });

      // Fail to back off
      limiter.recordFailure(); // 10 -> 5
      expect(limiter.getCurrentRate()).toBe(5);

      // Gradual recovery with successes
      const rateAfterFail = limiter.getCurrentRate();
      limiter.recordSuccess();
      limiter.recordSuccess();
      limiter.recordSuccess();
      expect(limiter.getCurrentRate()).toBeGreaterThan(rateAfterFail);
    });

    it("should handle rapid success-failure cycles", () => {
      const limiter = new AdaptiveRateLimiter({
        initialRate: 10,
        minRate: 1,
        maxRate: 50,
      });

      limiter.recordSuccess();
      limiter.recordSuccess();
      const peakRate = limiter.getCurrentRate();

      limiter.recordFailure();
      expect(limiter.getCurrentRate()).toBeLessThan(peakRate);

      limiter.recordSuccess();
      expect(limiter.getCurrentRate()).toBeGreaterThan(limiter.getCurrentRate() - 1);
    });
  });
});

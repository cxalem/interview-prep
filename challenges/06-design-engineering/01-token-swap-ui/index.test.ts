import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  SwapManager,
  Token,
  QuoteFetcher,
  QuoteResult,
  SwapExecutor,
  SwapState,
} from "./index";

const SOL: Token = {
  symbol: "SOL",
  mint: "So11111111111111111111111111111111111111112",
  decimals: 9,
  balance: 10,
};

const USDC: Token = {
  symbol: "USDC",
  mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  decimals: 6,
  balance: 1000,
};

const BONK: Token = {
  symbol: "BONK",
  mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  decimals: 5,
  balance: 1000000,
};

const mockQuoteResult: QuoteResult = {
  outputAmount: "150.00",
  route: {
    path: [SOL, USDC],
    estimatedOutput: "150.00",
    priceImpact: 0.3,
    fee: 0.001,
  },
  priceImpact: 0.3,
};

function createMockQuoteFetcher(): QuoteFetcher {
  return vi.fn().mockResolvedValue(mockQuoteResult);
}

function createMockSwapExecutor(): SwapExecutor {
  return vi
    .fn()
    .mockResolvedValue(
      "5UfDuX7hXbTtGNPbMKq2tCFm3vNuGPTDJ3rYjKbJQ1Wh"
    );
}

describe("SwapManager", () => {
  let manager: SwapManager;
  let quoteFetcher: QuoteFetcher;
  let swapExecutor: SwapExecutor;

  beforeEach(() => {
    vi.useFakeTimers();
    quoteFetcher = createMockQuoteFetcher();
    swapExecutor = createMockSwapExecutor();
    manager = new SwapManager(quoteFetcher, swapExecutor);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      const state = manager.getState();
      expect(state.inputToken).toBeNull();
      expect(state.outputToken).toBeNull();
      expect(state.inputAmount).toBe("");
      expect(state.outputAmount).toBe("");
      expect(state.slippage).toBe(0.5);
      expect(state.route).toBeNull();
      expect(state.priceImpact).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.status).toBe("idle");
    });
  });

  describe("token switching", () => {
    it("should set input token and clear amounts", () => {
      manager.setInputToken(SOL);
      const state = manager.getState();
      expect(state.inputToken).toEqual(SOL);
      expect(state.inputAmount).toBe("");
      expect(state.outputAmount).toBe("");
    });

    it("should set output token and clear amounts", () => {
      manager.setOutputToken(USDC);
      const state = manager.getState();
      expect(state.outputToken).toEqual(USDC);
      expect(state.inputAmount).toBe("");
      expect(state.outputAmount).toBe("");
    });

    it("should clear route and priceImpact when switching tokens", () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.setInputAmount("1");
      vi.advanceTimersByTime(300);

      manager.setInputToken(BONK);
      const state = manager.getState();
      expect(state.route).toBeNull();
      expect(state.priceImpact).toBeNull();
    });

    it("should notify subscribers when tokens change", () => {
      const listener = vi.fn();
      manager.subscribe(listener);
      manager.setInputToken(SOL);
      expect(listener).toHaveBeenCalled();
    });
  });

  describe("amount updates", () => {
    it("should update input amount", () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.setInputAmount("1.5");
      expect(manager.getState().inputAmount).toBe("1.5");
    });

    it("should trigger debounced quote fetch after 300ms", async () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.setInputAmount("1.5");

      expect(quoteFetcher).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      expect(quoteFetcher).toHaveBeenCalledWith(SOL, USDC, "1.5");
    });

    it("should not fetch quote before debounce period", () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.setInputAmount("1.5");

      vi.advanceTimersByTime(200);
      expect(quoteFetcher).not.toHaveBeenCalled();
    });

    it("should reset debounce timer on rapid input changes", async () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);

      manager.setInputAmount("1");
      vi.advanceTimersByTime(200);
      manager.setInputAmount("1.5");
      vi.advanceTimersByTime(200);
      manager.setInputAmount("2");
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      expect(quoteFetcher).toHaveBeenCalledTimes(1);
      expect(quoteFetcher).toHaveBeenCalledWith(SOL, USDC, "2");
    });
  });

  describe("debounced quotes", () => {
    it("should set isLoading during quote fetch", async () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.setInputAmount("1");

      const states: boolean[] = [];
      manager.subscribe((state) => {
        states.push(state.isLoading);
      });

      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      expect(states).toContain(true);
      expect(manager.getState().isLoading).toBe(false);
    });

    it("should update output amount after successful quote", async () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.setInputAmount("1");

      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      expect(manager.getState().outputAmount).toBe("150.00");
    });

    it("should update route and priceImpact after successful quote", async () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.setInputAmount("1");

      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      const state = manager.getState();
      expect(state.route).toBeDefined();
      expect(state.priceImpact).toBe(0.3);
    });

    it("should set error on failed quote fetch", async () => {
      const failingFetcher = vi
        .fn()
        .mockRejectedValue(new Error("No route found"));
      const mgr = new SwapManager(failingFetcher, swapExecutor);
      mgr.setInputToken(SOL);
      mgr.setOutputToken(USDC);
      mgr.setInputAmount("1");

      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      expect(mgr.getState().error).toBeTruthy();
      expect(mgr.getState().isLoading).toBe(false);
    });
  });

  describe("cancellation of stale quotes", () => {
    it("should discard stale quote results when a newer request is made", async () => {
      let resolveFirst: (val: QuoteResult) => void;
      let resolveSecond: (val: QuoteResult) => void;

      const slowFetcher = vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise<QuoteResult>((r) => {
              resolveFirst = r;
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise<QuoteResult>((r) => {
              resolveSecond = r;
            })
        );

      const mgr = new SwapManager(slowFetcher, swapExecutor);
      mgr.setInputToken(SOL);
      mgr.setOutputToken(USDC);

      // First input triggers first quote
      mgr.setInputAmount("1");
      vi.advanceTimersByTime(300);
      await vi.advanceTimersByTimeAsync(0);

      // Second input triggers second quote
      mgr.setInputAmount("2");
      vi.advanceTimersByTime(300);
      await vi.advanceTimersByTimeAsync(0);

      // Resolve first (stale) after second has been requested
      resolveFirst!({
        outputAmount: "100.00",
        route: mockQuoteResult.route,
        priceImpact: 0.1,
      });
      await vi.advanceTimersByTimeAsync(0);

      // The stale result should NOT be applied
      expect(mgr.getState().outputAmount).not.toBe("100.00");

      // Resolve second (current)
      resolveSecond!({
        outputAmount: "200.00",
        route: mockQuoteResult.route,
        priceImpact: 0.2,
      });
      await vi.advanceTimersByTimeAsync(0);

      expect(mgr.getState().outputAmount).toBe("200.00");
    });
  });

  describe("flip tokens", () => {
    it("should swap input and output tokens", () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.flipTokens();

      const state = manager.getState();
      expect(state.inputToken).toEqual(USDC);
      expect(state.outputToken).toEqual(SOL);
    });

    it("should swap amounts when flipping", async () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.setInputAmount("1");
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      const outputBefore = manager.getState().outputAmount;
      manager.flipTokens();

      expect(manager.getState().inputAmount).toBe(outputBefore);
    });

    it("should clear route and priceImpact on flip", () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.flipTokens();

      const state = manager.getState();
      expect(state.route).toBeNull();
      expect(state.priceImpact).toBeNull();
    });
  });

  describe("slippage validation", () => {
    it("should update slippage within valid range", () => {
      manager.setSlippage(1.0);
      expect(manager.getState().slippage).toBe(1.0);
    });

    it("should accept minimum slippage of 0.1", () => {
      manager.setSlippage(0.1);
      expect(manager.getState().slippage).toBe(0.1);
    });

    it("should accept maximum slippage of 50", () => {
      manager.setSlippage(50);
      expect(manager.getState().slippage).toBe(50);
    });

    it("should reject slippage below 0.1", () => {
      manager.setSlippage(1.0);
      manager.setSlippage(0.05);
      expect(manager.getState().slippage).toBe(1.0);
      expect(manager.getState().error).toBeTruthy();
    });

    it("should reject slippage above 50", () => {
      manager.setSlippage(1.0);
      manager.setSlippage(51);
      expect(manager.getState().slippage).toBe(1.0);
      expect(manager.getState().error).toBeTruthy();
    });
  });

  describe("swap lifecycle states", () => {
    it("should transition through the full swap lifecycle on success", async () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.setInputAmount("1");
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      const statuses: string[] = [];
      manager.subscribe((state) => {
        statuses.push(state.status);
      });

      await manager.executeSwap();

      expect(statuses).toContain("approving");
      expect(statuses).toContain("swapping");
      expect(statuses).toContain("confirming");
      expect(statuses).toContain("success");
    });

    it("should set status to failed when swap execution fails", async () => {
      const failingExecutor = vi
        .fn()
        .mockRejectedValue(new Error("Transaction failed"));

      const mgr = new SwapManager(quoteFetcher, failingExecutor);
      mgr.setInputToken(SOL);
      mgr.setOutputToken(USDC);
      mgr.setInputAmount("1");
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      await mgr.executeSwap().catch(() => {});

      expect(mgr.getState().status).toBe("failed");
      expect(mgr.getState().error).toBeTruthy();
    });

    it("should validate sufficient balance before swap", async () => {
      const poorToken: Token = { ...SOL, balance: 0.001 };
      manager.setInputToken(poorToken);
      manager.setOutputToken(USDC);
      manager.setInputAmount("10");
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      await expect(manager.executeSwap()).rejects.toThrow();
      expect(manager.getState().status).toBe("failed");
    });
  });

  describe("minimum received calculation", () => {
    it("should return null when no output amount", () => {
      expect(manager.getMinimumReceived()).toBeNull();
    });

    it("should calculate minimum received with default slippage", async () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.setInputAmount("1");
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      // outputAmount is 150.00, slippage is 0.5%
      // minReceived = 150 * (1 - 0.5/100) = 150 * 0.995 = 149.25
      expect(manager.getMinimumReceived()).toBeCloseTo(149.25, 2);
    });

    it("should recalculate when slippage changes", async () => {
      manager.setInputToken(SOL);
      manager.setOutputToken(USDC);
      manager.setInputAmount("1");
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      manager.setSlippage(1.0);
      // 150 * (1 - 1/100) = 150 * 0.99 = 148.5
      expect(manager.getMinimumReceived()).toBeCloseTo(148.5, 2);
    });
  });

  describe("subscribe", () => {
    it("should return an unsubscribe function", () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      manager.setInputToken(SOL);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      manager.setOutputToken(USDC);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should support multiple subscribers", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      manager.subscribe(listener1);
      manager.subscribe(listener2);

      manager.setInputToken(SOL);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });
});

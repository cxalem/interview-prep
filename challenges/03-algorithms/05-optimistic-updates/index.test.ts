import { describe, it, expect, vi } from "vitest";
import { OptimisticStore } from "./index";

interface WalletState {
  balance: number;
  nfts: string[];
  tokens: Record<string, number>;
}

const initialState: WalletState = {
  balance: 100,
  nfts: ["nft-1", "nft-2"],
  tokens: { USDC: 500, BONK: 1000000 },
};

function createStore() {
  return new OptimisticStore<WalletState>(structuredClone(initialState));
}

describe("Challenge 3.5: Optimistic Updates", () => {
  describe("basic state management", () => {
    it("should return initial state via getState()", () => {
      const store = createStore();
      expect(store.getState()).toEqual(initialState);
    });

    it("should return initial state via getConfirmedState()", () => {
      const store = createStore();
      expect(store.getConfirmedState()).toEqual(initialState);
    });

    it("should return new object references from getState()", () => {
      const store = createStore();
      const state1 = store.getState();
      const state2 = store.getState();
      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2);
    });

    it("should return new object references from getConfirmedState()", () => {
      const store = createStore();
      const state1 = store.getConfirmedState();
      const state2 = store.getConfirmedState();
      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2);
    });
  });

  describe("applyOptimistic", () => {
    it("should apply an optimistic update to getState()", () => {
      const store = createStore();

      store.applyOptimistic("send-20", (state) => ({
        ...state,
        balance: state.balance - 20,
      }));

      expect(store.getState().balance).toBe(80);
    });

    it("should not affect confirmed state", () => {
      const store = createStore();

      store.applyOptimistic("send-20", (state) => ({
        ...state,
        balance: state.balance - 20,
      }));

      expect(store.getConfirmedState().balance).toBe(100);
    });

    it("should apply multiple optimistic updates in order", () => {
      const store = createStore();

      store.applyOptimistic("send-20", (state) => ({
        ...state,
        balance: state.balance - 20,
      }));

      store.applyOptimistic("receive-50", (state) => ({
        ...state,
        balance: state.balance + 50,
      }));

      expect(store.getState().balance).toBe(130); // 100 - 20 + 50
    });

    it("should throw if duplicate id is used", () => {
      const store = createStore();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      expect(() => {
        store.applyOptimistic("tx-1", (state) => ({
          ...state,
          balance: state.balance - 20,
        }));
      }).toThrow();
    });

    it("should return a rollback function", () => {
      const store = createStore();

      const rollback = store.applyOptimistic("send-20", (state) => ({
        ...state,
        balance: state.balance - 20,
      }));

      expect(typeof rollback).toBe("function");
      expect(store.getState().balance).toBe(80);

      rollback();
      expect(store.getState().balance).toBe(100);
    });

    it("should handle optimistic updates to nested properties", () => {
      const store = createStore();

      store.applyOptimistic("add-nft", (state) => ({
        ...state,
        nfts: [...state.nfts, "nft-3"],
      }));

      expect(store.getState().nfts).toEqual(["nft-1", "nft-2", "nft-3"]);
      expect(store.getConfirmedState().nfts).toEqual(["nft-1", "nft-2"]);
    });

    it("should handle optimistic updates to record properties", () => {
      const store = createStore();

      store.applyOptimistic("swap-tokens", (state) => ({
        ...state,
        tokens: { ...state.tokens, USDC: state.tokens.USDC - 100, BONK: state.tokens.BONK + 50000 },
      }));

      expect(store.getState().tokens.USDC).toBe(400);
      expect(store.getState().tokens.BONK).toBe(1050000);
    });
  });

  describe("confirm", () => {
    it("should make an optimistic update permanent", () => {
      const store = createStore();

      store.applyOptimistic("send-20", (state) => ({
        ...state,
        balance: state.balance - 20,
      }));

      store.confirm("send-20");

      expect(store.getState().balance).toBe(80);
      expect(store.getConfirmedState().balance).toBe(80);
    });

    it("should throw if confirming non-existent id", () => {
      const store = createStore();
      expect(() => store.confirm("non-existent")).toThrow();
    });

    it("should handle confirming in order", () => {
      const store = createStore();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      store.applyOptimistic("tx-2", (state) => ({
        ...state,
        balance: state.balance - 20,
      }));

      store.confirm("tx-1");

      expect(store.getState().balance).toBe(70); // 100 - 10 - 20
      expect(store.getConfirmedState().balance).toBe(90); // 100 - 10
    });

    it("should handle out-of-order confirmations", () => {
      const store = createStore();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      store.applyOptimistic("tx-2", (state) => ({
        ...state,
        balance: state.balance - 20,
      }));

      // Confirm tx-2 first (out of order)
      store.confirm("tx-2");

      // tx-2 is confirmed: confirmed state = 100 - 20 = 80
      // tx-1 is still pending: getState = 80 - 10 = 70
      expect(store.getConfirmedState().balance).toBe(80);
      expect(store.getState().balance).toBe(70);

      // Now confirm tx-1
      store.confirm("tx-1");
      expect(store.getConfirmedState().balance).toBe(70);
      expect(store.getState().balance).toBe(70);
    });
  });

  describe("rollback", () => {
    it("should remove a specific optimistic update", () => {
      const store = createStore();

      store.applyOptimistic("send-20", (state) => ({
        ...state,
        balance: state.balance - 20,
      }));

      store.rollback("send-20");
      expect(store.getState().balance).toBe(100);
    });

    it("should throw if rolling back non-existent id", () => {
      const store = createStore();
      expect(() => store.rollback("non-existent")).toThrow();
    });

    it("should correctly re-apply remaining updates after rollback", () => {
      const store = createStore();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      store.applyOptimistic("tx-2", (state) => ({
        ...state,
        balance: state.balance - 20,
      }));

      store.applyOptimistic("tx-3", (state) => ({
        ...state,
        balance: state.balance + 5,
      }));

      // State: 100 - 10 - 20 + 5 = 75
      expect(store.getState().balance).toBe(75);

      // Roll back tx-2 (the middle one)
      store.rollback("tx-2");

      // State: 100 - 10 + 5 = 95
      expect(store.getState().balance).toBe(95);
      expect(store.getConfirmedState().balance).toBe(100);
    });

    it("should handle rolling back the first of multiple updates", () => {
      const store = createStore();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      store.applyOptimistic("tx-2", (state) => ({
        ...state,
        balance: state.balance * 2,
      }));

      // State: (100 - 10) * 2 = 180
      expect(store.getState().balance).toBe(180);

      store.rollback("tx-1");

      // State: 100 * 2 = 200
      expect(store.getState().balance).toBe(200);
    });
  });

  describe("rollbackAll", () => {
    it("should revert to confirmed state", () => {
      const store = createStore();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      store.applyOptimistic("tx-2", (state) => ({
        ...state,
        balance: state.balance - 20,
      }));

      store.rollbackAll();

      expect(store.getState()).toEqual(initialState);
      expect(store.getConfirmedState()).toEqual(initialState);
    });

    it("should be safe to call with no pending updates", () => {
      const store = createStore();
      expect(() => store.rollbackAll()).not.toThrow();
      expect(store.getState()).toEqual(initialState);
    });

    it("should allow new optimistic updates after rollbackAll", () => {
      const store = createStore();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: 0,
      }));

      store.rollbackAll();

      store.applyOptimistic("tx-2", (state) => ({
        ...state,
        balance: state.balance + 50,
      }));

      expect(store.getState().balance).toBe(150);
    });
  });

  describe("conflicting updates", () => {
    it("should handle two updates to the same field", () => {
      const store = createStore();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 30,
      }));

      store.applyOptimistic("tx-2", (state) => ({
        ...state,
        balance: state.balance - 50,
      }));

      // Both applied: 100 - 30 - 50 = 20
      expect(store.getState().balance).toBe(20);

      // Roll back first, second should still work correctly
      store.rollback("tx-1");
      expect(store.getState().balance).toBe(50); // 100 - 50
    });

    it("should handle updates to different fields independently", () => {
      const store = createStore();

      store.applyOptimistic("update-balance", (state) => ({
        ...state,
        balance: state.balance - 25,
      }));

      store.applyOptimistic("add-nft", (state) => ({
        ...state,
        nfts: [...state.nfts, "nft-3"],
      }));

      store.rollback("update-balance");

      expect(store.getState().balance).toBe(100);
      expect(store.getState().nfts).toEqual(["nft-1", "nft-2", "nft-3"]);
    });
  });

  describe("subscribe", () => {
    it("should notify listeners on applyOptimistic", () => {
      const store = createStore();
      const listener = vi.fn();

      store.subscribe(listener);

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 90 })
      );
    });

    it("should notify listeners on confirm", () => {
      const store = createStore();
      const listener = vi.fn();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      store.subscribe(listener);
      store.confirm("tx-1");

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 90 })
      );
    });

    it("should notify listeners on rollback", () => {
      const store = createStore();
      const listener = vi.fn();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      store.subscribe(listener);
      store.rollback("tx-1");

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 100 })
      );
    });

    it("should notify listeners on rollbackAll", () => {
      const store = createStore();
      const listener = vi.fn();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      store.subscribe(listener);
      store.rollbackAll();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should stop notifying after unsubscribe", () => {
      const store = createStore();
      const listener = vi.fn();

      const unsubscribe = store.subscribe(listener);

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      store.applyOptimistic("tx-2", (state) => ({
        ...state,
        balance: state.balance - 20,
      }));

      // Should still be 1 — not notified after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should support multiple listeners", () => {
      const store = createStore();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      store.subscribe(listener1);
      store.subscribe(listener2);

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 10,
      }));

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("immutability", () => {
    it("should not be affected by external mutation of returned state", () => {
      const store = createStore();
      const state = store.getState();

      state.balance = 999;
      state.nfts.push("hacked");

      expect(store.getState().balance).toBe(100);
      expect(store.getState().nfts).toEqual(["nft-1", "nft-2"]);
    });

    it("should not be affected by mutation of initial state object", () => {
      const myState = { balance: 100, nfts: ["a"], tokens: {} };
      const store = new OptimisticStore(myState);

      myState.balance = 0;
      myState.nfts.push("b");

      expect(store.getState().balance).toBe(100);
      expect(store.getState().nfts).toEqual(["a"]);
    });

    it("should not share references between getState and getConfirmedState", () => {
      const store = createStore();

      store.applyOptimistic("tx-1", (state) => ({
        ...state,
        balance: state.balance - 50,
      }));

      const current = store.getState();
      const confirmed = store.getConfirmedState();

      expect(current).not.toBe(confirmed);
      expect(current.balance).not.toBe(confirmed.balance);
    });
  });
});

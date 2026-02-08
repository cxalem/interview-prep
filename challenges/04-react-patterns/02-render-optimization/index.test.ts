import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createStore, shallowEqual } from "./index";

interface TestState {
  balance: number;
  address: string;
  tokens: string[];
  nested: { count: number };
}

describe("createStore", () => {
  const initialState: TestState = {
    balance: 100,
    address: "abc123",
    tokens: ["SOL", "USDC"],
    nested: { count: 0 },
  };

  let store: ReturnType<typeof createStore<TestState>>;

  beforeEach(() => {
    store = createStore<TestState>({ ...initialState, tokens: [...initialState.tokens], nested: { ...initialState.nested } });
  });

  afterEach(() => {
    store.destroy();
  });

  describe("getState", () => {
    it("should return the initial state", () => {
      expect(store.getState()).toEqual(initialState);
    });
  });

  describe("setState", () => {
    it("should update state with partial object", () => {
      store.setState({ balance: 200 });
      expect(store.getState().balance).toBe(200);
      // Other fields unchanged
      expect(store.getState().address).toBe("abc123");
    });

    it("should update state with updater function", () => {
      store.setState((prev) => ({ balance: prev.balance + 50 }));
      expect(store.getState().balance).toBe(150);
    });

    it("should shallow merge updates", () => {
      store.setState({ balance: 999 });
      const state = store.getState();
      expect(state.balance).toBe(999);
      expect(state.address).toBe("abc123");
      expect(state.tokens).toEqual(["SOL", "USDC"]);
    });
  });

  describe("subscribe (full listener)", () => {
    it("should notify listeners on state change", async () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.setState({ balance: 200 });

      // Batching: wait for microtask
      await Promise.resolve();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 200 }),
        expect.objectContaining({ balance: 100 })
      );
    });

    it("should return an unsubscribe function", async () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      store.setState({ balance: 200 });
      await Promise.resolve();
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      store.setState({ balance: 300 });
      await Promise.resolve();
      expect(listener).toHaveBeenCalledTimes(1); // not called again
    });

    it("should support multiple listeners", async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      store.subscribe(listener1);
      store.subscribe(listener2);

      store.setState({ balance: 200 });
      await Promise.resolve();

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("subscribe (selector)", () => {
    it("should only fire when selected value changes", async () => {
      const listener = vi.fn();
      store.subscribe((state) => state.balance, listener);

      store.setState({ address: "new-address" });
      await Promise.resolve();
      expect(listener).not.toHaveBeenCalled();

      store.setState({ balance: 200 });
      await Promise.resolve();
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(200, 100);
    });

    it("should use Object.is by default for equality", async () => {
      const listener = vi.fn();
      store.subscribe((state) => state.tokens, listener);

      // Setting a new array reference even with same content triggers the listener
      store.setState({ tokens: ["SOL", "USDC"] });
      await Promise.resolve();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should use custom equality function when provided", async () => {
      const listener = vi.fn();
      store.subscribe(
        (state) => state.tokens,
        listener,
        (a, b) => shallowEqual(a, b)
      );

      // Same content, different reference — should NOT fire with shallowEqual
      store.setState({ tokens: ["SOL", "USDC"] });
      await Promise.resolve();
      expect(listener).not.toHaveBeenCalled();

      // Different content — should fire
      store.setState({ tokens: ["SOL", "USDC", "RAY"] });
      await Promise.resolve();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should return unsubscribe for selector subscriptions", async () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe((state) => state.balance, listener);

      store.setState({ balance: 200 });
      await Promise.resolve();
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      store.setState({ balance: 300 });
      await Promise.resolve();
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("batched updates", () => {
    it("should batch multiple setState calls in the same microtask", async () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.setState({ balance: 200 });
      store.setState({ address: "new" });
      store.setState({ balance: 300 });

      // Listener should not have been called synchronously (batching)
      expect(listener).toHaveBeenCalledTimes(0);

      await Promise.resolve();

      // Should fire only once with the final merged state
      expect(listener).toHaveBeenCalledTimes(1);
      const [newState] = listener.mock.calls[0];
      expect(newState.balance).toBe(300);
      expect(newState.address).toBe("new");
    });

    it("should batch for selector subscribers too", async () => {
      const listener = vi.fn();
      store.subscribe((state) => state.balance, listener);

      store.setState({ balance: 200 });
      store.setState({ balance: 300 });
      store.setState({ balance: 400 });

      await Promise.resolve();

      // Should only fire once, with the final value
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(400, 100);
    });
  });

  describe("destroy", () => {
    it("should remove all subscriptions", async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      store.subscribe(listener1);
      store.subscribe((state) => state.balance, listener2);

      store.destroy();

      store.setState({ balance: 999 });
      await Promise.resolve();

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });
});

describe("shallowEqual", () => {
  it("should return true for identical primitives", () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual("a", "a")).toBe(true);
    expect(shallowEqual(true, true)).toBe(true);
    expect(shallowEqual(null, null)).toBe(true);
    expect(shallowEqual(undefined, undefined)).toBe(true);
  });

  it("should return false for different primitives", () => {
    expect(shallowEqual(1, 2)).toBe(false);
    expect(shallowEqual("a", "b")).toBe(false);
    expect(shallowEqual(true, false)).toBe(false);
    expect(shallowEqual(null, undefined)).toBe(false);
  });

  it("should return true for the same reference", () => {
    const obj = { a: 1 };
    expect(shallowEqual(obj, obj)).toBe(true);
  });

  it("should return true for objects with same keys and values", () => {
    expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it("should return false for objects with different values", () => {
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("should return false for objects with different keys", () => {
    expect(shallowEqual({ a: 1 }, { b: 1 } as any)).toBe(false);
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 } as any)).toBe(false);
  });

  it("should return true for arrays with same elements", () => {
    expect(shallowEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it("should return false for arrays with different elements", () => {
    expect(shallowEqual([1, 2], [1, 3])).toBe(false);
    expect(shallowEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it("should NOT deeply compare nested objects", () => {
    expect(shallowEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(false);
  });

  it("should handle NaN correctly", () => {
    expect(shallowEqual(NaN, NaN)).toBe(true);
    expect(shallowEqual({ a: NaN }, { a: NaN })).toBe(true);
  });
});

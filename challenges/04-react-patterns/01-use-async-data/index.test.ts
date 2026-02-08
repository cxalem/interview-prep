import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AsyncDataManager } from "./index";

describe("AsyncDataManager", () => {
  let manager: AsyncDataManager<string>;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new AsyncDataManager<string>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = manager.getState();
      expect(state).toEqual({
        data: null,
        error: null,
        isLoading: false,
        isStale: false,
      });
    });
  });

  describe("fetch", () => {
    it("should set isLoading to true when fetch starts", async () => {
      const states: boolean[] = [];
      manager.subscribe((state) => states.push(state.isLoading));

      const fetcher = vi.fn(
        () => new Promise<string>((resolve) => setTimeout(() => resolve("data"), 100))
      );

      const fetchPromise = manager.fetch(fetcher);
      expect(manager.getState().isLoading).toBe(true);

      await vi.advanceTimersByTimeAsync(100);
      await fetchPromise;

      expect(manager.getState().isLoading).toBe(false);
    });

    it("should set data on successful fetch", async () => {
      const fetcher = vi.fn(() => Promise.resolve("hello"));
      await manager.fetch(fetcher);

      expect(manager.getState().data).toBe("hello");
      expect(manager.getState().error).toBeNull();
      expect(manager.getState().isLoading).toBe(false);
    });

    it("should set error on failed fetch", async () => {
      const error = new Error("Network error");
      const fetcher = vi.fn(() => Promise.reject(error));

      await manager.fetch(fetcher);

      expect(manager.getState().error).toBe(error);
      expect(manager.getState().data).toBeNull();
      expect(manager.getState().isLoading).toBe(false);
    });

    it("should pass AbortSignal to fetcher", async () => {
      const fetcher = vi.fn((_signal: AbortSignal) => Promise.resolve("data"));
      await manager.fetch(fetcher);

      expect(fetcher).toHaveBeenCalledWith(expect.any(AbortSignal));
    });

    it("should notify subscribers on state changes", async () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      await manager.fetch(() => Promise.resolve("data"));

      // At minimum: loading start + success
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe("deduplication", () => {
    it("should not start a second fetch while one is in flight", async () => {
      let resolveFirst!: (val: string) => void;
      const firstFetcher = vi.fn(
        () => new Promise<string>((resolve) => { resolveFirst = resolve; })
      );
      const secondFetcher = vi.fn(() => Promise.resolve("second"));

      const promise1 = manager.fetch(firstFetcher);
      const promise2 = manager.fetch(secondFetcher);

      // Second fetcher should not have been called
      expect(secondFetcher).not.toHaveBeenCalled();

      resolveFirst("first");
      const result1 = await promise1;
      const result2 = await promise2;

      expect(result1).toBe("first");
      expect(result2).toBe("first");
    });
  });

  describe("refetch", () => {
    it("should re-run the last fetcher", async () => {
      const fetcher = vi.fn(() => Promise.resolve("data"));
      await manager.fetch(fetcher);

      expect(fetcher).toHaveBeenCalledTimes(1);

      await manager.refetch();
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("should throw if no fetcher has been set", async () => {
      await expect(manager.refetch()).rejects.toThrow();
    });
  });

  describe("mutate", () => {
    it("should optimistically set data", () => {
      manager.mutate("optimistic");

      const state = manager.getState();
      expect(state.data).toBe("optimistic");
      expect(state.error).toBeNull();
      expect(state.isStale).toBe(false);
    });

    it("should clear existing error when mutating", async () => {
      await manager.fetch(() => Promise.reject(new Error("fail")));
      expect(manager.getState().error).not.toBeNull();

      manager.mutate("recovered");
      expect(manager.getState().error).toBeNull();
      expect(manager.getState().data).toBe("recovered");
    });

    it("should notify subscribers", () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      manager.mutate("new data");
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("invalidate", () => {
    it("should mark data as stale", async () => {
      await manager.fetch(() => Promise.resolve("data"));
      expect(manager.getState().isStale).toBe(false);

      manager.invalidate();
      expect(manager.getState().isStale).toBe(true);
      // Data should still be available
      expect(manager.getState().data).toBe("data");
    });

    it("should notify subscribers", async () => {
      await manager.fetch(() => Promise.resolve("data"));

      const listener = vi.fn();
      manager.subscribe(listener);

      manager.invalidate();
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("stale-while-revalidate", () => {
    it("should keep stale data visible while revalidating", async () => {
      await manager.fetch(() => Promise.resolve("old data"));
      manager.invalidate();

      expect(manager.getState().data).toBe("old data");
      expect(manager.getState().isStale).toBe(true);

      let resolveNew!: (val: string) => void;
      const newFetcher = () =>
        new Promise<string>((resolve) => { resolveNew = resolve; });

      const fetchPromise = manager.fetch(newFetcher);

      // During revalidation: old data still visible, loading is true, stale is true
      expect(manager.getState().data).toBe("old data");
      expect(manager.getState().isLoading).toBe(true);
      expect(manager.getState().isStale).toBe(true);

      resolveNew("new data");
      await fetchPromise;

      expect(manager.getState().data).toBe("new data");
      expect(manager.getState().isLoading).toBe(false);
      expect(manager.getState().isStale).toBe(false);
    });
  });

  describe("cancel", () => {
    it("should cancel in-flight request", async () => {
      const fetcher = vi.fn(
        (signal: AbortSignal) =>
          new Promise<string>((resolve, reject) => {
            signal.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError"))
            );
            setTimeout(() => resolve("data"), 1000);
          })
      );

      const fetchPromise = manager.fetch(fetcher);
      expect(manager.getState().isLoading).toBe(true);

      manager.cancel();
      expect(manager.getState().isLoading).toBe(false);

      await fetchPromise;
      // Data should not have been set
      expect(manager.getState().data).toBeNull();
    });

    it("should not clear existing data on cancel", async () => {
      await manager.fetch(() => Promise.resolve("existing"));

      const fetcher = vi.fn(
        () => new Promise<string>((resolve) => setTimeout(() => resolve("new"), 1000))
      );

      manager.fetch(fetcher);
      manager.cancel();

      expect(manager.getState().data).toBe("existing");
    });
  });

  describe("subscribe", () => {
    it("should return an unsubscribe function", () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      manager.mutate("first");
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      manager.mutate("second");
      expect(listener).toHaveBeenCalledTimes(1); // not called again
    });

    it("should support multiple subscribers", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      manager.subscribe(listener1);
      manager.subscribe(listener2);

      manager.mutate("data");

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("auto-refetch", () => {
    it("should automatically refetch on interval", async () => {
      const fetcher = vi.fn(() => Promise.resolve("data"));
      await manager.fetch(fetcher);
      expect(fetcher).toHaveBeenCalledTimes(1);

      manager.startAutoRefetch(5000);

      await vi.advanceTimersByTimeAsync(5000);
      expect(fetcher).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(5000);
      expect(fetcher).toHaveBeenCalledTimes(3);

      manager.stopAutoRefetch();

      await vi.advanceTimersByTimeAsync(5000);
      expect(fetcher).toHaveBeenCalledTimes(3); // no more calls
    });

    it("should stop auto-refetch when stopAutoRefetch is called", async () => {
      const fetcher = vi.fn(() => Promise.resolve("data"));
      await manager.fetch(fetcher);

      manager.startAutoRefetch(1000);
      manager.stopAutoRefetch();

      await vi.advanceTimersByTimeAsync(5000);
      expect(fetcher).toHaveBeenCalledTimes(1); // only the initial fetch
    });
  });
});

import { describe, it, expect, vi } from "vitest";
import { TaskQueue } from "./index";

// Helper: creates a task that resolves after a delay
function delayedTask<T>(value: T, ms: number): () => Promise<T> {
  return () => new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Helper: creates a task that rejects after a delay
function failingTask(error: string, ms: number = 0): () => Promise<never> {
  return () =>
    new Promise((_, reject) => setTimeout(() => reject(new Error(error)), ms));
}

describe("TaskQueue", () => {
  // ─── Constructor ──────────────────────────────────────────────

  it("should create a queue with the given concurrency", () => {
    const queue = new TaskQueue<string>(3);
    expect(queue.running).toBe(0);
    expect(queue.pending).toBe(0);
  });

  it("should throw if maxConcurrency is <= 0", () => {
    expect(() => new TaskQueue(0)).toThrow();
    expect(() => new TaskQueue(-1)).toThrow();
  });

  // ─── Basic add / execution ────────────────────────────────────

  it("should execute a single task and return its result", async () => {
    const queue = new TaskQueue<string>(2);
    const result = await queue.add(() => Promise.resolve("hello"));
    expect(result).toBe("hello");
  });

  it("should reject if a task throws", async () => {
    const queue = new TaskQueue<string>(2);
    await expect(
      queue.add(() => Promise.reject(new Error("boom")))
    ).rejects.toThrow("boom");
  });

  // ─── Concurrency enforcement ─────────────────────────────────

  it("should not exceed maxConcurrency", async () => {
    vi.useFakeTimers();

    const queue = new TaskQueue<string>(2);
    let concurrentCount = 0;
    let maxConcurrentSeen = 0;

    const createTask = (id: string) => () =>
      new Promise<string>((resolve) => {
        concurrentCount++;
        maxConcurrentSeen = Math.max(maxConcurrentSeen, concurrentCount);
        setTimeout(() => {
          concurrentCount--;
          resolve(id);
        }, 100);
      });

    const promises = [
      queue.add(createTask("a")),
      queue.add(createTask("b")),
      queue.add(createTask("c")),
      queue.add(createTask("d")),
    ];

    // After starting, only 2 should be running
    expect(queue.running).toBe(2);
    expect(queue.pending).toBe(2);

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);

    const results = await Promise.all(promises);

    expect(maxConcurrentSeen).toBe(2);
    expect(results).toEqual(["a", "b", "c", "d"]);

    vi.useRealTimers();
  });

  it("should process tasks in FIFO order", async () => {
    const queue = new TaskQueue<number>(1); // concurrency 1 = sequential
    const order: number[] = [];

    const createTask = (n: number) => async () => {
      order.push(n);
      return n;
    };

    await Promise.all([
      queue.add(createTask(1)),
      queue.add(createTask(2)),
      queue.add(createTask(3)),
    ]);

    expect(order).toEqual([1, 2, 3]);
  });

  // ─── addBatch ─────────────────────────────────────────────────

  it("should add multiple tasks and return results in order", async () => {
    const queue = new TaskQueue<number>(2);

    const results = await queue.addBatch([
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
    ]);

    expect(results).toEqual([1, 2, 3]);
  });

  it("should reject addBatch if any task fails", async () => {
    const queue = new TaskQueue<number>(2);

    await expect(
      queue.addBatch([
        () => Promise.resolve(1),
        () => Promise.reject(new Error("fail")),
        () => Promise.resolve(3),
      ])
    ).rejects.toThrow("fail");
  });

  // ─── Pause / Resume ──────────────────────────────────────────

  it("should pause and not start new tasks", async () => {
    vi.useFakeTimers();

    const queue = new TaskQueue<string>(2);

    queue.add(delayedTask("a", 100));
    queue.add(delayedTask("b", 100));

    queue.pause();

    queue.add(delayedTask("c", 100));

    // After first batch completes, c should not start
    await vi.advanceTimersByTimeAsync(100);

    expect(queue.running).toBe(0);
    expect(queue.pending).toBe(1); // "c" is still pending

    vi.useRealTimers();
  });

  it("should resume processing after pause", async () => {
    vi.useFakeTimers();

    const queue = new TaskQueue<string>(2);
    const results: string[] = [];

    const trackTask = (id: string) => async () => {
      await new Promise((r) => setTimeout(r, 50));
      results.push(id);
      return id;
    };

    queue.add(trackTask("a"));
    queue.add(trackTask("b"));

    await vi.advanceTimersByTimeAsync(50);

    queue.pause();
    const cPromise = queue.add(trackTask("c"));

    await vi.advanceTimersByTimeAsync(100);
    expect(results).not.toContain("c");

    queue.resume();
    await vi.advanceTimersByTimeAsync(50);

    await cPromise;
    expect(results).toContain("c");

    vi.useRealTimers();
  });

  // ─── clear ────────────────────────────────────────────────────

  it("should clear pending tasks and reject their promises", async () => {
    vi.useFakeTimers();

    const queue = new TaskQueue<string>(1);

    const task1 = queue.add(delayedTask("a", 100));
    const task2 = queue.add(delayedTask("b", 100));
    const task3 = queue.add(delayedTask("c", 100));

    expect(queue.pending).toBe(2); // b and c pending

    queue.clear();

    expect(queue.pending).toBe(0);
    expect(queue.running).toBe(1); // a is still running

    await expect(task2).rejects.toThrow();
    await expect(task3).rejects.toThrow();

    await vi.advanceTimersByTimeAsync(100);
    await expect(task1).resolves.toBe("a");

    vi.useRealTimers();
  });

  // ─── onDrain ──────────────────────────────────────────────────

  it("should call onDrain when all tasks complete", async () => {
    const queue = new TaskQueue<string>(2);
    const drainCallback = vi.fn();

    queue.onDrain(drainCallback);

    await queue.addBatch([
      () => Promise.resolve("a"),
      () => Promise.resolve("b"),
    ]);

    // Give microtasks a chance to flush
    await new Promise((r) => setTimeout(r, 0));

    expect(drainCallback).toHaveBeenCalled();
  });

  it("should call onDrain immediately if queue is already empty", async () => {
    const queue = new TaskQueue<string>(2);
    const drainCallback = vi.fn();

    queue.onDrain(drainCallback);

    // Wait for potential async drain check
    await new Promise((r) => setTimeout(r, 0));

    expect(drainCallback).toHaveBeenCalled();
  });

  // ─── Retry support ───────────────────────────────────────────

  it("should retry a failing task the specified number of times", async () => {
    const queue = new TaskQueue<string>(2);
    let attempts = 0;

    const flakyTask = () => {
      attempts++;
      if (attempts < 3) {
        return Promise.reject(new Error("flaky"));
      }
      return Promise.resolve("success");
    };

    const result = await queue.add(flakyTask, { retries: 3 });
    expect(result).toBe("success");
    expect(attempts).toBe(3);
  });

  it("should reject after exhausting all retries", async () => {
    const queue = new TaskQueue<string>(2);

    await expect(
      queue.add(failingTask("permanent failure"), { retries: 2 })
    ).rejects.toThrow("permanent failure");
  });

  it("should delay between retries when retryDelay is set", async () => {
    vi.useFakeTimers();

    const queue = new TaskQueue<string>(2);
    let attempts = 0;

    const flakyTask = () => {
      attempts++;
      if (attempts < 3) {
        return Promise.reject(new Error("retry me"));
      }
      return Promise.resolve("done");
    };

    const resultPromise = queue.add(flakyTask, {
      retries: 3,
      retryDelay: 1000,
    });

    // First attempt fails immediately
    await vi.advanceTimersByTimeAsync(0);
    expect(attempts).toBe(1);

    // Wait for retry delay
    await vi.advanceTimersByTimeAsync(1000);
    expect(attempts).toBe(2);

    // Wait for second retry delay
    await vi.advanceTimersByTimeAsync(1000);
    expect(attempts).toBe(3);

    const result = await resultPromise;
    expect(result).toBe("done");

    vi.useRealTimers();
  });

  // ─── Edge cases ───────────────────────────────────────────────

  it("should handle concurrency of 1 (sequential execution)", async () => {
    const queue = new TaskQueue<number>(1);
    const results = await queue.addBatch([
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
    ]);
    expect(results).toEqual([1, 2, 3]);
  });

  it("should handle adding tasks from within a task callback", async () => {
    const queue = new TaskQueue<number>(2);
    let innerResult: number | undefined;

    await queue.add(async () => {
      innerResult = await queue.add(() => Promise.resolve(42));
      return 1;
    });

    expect(innerResult).toBe(42);
  });

  it("should report correct running and pending counts throughout", async () => {
    vi.useFakeTimers();

    const queue = new TaskQueue<string>(2);

    expect(queue.running).toBe(0);
    expect(queue.pending).toBe(0);

    queue.add(delayedTask("a", 100));
    queue.add(delayedTask("b", 100));
    queue.add(delayedTask("c", 100));

    expect(queue.running).toBe(2);
    expect(queue.pending).toBe(1);

    await vi.advanceTimersByTimeAsync(100);

    expect(queue.running).toBe(1); // c is now running
    expect(queue.pending).toBe(0);

    await vi.advanceTimersByTimeAsync(100);

    expect(queue.running).toBe(0);
    expect(queue.pending).toBe(0);

    vi.useRealTimers();
  });
});

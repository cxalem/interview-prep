import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ToastManager,
  TransactionToast,
  Toast,
  ToastConfig,
} from "./index";

describe("ToastManager", () => {
  let manager: ToastManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new ToastManager({ maxVisible: 3 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("show and dismiss", () => {
    it("should show a toast and return an id", () => {
      const id = manager.show({ type: "info", title: "Hello" });
      expect(id).toBeTruthy();
      expect(typeof id).toBe("string");
    });

    it("should add toast to visible list", () => {
      manager.show({ type: "info", title: "Hello" });
      expect(manager.getVisible()).toHaveLength(1);
      expect(manager.getVisible()[0].title).toBe("Hello");
    });

    it("should dismiss a toast by id", () => {
      const id = manager.show({ type: "info", title: "Hello" });
      manager.dismiss(id);
      expect(manager.getVisible()).toHaveLength(0);
    });

    it("should dismiss all toasts", () => {
      manager.show({ type: "info", title: "One" });
      manager.show({ type: "info", title: "Two" });
      manager.show({ type: "info", title: "Three" });
      manager.dismissAll();
      expect(manager.getVisible()).toHaveLength(0);
      expect(manager.getQueue()).toHaveLength(0);
    });
  });

  describe("auto-dismiss timing", () => {
    it("should auto-dismiss after default duration (5000ms)", () => {
      manager.show({ type: "success", title: "Done!" });
      expect(manager.getVisible()).toHaveLength(1);

      vi.advanceTimersByTime(5000);
      expect(manager.getVisible()).toHaveLength(0);
    });

    it("should auto-dismiss after custom duration", () => {
      manager.show({ type: "info", title: "Quick", duration: 2000 });
      vi.advanceTimersByTime(1999);
      expect(manager.getVisible()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(manager.getVisible()).toHaveLength(0);
    });

    it("should not auto-dismiss loading toasts", () => {
      manager.show({ type: "loading", title: "Loading..." });
      vi.advanceTimersByTime(60000);
      expect(manager.getVisible()).toHaveLength(1);
    });

    it("should not auto-dismiss persistent toasts", () => {
      manager.show({
        type: "info",
        title: "Sticky",
        persistent: true,
      });
      vi.advanceTimersByTime(60000);
      expect(manager.getVisible()).toHaveLength(1);
    });
  });

  describe("queue management", () => {
    it("should queue toasts beyond maxVisible", () => {
      manager.show({ type: "info", title: "One" });
      manager.show({ type: "info", title: "Two" });
      manager.show({ type: "info", title: "Three" });
      manager.show({ type: "info", title: "Four" });

      expect(manager.getVisible()).toHaveLength(3);
      expect(manager.getQueue()).toHaveLength(1);
    });

    it("should promote queued toast when visible toast is dismissed", () => {
      const id1 = manager.show({ type: "info", title: "One", persistent: true });
      manager.show({ type: "info", title: "Two", persistent: true });
      manager.show({ type: "info", title: "Three", persistent: true });
      manager.show({ type: "info", title: "Four", persistent: true });

      expect(manager.getQueue()).toHaveLength(1);
      expect(manager.getQueue()[0].title).toBe("Four");

      manager.dismiss(id1);

      expect(manager.getVisible()).toHaveLength(3);
      expect(manager.getQueue()).toHaveLength(0);
      expect(manager.getVisible().map((t) => t.title)).toContain("Four");
    });

    it("should promote queued toast when visible toast auto-dismisses", () => {
      manager.show({ type: "info", title: "One", duration: 1000 });
      manager.show({ type: "info", title: "Two", persistent: true });
      manager.show({ type: "info", title: "Three", persistent: true });
      manager.show({ type: "info", title: "Four", persistent: true });

      expect(manager.getQueue()).toHaveLength(1);

      vi.advanceTimersByTime(1000);

      expect(manager.getVisible()).toHaveLength(3);
      expect(manager.getQueue()).toHaveLength(0);
    });
  });

  describe("max visible configuration", () => {
    it("should respect custom maxVisible", () => {
      const smallManager = new ToastManager({ maxVisible: 1 });
      smallManager.show({ type: "info", title: "One", persistent: true });
      smallManager.show({ type: "info", title: "Two", persistent: true });

      expect(smallManager.getVisible()).toHaveLength(1);
      expect(smallManager.getQueue()).toHaveLength(1);
    });

    it("should default maxVisible to 3", () => {
      const defaultManager = new ToastManager();
      defaultManager.show({ type: "info", title: "One", persistent: true });
      defaultManager.show({ type: "info", title: "Two", persistent: true });
      defaultManager.show({ type: "info", title: "Three", persistent: true });
      defaultManager.show({ type: "info", title: "Four", persistent: true });

      expect(defaultManager.getVisible()).toHaveLength(3);
      expect(defaultManager.getQueue()).toHaveLength(1);
    });
  });

  describe("update in place", () => {
    it("should update toast title and type", () => {
      const id = manager.show({ type: "loading", title: "Processing..." });
      manager.update(id, { type: "success", title: "Done!" });

      const visible = manager.getVisible();
      expect(visible[0].type).toBe("success");
      expect(visible[0].title).toBe("Done!");
    });

    it("should start auto-dismiss timer when updating loading to success", () => {
      const id = manager.show({ type: "loading", title: "Processing..." });
      manager.update(id, {
        type: "success",
        title: "Done!",
        persistent: false,
      });

      vi.advanceTimersByTime(5000);
      expect(manager.getVisible()).toHaveLength(0);
    });

    it("should update description", () => {
      const id = manager.show({ type: "info", title: "Hello" });
      manager.update(id, { description: "World" });

      expect(manager.getVisible()[0].description).toBe("World");
    });
  });

  describe("subscriber notifications", () => {
    it("should notify on show", () => {
      const listener = vi.fn();
      manager.subscribe(listener);
      manager.show({ type: "info", title: "Hello" });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should notify on dismiss", () => {
      const id = manager.show({ type: "info", title: "Hello" });
      const listener = vi.fn();
      manager.subscribe(listener);
      manager.dismiss(id);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should notify on update", () => {
      const id = manager.show({ type: "info", title: "Hello" });
      const listener = vi.fn();
      manager.subscribe(listener);
      manager.update(id, { title: "Updated" });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should support unsubscribe", () => {
      const listener = vi.fn();
      const unsub = manager.subscribe(listener);
      unsub();
      manager.show({ type: "info", title: "Hello" });
      expect(listener).not.toHaveBeenCalled();
    });
  });
});

describe("TransactionToast", () => {
  let manager: ToastManager;
  let txToast: TransactionToast;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new ToastManager({ maxVisible: 5 });
    txToast = new TransactionToast(manager);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show a loading toast for a transaction", () => {
    const handle = txToast.showTransaction("5UfDuX7hXbTtGNPbMKq2tCFm3");
    expect(handle.id).toBeTruthy();

    const visible = manager.getVisible();
    expect(visible).toHaveLength(1);
    expect(visible[0].type).toBe("loading");
  });

  it("should update to success on confirm", () => {
    const handle = txToast.showTransaction("5UfDuX7hXbTtGNPbMKq2tCFm3");
    handle.confirm();

    const visible = manager.getVisible();
    expect(visible[0].type).toBe("success");
    expect(visible[0].title).toMatch(/confirm/i);
  });

  it("should update to error on fail", () => {
    const handle = txToast.showTransaction("5UfDuX7hXbTtGNPbMKq2tCFm3");
    handle.fail("Insufficient funds");

    const visible = manager.getVisible();
    expect(visible[0].type).toBe("error");
  });

  it("should update to warning on expire", () => {
    const handle = txToast.showTransaction("5UfDuX7hXbTtGNPbMKq2tCFm3");
    handle.expire();

    const visible = manager.getVisible();
    expect(visible[0].type).toBe("warning");
    expect(visible[0].title).toMatch(/expir/i);
  });

  it("should auto-dismiss after confirm", () => {
    const handle = txToast.showTransaction("5UfDuX7hXbTtGNPbMKq2tCFm3");
    handle.confirm();

    vi.advanceTimersByTime(5000);
    expect(manager.getVisible()).toHaveLength(0);
  });
});

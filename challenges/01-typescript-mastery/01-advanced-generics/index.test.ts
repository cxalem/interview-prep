import { describe, it, expect, vi } from "vitest";
import { TypedEventEmitter, type WalletEvents } from "./index";

describe("Challenge 1.1: TypedEventEmitter", () => {
  function createEmitter() {
    return new TypedEventEmitter<WalletEvents>();
  }

  describe("on() and emit()", () => {
    it("should call listener with correct payload", () => {
      const emitter = createEmitter();
      const handler = vi.fn();

      emitter.on("connect", handler);
      emitter.emit("connect", { publicKey: "abc123" });

      expect(handler).toHaveBeenCalledWith({ publicKey: "abc123" });
    });

    it("should handle void events (no payload)", () => {
      const emitter = createEmitter();
      const handler = vi.fn();

      emitter.on("disconnect", handler);
      emitter.emit("disconnect");

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should support multiple listeners for the same event", () => {
      const emitter = createEmitter();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      emitter.on("connect", handler1);
      emitter.on("connect", handler2);
      emitter.emit("connect", { publicKey: "abc" });

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
    });

    it("should support method chaining", () => {
      const emitter = createEmitter();
      const result = emitter
        .on("connect", () => {})
        .on("disconnect", () => {})
        .on("transaction", () => {});

      expect(result).toBe(emitter);
    });
  });

  describe("off()", () => {
    it("should remove a specific listener", () => {
      const emitter = createEmitter();
      const handler = vi.fn();

      emitter.on("connect", handler);
      emitter.off("connect", handler);
      emitter.emit("connect", { publicKey: "abc" });

      expect(handler).not.toHaveBeenCalled();
    });

    it("should only remove the specified listener", () => {
      const emitter = createEmitter();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      emitter.on("connect", handler1);
      emitter.on("connect", handler2);
      emitter.off("connect", handler1);
      emitter.emit("connect", { publicKey: "abc" });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledOnce();
    });
  });

  describe("once()", () => {
    it("should only fire the listener once", () => {
      const emitter = createEmitter();
      const handler = vi.fn();

      emitter.once("connect", handler);
      emitter.emit("connect", { publicKey: "first" });
      emitter.emit("connect", { publicKey: "second" });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ publicKey: "first" });
    });

    it("should work with void events", () => {
      const emitter = createEmitter();
      const handler = vi.fn();

      emitter.once("disconnect", handler);
      emitter.emit("disconnect");
      emitter.emit("disconnect");

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("onAny() — wildcard", () => {
    it("should receive all events", () => {
      const emitter = createEmitter();
      const handler = vi.fn();

      emitter.onAny(handler);
      emitter.emit("connect", { publicKey: "abc" });
      emitter.emit("disconnect");

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledWith({
        event: "connect",
        data: { publicKey: "abc" },
      });
      expect(handler).toHaveBeenCalledWith({
        event: "disconnect",
        data: undefined,
      });
    });

    it("offAny should remove wildcard listener", () => {
      const emitter = createEmitter();
      const handler = vi.fn();

      emitter.onAny(handler);
      emitter.offAny(handler);
      emitter.emit("connect", { publicKey: "abc" });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("removeAllListeners()", () => {
    it("should remove all listeners for a specific event", () => {
      const emitter = createEmitter();
      const h1 = vi.fn();
      const h2 = vi.fn();
      const h3 = vi.fn();

      emitter.on("connect", h1);
      emitter.on("connect", h2);
      emitter.on("disconnect", h3);
      emitter.removeAllListeners("connect");

      emitter.emit("connect", { publicKey: "abc" });
      emitter.emit("disconnect");

      expect(h1).not.toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
      expect(h3).toHaveBeenCalledOnce();
    });

    it("should remove ALL listeners when called with no args", () => {
      const emitter = createEmitter();
      const h1 = vi.fn();
      const h2 = vi.fn();

      emitter.on("connect", h1);
      emitter.on("disconnect", h2);
      emitter.removeAllListeners();

      emitter.emit("connect", { publicKey: "abc" });
      emitter.emit("disconnect");

      expect(h1).not.toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
    });
  });

  describe("listenerCount()", () => {
    it("should return the correct count", () => {
      const emitter = createEmitter();

      expect(emitter.listenerCount("connect")).toBe(0);

      emitter.on("connect", () => {});
      emitter.on("connect", () => {});
      expect(emitter.listenerCount("connect")).toBe(2);

      emitter.once("connect", () => {});
      expect(emitter.listenerCount("connect")).toBe(3);
    });
  });

  describe("edge cases", () => {
    it("should not throw when emitting with no listeners", () => {
      const emitter = createEmitter();
      expect(() => emitter.emit("connect", { publicKey: "abc" })).not.toThrow();
    });

    it("should not throw when removing a non-existent listener", () => {
      const emitter = createEmitter();
      expect(() => emitter.off("connect", () => {})).not.toThrow();
    });

    it("should handle rapid subscribe/unsubscribe cycles", () => {
      const emitter = createEmitter();
      const handler = vi.fn();

      for (let i = 0; i < 100; i++) {
        emitter.on("connect", handler);
        emitter.off("connect", handler);
      }

      emitter.emit("connect", { publicKey: "abc" });
      expect(handler).not.toHaveBeenCalled();
    });
  });
});

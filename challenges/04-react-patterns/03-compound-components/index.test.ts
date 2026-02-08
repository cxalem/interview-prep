import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DisclosureManager, StackManager, FocusTrapManager } from "./index";

describe("DisclosureManager", () => {
  let disclosure: DisclosureManager;

  beforeEach(() => {
    vi.useFakeTimers();
    disclosure = new DisclosureManager({ animationDuration: 300 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should start in closed state", () => {
      expect(disclosure.state).toBe("closed");
      expect(disclosure.isOpen).toBe(false);
      expect(disclosure.isAnimating).toBe(false);
    });
  });

  describe("open", () => {
    it("should transition to opening immediately", () => {
      disclosure.open();
      expect(disclosure.state).toBe("opening");
      expect(disclosure.isOpen).toBe(true);
      expect(disclosure.isAnimating).toBe(true);
    });

    it("should transition to open after animation duration", () => {
      disclosure.open();
      vi.advanceTimersByTime(300);
      expect(disclosure.state).toBe("open");
      expect(disclosure.isOpen).toBe(true);
      expect(disclosure.isAnimating).toBe(false);
    });

    it("should be a no-op if not in closed state", () => {
      disclosure.open();
      vi.advanceTimersByTime(300); // now open
      disclosure.open(); // should be no-op since already open
      expect(disclosure.state).toBe("open");
    });
  });

  describe("close", () => {
    it("should transition to closing immediately", () => {
      disclosure.open();
      vi.advanceTimersByTime(300);
      disclosure.close();
      expect(disclosure.state).toBe("closing");
      expect(disclosure.isAnimating).toBe(true);
    });

    it("should transition to closed after animation duration", () => {
      disclosure.open();
      vi.advanceTimersByTime(300);
      disclosure.close();
      vi.advanceTimersByTime(300);
      expect(disclosure.state).toBe("closed");
      expect(disclosure.isOpen).toBe(false);
      expect(disclosure.isAnimating).toBe(false);
    });

    it("should be a no-op if not in open state", () => {
      disclosure.close(); // already closed
      expect(disclosure.state).toBe("closed");
    });
  });

  describe("toggle", () => {
    it("should open when closed", () => {
      disclosure.toggle();
      expect(disclosure.state).toBe("opening");
    });

    it("should close when open", () => {
      disclosure.open();
      vi.advanceTimersByTime(300);
      disclosure.toggle();
      expect(disclosure.state).toBe("closing");
    });

    it("should be a no-op when animating", () => {
      disclosure.open(); // now opening (animating)
      disclosure.toggle(); // should be no-op
      expect(disclosure.state).toBe("opening");
    });
  });

  describe("onStateChange", () => {
    it("should notify listener on state transitions", () => {
      const listener = vi.fn();
      disclosure.onStateChange(listener);

      disclosure.open();
      expect(listener).toHaveBeenCalledWith("opening");

      vi.advanceTimersByTime(300);
      expect(listener).toHaveBeenCalledWith("open");

      disclosure.close();
      expect(listener).toHaveBeenCalledWith("closing");

      vi.advanceTimersByTime(300);
      expect(listener).toHaveBeenCalledWith("closed");

      expect(listener).toHaveBeenCalledTimes(4);
    });

    it("should return an unsubscribe function", () => {
      const listener = vi.fn();
      const unsubscribe = disclosure.onStateChange(listener);

      disclosure.open();
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      vi.advanceTimersByTime(300);
      expect(listener).toHaveBeenCalledTimes(1); // not called again
    });

    it("should support multiple listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      disclosure.onStateChange(listener1);
      disclosure.onStateChange(listener2);

      disclosure.open();
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("custom animation duration", () => {
    it("should use custom animation duration", () => {
      const fast = new DisclosureManager({ animationDuration: 100 });
      fast.open();
      expect(fast.state).toBe("opening");

      vi.advanceTimersByTime(100);
      expect(fast.state).toBe("open");
    });

    it("should default to 300ms", () => {
      const defaultDuration = new DisclosureManager();
      defaultDuration.open();

      vi.advanceTimersByTime(299);
      expect(defaultDuration.state).toBe("opening");

      vi.advanceTimersByTime(1);
      expect(defaultDuration.state).toBe("open");
    });
  });
});

describe("StackManager", () => {
  let stack: StackManager;

  beforeEach(() => {
    stack = new StackManager();
  });

  describe("initial state", () => {
    it("should start empty", () => {
      expect(stack.current).toBeUndefined();
      expect(stack.stack).toEqual([]);
      expect(stack.size).toBe(0);
    });
  });

  describe("push", () => {
    it("should add items to the stack", () => {
      stack.push("modal-1");
      expect(stack.current).toBe("modal-1");
      expect(stack.size).toBe(1);

      stack.push("modal-2");
      expect(stack.current).toBe("modal-2");
      expect(stack.size).toBe(2);
    });

    it("should maintain order", () => {
      stack.push("a");
      stack.push("b");
      stack.push("c");
      expect(stack.stack).toEqual(["a", "b", "c"]);
    });
  });

  describe("pop", () => {
    it("should remove and return top item", () => {
      stack.push("a");
      stack.push("b");

      const popped = stack.pop();
      expect(popped).toBe("b");
      expect(stack.current).toBe("a");
      expect(stack.size).toBe(1);
    });

    it("should return undefined when empty", () => {
      expect(stack.pop()).toBeUndefined();
    });
  });

  describe("popTo", () => {
    it("should pop everything above the target", () => {
      stack.push("a");
      stack.push("b");
      stack.push("c");
      stack.push("d");

      stack.popTo("b");
      expect(stack.stack).toEqual(["a", "b"]);
      expect(stack.current).toBe("b");
    });

    it("should be a no-op if id is not in the stack", () => {
      stack.push("a");
      stack.push("b");

      stack.popTo("x");
      expect(stack.stack).toEqual(["a", "b"]);
    });

    it("should do nothing if target is already on top", () => {
      stack.push("a");
      stack.push("b");

      stack.popTo("b");
      expect(stack.stack).toEqual(["a", "b"]);
    });
  });

  describe("popAll", () => {
    it("should clear the entire stack", () => {
      stack.push("a");
      stack.push("b");
      stack.push("c");

      stack.popAll();
      expect(stack.size).toBe(0);
      expect(stack.current).toBeUndefined();
      expect(stack.stack).toEqual([]);
    });
  });

  describe("has", () => {
    it("should return true if id is in stack", () => {
      stack.push("a");
      stack.push("b");

      expect(stack.has("a")).toBe(true);
      expect(stack.has("b")).toBe(true);
    });

    it("should return false if id is not in stack", () => {
      stack.push("a");
      expect(stack.has("z")).toBe(false);
    });
  });

  describe("stack immutability", () => {
    it("should return a copy from stack getter", () => {
      stack.push("a");
      const snapshot = stack.stack;
      stack.push("b");
      // Original snapshot should not be modified
      expect(snapshot).toEqual(["a"]);
      expect(stack.stack).toEqual(["a", "b"]);
    });
  });
});

describe("FocusTrapManager", () => {
  let trap: FocusTrapManager;

  beforeEach(() => {
    trap = new FocusTrapManager();
  });

  describe("initial state", () => {
    it("should start inactive", () => {
      expect(trap.isActive).toBe(false);
      expect(trap.elements).toEqual([]);
    });
  });

  describe("activate", () => {
    it("should activate the focus trap", () => {
      trap.activate(["btn-1", "btn-2", "btn-3"]);
      expect(trap.isActive).toBe(true);
      expect(trap.elements).toEqual(["btn-1", "btn-2", "btn-3"]);
    });
  });

  describe("deactivate", () => {
    it("should deactivate and clear elements", () => {
      trap.activate(["btn-1", "btn-2"]);
      trap.deactivate();
      expect(trap.isActive).toBe(false);
      expect(trap.elements).toEqual([]);
    });
  });

  describe("handleTab", () => {
    beforeEach(() => {
      trap.activate(["a", "b", "c", "d"]);
    });

    it("should move to next element on Tab", () => {
      expect(trap.handleTab("a", false)).toBe("b");
      expect(trap.handleTab("b", false)).toBe("c");
      expect(trap.handleTab("c", false)).toBe("d");
    });

    it("should wrap from last to first on Tab", () => {
      expect(trap.handleTab("d", false)).toBe("a");
    });

    it("should move to previous element on Shift+Tab", () => {
      expect(trap.handleTab("d", true)).toBe("c");
      expect(trap.handleTab("c", true)).toBe("b");
      expect(trap.handleTab("b", true)).toBe("a");
    });

    it("should wrap from first to last on Shift+Tab", () => {
      expect(trap.handleTab("a", true)).toBe("d");
    });

    it("should return first element if current is not in list", () => {
      expect(trap.handleTab("unknown", false)).toBe("a");
      expect(trap.handleTab("unknown", true)).toBe("a");
    });

    it("should return undefined if trap is not active", () => {
      trap.deactivate();
      expect(trap.handleTab("a", false)).toBeUndefined();
    });

    it("should return undefined if elements list is empty", () => {
      trap.activate([]);
      expect(trap.handleTab("a", false)).toBeUndefined();
    });

    it("should handle single element", () => {
      trap.activate(["only"]);
      expect(trap.handleTab("only", false)).toBe("only");
      expect(trap.handleTab("only", true)).toBe("only");
    });
  });
});

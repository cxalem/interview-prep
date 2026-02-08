import { describe, it, expect, vi } from "vitest";
import {
  StateMachine,
  createTransactionMachine,
  type StateMachineConfig,
} from "./index";

// ===== Simple traffic light machine for generic tests =====
type LightState = "green" | "yellow" | "red";
type LightEvent = "NEXT" | "EMERGENCY";
interface LightContext {
  count: number;
}

const trafficLightConfig: StateMachineConfig<LightState, LightEvent, LightContext> = {
  initial: "green",
  context: { count: 0 },
  states: {
    green: {
      on: {
        NEXT: {
          target: "yellow",
          action: (ctx) => ({ ...ctx, count: ctx.count + 1 }),
        },
        EMERGENCY: "red",
      },
    },
    yellow: {
      on: {
        NEXT: "red",
      },
    },
    red: {
      on: {
        NEXT: "green",
      },
    },
  },
};

describe("StateMachine (generic)", () => {
  describe("initialization", () => {
    it("should start in the initial state", () => {
      const machine = new StateMachine(trafficLightConfig);
      expect(machine.getState().value).toBe("green");
    });

    it("should have the initial context", () => {
      const machine = new StateMachine(trafficLightConfig);
      expect(machine.getState().context).toEqual({ count: 0 });
    });
  });

  describe("send", () => {
    it("should transition to the target state", () => {
      const machine = new StateMachine(trafficLightConfig);
      machine.send("NEXT");
      expect(machine.getState().value).toBe("yellow");
    });

    it("should support shorthand target (string instead of object)", () => {
      const machine = new StateMachine(trafficLightConfig);
      machine.send("EMERGENCY");
      expect(machine.getState().value).toBe("red");
    });

    it("should throw on invalid transition", () => {
      const machine = new StateMachine(trafficLightConfig);
      machine.send("NEXT"); // green -> yellow
      // yellow has no EMERGENCY transition
      expect(() => machine.send("EMERGENCY")).toThrow();
    });

    it("should update context via transition action", () => {
      const machine = new StateMachine(trafficLightConfig);
      machine.send("NEXT"); // green -> yellow, action increments count
      expect(machine.getState().context.count).toBe(1);
    });
  });

  describe("matches", () => {
    it("should return true for current state", () => {
      const machine = new StateMachine(trafficLightConfig);
      expect(machine.matches("green")).toBe(true);
      expect(machine.matches("yellow")).toBe(false);
    });
  });

  describe("canSend", () => {
    it("should return true for valid transitions", () => {
      const machine = new StateMachine(trafficLightConfig);
      expect(machine.canSend("NEXT")).toBe(true);
      expect(machine.canSend("EMERGENCY")).toBe(true);
    });

    it("should return false for invalid transitions", () => {
      const machine = new StateMachine(trafficLightConfig);
      machine.send("NEXT"); // green -> yellow
      expect(machine.canSend("EMERGENCY")).toBe(false);
    });
  });

  describe("guards", () => {
    it("should block transition when guard returns false", () => {
      const config: StateMachineConfig<"a" | "b", "GO", { allowed: boolean }> = {
        initial: "a",
        context: { allowed: false },
        states: {
          a: {
            on: {
              GO: {
                target: "b",
                guard: (ctx) => ctx.allowed,
              },
            },
          },
          b: { on: {} },
        },
      };

      const machine = new StateMachine(config);
      expect(machine.canSend("GO")).toBe(false);
      expect(() => machine.send("GO")).toThrow();
      expect(machine.getState().value).toBe("a");
    });

    it("should allow transition when guard returns true", () => {
      const config: StateMachineConfig<"a" | "b", "GO", { allowed: boolean }> = {
        initial: "a",
        context: { allowed: true },
        states: {
          a: {
            on: {
              GO: {
                target: "b",
                guard: (ctx) => ctx.allowed,
              },
            },
          },
          b: { on: {} },
        },
      };

      const machine = new StateMachine(config);
      expect(machine.canSend("GO")).toBe(true);
      machine.send("GO");
      expect(machine.getState().value).toBe("b");
    });
  });

  describe("entry/exit actions", () => {
    it("should run exit action when leaving a state", () => {
      const exitFn = vi.fn((ctx: LightContext) => ({ ...ctx, count: ctx.count + 10 }));
      const config: StateMachineConfig<LightState, LightEvent, LightContext> = {
        ...trafficLightConfig,
        states: {
          ...trafficLightConfig.states,
          green: {
            ...trafficLightConfig.states.green,
            exit: exitFn,
          },
        },
      };

      const machine = new StateMachine(config);
      machine.send("NEXT");
      expect(exitFn).toHaveBeenCalledTimes(1);
      // exit adds 10, transition action adds 1
      expect(machine.getState().context.count).toBe(11);
    });

    it("should run entry action when entering a state", () => {
      const entryFn = vi.fn((ctx: LightContext) => ({ ...ctx, count: ctx.count + 100 }));
      const config: StateMachineConfig<LightState, LightEvent, LightContext> = {
        ...trafficLightConfig,
        states: {
          ...trafficLightConfig.states,
          yellow: {
            ...trafficLightConfig.states.yellow,
            entry: entryFn,
          },
        },
      };

      const machine = new StateMachine(config);
      machine.send("NEXT"); // green -> yellow
      expect(entryFn).toHaveBeenCalledTimes(1);
      // transition action adds 1, entry adds 100
      expect(machine.getState().context.count).toBe(101);
    });

    it("should run in order: exit -> transition action -> entry", () => {
      const order: string[] = [];

      const config: StateMachineConfig<"a" | "b", "GO", { value: string }> = {
        initial: "a",
        context: { value: "" },
        states: {
          a: {
            on: {
              GO: {
                target: "b",
                action: (ctx) => {
                  order.push("transition");
                  return { ...ctx, value: ctx.value + "T" };
                },
              },
            },
            exit: (ctx) => {
              order.push("exit");
              return { ...ctx, value: ctx.value + "E" };
            },
          },
          b: {
            on: {},
            entry: (ctx) => {
              order.push("entry");
              return { ...ctx, value: ctx.value + "N" };
            },
          },
        },
      };

      const machine = new StateMachine(config);
      machine.send("GO");
      expect(order).toEqual(["exit", "transition", "entry"]);
      expect(machine.getState().context.value).toBe("ETN");
    });
  });

  describe("subscribe", () => {
    it("should notify listeners on transitions", () => {
      const machine = new StateMachine(trafficLightConfig);
      const listener = vi.fn();
      machine.subscribe(listener);

      machine.send("NEXT");
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        value: "yellow",
        context: { count: 1 },
      });
    });

    it("should return an unsubscribe function", () => {
      const machine = new StateMachine(trafficLightConfig);
      const listener = vi.fn();
      const unsubscribe = machine.subscribe(listener);

      machine.send("NEXT");
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      machine.send("NEXT");
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});

describe("createTransactionMachine", () => {
  describe("happy path", () => {
    it("should follow the full lifecycle: idle -> building -> signing -> sending -> confirming -> confirmed", () => {
      const machine = createTransactionMachine();
      expect(machine.matches("idle")).toBe(true);

      machine.send("BUILD");
      expect(machine.matches("building")).toBe(true);

      machine.send("SIGN");
      expect(machine.matches("signing")).toBe(true);

      machine.send("SEND");
      expect(machine.matches("sending")).toBe(true);

      machine.send("CONFIRM");
      expect(machine.matches("confirming")).toBe(true);

      machine.send("CONFIRM");
      expect(machine.matches("confirmed")).toBe(true);
    });
  });

  describe("error path", () => {
    it("should transition to failed from sending", () => {
      const machine = createTransactionMachine();
      machine.send("BUILD");
      machine.send("SIGN");
      machine.send("SEND");
      machine.send("FAIL");

      expect(machine.matches("failed")).toBe(true);
    });

    it("should transition to failed from confirming", () => {
      const machine = createTransactionMachine();
      machine.send("BUILD");
      machine.send("SIGN");
      machine.send("SEND");
      machine.send("CONFIRM");
      machine.send("FAIL");

      expect(machine.matches("failed")).toBe(true);
    });
  });

  describe("retry", () => {
    it("should allow retry from failed state", () => {
      const machine = createTransactionMachine();
      machine.send("BUILD");
      machine.send("SIGN");
      machine.send("SEND");
      machine.send("FAIL");

      machine.send("RETRY");
      expect(machine.matches("idle")).toBe(true);
      expect(machine.getState().context.retryCount).toBe(1);
    });

    it("should increment retryCount on each retry", () => {
      const machine = createTransactionMachine();

      // First attempt + fail
      machine.send("BUILD");
      machine.send("SIGN");
      machine.send("SEND");
      machine.send("FAIL");
      machine.send("RETRY");
      expect(machine.getState().context.retryCount).toBe(1);

      // Second attempt + fail
      machine.send("BUILD");
      machine.send("SIGN");
      machine.send("SEND");
      machine.send("FAIL");
      machine.send("RETRY");
      expect(machine.getState().context.retryCount).toBe(2);
    });

    it("should block retry when retryCount >= 3", () => {
      const machine = createTransactionMachine();

      for (let i = 0; i < 3; i++) {
        machine.send("BUILD");
        machine.send("SIGN");
        machine.send("SEND");
        machine.send("FAIL");
        machine.send("RETRY");
      }

      // 4th attempt fails
      machine.send("BUILD");
      machine.send("SIGN");
      machine.send("SEND");
      machine.send("FAIL");

      expect(machine.getState().context.retryCount).toBe(3);
      expect(machine.canSend("RETRY")).toBe(false);
      expect(() => machine.send("RETRY")).toThrow();
    });
  });

  describe("reset", () => {
    it("should reset from confirmed to idle", () => {
      const machine = createTransactionMachine();
      machine.send("BUILD");
      machine.send("SIGN");
      machine.send("SEND");
      machine.send("CONFIRM");
      machine.send("CONFIRM");

      machine.send("RESET");
      expect(machine.matches("idle")).toBe(true);
      expect(machine.getState().context).toEqual({
        signature: null,
        error: null,
        retryCount: 0,
      });
    });

    it("should reset from failed to idle", () => {
      const machine = createTransactionMachine();
      machine.send("BUILD");
      machine.send("SIGN");
      machine.send("SEND");
      machine.send("FAIL");

      machine.send("RESET");
      expect(machine.matches("idle")).toBe(true);
    });
  });

  describe("invalid transitions", () => {
    it("should throw when sending invalid event for current state", () => {
      const machine = createTransactionMachine();
      // idle state cannot receive SIGN directly
      expect(() => machine.send("SIGN")).toThrow();
    });

    it("should not allow BUILD from confirmed", () => {
      const machine = createTransactionMachine();
      machine.send("BUILD");
      machine.send("SIGN");
      machine.send("SEND");
      machine.send("CONFIRM");
      machine.send("CONFIRM");

      expect(() => machine.send("BUILD")).toThrow();
    });
  });

  describe("context updates", () => {
    it("should have correct initial context", () => {
      const machine = createTransactionMachine();
      expect(machine.getState().context).toEqual({
        signature: null,
        error: null,
        retryCount: 0,
      });
    });
  });
});

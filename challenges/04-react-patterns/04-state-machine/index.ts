/**
 * Challenge 4.4: State Machine (Transaction Lifecycle)
 *
 * Implement a finite state machine with guards, entry/exit actions,
 * and context. Then create a pre-configured machine for the Solana
 * transaction lifecycle.
 */

export type Unsubscribe = () => void;

/**
 * Transition configuration for an event.
 * Can be a shorthand string (just the target state) or a full config object.
 */
export interface TransitionConfig<TState extends string, TContext> {
  target: TState;
  guard?: (context: TContext) => boolean;
  action?: (context: TContext) => TContext;
}

/**
 * Configuration for a single state node.
 */
export interface StateConfig<TState extends string, TEvent extends string, TContext> {
  on?: Partial<Record<TEvent, TransitionConfig<TState, TContext> | TState>>;
  entry?: (context: TContext) => TContext;
  exit?: (context: TContext) => TContext;
}

/**
 * Full state machine configuration.
 */
export interface StateMachineConfig<TState extends string, TEvent extends string, TContext> {
  initial: TState;
  context: TContext;
  states: Record<TState, StateConfig<TState, TEvent, TContext>>;
}

/**
 * State machine snapshot — the current state value and context.
 */
export interface MachineState<TState extends string, TContext> {
  value: TState;
  context: TContext;
}

export type MachineListener<TState extends string, TContext> = (
  state: MachineState<TState, TContext>
) => void;

export class StateMachine<TState extends string, TEvent extends string, TContext> {
  /**
   * @param config - The full state machine configuration
   */
  constructor(config: StateMachineConfig<TState, TEvent, TContext>) {
    // TODO: Store config, set initial state and context
    // Run entry action for initial state if defined
    throw new Error("Not implemented");
  }

  /**
   * Returns the current state value and context.
   */
  getState(): MachineState<TState, TContext> {
    // TODO: Return { value, context }
    throw new Error("Not implemented");
  }

  /**
   * Check if the machine is in the given state.
   */
  matches(state: TState): boolean {
    // TODO: Compare current state to given state
    throw new Error("Not implemented");
  }

  /**
   * Check if an event can be sent in the current state.
   * Returns true if a valid transition exists AND the guard (if any) passes.
   */
  canSend(event: TEvent): boolean {
    // TODO: Look up transition, check guard
    throw new Error("Not implemented");
  }

  /**
   * Process an event.
   * 1. Look up the transition for the current state + event
   * 2. Check the guard (if any) — if guard fails, throw
   * 3. Run exit action of current state
   * 4. Run transition action (if any)
   * 5. Update state to target
   * 6. Run entry action of new state
   * 7. Notify subscribers
   *
   * Throws if no valid transition exists.
   */
  send(event: TEvent): void {
    // TODO: Implement full transition logic
    throw new Error("Not implemented");
  }

  /**
   * Subscribe to state transitions.
   * Returns an unsubscribe function.
   */
  subscribe(listener: MachineListener<TState, TContext>): Unsubscribe {
    // TODO: Register listener, return unsubscribe
    throw new Error("Not implemented");
  }
}

// ===== Transaction Machine =====

export type TransactionState =
  | "idle"
  | "building"
  | "signing"
  | "sending"
  | "confirming"
  | "confirmed"
  | "failed";

export type TransactionEvent =
  | "BUILD"
  | "SIGN"
  | "SEND"
  | "CONFIRM"
  | "FAIL"
  | "RETRY"
  | "RESET";

export interface TransactionContext {
  signature: string | null;
  error: string | null;
  retryCount: number;
}

/**
 * Create a pre-configured state machine for the Solana transaction lifecycle.
 *
 * States: idle -> building -> signing -> sending -> confirming -> confirmed | failed
 * With RETRY (failed -> idle, max 3 retries) and RESET (confirmed/failed -> idle)
 */
export function createTransactionMachine(): StateMachine<
  TransactionState,
  TransactionEvent,
  TransactionContext
> {
  // TODO: Return a new StateMachine with the transaction lifecycle config
  // Include guards (RETRY only if retryCount < 3)
  // Include actions (FAIL sets error, RETRY increments retryCount, RESET resets context)
  throw new Error("Not implemented");
}

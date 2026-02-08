// Challenge 1.1: Type-Safe Event System
// =======================================
// Implement a fully type-safe event emitter.
// All tests should pass AND TypeScript should catch type errors at compile time.

// This interface defines the events your emitter must handle in tests:
export interface WalletEvents {
  connect: { publicKey: string };
  disconnect: void;
  accountChanged: { publicKey: string };
  transaction: { signature: string; status: "confirmed" | "failed" };
}

// Wildcard listener payload
export interface WildcardPayload {
  event: string;
  data: unknown;
}

// TODO: Define the callback type that correctly handles void vs non-void payloads
// type EventCallback<T> = ???

// TODO: Implement the TypedEventEmitter class
export class TypedEventEmitter<T extends Record<string, unknown>> {
  // TODO: choose the right data structure for storing listeners

  on<K extends keyof T>(
    event: K,
    callback: unknown // TODO: fix this type
  ): this {
    throw new Error("Not implemented");
  }

  once<K extends keyof T>(
    event: K,
    callback: unknown // TODO: fix this type
  ): this {
    throw new Error("Not implemented");
  }

  off<K extends keyof T>(
    event: K,
    callback: unknown // TODO: fix this type
  ): this {
    throw new Error("Not implemented");
  }

  emit<K extends keyof T>(
    event: K,
    ...args: unknown[] // TODO: fix this type — void events should require no args
  ): void {
    throw new Error("Not implemented");
  }

  // Wildcard: listen to all events
  onAny(callback: (payload: WildcardPayload) => void): this {
    throw new Error("Not implemented");
  }

  offAny(callback: (payload: WildcardPayload) => void): this {
    throw new Error("Not implemented");
  }

  removeAllListeners<K extends keyof T>(event?: K): this {
    throw new Error("Not implemented");
  }

  listenerCount<K extends keyof T>(event: K): number {
    throw new Error("Not implemented");
  }
}

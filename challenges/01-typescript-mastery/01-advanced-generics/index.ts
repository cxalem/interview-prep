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
type EventCallback<Payload> = Payload extends void
  ? () => void
  : (data: Payload) => void;

// TODO: Implement the TypedEventEmitter class
export class TypedEventEmitter<T extends Record<string, unknown>> {
  // TODO: choose the right data structure for storing listeners

  private listeners: Map<keyof T, Array<Function>>;
  private wildcardListeners: Array<(payload: WildcardPayload) => void>;
  private onceSet: Set<Function>;

  constructor() {
    this.listeners = new Map<keyof T, Array<Function>>();
    this.wildcardListeners = new Array<(payload: WildcardPayload) => void>();
    this.onceSet = new Set<Function>();
  }

  on<K extends keyof T>(
    event: K,
    callback: EventCallback<T[K]>, // TODO: fix this type
  ): this {
    if (!this.listeners.get(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback as Function);
    return this;
  }

  once<K extends keyof T>(
    event: K,
    callback: EventCallback<T[K]>, // TODO: fix this type
  ): this {
    this.on(event, callback);
    this.onceSet.add(callback as Function);
    return this;
  }

  off<K extends keyof T>(
    event: K,
    callback: EventCallback<T[K]>, // TODO: fix this type
  ): this {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return this;

    const index = callbacks.indexOf(callback as Function);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    return this;
  }

  emit<K extends keyof T>(
    event: K,
    ...args: T[K] extends void ? [] : [T[K]] // TODO: fix this type — void events should require no args
  ): void {
    const callbacks = this.listeners.get(event);

    if (callbacks) {
      for (const callback of [...callbacks]) {
        callback(...args);
        if (this.onceSet.has(callback)) {
          const index = callbacks.indexOf(callback as Function);
          callbacks.splice(index, 1);
          this.onceSet.delete(callback);
        }
      }
    }

    for (const wildcard of this.wildcardListeners) {
      wildcard({ event: event as string, data: args[0] });
    }
  }

  // Wildcard: listen to all events
  onAny(callback: (payload: WildcardPayload) => void): this {
    this.wildcardListeners.push(callback);
    return this;
  }

  offAny(callback: (payload: WildcardPayload) => void): this {
    const index = this.wildcardListeners.indexOf(callback);
    if (index !== -1) {
      this.wildcardListeners.splice(index, 1);
    }
    return this;
  }

  removeAllListeners<K extends keyof T>(event?: K): this {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners = new Map<keyof T, Array<Function>>();
      this.wildcardListeners = new Array<(payload: WildcardPayload) => void>();
      this.onceSet = new Set<Function>();
    }
    return this;
  }

  listenerCount<K extends keyof T>(event: K): number {
    return this.listeners.get(event)?.length || 0;
  }
}

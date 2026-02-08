/**
 * Challenge 4.2: Render Optimization (Selector Pattern)
 *
 * Implement a state store with selector-based subscriptions.
 * Supports fine-grained reactivity, custom equality functions,
 * and batched updates.
 */

export type Listener<T> = (state: T, prevState: T) => void;
export type SelectorListener<T, S> = (selectedState: S, prevSelectedState: S) => void;
export type EqualityFn<S> = (a: S, b: S) => boolean;
export type Unsubscribe = () => void;

export interface Store<T extends object> {
  /**
   * Returns the current state snapshot.
   */
  getState(): T;

  /**
   * Update state via shallow merge.
   * Accepts a partial state object or an updater function.
   * Multiple calls in the same microtask should be batched.
   */
  setState(partial: Partial<T> | ((prev: T) => Partial<T>)): void;

  /**
   * Subscribe to ALL state changes.
   * Listener receives (newState, prevState).
   */
  subscribe(listener: Listener<T>): Unsubscribe;

  /**
   * Subscribe to selected state changes only.
   * Listener only fires when selector(state) changes according to equalityFn.
   * Default equalityFn is Object.is.
   */
  subscribe<S>(
    selector: (state: T) => S,
    listener: SelectorListener<T, S>,
    equalityFn?: EqualityFn<S>
  ): Unsubscribe;

  /**
   * Remove all subscriptions and clean up.
   */
  destroy(): void;
}

/**
 * Create a new store with the given initial state.
 *
 * @param initialState - The initial state of the store
 * @returns A Store object with getState, setState, subscribe, and destroy methods
 */
export function createStore<T extends object>(initialState: T): Store<T> {
  // TODO: Implement the store
  // - Maintain current state
  // - Support both full listeners and selector-based listeners
  // - Batch multiple setState calls in the same microtask
  // - Shallow merge partial updates into state
  throw new Error("Not implemented");
}

/**
 * Shallow equality comparison.
 * Returns true if both values have the same keys with
 * the same values (compared via Object.is), one level deep.
 *
 * Handles primitives, null, undefined, arrays, and plain objects.
 */
export function shallowEqual<T>(a: T, b: T): boolean {
  // TODO: Implement shallow equality comparison
  // - If Object.is(a, b) is true, return true
  // - If either is not an object or is null, return false
  // - Compare keys length, then compare each value with Object.is
  // - Handle arrays: compare length and each element
  throw new Error("Not implemented");
}

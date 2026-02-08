/**
 * Challenge 3.5: Optimistic Updates
 *
 * Implement an optimistic update system with rollback capabilities.
 * Core UX pattern for Solana wallets and dApps.
 */

type Mutator<T> = (state: T) => T;
type Listener<T> = (state: T) => void;

interface PendingUpdate<T> {
  id: string;
  mutator: Mutator<T>;
}

/**
 * OptimisticStore<T>
 *
 * A generic state store that supports optimistic mutations with
 * confirm/rollback semantics. Optimistic updates are applied
 * immediately but can be rolled back if the underlying operation fails.
 *
 * State is always immutable — new objects are returned, never mutated.
 */
export class OptimisticStore<T> {
  constructor(initialState: T) {
    // TODO: Store the initial state as the confirmed state (deep clone)
    // TODO: Initialize the pending updates list (ordered)
    // TODO: Initialize the subscribers set
    throw new Error("Not implemented");
  }

  /**
   * Returns the current state with all pending optimistic updates applied.
   * Computes this by applying all pending mutators in order to the confirmed state.
   * Returns a new object — never the internal state reference.
   */
  getState(): T {
    // TODO: Start from a clone of the confirmed state
    // TODO: Apply each pending mutator in order
    // TODO: Return the result (new object)
    throw new Error("Not implemented");
  }

  /**
   * Returns only the confirmed (committed) state.
   * Returns a new object — never the internal state reference.
   */
  getConfirmedState(): T {
    // TODO: Return a deep clone of the confirmed state
    throw new Error("Not implemented");
  }

  /**
   * Applies an optimistic mutation identified by `id`.
   *
   * @param id - Unique identifier for this optimistic update
   * @param mutator - Function that takes current state and returns new state
   * @returns A rollback function that removes this specific optimistic update
   * @throws If an update with the same id already exists
   */
  applyOptimistic(id: string, mutator: Mutator<T>): () => void {
    // TODO: Check for duplicate id — throw if exists
    // TODO: Add { id, mutator } to the pending updates list
    // TODO: Notify all subscribers with the new state
    // TODO: Return a rollback function that calls this.rollback(id)
    throw new Error("Not implemented");
  }

  /**
   * Confirms an optimistic update, making it permanent.
   * The mutator is applied to the confirmed state and removed from pending.
   *
   * @param id - The id of the optimistic update to confirm
   * @throws If no pending update with this id exists
   */
  confirm(id: string): void {
    // TODO: Find the pending update by id — throw if not found
    // TODO: Apply the mutator to the confirmed state
    // TODO: Remove the update from the pending list
    // TODO: Notify all subscribers with the new state
    throw new Error("Not implemented");
  }

  /**
   * Rolls back a specific optimistic update.
   * The update is removed and remaining updates are re-applied.
   *
   * @param id - The id of the optimistic update to roll back
   * @throws If no pending update with this id exists
   */
  rollback(id: string): void {
    // TODO: Find the pending update by id — throw if not found
    // TODO: Remove it from the pending list
    // TODO: Notify all subscribers with the new state (remaining updates re-applied)
    throw new Error("Not implemented");
  }

  /**
   * Rolls back all pending optimistic updates.
   * State reverts to the confirmed state.
   */
  rollbackAll(): void {
    // TODO: Clear all pending updates
    // TODO: Notify all subscribers with the confirmed state
    throw new Error("Not implemented");
  }

  /**
   * Registers a listener for state changes.
   *
   * @param listener - Called with the current state on every change
   * @returns An unsubscribe function
   */
  subscribe(listener: Listener<T>): () => void {
    // TODO: Add listener to the subscribers set
    // TODO: Return a function that removes the listener
    throw new Error("Not implemented");
  }
}

/**
 * Challenge 4.1: useAsyncData Hook (Pure Logic)
 *
 * Implement the core logic of a data fetching hook.
 * Manages async state, deduplication, stale-while-revalidate,
 * auto-refetch, and cancellation.
 */

export interface AsyncDataState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isStale: boolean;
}

export type Fetcher<T> = (signal: AbortSignal) => Promise<T>;
export type Listener<T> = (state: AsyncDataState<T>) => void;
export type Unsubscribe = () => void;

export class AsyncDataManager<T> {
  /**
   * Get the current state snapshot.
   */
  getState(): AsyncDataState<T> {
    // TODO: Return the current state
    throw new Error("Not implemented");
  }

  /**
   * Execute an async fetcher function.
   * - Transitions state: sets isLoading to true, then data or error on completion.
   * - Passes an AbortSignal to the fetcher for cancellation support.
   * - Supports stale-while-revalidate: if data exists and is stale, keep it visible while loading.
   * - Supports deduplication: if a fetch is already in flight, do not start another.
   */
  fetch(fetcher: Fetcher<T>): Promise<T | null> {
    // TODO: Implement fetch with state transitions, deduplication, and SWR
    throw new Error("Not implemented");
  }

  /**
   * Re-run the last fetcher function.
   * Throws if no fetcher has been set yet.
   */
  refetch(): Promise<T | null> {
    // TODO: Re-execute the last fetcher
    throw new Error("Not implemented");
  }

  /**
   * Optimistically set data without fetching.
   * Clears any existing error and sets isStale to false.
   */
  mutate(data: T): void {
    // TODO: Set data optimistically
    throw new Error("Not implemented");
  }

  /**
   * Mark current data as stale without clearing it.
   */
  invalidate(): void {
    // TODO: Set isStale to true
    throw new Error("Not implemented");
  }

  /**
   * Cancel the in-flight request.
   * Aborts the AbortController, sets isLoading to false.
   * Does not clear existing data.
   */
  cancel(): void {
    // TODO: Cancel in-flight request via AbortController
    throw new Error("Not implemented");
  }

  /**
   * Subscribe to state changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: Listener<T>): Unsubscribe {
    // TODO: Register listener and return unsubscribe function
    throw new Error("Not implemented");
  }

  /**
   * Start automatically refetching on an interval.
   * Each interval tick calls refetch().
   */
  startAutoRefetch(intervalMs: number): void {
    // TODO: Set up interval-based refetching
    throw new Error("Not implemented");
  }

  /**
   * Stop the auto-refetch interval.
   */
  stopAutoRefetch(): void {
    // TODO: Clear the auto-refetch interval
    throw new Error("Not implemented");
  }
}

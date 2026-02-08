/**
 * Challenge 2.3: Priority Queue (Min-Heap)
 *
 * Implement a generic priority queue backed by a binary heap.
 * Useful for modeling transaction priority fee ordering on Solana.
 */

export type Comparator<T> = (a: T, b: T) => number;

export class PriorityQueue<T> {
  private comparator: Comparator<T>;

  /**
   * @param comparator - Comparison function that determines priority.
   *   Returns negative if `a` has higher priority than `b`,
   *   positive if `b` has higher priority, 0 if equal.
   */
  constructor(comparator: Comparator<T>) {
    this.comparator = comparator;

    // TODO: Initialize the internal heap array
  }

  /**
   * Add an item to the priority queue.
   * O(log n) time complexity.
   */
  enqueue(item: T): void {
    // TODO: Implement
    // - Add item to the end of the heap array
    // - Bubble up to restore heap property
    throw new Error("Not implemented");
  }

  /**
   * Remove and return the highest priority item.
   * Returns undefined if the queue is empty.
   * O(log n) time complexity.
   */
  dequeue(): T | undefined {
    // TODO: Implement
    // - If empty, return undefined
    // - Save the root (index 0) as the result
    // - Move the last element to the root
    // - Sink down to restore heap property
    // - Return the saved root
    throw new Error("Not implemented");
  }

  /**
   * View the highest priority item without removing it.
   * Returns undefined if the queue is empty.
   * O(1) time complexity.
   */
  peek(): T | undefined {
    // TODO: Implement
    throw new Error("Not implemented");
  }

  /**
   * Returns the current number of items in the queue.
   */
  get size(): number {
    // TODO: Implement
    throw new Error("Not implemented");
  }

  /**
   * Returns true if the queue has no items.
   */
  isEmpty(): boolean {
    // TODO: Implement
    throw new Error("Not implemented");
  }

  /**
   * Returns all items sorted by priority without modifying the queue.
   * O(n log n) time complexity.
   */
  toArray(): T[] {
    // TODO: Implement
    // - Clone the queue (or the internal heap)
    // - Dequeue everything from the clone into a result array
    // - Return the result
    throw new Error("Not implemented");
  }

  /**
   * Find an item matching the predicate, replace it with newItem,
   * and re-heapify to maintain the heap property.
   *
   * @param predicate - Function to find the item to replace
   * @param newItem - The replacement item
   * @returns true if an item was found and replaced, false otherwise
   */
  changePriority(predicate: (item: T) => boolean, newItem: T): boolean {
    // TODO: Implement
    // - Find the index of the first item matching the predicate
    // - Replace it with newItem
    // - Bubble up OR sink down depending on new priority
    // - Return true if found, false if not
    throw new Error("Not implemented");
  }

  // ─── Private helpers ──────────────────────────────────────────

  /**
   * Restore heap property by moving an element up.
   */
  private bubbleUp(index: number): void {
    // TODO: Implement
    // Parent index: Math.floor((index - 1) / 2)
    throw new Error("Not implemented");
  }

  /**
   * Restore heap property by moving an element down.
   */
  private sinkDown(index: number): void {
    // TODO: Implement
    // Left child: 2 * index + 1
    // Right child: 2 * index + 2
    throw new Error("Not implemented");
  }
}

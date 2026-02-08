# Challenge 4.5: Virtual List

| Difficulty | AI Assistance | Time Limit |
|------------|---------------|------------|
| Hard       | None recommended | 60 min  |

## Overview

Implement the virtualization logic for rendering large lists efficiently (activity feed, token list). Tests your understanding of windowing algorithms — the math behind only rendering visible items plus a small overscan buffer.

## Requirements

### `VirtualList` class

Calculates which items are visible in a scrollable viewport.

**Constructor**:
```ts
{
  itemCount: number;
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;  // default: 3 — extra items to render above/below viewport
}
```

**Methods**:
- **`getVisibleRange(scrollTop: number)`** — Returns the range of items to render:
  ```ts
  {
    startIndex: number;   // first item to render (including overscan)
    endIndex: number;     // last item to render (exclusive, including overscan)
    offsetTop: number;    // Y offset of the first visible item (for positioning)
    totalHeight: number;  // total scrollable height
  }
  ```
- **`scrollToIndex(index: number, align: "start" | "center" | "end")`** — Returns the `scrollTop` value needed to show the given item at the specified alignment.
- **`getTotalHeight()`** — Sum of all item heights.
- **`getItemOffset(index: number)`** — Get the Y offset of the item at the given index.
- **`getItemHeight(index: number)`** — Get the height of the item at the given index.

**Fixed vs Variable Height**:
- If `itemHeight` is a number, all items have the same height (fast path).
- If `itemHeight` is a function, each item can have a different height (requires scanning).

### `VirtualGrid` class

Extension for 2D grid layouts (NFT gallery, token grid).

**Constructor**:
```ts
{
  itemCount: number;
  columnCount: number;
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  overscan?: number;  // default: 2 rows
}
```

**Methods**:
- **`getVisibleCells(scrollTop: number)`** — Returns array of visible cells:
  ```ts
  Array<{
    index: number;  // item index (0 to itemCount-1)
    row: number;    // row number (0-indexed)
    col: number;    // column number (0-indexed)
    x: number;      // pixel X position
    y: number;      // pixel Y position
  }>
  ```
- **`getTotalHeight()`** — Total scrollable height (rows * itemHeight).
- **`scrollToIndex(index: number)`** — Returns scrollTop to show the row containing this item.

## Key Concepts

- **Overscan**: Rendering a few extra items above and below the viewport prevents flickering during fast scrolling.
- **Windowing**: Only calculating and "rendering" the items currently in view, rather than all items.
- **Offset calculation**: For variable-height items, you need to sum heights up to the target index.

## Solana Context

Virtualization is essential for:
- Token list with 100s of SPL tokens
- Transaction history that can grow to 1000s of entries
- NFT gallery grid with images of varying sizes
- Activity feed with real-time updates

## Running Tests

```bash
npx vitest run challenges/04-react-patterns/05-virtual-list
```

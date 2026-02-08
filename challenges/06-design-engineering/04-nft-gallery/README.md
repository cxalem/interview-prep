# Challenge 6.4: NFT Gallery State

## Difficulty: Hard
## AI Assistance: None recommended
## Time: 60 minutes

---

## Overview

Build the state and data management for an NFT gallery with filtering, sorting, lazy loading, and selection. This challenge tests your ability to manage a complex data layer with multiple interacting concerns: pagination, client-side filtering, sorting, search, and multi-select.

**Important:** This is a design engineering challenge. We test the **state logic**, not the rendering.

---

## Requirements

### `NFTGalleryManager`

#### NFT Shape

```typescript
{
  id: string;
  name: string;
  image: string;
  collection: string;
  attributes: Record<string, string>;
  price?: number;
  listingStatus: 'listed' | 'unlisted' | 'auction';
}
```

#### Methods

- **`loadPage(page, pageSize)`** — Async pagination using a provided fetcher. Replaces current items for that page.
- **`loadMore()`** — Infinite scroll support. Appends the next page of results to existing items.
- **`setFilter(filters)`** — Filter by collection, attribute, price range, listing status. Filters are applied client-side on loaded data.
- **`setSort(field, direction)`** — Sort by `name`, `price`, or `recent`. Direction is `asc` or `desc`.
- **`search(query)`** — Client-side fuzzy search by name on loaded items.
- **`getFilteredItems()`** — Returns the current filtered, sorted, and searched view of loaded items.
- **`getCollections()`** — Returns unique collection names from all loaded data.
- **`getAttributeValues(traitType)`** — Returns unique values for a given trait type across loaded data.
- **`selectItem(id)`** / **`deselectItem(id)`** — Toggle selection on individual items.
- **`selectAll()`** — Select all currently filtered items.
- **`deselectAll()`** — Clear all selections.
- **`getSelection()`** — Returns the currently selected items.
- **`getState()`** — Returns `{ isLoading, hasMore, error, currentPage, totalLoaded }`.
- **`subscribe(listener)`** — Register a callback for state changes. Returns an unsubscribe function.

---

## Examples

```typescript
const fetcher = async (page, pageSize) => ({
  items: [...],
  total: 100,
  hasMore: true,
});

const gallery = new NFTGalleryManager(fetcher);
await gallery.loadPage(1, 20);
gallery.setFilter({ collection: 'DeGods' });
gallery.setSort('price', 'desc');
const items = gallery.getFilteredItems();
```

---

## Evaluation Criteria

- Correct pagination and infinite scroll behavior
- Proper client-side filtering with multiple simultaneous filter criteria
- Sorting stability and correctness
- Fuzzy search that is reasonably tolerant of typos or partial matches
- Selection management that works correctly with filtering
- Clean subscriber notification pattern

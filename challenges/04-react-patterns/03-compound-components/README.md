# Challenge 4.3: Compound Components (Disclosure Pattern)

| Difficulty | AI Assistance | Time Limit |
|------------|---------------|------------|
| Medium     | Minimal       | 45 min     |

## Overview

Implement the state machine logic for a compound component system (modal/disclosure). Tests your understanding of component composition patterns used in wallet UIs — connect modal, transaction detail sheets, settings panels, etc.

## Requirements

### `DisclosureManager` class

Manages open/close state with animation support.

**States**: `closed` -> `opening` -> `open` -> `closing` -> `closed`

**Constructor**: `{ animationDuration?: number }` (default: 300ms)

**Methods**:
- **`open()`** — Transition from `closed` to `opening`, then to `open` after animation duration.
- **`close()`** — Transition from `open` to `closing`, then to `closed` after animation duration.
- **`toggle()`** — Open if closed, close if open. No-op if animating.
- **`onStateChange(listener: (state) => void)`** — Subscribe to state transitions. Returns an unsubscribe function.

**Getters**:
- **`state`** — Current state string (`closed`, `opening`, `open`, `closing`)
- **`isOpen`** — `true` when state is `open` or `opening`
- **`isAnimating`** — `true` when state is `opening` or `closing`

### `StackManager` class

Manages a stack of disclosures (like nested modals).

**Methods**:
- **`push(id: string)`** — Push a new disclosure onto the stack.
- **`pop()`** — Remove and return the top disclosure. Returns the popped id or `undefined`.
- **`popTo(id: string)`** — Pop all disclosures above the given id (inclusive of everything above, keeping the target).
- **`popAll()`** — Clear the entire stack.
- **`has(id: string)`** — Check if an id is in the stack.

**Getters**:
- **`current`** — The id at the top of the stack, or `undefined` if empty.
- **`stack`** — A readonly copy of the full stack array.
- **`size`** — Number of items in the stack.

### `FocusTrapManager` class

Manages focus trapping logic for accessibility.

**Methods**:
- **`activate(elementIds: string[])`** — Set the list of focusable element IDs. Focus trap is now active.
- **`deactivate()`** — Release the focus trap. Clears element list.
- **`handleTab(currentFocusId: string, shiftKey: boolean)`** — Returns the next element ID that should receive focus. Wraps around at boundaries.

**Getters**:
- **`isActive`** — Whether the focus trap is currently active.
- **`elements`** — The current list of trapped element IDs.

**Behavior**:
- Tab (shiftKey=false): Move to next element, wrap from last to first.
- Shift+Tab (shiftKey=true): Move to previous element, wrap from first to last.
- If current element is not in the list, return the first element.

## Solana Context

These patterns power every wallet interaction:
- Connect wallet modal with focus trapping for accessibility
- Transaction confirmation sheets stacked on top of each other
- Settings/account menus with animated open/close transitions

## Running Tests

```bash
npx vitest run challenges/04-react-patterns/03-compound-components
```

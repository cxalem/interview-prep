# Challenge 2.4: Trie (Autocomplete)

| Difficulty | AI Assistance | Time Limit |
|------------|--------------|------------|
| Medium     | Partial      | 45 min     |

## Problem

Build a **Trie** (prefix tree) for token search and autocomplete functionality — like the search bar in a Solana wallet where you type "SO" and it suggests "SOL", "SONIC", "SOLAMA", etc.

## Requirements

### TrieNode

Each node should contain:
- A map of children (character -> TrieNode)
- A flag indicating if this node marks the end of a word
- Optional metadata of type `T` associated with completed words
- A frequency counter for ranking autocomplete results

### Trie\<T\> Class

- **`insert(word: string, metadata?: T)`** — Insert a word into the trie with optional metadata. If the word already exists, update its metadata.
- **`search(word: string)`** — Returns `true` if the exact word exists in the trie.
- **`startsWith(prefix: string)`** — Returns `true` if any word in the trie starts with the given prefix.
- **`autocomplete(prefix: string, limit?: number)`** — Returns an array of `{ word: string, metadata?: T, frequency: number }` objects for all words matching the prefix, sorted by frequency (highest first). If `limit` is provided, return at most that many results.
- **`incrementFrequency(word: string)`** — Increments the search frequency of a word. Returns `true` if the word exists, `false` otherwise.
- **`delete(word: string)`** — Removes a word from the trie. Returns `true` if the word existed.
- **`getAllWords()`** — Returns an array of all words stored in the trie.

## Hints

- Each character in a word maps to an edge in the trie.
- To find all words with a prefix, navigate to the prefix node, then perform a DFS/BFS to collect all complete words below it.
- For autocomplete, collect results and sort by frequency before returning.
- For deletion, remove the end-of-word marker. Optionally prune nodes that are no longer part of any word.

## Example

```typescript
const trie = new Trie<{ symbol: string }>();

trie.insert("solana", { symbol: "SOL" });
trie.insert("sonic", { symbol: "SONIC" });
trie.insert("usdc", { symbol: "USDC" });
trie.insert("usdt", { symbol: "USDT" });

trie.search("solana");        // true
trie.search("sol");           // false
trie.startsWith("sol");       // true

trie.incrementFrequency("solana");
trie.incrementFrequency("solana");
trie.incrementFrequency("sonic");

trie.autocomplete("so");
// [
//   { word: "solana", metadata: { symbol: "SOL" }, frequency: 2 },
//   { word: "sonic", metadata: { symbol: "SONIC" }, frequency: 1 },
// ]

trie.autocomplete("us", 1);
// [ { word: "usdc", metadata: { symbol: "USDC" }, frequency: 0 } ]
// (only 1 result due to limit; usdc and usdt both have freq 0, order is stable)
```

## Relevance to Solana

Token lists on Solana can have thousands of tokens. A trie enables instant prefix-based search for token names and symbols in wallet UIs, DEX interfaces, and portfolio trackers.

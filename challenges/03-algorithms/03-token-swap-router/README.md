# Challenge 3.3: Token Swap Router

## Difficulty: Hard

## AI Assistance: Minimal

## Time Limit: 60 minutes

## Problem

Find the optimal swap route between two tokens given a graph of liquidity pools. This is a modified shortest path / graph problem directly relevant to how **Jupiter aggregator** routes trades across Solana DEXes.

Given a set of liquidity pools, each with reserves and a fee, compute the best route from one token to another. Routes may be multi-hop (e.g., SOL -> USDC -> BONK) and must account for the constant product AMM formula.

## Requirements

### `findBestRoute(tokenIn: string, tokenOut: string, amount: number, pools: Pool[]): Route | null`

- Finds the route that produces the maximum output amount
- Returns `null` if no route exists between the two tokens
- Considers all possible routes up to a reasonable hop limit (e.g., 4)
- Applies the constant product formula at each hop

### `findAllRoutes(tokenIn: string, tokenOut: string, pools: Pool[], maxHops: number): Route[]`

- Finds all possible routes between two tokens up to `maxHops` swaps
- Does not use the same pool twice in a single route
- Returns routes sorted by output amount (best first) -- use an `amount` of 1 as input to calculate the output amount for sorting purposes
- Each route includes the path of tokens and the pools used

### `estimatePriceImpact(route: Route, amount: number, pools: Pool[]): number`

- Calculates the price impact as a percentage
- Price impact = `((spotPrice - executionPrice) / spotPrice) * 100`
- Spot price uses infinitesimal amount; execution price uses the actual amount
- Returns the value as a percentage (e.g., 2.5 for 2.5%)

## AMM Formula

Uses the **constant product formula** (x * y = k):

```
outputAmount = (reserveOut * amountIn * (1 - fee)) / (reserveIn + amountIn * (1 - fee))
```

Where:
- `reserveIn` = reserve of the input token in the pool
- `reserveOut` = reserve of the output token in the pool
- `amountIn` = amount being swapped in
- `fee` = pool fee as a decimal (e.g., 0.003 for 0.3%)

## Type Definitions

```typescript
interface Pool {
  id: string;
  tokenA: string;
  tokenB: string;
  reserveA: number;
  reserveB: number;
  fee: number; // e.g., 0.003 for 0.3%
}

interface Route {
  path: string[];         // e.g., ["SOL", "USDC", "BONK"]
  pools: string[];        // pool IDs used at each hop
  expectedOutput: number; // final output amount
}
```

## Examples

```typescript
const pools: Pool[] = [
  { id: "sol-usdc", tokenA: "SOL", tokenB: "USDC", reserveA: 1000, reserveB: 150000, fee: 0.003 },
  { id: "usdc-bonk", tokenA: "USDC", tokenB: "BONK", reserveA: 50000, reserveB: 5000000000, fee: 0.003 },
  { id: "sol-bonk", tokenA: "SOL", tokenB: "BONK", reserveA: 500, reserveB: 2500000000, fee: 0.01 },
];

// Direct route: SOL -> BONK via sol-bonk pool
// Multi-hop route: SOL -> USDC -> BONK via sol-usdc then usdc-bonk

findBestRoute("SOL", "BONK", 10, pools);
// Returns the route with the higher output amount
```

## Hints

- Build a graph where tokens are nodes and pools are edges
- Use DFS or BFS to enumerate all paths up to maxHops
- At each hop, calculate output using the constant product formula
- For `estimatePriceImpact`, compare the ratio from a very small trade vs the actual trade
- Remember pools are bidirectional — you can swap A->B or B->A
- Do not modify pool reserves during route calculation (assume independent pricing)

import { describe, it, expect, vi } from "vitest";
import {
  calculateSwapOutput,
  findBestRoute,
  findAllRoutes,
  estimatePriceImpact,
  Pool,
  Route,
} from "./index";

// Realistic pool data modeled after Solana DEX pools
const POOLS: Pool[] = [
  {
    id: "sol-usdc",
    tokenA: "SOL",
    tokenB: "USDC",
    reserveA: 10000,
    reserveB: 1500000,
    fee: 0.003,
  },
  {
    id: "usdc-bonk",
    tokenA: "USDC",
    tokenB: "BONK",
    reserveA: 500000,
    reserveB: 50000000000,
    fee: 0.003,
  },
  {
    id: "sol-bonk",
    tokenA: "SOL",
    tokenB: "BONK",
    reserveA: 5000,
    reserveB: 25000000000,
    fee: 0.01,
  },
  {
    id: "usdc-usdt",
    tokenA: "USDC",
    tokenB: "USDT",
    reserveA: 10000000,
    reserveB: 10000000,
    fee: 0.001,
  },
  {
    id: "sol-msol",
    tokenA: "SOL",
    tokenB: "mSOL",
    reserveA: 50000,
    reserveB: 47000,
    fee: 0.002,
  },
  {
    id: "msol-usdc",
    tokenA: "mSOL",
    tokenB: "USDC",
    reserveA: 20000,
    reserveB: 3200000,
    fee: 0.003,
  },
];

describe("Challenge 3.3: Token Swap Router", () => {
  describe("calculateSwapOutput", () => {
    it("should calculate output for a simple swap", () => {
      // Pool: 1000 SOL / 150000 USDC, 0.3% fee
      // Swapping 10 SOL in
      const output = calculateSwapOutput(10, 1000, 150000, 0.003);

      // amountInWithFee = 10 * (1 - 0.003) = 9.97
      // output = (150000 * 9.97) / (1000 + 9.97) = 1495500 / 1009.97 ~= 1480.74
      expect(output).toBeCloseTo(1480.74, 0);
    });

    it("should return 0 output for 0 input", () => {
      const output = calculateSwapOutput(0, 1000, 150000, 0.003);
      expect(output).toBe(0);
    });

    it("should return less output with higher fees", () => {
      const lowFee = calculateSwapOutput(10, 1000, 150000, 0.001);
      const highFee = calculateSwapOutput(10, 1000, 150000, 0.01);
      expect(lowFee).toBeGreaterThan(highFee);
    });

    it("should handle very small amounts", () => {
      const output = calculateSwapOutput(0.001, 1000, 150000, 0.003);
      expect(output).toBeGreaterThan(0);
      // For very small amounts, output should be close to the spot price ratio
      // spotPrice ~= 150000/1000 = 150
      expect(output).toBeCloseTo(0.001 * 150, 1);
    });

    it("should handle large amounts with significant price impact", () => {
      // Swapping 500 SOL into a pool of 1000 SOL — massive price impact
      const output = calculateSwapOutput(500, 1000, 150000, 0.003);
      // Without price impact, 500 SOL would give 75000 USDC
      // With constant product, it should be significantly less
      expect(output).toBeLessThan(75000);
      expect(output).toBeGreaterThan(0);
    });
  });

  describe("findBestRoute", () => {
    it("should find a direct route between two tokens", () => {
      const result = findBestRoute("SOL", "USDC", 10, POOLS);

      expect(result).not.toBeNull();
      expect(result!.path[0]).toBe("SOL");
      expect(result!.path[result!.path.length - 1]).toBe("USDC");
      expect(result!.expectedOutput).toBeGreaterThan(0);
    });

    it("should find a multi-hop route when it gives better output", () => {
      // SOL -> BONK can go direct (sol-bonk with 1% fee) or via USDC (0.3% + 0.3%)
      const result = findBestRoute("SOL", "BONK", 10, POOLS);

      expect(result).not.toBeNull();
      expect(result!.path[0]).toBe("SOL");
      expect(result!.path[result!.path.length - 1]).toBe("BONK");
      expect(result!.expectedOutput).toBeGreaterThan(0);
    });

    it("should return null when no route exists", () => {
      const isolatedPools: Pool[] = [
        { id: "sol-usdc", tokenA: "SOL", tokenB: "USDC", reserveA: 1000, reserveB: 150000, fee: 0.003 },
      ];
      const result = findBestRoute("SOL", "BONK", 10, isolatedPools);
      expect(result).toBeNull();
    });

    it("should handle a swap in the reverse direction of pool token order", () => {
      // Pool is defined as SOL/USDC but we want USDC -> SOL
      const result = findBestRoute("USDC", "SOL", 1500, POOLS);

      expect(result).not.toBeNull();
      expect(result!.path[0]).toBe("USDC");
      expect(result!.path[result!.path.length - 1]).toBe("SOL");
      expect(result!.expectedOutput).toBeGreaterThan(0);
    });

    it("should find routes with up to 3 hops", () => {
      // SOL -> mSOL -> USDC -> USDT requires 3 hops
      const result = findBestRoute("SOL", "USDT", 10, POOLS);

      expect(result).not.toBeNull();
      expect(result!.path[0]).toBe("SOL");
      expect(result!.path[result!.path.length - 1]).toBe("USDT");
      expect(result!.pools.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle swapping the same token (returns zero route)", () => {
      const result = findBestRoute("SOL", "SOL", 10, POOLS);
      // Either returns null or a route with amount=10 and path=["SOL"]
      if (result !== null) {
        expect(result.expectedOutput).toBe(10);
      }
    });
  });

  describe("findAllRoutes", () => {
    it("should find all routes up to maxHops", () => {
      const routes = findAllRoutes("SOL", "USDC", POOLS, 3);

      expect(routes.length).toBeGreaterThanOrEqual(1);
      // Direct route via sol-usdc
      // Indirect via sol-msol -> msol-usdc
      expect(routes.length).toBeGreaterThanOrEqual(2);
    });

    it("should sort routes by output descending", () => {
      const routes = findAllRoutes("SOL", "USDC", POOLS, 3);

      for (let i = 1; i < routes.length; i++) {
        expect(routes[i - 1].expectedOutput).toBeGreaterThanOrEqual(
          routes[i].expectedOutput
        );
      }
    });

    it("should not reuse the same pool in a single route", () => {
      const routes = findAllRoutes("SOL", "BONK", POOLS, 4);

      for (const route of routes) {
        const poolSet = new Set(route.pools);
        expect(poolSet.size).toBe(route.pools.length);
      }
    });

    it("should respect maxHops limit", () => {
      const routes = findAllRoutes("SOL", "USDT", POOLS, 2);

      for (const route of routes) {
        // Number of hops = number of pools used
        expect(route.pools.length).toBeLessThanOrEqual(2);
      }
    });

    it("should return empty array when no route exists", () => {
      const isolatedPools: Pool[] = [
        { id: "sol-usdc", tokenA: "SOL", tokenB: "USDC", reserveA: 1000, reserveB: 150000, fee: 0.003 },
      ];
      const routes = findAllRoutes("SOL", "BONK", isolatedPools, 4);
      expect(routes).toEqual([]);
    });

    it("should find routes in both pool directions", () => {
      const simplePools: Pool[] = [
        { id: "a-b", tokenA: "A", tokenB: "B", reserveA: 1000, reserveB: 2000, fee: 0.003 },
        { id: "b-c", tokenA: "B", tokenB: "C", reserveA: 1000, reserveB: 3000, fee: 0.003 },
      ];
      const routes = findAllRoutes("A", "C", simplePools, 2);
      expect(routes.length).toBe(1);
      expect(routes[0].path).toEqual(["A", "B", "C"]);
    });

    it("should handle maxHops of 1", () => {
      const routes = findAllRoutes("SOL", "USDC", POOLS, 1);

      // Only direct routes
      for (const route of routes) {
        expect(route.pools.length).toBe(1);
        expect(route.path.length).toBe(2);
      }
    });
  });

  describe("estimatePriceImpact", () => {
    it("should return low impact for small trades relative to pool size", () => {
      const route: Route = {
        path: ["SOL", "USDC"],
        pools: ["sol-usdc"],
        expectedOutput: 0, // will be recalculated
      };

      // 1 SOL into a pool with 10000 SOL — very low impact
      const impact = estimatePriceImpact(route, 1, POOLS);
      expect(impact).toBeLessThan(0.1); // less than 0.1%
      expect(impact).toBeGreaterThanOrEqual(0);
    });

    it("should return higher impact for larger trades", () => {
      const route: Route = {
        path: ["SOL", "USDC"],
        pools: ["sol-usdc"],
        expectedOutput: 0,
      };

      const smallImpact = estimatePriceImpact(route, 10, POOLS);
      const largeImpact = estimatePriceImpact(route, 1000, POOLS);

      expect(largeImpact).toBeGreaterThan(smallImpact);
    });

    it("should calculate significant impact for large trades", () => {
      const route: Route = {
        path: ["SOL", "USDC"],
        pools: ["sol-usdc"],
        expectedOutput: 0,
      };

      // 5000 SOL into pool with 10000 SOL — ~33% impact expected
      const impact = estimatePriceImpact(route, 5000, POOLS);
      expect(impact).toBeGreaterThan(20);
      expect(impact).toBeLessThan(60);
    });

    it("should handle multi-hop price impact", () => {
      const route: Route = {
        path: ["SOL", "USDC", "BONK"],
        pools: ["sol-usdc", "usdc-bonk"],
        expectedOutput: 0,
      };

      const impact = estimatePriceImpact(route, 100, POOLS);
      expect(impact).toBeGreaterThan(0);
    });

    it("should return approximately zero for near-zero trade amounts", () => {
      const route: Route = {
        path: ["SOL", "USDC"],
        pools: ["sol-usdc"],
        expectedOutput: 0,
      };

      const impact = estimatePriceImpact(route, 0.01, POOLS);
      expect(impact).toBeCloseTo(0, 2);
    });
  });
});

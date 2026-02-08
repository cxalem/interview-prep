// Challenge 6.1: Token Swap UI State
// Difficulty: Hard | Time: 90 min | AI Assistance: None recommended

export interface Token {
  symbol: string;
  mint: string;
  decimals: number;
  balance: number;
}

export interface Route {
  path: Token[];
  estimatedOutput: string;
  priceImpact: number;
  fee: number;
}

export interface QuoteResult {
  outputAmount: string;
  route: Route;
  priceImpact: number;
}

export type SwapStatus =
  | "idle"
  | "approving"
  | "swapping"
  | "confirming"
  | "success"
  | "failed";

export interface SwapState {
  inputToken: Token | null;
  outputToken: Token | null;
  inputAmount: string;
  outputAmount: string;
  slippage: number;
  route: Route | null;
  priceImpact: number | null;
  isLoading: boolean;
  error: string | null;
  status: SwapStatus;
}

export type QuoteFetcher = (
  inputToken: Token,
  outputToken: Token,
  inputAmount: string
) => Promise<QuoteResult>;

export type SwapExecutor = (
  inputToken: Token,
  outputToken: Token,
  inputAmount: string,
  route: Route
) => Promise<string>; // returns tx signature

export type Listener = (state: SwapState) => void;

export class SwapManager {
  // TODO: Store state, quoteFetcher, subscribers, debounce timer, and abort tracking

  constructor(
    quoteFetcher: QuoteFetcher,
    swapExecutor?: SwapExecutor,
    config?: { debounceMs?: number }
  ) {
    // TODO: Initialize state with defaults
    // - slippage defaults to 0.5
    // - status defaults to 'idle'
    // - all tokens/amounts null/empty
    throw new Error("Not implemented");
  }

  getState(): SwapState {
    // TODO: Return a snapshot of the current state
    throw new Error("Not implemented");
  }

  subscribe(listener: Listener): () => void {
    // TODO: Add listener to subscribers set
    // TODO: Return an unsubscribe function that removes the listener
    throw new Error("Not implemented");
  }

  setInputToken(token: Token): void {
    // TODO: Set the input token
    // TODO: Clear inputAmount, outputAmount, route, priceImpact, error
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  setOutputToken(token: Token): void {
    // TODO: Set the output token
    // TODO: Clear inputAmount, outputAmount, route, priceImpact, error
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  setInputAmount(amount: string): void {
    // TODO: Validate the amount is a valid number string
    // TODO: Update inputAmount in state
    // TODO: Trigger a debounced quote fetch (300ms default)
    // TODO: Cancel any pending debounce timer
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  flipTokens(): void {
    // TODO: Swap inputToken and outputToken
    // TODO: Swap inputAmount and outputAmount
    // TODO: Clear route and priceImpact
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  setSlippage(value: number): void {
    // TODO: Validate slippage is between 0.1 and 50
    // TODO: If invalid, set an error and do not change slippage
    // TODO: Update slippage in state
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  async fetchQuote(): Promise<void> {
    // TODO: Validate inputToken, outputToken, and inputAmount are set
    // TODO: Set isLoading to true, clear error
    // TODO: Call the quoteFetcher
    // TODO: If a newer quote request has been made, discard this result (stale cancellation)
    // TODO: On success, update outputAmount, route, priceImpact
    // TODO: On failure, set error
    // TODO: Set isLoading to false
    // TODO: Notify subscribers at each state transition
    throw new Error("Not implemented");
  }

  async executeSwap(): Promise<string> {
    // TODO: Validate all required fields are present
    // TODO: Validate sufficient balance
    // TODO: Drive state machine: idle → approving → swapping → confirming → success | failed
    // TODO: Notify subscribers at each state transition
    // TODO: On failure at any step, set status to 'failed' and set error
    // TODO: Return the transaction signature on success
    throw new Error("Not implemented");
  }

  getMinimumReceived(): number | null {
    // TODO: If outputAmount is not set, return null
    // TODO: Return outputAmount * (1 - slippage / 100)
    throw new Error("Not implemented");
  }
}

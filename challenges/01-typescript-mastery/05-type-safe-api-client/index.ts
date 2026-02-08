// Challenge 1.5: Type-Safe RPC API Client
// ==========================================
// Build a type-safe JSON-RPC client where method names, params, and return types
// are all inferred from a single schema definition.

// ---- Supporting Types ----

export interface AccountInfo {
  lamports: number;
  owner: string;
  data: string;
  executable: boolean;
  rentEpoch: number;
}

export interface TransactionDetail {
  signatures: string[];
  message: {
    accountKeys: string[];
    instructions: Array<{
      programIdIndex: number;
      accounts: number[];
      data: string;
    }>;
  };
  blockTime: number | null;
}

// ---- RPC Schema ----

// TODO: Define a base RpcSchema type constraint.
// It should map method names to { params, response } pairs.
//
// Example:
// interface RpcSchema {
//   [method: string]: {
//     params: Record<string, unknown>;
//     response: unknown;
//   };
// }

// TODO: Define the SolanaRpcSchema that models these methods:
//
// getBalance:
//   params:   { address: string }
//   response: { value: number }
//
// getAccountInfo:
//   params:   { address: string; encoding?: string }
//   response: { value: AccountInfo | null }
//
// getLatestBlockhash:
//   params:   {}
//   response: { blockhash: string; lastValidBlockHeight: number }
//
// sendTransaction:
//   params:   { transaction: string; encoding?: string }
//   response: { signature: string }
//
// getTransaction:
//   params:   { signature: string }
//   response: { transaction: TransactionDetail | null }

export interface SolanaRpcSchema {
  // TODO: implement the schema entries
  [key: string]: { params: any; response: any }; // placeholder — replace this
}

// ---- Middleware ----

// TODO: Define the middleware interface.
// It should support optional beforeRequest and afterResponse hooks.
export interface RpcMiddleware {
  beforeRequest?(method: string, params: unknown): void;
  afterResponse?(method: string, response: unknown): void;
}

// ---- Fetch Type ----

// A type for the fetch function to allow injection in tests
export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

// ---- RPC Client ----

// TODO: Implement the RpcClient class.
// It should be generic over an RPC schema type.
//
// Constructor should accept:
//   - endpoint: string (the RPC URL)
//   - fetchFn: FetchFn (injected fetch, for testability)
//
// Methods:
//   - use(middleware: RpcMiddleware): void — register a middleware
//   - call<M extends keyof Schema>(method: M, params: Schema[M]["params"]): Promise<Schema[M]["response"]>
//
// The call() method should:
//   1. Run all beforeRequest middlewares
//   2. Send a JSON-RPC 2.0 POST request via fetchFn
//   3. Parse the response JSON
//   4. Run all afterResponse middlewares
//   5. Return the result field from the JSON-RPC response

export class RpcClient<Schema extends Record<string, { params: any; response: any }>> {
  // TODO: Store endpoint, fetchFn, and middlewares

  constructor(
    private endpoint: string,
    private fetchFn: FetchFn
  ) {
    // TODO: initialize internal state
  }

  // TODO: Implement use() to register middleware
  use(middleware: RpcMiddleware): void {
    throw new Error("Not implemented");
  }

  // TODO: Implement the type-safe call() method
  // The method name M should be constrained to keys of Schema.
  // The params type should be Schema[M]["params"].
  // The return type should be Promise<Schema[M]["response"]>.
  //
  // JSON-RPC 2.0 request format:
  // {
  //   jsonrpc: "2.0",
  //   id: <unique number>,
  //   method: <method name>,
  //   params: <params>
  // }
  //
  // JSON-RPC 2.0 response format:
  // {
  //   jsonrpc: "2.0",
  //   id: <matching id>,
  //   result: <the result to return>
  // }
  async call<M extends string & keyof Schema>(
    method: M,
    params: Schema[M]["params"]
  ): Promise<Schema[M]["response"]> {
    throw new Error("Not implemented");
  }
}

// ---- Factory Function ----

// TODO: Implement a convenience factory that creates an RpcClient<SolanaRpcSchema>
export function createSolanaRpcClient(
  endpoint: string,
  fetchFn?: FetchFn
): RpcClient<SolanaRpcSchema> {
  throw new Error("Not implemented");
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  RpcClient,
  createSolanaRpcClient,
  type SolanaRpcSchema,
  type RpcMiddleware,
  type FetchFn,
  type AccountInfo,
} from "./index";

// ---- Test Helpers ----

function createMockFetch(responseData: unknown): FetchFn {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        jsonrpc: "2.0",
        id: 1,
        result: responseData,
      }),
  } as Response);
}

function createMockFetchForMultipleCalls(responses: unknown[]): FetchFn {
  const fn = vi.fn();
  responses.forEach((data, index) => {
    fn.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: "2.0",
          id: index + 1,
          result: data,
        }),
    } as Response);
  });
  return fn;
}

const TEST_ENDPOINT = "https://api.devnet.solana.com";

describe("Challenge 1.5: Type-Safe RPC API Client", () => {
  // =========================================
  // Client Creation
  // =========================================
  describe("client creation", () => {
    it("should create a client with endpoint and fetch function", () => {
      const mockFetch = createMockFetch({});
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);
      expect(client).toBeDefined();
    });

    it("should create a Solana RPC client via factory function", () => {
      const mockFetch = createMockFetch({});
      const client = createSolanaRpcClient(TEST_ENDPOINT, mockFetch);
      expect(client).toBeDefined();
    });
  });

  // =========================================
  // getBalance
  // =========================================
  describe("getBalance", () => {
    it("should call getBalance and return typed response", async () => {
      const mockFetch = createMockFetch({ value: 1_000_000_000 });
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const result = await client.call("getBalance", {
        address: "11111111111111111111111111111111",
      });

      expect(result).toEqual({ value: 1_000_000_000 });
    });

    it("should send correct JSON-RPC request for getBalance", async () => {
      const mockFetch = createMockFetch({ value: 0 });
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      await client.call("getBalance", { address: "someAddress" });

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, init] = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toBe(TEST_ENDPOINT);
      expect(init.method).toBe("POST");

      const body = JSON.parse(init.body as string);
      expect(body.jsonrpc).toBe("2.0");
      expect(body.method).toBe("getBalance");
      expect(body.params).toEqual({ address: "someAddress" });
      expect(body.id).toBeDefined();
    });
  });

  // =========================================
  // getAccountInfo
  // =========================================
  describe("getAccountInfo", () => {
    it("should return account info when account exists", async () => {
      const accountInfo: AccountInfo = {
        lamports: 1_000_000,
        owner: "11111111111111111111111111111111",
        data: "",
        executable: false,
        rentEpoch: 0,
      };
      const mockFetch = createMockFetch({ value: accountInfo });
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const result = await client.call("getAccountInfo", {
        address: "someAddress",
      });

      expect(result).toEqual({ value: accountInfo });
    });

    it("should return null value when account does not exist", async () => {
      const mockFetch = createMockFetch({ value: null });
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const result = await client.call("getAccountInfo", {
        address: "nonExistent",
      });

      expect(result).toEqual({ value: null });
    });

    it("should accept optional encoding parameter", async () => {
      const mockFetch = createMockFetch({ value: null });
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      await client.call("getAccountInfo", {
        address: "someAddress",
        encoding: "base64",
      });

      const body = JSON.parse(
        (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string
      );
      expect(body.params).toEqual({
        address: "someAddress",
        encoding: "base64",
      });
    });
  });

  // =========================================
  // getLatestBlockhash
  // =========================================
  describe("getLatestBlockhash", () => {
    it("should return blockhash and lastValidBlockHeight", async () => {
      const mockResponse = {
        blockhash: "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N",
        lastValidBlockHeight: 150_000_000,
      };
      const mockFetch = createMockFetch(mockResponse);
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const result = await client.call("getLatestBlockhash", {});

      expect(result).toEqual(mockResponse);
      expect(result.blockhash).toBe(
        "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N"
      );
      expect(result.lastValidBlockHeight).toBe(150_000_000);
    });
  });

  // =========================================
  // sendTransaction
  // =========================================
  describe("sendTransaction", () => {
    it("should send a transaction and return signature", async () => {
      const mockFetch = createMockFetch({
        signature:
          "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQU",
      });
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const result = await client.call("sendTransaction", {
        transaction: "base64encodedTx",
      });

      expect(result.signature).toBe(
        "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQU"
      );
    });
  });

  // =========================================
  // getTransaction
  // =========================================
  describe("getTransaction", () => {
    it("should return transaction details", async () => {
      const txDetail = {
        transaction: {
          signatures: ["sig1"],
          message: {
            accountKeys: ["key1", "key2"],
            instructions: [
              { programIdIndex: 0, accounts: [1], data: "base58data" },
            ],
          },
          blockTime: 1_700_000_000,
        },
      };
      const mockFetch = createMockFetch(txDetail);
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const result = await client.call("getTransaction", {
        signature: "someSig",
      });

      expect(result.transaction).toBeDefined();
      expect(result.transaction?.signatures).toEqual(["sig1"]);
    });

    it("should return null transaction when not found", async () => {
      const mockFetch = createMockFetch({ transaction: null });
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const result = await client.call("getTransaction", {
        signature: "nonExistentSig",
      });

      expect(result.transaction).toBeNull();
    });
  });

  // =========================================
  // Middleware
  // =========================================
  describe("middleware", () => {
    it("should call beforeRequest middleware before the RPC call", async () => {
      const mockFetch = createMockFetch({ value: 100 });
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const beforeRequest = vi.fn();
      client.use({ beforeRequest });

      await client.call("getBalance", { address: "test" });

      expect(beforeRequest).toHaveBeenCalledOnce();
      expect(beforeRequest).toHaveBeenCalledWith("getBalance", {
        address: "test",
      });
    });

    it("should call afterResponse middleware after the RPC call", async () => {
      const responseData = { value: 500 };
      const mockFetch = createMockFetch(responseData);
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const afterResponse = vi.fn();
      client.use({ afterResponse });

      await client.call("getBalance", { address: "test" });

      expect(afterResponse).toHaveBeenCalledOnce();
      expect(afterResponse).toHaveBeenCalledWith("getBalance", responseData);
    });

    it("should support multiple middlewares in order", async () => {
      const mockFetch = createMockFetch({ value: 0 });
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const callOrder: string[] = [];

      client.use({
        beforeRequest: () => callOrder.push("before1"),
        afterResponse: () => callOrder.push("after1"),
      });
      client.use({
        beforeRequest: () => callOrder.push("before2"),
        afterResponse: () => callOrder.push("after2"),
      });

      await client.call("getBalance", { address: "test" });

      expect(callOrder).toEqual(["before1", "before2", "after1", "after2"]);
    });

    it("should work with middleware that only has beforeRequest", async () => {
      const mockFetch = createMockFetch({ value: 0 });
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const beforeRequest = vi.fn();
      client.use({ beforeRequest });

      await client.call("getBalance", { address: "test" });

      expect(beforeRequest).toHaveBeenCalledOnce();
    });

    it("should work with middleware that only has afterResponse", async () => {
      const mockFetch = createMockFetch({ value: 0 });
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const afterResponse = vi.fn();
      client.use({ afterResponse });

      await client.call("getBalance", { address: "test" });

      expect(afterResponse).toHaveBeenCalledOnce();
    });
  });

  // =========================================
  // Multiple Sequential Calls
  // =========================================
  describe("multiple calls", () => {
    it("should handle multiple sequential calls correctly", async () => {
      const mockFetch = createMockFetchForMultipleCalls([
        { value: 1000 },
        {
          blockhash: "abc123",
          lastValidBlockHeight: 100,
        },
      ]);
      const client = new RpcClient<SolanaRpcSchema>(TEST_ENDPOINT, mockFetch);

      const balance = await client.call("getBalance", { address: "addr1" });
      const blockhash = await client.call("getLatestBlockhash", {});

      expect(balance).toEqual({ value: 1000 });
      expect(blockhash).toEqual({
        blockhash: "abc123",
        lastValidBlockHeight: 100,
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});

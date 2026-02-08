import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  WalletConnectionManager,
  WalletStorageManager,
  WalletInfo,
  WalletConnector,
  WalletAccount,
  StorageInterface,
  ConnectionStatus,
} from "./index";

const WALLETS: WalletInfo[] = [
  { id: "phantom", name: "Phantom", icon: "phantom.svg" },
  { id: "solflare", name: "Solflare", icon: "solflare.svg" },
  { id: "backpack", name: "Backpack", icon: "backpack.svg" },
];

const PHANTOM_ACCOUNT: WalletAccount = {
  publicKey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  label: "Phantom",
};

function createMockStorage(): StorageInterface {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => store.set(key, value)),
    removeItem: vi.fn((key: string) => store.delete(key)),
  };
}

function createMockConnector(): WalletConnector {
  return vi.fn().mockResolvedValue(PHANTOM_ACCOUNT);
}

describe("WalletStorageManager", () => {
  let storage: StorageInterface;
  let manager: WalletStorageManager;

  beforeEach(() => {
    storage = createMockStorage();
    manager = new WalletStorageManager(storage);
  });

  it("should save a wallet ID", () => {
    manager.save("phantom");
    expect(storage.setItem).toHaveBeenCalled();
  });

  it("should load a previously saved wallet ID", () => {
    manager.save("phantom");
    expect(manager.load()).toBe("phantom");
  });

  it("should return null when no wallet is saved", () => {
    expect(manager.load()).toBeNull();
  });

  it("should clear the saved wallet ID", () => {
    manager.save("phantom");
    manager.clear();
    expect(manager.load()).toBeNull();
  });
});

describe("WalletConnectionManager", () => {
  let mockStorage: StorageInterface;
  let storageManager: WalletStorageManager;
  let connector: WalletConnector;
  let manager: WalletConnectionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    mockStorage = createMockStorage();
    storageManager = new WalletStorageManager(mockStorage);
    connector = createMockConnector();
    manager = new WalletConnectionManager(WALLETS, connector, storageManager);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initialization", () => {
    it("should start in idle state", () => {
      expect(manager.getState().state).toBe("idle");
    });

    it("should have no account initially", () => {
      expect(manager.getAccount()).toBeNull();
    });

    it("should list available wallets", () => {
      expect(manager.listWallets()).toEqual(WALLETS);
    });
  });

  describe("full connection flow", () => {
    it("should transition through connecting -> approving states", async () => {
      const states: string[] = [];
      manager.onStateChange((status) => states.push(status.state));

      const connectPromise = manager.connect("phantom");
      await vi.runAllTimersAsync();
      await connectPromise;

      expect(states).toContain("connecting");
      expect(states).toContain("approving");
    });

    it("should reach connected state after approve", async () => {
      const connectPromise = manager.connect("phantom");
      await vi.runAllTimersAsync();
      await connectPromise;

      manager.approve();

      expect(manager.getState().state).toBe("connected");
    });

    it("should provide account after connection", async () => {
      const connectPromise = manager.connect("phantom");
      await vi.runAllTimersAsync();
      await connectPromise;

      manager.approve();

      const account = manager.getAccount();
      expect(account).not.toBeNull();
      expect(account!.publicKey).toBe(PHANTOM_ACCOUNT.publicKey);
    });

    it("should save wallet to storage on successful connection", async () => {
      const connectPromise = manager.connect("phantom");
      await vi.runAllTimersAsync();
      await connectPromise;

      manager.approve();

      expect(mockStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("rejection", () => {
    it("should transition to error state when user rejects", async () => {
      const connectPromise = manager.connect("phantom");
      await vi.runAllTimersAsync();
      await connectPromise;

      manager.reject();

      expect(manager.getState().state).toBe("error");
      expect(manager.getState().error).toBeTruthy();
    });

    it("should have no account after rejection", async () => {
      const connectPromise = manager.connect("phantom");
      await vi.runAllTimersAsync();
      await connectPromise;

      manager.reject();

      expect(manager.getAccount()).toBeNull();
    });
  });

  describe("timeout", () => {
    it("should transition to error if connection takes too long", async () => {
      const slowConnector = vi.fn(
        () =>
          new Promise<WalletAccount>(() => {
            // Never resolves
          })
      );

      const mgr = new WalletConnectionManager(
        WALLETS,
        slowConnector,
        storageManager,
        { timeoutMs: 5000 }
      );

      mgr.connect("phantom");

      vi.advanceTimersByTime(5000);
      await vi.advanceTimersByTimeAsync(0);

      expect(mgr.getState().state).toBe("error");
      expect(mgr.getState().error).toMatch(/timeout/i);
    });

    it("should clear timeout on successful connection", async () => {
      const connectPromise = manager.connect("phantom");
      await vi.runAllTimersAsync();
      await connectPromise;
      manager.approve();

      // Advance past timeout — should not transition to error
      vi.advanceTimersByTime(60000);
      expect(manager.getState().state).toBe("connected");
    });
  });

  describe("auto-reconnect", () => {
    it("should auto-connect to the last wallet from storage", async () => {
      storageManager.save("phantom");

      const result = manager.tryAutoConnect();
      await vi.runAllTimersAsync();

      expect(await result).toBe(true);
    });

    it("should return false when no wallet in storage", async () => {
      const result = await manager.tryAutoConnect();
      expect(result).toBe(false);
    });

    it("should return false when auto-connect fails", async () => {
      storageManager.save("phantom");
      const failingConnector = vi
        .fn()
        .mockRejectedValue(new Error("Not installed"));

      const mgr = new WalletConnectionManager(
        WALLETS,
        failingConnector,
        storageManager
      );

      const result = mgr.tryAutoConnect();
      await vi.runAllTimersAsync();

      expect(await result).toBe(false);
    });
  });

  describe("switch wallet", () => {
    it("should disconnect from current and connect to new wallet", async () => {
      // First connect to phantom
      const connectPromise = manager.connect("phantom");
      await vi.runAllTimersAsync();
      await connectPromise;
      manager.approve();

      expect(manager.getState().state).toBe("connected");

      // Switch to solflare
      const solflareAccount: WalletAccount = {
        publicKey: "DifferentPublicKey123",
        label: "Solflare",
      };
      (connector as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        solflareAccount
      );

      const switchPromise = manager.switchWallet("solflare");
      await vi.runAllTimersAsync();
      await switchPromise;
      manager.approve();

      expect(manager.getState().walletId).toBe("solflare");
    });
  });

  describe("disconnect", () => {
    it("should transition to idle after disconnect", async () => {
      const connectPromise = manager.connect("phantom");
      await vi.runAllTimersAsync();
      await connectPromise;
      manager.approve();

      await manager.disconnect();

      expect(manager.getState().state).toBe("idle");
      expect(manager.getAccount()).toBeNull();
    });

    it("should clear storage on disconnect", async () => {
      const connectPromise = manager.connect("phantom");
      await vi.runAllTimersAsync();
      await connectPromise;
      manager.approve();

      await manager.disconnect();

      expect(storageManager.load()).toBeNull();
    });

    it("should notify subscribers during disconnect flow", async () => {
      const connectPromise = manager.connect("phantom");
      await vi.runAllTimersAsync();
      await connectPromise;
      manager.approve();

      const states: string[] = [];
      manager.onStateChange((status) => states.push(status.state));

      await manager.disconnect();

      expect(states).toContain("disconnecting");
      expect(states).toContain("idle");
    });
  });

  describe("state change subscription", () => {
    it("should support unsubscribe", () => {
      const listener = vi.fn();
      const unsubscribe = manager.onStateChange(listener);

      manager.connect("phantom");
      expect(listener).toHaveBeenCalled();

      const callCount = listener.mock.calls.length;
      unsubscribe();

      manager.connect("solflare").catch(() => {});
      expect(listener.mock.calls.length).toBe(callCount);
    });
  });
});

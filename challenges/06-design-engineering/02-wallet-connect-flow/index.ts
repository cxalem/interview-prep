// Challenge 6.2: Wallet Connect Flow
// Difficulty: Medium | Time: 60 min | AI Assistance: None recommended

export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
}

export interface WalletAccount {
  publicKey: string;
  label?: string;
}

export type ConnectionState =
  | "idle"
  | "selecting"
  | "connecting"
  | "approving"
  | "connected"
  | "disconnecting"
  | "error";

export interface ConnectionStatus {
  state: ConnectionState;
  walletId: string | null;
  account: WalletAccount | null;
  error: string | null;
}

export type WalletConnector = (walletId: string) => Promise<WalletAccount>;
export type WalletDisconnector = (walletId: string) => Promise<void>;

export type StateChangeListener = (status: ConnectionStatus) => void;

export interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class WalletStorageManager {
  // TODO: Store the injected storage interface and define a storage key

  constructor(storage: StorageInterface) {
    // TODO: Save the storage reference
    throw new Error("Not implemented");
  }

  save(walletId: string): void {
    // TODO: Persist the walletId using the injected storage
    throw new Error("Not implemented");
  }

  load(): string | null {
    // TODO: Retrieve the last connected wallet ID from storage
    // TODO: Return null if nothing is stored
    throw new Error("Not implemented");
  }

  clear(): void {
    // TODO: Remove the persisted wallet ID from storage
    throw new Error("Not implemented");
  }
}

export class WalletConnectionManager {
  // TODO: Store wallets, connector, storage, state, subscribers, timeout config

  constructor(
    wallets: WalletInfo[],
    connector: WalletConnector,
    storage: WalletStorageManager,
    config?: {
      timeoutMs?: number;
      disconnector?: WalletDisconnector;
    }
  ) {
    // TODO: Initialize state to idle with null wallet and account
    // TODO: Store wallet list, connector, storage, and config
    // TODO: Default timeout to 30000ms
    throw new Error("Not implemented");
  }

  getState(): ConnectionStatus {
    // TODO: Return a snapshot of the current connection status
    throw new Error("Not implemented");
  }

  listWallets(): WalletInfo[] {
    // TODO: Return the list of available wallets
    throw new Error("Not implemented");
  }

  onStateChange(listener: StateChangeListener): () => void {
    // TODO: Register the listener
    // TODO: Return an unsubscribe function
    throw new Error("Not implemented");
  }

  async connect(walletId: string): Promise<void> {
    // TODO: Validate the walletId exists in the wallet list
    // TODO: Transition to 'connecting' state
    // TODO: Start a timeout timer
    // TODO: Call the connector
    // TODO: Transition to 'approving' state (waiting for user)
    // TODO: Notify subscribers at each transition
    throw new Error("Not implemented");
  }

  approve(): void {
    // TODO: Only valid in 'approving' state
    // TODO: Transition to 'connected'
    // TODO: Clear timeout timer
    // TODO: Save walletId to storage
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  reject(): void {
    // TODO: Only valid in 'approving' state
    // TODO: Transition to 'error' with a rejection message
    // TODO: Clear timeout timer
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  async disconnect(): Promise<void> {
    // TODO: Only valid in 'connected' state
    // TODO: Transition to 'disconnecting'
    // TODO: Call disconnector if provided
    // TODO: Clear storage
    // TODO: Transition to 'idle'
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  async switchWallet(walletId: string): Promise<void> {
    // TODO: Disconnect current wallet (if connected)
    // TODO: Connect to the new wallet
    throw new Error("Not implemented");
  }

  async tryAutoConnect(): Promise<boolean> {
    // TODO: Load wallet ID from storage
    // TODO: If found, attempt to connect
    // TODO: Return true if auto-connect succeeded, false otherwise
    throw new Error("Not implemented");
  }

  getAccount(): WalletAccount | null {
    // TODO: Return account if connected, null otherwise
    throw new Error("Not implemented");
  }
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActivityFeedManager,
  Activity,
  HistoryFetcher,
  HistoryResult,
  ActivityType,
  DateGroup,
} from "./index";

const NOW = 1700000000000; // Fixed timestamp for tests

function createActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: overrides.id ?? `act-${Math.random().toString(36).slice(2)}`,
    type: overrides.type ?? "transfer",
    timestamp: overrides.timestamp ?? NOW,
    signature: overrides.signature ?? `sig-${Math.random().toString(36).slice(2)}`,
    status: overrides.status ?? "confirmed",
    details: overrides.details ?? {},
    token: overrides.token,
    amount: overrides.amount,
    counterparty: overrides.counterparty,
    read: overrides.read ?? false,
  };
}

const HISTORY_PAGE_1: Activity[] = [
  createActivity({ id: "h1", signature: "sig-h1", timestamp: NOW - 1000, type: "transfer", token: "SOL", amount: 5 }),
  createActivity({ id: "h2", signature: "sig-h2", timestamp: NOW - 2000, type: "swap", token: "SOL", amount: -2 }),
  createActivity({ id: "h3", signature: "sig-h3", timestamp: NOW - 3000, type: "nftSale", token: "SOL", amount: 10 }),
  createActivity({ id: "h4", signature: "sig-h4", timestamp: NOW - 86400000 - 1000, type: "transfer", token: "USDC", amount: 100 }),
  createActivity({ id: "h5", signature: "sig-h5", timestamp: NOW - 86400000 * 3, type: "staking", token: "SOL", amount: -50 }),
];

const HISTORY_PAGE_2: Activity[] = [
  createActivity({ id: "h6", signature: "sig-h6", timestamp: NOW - 86400000 * 10, type: "transfer", token: "USDC", amount: 200 }),
  createActivity({ id: "h7", signature: "sig-h7", timestamp: NOW - 86400000 * 40, type: "swap", token: "SOL", amount: -5 }),
];

function createMockFetcher(): HistoryFetcher {
  let callCount = 0;
  return vi.fn(async (before: number | undefined, limit: number): Promise<HistoryResult> => {
    callCount++;
    if (callCount === 1) {
      return { activities: HISTORY_PAGE_1, hasMore: true };
    }
    return { activities: HISTORY_PAGE_2, hasMore: false };
  });
}

describe("ActivityFeedManager", () => {
  let feed: ActivityFeedManager;
  let fetcher: HistoryFetcher;

  beforeEach(() => {
    vi.setSystemTime(NOW);
    fetcher = createMockFetcher();
    feed = new ActivityFeedManager(fetcher);
  });

  describe("history loading", () => {
    it("should load the first page of history", async () => {
      await feed.loadHistory(undefined, 20);
      const activities = feed.getActivities();
      expect(activities).toHaveLength(5);
    });

    it("should load additional pages", async () => {
      await feed.loadHistory(undefined, 20);
      await feed.loadHistory(NOW - 86400000 * 3, 20);

      const activities = feed.getActivities();
      expect(activities).toHaveLength(7);
    });

    it("should maintain descending timestamp order", async () => {
      await feed.loadHistory(undefined, 20);
      const activities = feed.getActivities();

      for (let i = 1; i < activities.length; i++) {
        expect(activities[i].timestamp).toBeLessThanOrEqual(activities[i - 1].timestamp);
      }
    });
  });

  describe("real-time updates (prepend)", () => {
    it("should prepend new real-time activity", async () => {
      await feed.loadHistory(undefined, 20);

      const newActivity = createActivity({
        id: "rt-1",
        signature: "sig-rt-1",
        timestamp: NOW + 1000,
        type: "swap",
      });

      feed.addRealTimeUpdate(newActivity);

      const activities = feed.getActivities();
      expect(activities[0].id).toBe("rt-1");
    });

    it("should notify subscribers on real-time update", async () => {
      await feed.loadHistory(undefined, 20);

      const listener = vi.fn();
      feed.subscribe(listener);

      feed.addRealTimeUpdate(
        createActivity({ id: "rt-2", signature: "sig-rt-2", timestamp: NOW + 2000 })
      );

      expect(listener).toHaveBeenCalled();
    });
  });

  describe("deduplication", () => {
    it("should not create duplicates when real-time update has same signature as history", async () => {
      await feed.loadHistory(undefined, 20);
      const countBefore = feed.getActivities().length;

      // Add an activity with the same signature as an existing one
      feed.addRealTimeUpdate(
        createActivity({
          id: "h1-rt",
          signature: "sig-h1",
          timestamp: NOW - 1000,
          status: "confirmed",
        })
      );

      expect(feed.getActivities().length).toBe(countBefore);
    });

    it("should update existing activity when duplicate signature arrives", async () => {
      await feed.loadHistory(undefined, 20);

      feed.addRealTimeUpdate(
        createActivity({
          id: "h2-updated",
          signature: "sig-h2",
          timestamp: NOW - 2000,
          status: "failed",
        })
      );

      const activity = feed.getActivityBySignature("sig-h2");
      expect(activity?.status).toBe("failed");
    });
  });

  describe("date grouping", () => {
    it("should group activities into date buckets", async () => {
      await feed.loadHistory(undefined, 20);
      await feed.loadHistory(NOW - 86400000 * 3, 20);

      const grouped = feed.groupByDate(feed.getActivities());

      expect(grouped["Today"].length).toBeGreaterThan(0);
      expect(grouped["Yesterday"].length).toBeGreaterThan(0);
    });

    it("should place older activities in the correct bucket", async () => {
      await feed.loadHistory(undefined, 20);
      await feed.loadHistory(NOW - 86400000 * 3, 20);

      const grouped = feed.groupByDate(feed.getActivities());

      // h7 is 40 days ago — should be in "Older"
      const olderIds = grouped["Older"].map((a) => a.id);
      expect(olderIds).toContain("h7");
    });

    it("should return empty arrays for buckets with no activities", () => {
      const grouped = feed.groupByDate([]);
      expect(grouped["Today"]).toHaveLength(0);
      expect(grouped["Yesterday"]).toHaveLength(0);
      expect(grouped["This Week"]).toHaveLength(0);
      expect(grouped["This Month"]).toHaveLength(0);
      expect(grouped["Older"]).toHaveLength(0);
    });
  });

  describe("summary calculation", () => {
    it("should calculate per-token summary for a time range", async () => {
      await feed.loadHistory(undefined, 20);

      const summary = feed.getActivitySummary({
        start: NOW - 10000,
        end: NOW + 1000,
      });

      // In this range: h1 (SOL +5), h2 (SOL -2), h3 (SOL +10)
      expect(summary["SOL"]).toBeDefined();
      expect(summary["SOL"].totalIn).toBe(15);
      expect(summary["SOL"].totalOut).toBe(2);
      expect(summary["SOL"].netChange).toBe(13);
      expect(summary["SOL"].txCount).toBe(3);
    });

    it("should handle multiple tokens in summary", async () => {
      await feed.loadHistory(undefined, 20);

      const summary = feed.getActivitySummary({
        start: NOW - 86400000 * 2,
        end: NOW + 1000,
      });

      expect(summary["SOL"]).toBeDefined();
      expect(summary["USDC"]).toBeDefined();
    });

    it("should return empty summary for no activities in range", async () => {
      await feed.loadHistory(undefined, 20);

      const summary = feed.getActivitySummary({
        start: NOW + 100000,
        end: NOW + 200000,
      });

      expect(Object.keys(summary)).toHaveLength(0);
    });
  });

  describe("read/unread", () => {
    it("should start with all activities unread", async () => {
      await feed.loadHistory(undefined, 20);
      expect(feed.getUnreadCount()).toBe(5);
    });

    it("should mark activity as read", async () => {
      await feed.loadHistory(undefined, 20);
      feed.markAsRead("h1");
      expect(feed.getUnreadCount()).toBe(4);
    });

    it("should not count already-read activities", async () => {
      await feed.loadHistory(undefined, 20);
      feed.markAsRead("h1");
      feed.markAsRead("h1"); // duplicate mark
      expect(feed.getUnreadCount()).toBe(4);
    });

    it("should add real-time updates as unread", async () => {
      await feed.loadHistory(undefined, 20);
      feed.addRealTimeUpdate(
        createActivity({ id: "rt-unread", signature: "sig-rt-unread", timestamp: NOW + 1000 })
      );
      expect(feed.getUnreadCount()).toBe(6);
    });
  });

  describe("optimistic updates", () => {
    it("should update activity status from pending to confirmed", async () => {
      feed.addRealTimeUpdate(
        createActivity({
          id: "opt-1",
          signature: "sig-opt-1",
          timestamp: NOW,
          status: "pending",
        })
      );

      expect(feed.getActivityBySignature("sig-opt-1")?.status).toBe("pending");

      feed.updateStatus("opt-1", "confirmed");
      expect(feed.getActivityBySignature("sig-opt-1")?.status).toBe("confirmed");
    });

    it("should update activity status from pending to failed", () => {
      feed.addRealTimeUpdate(
        createActivity({
          id: "opt-2",
          signature: "sig-opt-2",
          timestamp: NOW,
          status: "pending",
        })
      );

      feed.updateStatus("opt-2", "failed");
      expect(feed.getActivityBySignature("sig-opt-2")?.status).toBe("failed");
    });

    it("should notify subscribers on status update", () => {
      feed.addRealTimeUpdate(
        createActivity({
          id: "opt-3",
          signature: "sig-opt-3",
          timestamp: NOW,
          status: "pending",
        })
      );

      const listener = vi.fn();
      feed.subscribe(listener);

      feed.updateStatus("opt-3", "confirmed");
      expect(listener).toHaveBeenCalled();
    });
  });

  describe("filtering by type", () => {
    it("should filter activities by type", async () => {
      await feed.loadHistory(undefined, 20);
      const transfers = feed.getActivities({ type: "transfer" });
      expect(transfers.every((a) => a.type === "transfer")).toBe(true);
    });

    it("should filter activities by token", async () => {
      await feed.loadHistory(undefined, 20);
      const solActivities = feed.getActivities({ token: "SOL" });
      expect(solActivities.every((a) => a.token === "SOL")).toBe(true);
    });

    it("should filter activities by status", async () => {
      await feed.loadHistory(undefined, 20);
      feed.addRealTimeUpdate(
        createActivity({
          id: "pending-1",
          signature: "sig-pending-1",
          timestamp: NOW + 1,
          status: "pending",
        })
      );

      const pending = feed.getActivities({ status: "pending" });
      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe("pending");
    });

    it("should filter activities by date range", async () => {
      await feed.loadHistory(undefined, 20);
      const recent = feed.getActivities({
        dateRange: { start: NOW - 5000, end: NOW + 1000 },
      });

      expect(recent.every((a) => a.timestamp >= NOW - 5000 && a.timestamp <= NOW + 1000)).toBe(true);
    });
  });

  describe("lookup by signature", () => {
    it("should find activity by signature", async () => {
      await feed.loadHistory(undefined, 20);
      const activity = feed.getActivityBySignature("sig-h1");
      expect(activity).toBeDefined();
      expect(activity!.id).toBe("h1");
    });

    it("should return undefined for unknown signature", async () => {
      await feed.loadHistory(undefined, 20);
      expect(feed.getActivityBySignature("unknown-sig")).toBeUndefined();
    });
  });

  describe("subscriptions", () => {
    it("should notify on loadHistory", async () => {
      const listener = vi.fn();
      feed.subscribe(listener);
      await feed.loadHistory(undefined, 20);
      expect(listener).toHaveBeenCalled();
    });

    it("should support unsubscribe", async () => {
      const listener = vi.fn();
      const unsub = feed.subscribe(listener);
      unsub();
      await feed.loadHistory(undefined, 20);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});

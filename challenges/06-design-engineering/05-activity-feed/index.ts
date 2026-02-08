// Challenge 6.5: Activity Feed
// Difficulty: Hard | Time: 60 min | AI Assistance: None recommended

export type ActivityType =
  | "transfer"
  | "swap"
  | "nftSale"
  | "nftListing"
  | "staking"
  | "programInteraction";

export type ActivityStatus = "pending" | "confirmed" | "failed";

export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: number;
  signature: string;
  status: ActivityStatus;
  details: Record<string, unknown>;
  token?: string;
  amount?: number;
  counterparty?: string;
  read: boolean;
}

export interface ActivityFilter {
  type?: ActivityType;
  token?: string;
  status?: ActivityStatus;
  dateRange?: { start: number; end: number };
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface TokenSummary {
  totalIn: number;
  totalOut: number;
  netChange: number;
  txCount: number;
}

export interface ActivitySummary {
  [token: string]: TokenSummary;
}

export interface DateGroup {
  Today: Activity[];
  Yesterday: Activity[];
  "This Week": Activity[];
  "This Month": Activity[];
  Older: Activity[];
}

export interface HistoryResult {
  activities: Activity[];
  hasMore: boolean;
}

export type HistoryFetcher = (
  before: number | undefined,
  limit: number
) => Promise<HistoryResult>;

export type FeedListener = (activities: Activity[]) => void;

export class ActivityFeedManager {
  // TODO: Store activities, fetcher, subscribers, hasMore flag, loading state

  constructor(fetcher: HistoryFetcher) {
    // TODO: Initialize with empty activities array
    // TODO: Store the fetcher function
    throw new Error("Not implemented");
  }

  async loadHistory(
    before?: number,
    limit: number = 20
  ): Promise<void> {
    // TODO: Call the fetcher with the before cursor and limit
    // TODO: Append the fetched activities to existing ones (avoid duplicates)
    // TODO: Sort all activities by timestamp descending
    // TODO: Update hasMore flag
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  addRealTimeUpdate(activity: Activity): void {
    // TODO: Check if an activity with the same signature already exists
    // TODO: If duplicate, update the existing entry (merge fields)
    // TODO: If new, prepend to the activities list
    // TODO: Maintain descending timestamp order
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  getActivities(filters?: ActivityFilter): Activity[] {
    // TODO: Start with all activities
    // TODO: Apply type filter if provided
    // TODO: Apply token filter if provided
    // TODO: Apply status filter if provided
    // TODO: Apply date range filter if provided
    // TODO: Return filtered activities in descending timestamp order
    throw new Error("Not implemented");
  }

  groupByDate(activities: Activity[]): DateGroup {
    // TODO: Group activities into date buckets relative to "now":
    //   - "Today": same calendar day
    //   - "Yesterday": previous calendar day
    //   - "This Week": within the last 7 days (excluding today/yesterday)
    //   - "This Month": within the last 30 days (excluding this week)
    //   - "Older": everything else
    // TODO: Each bucket should maintain descending timestamp order
    throw new Error("Not implemented");
  }

  getActivitySummary(timeRange: TimeRange): ActivitySummary {
    // TODO: Filter activities within the time range
    // TODO: Group by token
    // TODO: For each token, calculate:
    //   - totalIn: sum of positive amounts
    //   - totalOut: sum of negative amounts (as absolute value)
    //   - netChange: totalIn - totalOut
    //   - txCount: number of transactions for that token
    // TODO: Return the summary object keyed by token
    throw new Error("Not implemented");
  }

  markAsRead(id: string): void {
    // TODO: Find the activity by ID and set read to true
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  getUnreadCount(): number {
    // TODO: Return the count of activities where read is false
    throw new Error("Not implemented");
  }

  updateStatus(id: string, status: ActivityStatus): void {
    // TODO: Find the activity by ID and update its status
    // TODO: Notify subscribers
    throw new Error("Not implemented");
  }

  getActivityBySignature(signature: string): Activity | undefined {
    // TODO: Find and return the activity matching the given signature
    throw new Error("Not implemented");
  }

  subscribe(listener: FeedListener): () => void {
    // TODO: Add listener to subscribers
    // TODO: Return an unsubscribe function
    throw new Error("Not implemented");
  }
}

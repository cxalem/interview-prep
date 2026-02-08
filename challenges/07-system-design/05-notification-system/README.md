# System Design: Wallet Notification System

**Difficulty:** Hard | **Time:** 60 min | **Format:** Whiteboard

Design a notification system for a wallet with millions of users.

## Requirements

- Notification types: incoming transfers, outgoing confirmations, price alerts, governance votes, NFT activity, security alerts
- Delivery channels: push notification (mobile), browser extension badge, email digest, in-app feed
- User preferences: per-type enable/disable, quiet hours, threshold amounts
- Real-time delivery (< 5s for transaction notifications)
- Millions of concurrent users
- Notification history and read state
- Batching: group similar notifications (10 small transfers -> 1 notification)
- Priority levels: security alerts always deliver immediately

## Discussion Points

1. How do you detect events that should trigger notifications? (on-chain monitoring)
2. How do you route notifications to the right channel?
3. How do you handle user preferences efficiently?
4. How do you batch similar notifications?
5. What's your delivery guarantee? (at-least-once vs exactly-once)
6. How do you handle millions of price alerts efficiently?
7. How do you manage notification fatigue?

## Evaluation Criteria

- Event-driven architecture design
- Understanding of push notification infrastructure
- Scalability for millions of users
- User experience considerations (batching, fatigue, priority)
- Data modeling for notification state
- Operational maturity (monitoring, delivery tracking)

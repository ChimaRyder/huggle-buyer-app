/**
 * Order status tabs configuration
 * Used for filtering orders by status in the Orders screen
 */

export const orderStatusTabs = [
  "Pending",
  "Confirmed", 
  "Ready for Pickup",
  "Completed",
  "Cancelled",
] as const;

export type OrderStatusTab = typeof orderStatusTabs[number];
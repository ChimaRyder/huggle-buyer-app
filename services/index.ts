/**
 * Services Export
 * Central export file for all service modules
 */

export { productService } from './productService';
export { locationService } from './locationService';
export { userService } from './userService';
export { orderService } from './orderService';

// Re-export types for convenience
export type {
  Location,
  Store,
} from './locationService';

export type {
  UserProfile,
  UserAddress,
  UserPreferences,
  UpdateUserProfileRequest,
} from './userService';

export type {
  Order,
  OrderItem,
  OrderStatus,
  DeliveryAddress,
  CreateOrderRequest,
} from './orderService';
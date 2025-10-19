/**
 * Backend data models matching the server API contracts
 * These interfaces represent the data structures returned by the backend API
 */

import type { ApiResponse } from './common';

// Supporting interfaces
export interface BusinessHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  buyerId?: string;
  storeId?: string;
  label?: string;
  createdAt: string;
  updatedAt: string;
}

// Product related interfaces
export interface BackendProduct {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  image: string[]; // Array of image URLs
  coverImage?: string; // Cover image URL for display
  tags: string[]; // Product tags/categories
  productType?: string;
  price: number;
  originalPrice: number;
  discountedPrice?: number; // Used in frontend for pricing display
  stock: number;
  expiresOn: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Bundle-specific fields for unified handling
  isBundle?: boolean;
  
  // Dynamic pricing info for buyers (derived fields)
  discountPercentage: number;
  hasDiscount: boolean;
  
  // Store information for buyer context
  storeName?: string;
  storeImageUrl?: string;
  storeDescription?: string;
  
  // Legacy fields for compatibility (optional)
  rating?: number;
  ratingCount?: number;
}

// Bundle related interfaces
export interface BackendBundleProduct {
  id: string;
  name: string;
  tags: string[];
  stock: number;
  expiresOn?: string;
  productType?: string;
  // Additional product details for display
  price: number;
  originalPrice: number;
  image: string[];
  isActive: boolean;
}

export interface BackendBundle {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  products: BackendBundleProduct[];
  images: string[];
  coverImage?: string; // Cover image URL for display (unified with BackendProduct)
  stock: number;
  signature: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  
  // Pricing properties
  price: number;
  originalPrice: number;
  expiresOn: string;
  isActive: boolean;
  
  // Dynamic pricing info for buyers
  discountPercentage: number;
  hasDiscount: boolean;
  isDynamicPricingEnabled: boolean;
  
  // Store information for buyer context
  storeName?: string;
  storeImageUrl?: string;
  storeDescription?: string;
  
  // Computed properties
  totalProductPrice: number;
  totalProductOriginalPrice: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  productType: string;
  coverImage: string;
  additionalImages: string[];
  originalPrice: number;
  discountedPrice: number;
  expirationDate: string;
  storeId: string;
  stock: number;
  category: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
  isActive?: boolean;
}

// Store related interfaces
export interface BackendStore {
  id: string;
  sellerId: string;
  name: string;
  storeType?: string;
  description?: string;
  tags: string[];
  locationId?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  address?: string;
  city?: string;
  province?: string;
  businessHours: BusinessHours[];
  isOpen: boolean;
  isVerified: boolean;
  location?: Location;
  createdAt: string;
  updatedAt: string;
  
  // Additional fields that might be included for buyer context
  distance?: number; // Distance from user location (for search results)
}

export interface CreateStoreRequest {
  name: string;
  storeDescription: string;
  storeImageUrl: string;
  storeCoverUrl: string;
  storeCategory: string;
  tags: string[];
  address: string;
  city: string;
  province: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

// Review related interfaces
export interface BackendReview {
  id: string;
  productId: string;
  buyerId: string;
  buyerName?: string;
  buyerAvatar?: string;
  content: string | null;
  imageUrls: string[] | null;
  rating: number;
  createdAt: string;
  updatedAt: string | null;
  isVerifiedPurchase?: boolean;
}

export interface CreateReviewRequest {
  productId: string;
  content?: string;
  imageUrls?: string[];
  rating: number;
}

export interface UpdateReviewRequest extends Partial<CreateReviewRequest> {
  id: string;
}

// User related interfaces
export interface BackendBuyer {
  id: string;
  name: string;
  emailAddress: string;
  phoneNumber?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
  favoriteStores: string[];
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

export interface UpdateBuyerRequest {
  name?: string;
  phoneNumber?: string;
  avatar?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateFavoriteStoreRequest {
  storeId: string;
  isAdd: boolean;
}

// Order related interfaces
export interface BackendOrder {
  id: string;
  buyerId: string;
  storeId: string;
  storeName?: string;
  productId: string[];
  productNames?: string[];
  quantity: number[];
  unitPrices?: number[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryDate?: string;
  notes?: string;
}

export interface CreateOrderRequest {
  storeId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface UpdateOrderRequest {
  id: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryDate?: string;
  notes?: string;
}

// Cart related interfaces
export interface BackendCartItem {
  id: string;
  buyerId: string;
  productId: string;
  product?: BackendProduct;
  quantity: number;
  addedAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  id: string;
  quantity: number;
}

// Notification interfaces
export interface BackendNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// Enums
export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  ReadyForPickup = 2,
  Completed = 3,
  Cancelled = 4,
}

export enum PaymentStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Failed = 3,
  Refunded = 4,
}

export enum NotificationType {
  OrderUpdate = 'order_update',
  ProductUpdate = 'product_update',
  StoreUpdate = 'store_update',
  Promotion = 'promotion',
  System = 'system',
}

// Post related interfaces
export interface BackendPost {
  id: string;
  sellerId: string;
  sellerName?: string;
  storeId: string;
  storeName?: string;
  content?: string;
  imageUrls: string[];
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  content?: string;
  imageUrls?: string[];
  storeId?: string;
}

export interface UpdatePostRequest {
  content?: string;
  imageUrls?: string[];
}

// Push token related interfaces
export interface BackendPushToken {
  id: string;
  userId: string;
  token: string;
  deviceType: string;
  deviceId?: string;
  appVersion?: string;
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPushTokenRequest {
  token: string;
}

export interface UpdatePushTokenStatusRequest {
  isActive: boolean;
}

// API Response types
export type ProductsResponse = ApiResponse<BackendProduct[]>;
export type ProductResponse = ApiResponse<BackendProduct>;
export type BundlesResponse = ApiResponse<BackendBundle[]>;
export type BundleResponse = ApiResponse<BackendBundle>;
export type StoresResponse = ApiResponse<BackendStore[]>;
export type StoreResponse = ApiResponse<BackendStore>;
export type ReviewsResponse = ApiResponse<BackendReview[]>;
export type ReviewResponse = ApiResponse<BackendReview>;
export type OrdersResponse = ApiResponse<BackendOrder[]>;
export type OrderResponse = ApiResponse<BackendOrder>;
export type CartResponse = ApiResponse<BackendCartItem[]>;
export type BuyerResponse = ApiResponse<BackendBuyer>;
export type NotificationsResponse = ApiResponse<BackendNotification[]>;
export type PostsResponse = ApiResponse<BackendPost[]>;
export type PostResponse = ApiResponse<BackendPost>;
export type PushTokenResponse = ApiResponse<BackendPushToken>;
export type PushTokensResponse = ApiResponse<BackendPushToken[]>;

/**
 * Backend data models matching the server API contracts
 * These interfaces represent the data structures returned by the backend API
 */

import type { ApiResponse } from './common';

// Product related interfaces
export interface BackendProduct {
  id: string;
  name: string;
  description: string;
  productType: string;
  coverImage: string;
  additionalImages: string[];
  originalPrice: number;
  discountedPrice: number;
  expirationDate: string;
  storeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stock: number;
  rating: number;
  ratingCount: number;
  category: string[];
  analytics?: Record<string, unknown>[];
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
  rating?: number;
  reviews?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  deliveryAddress?: string;
  deliveryDate?: string;
  notes?: string;
}

export interface CreateOrderRequest {
  storeId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress?: string;
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

// API Response types
export type ProductsResponse = ApiResponse<BackendProduct[]>;
export type ProductResponse = ApiResponse<BackendProduct>;
export type StoresResponse = ApiResponse<BackendStore[]>;
export type StoreResponse = ApiResponse<BackendStore>;
export type ReviewsResponse = ApiResponse<BackendReview[]>;
export type ReviewResponse = ApiResponse<BackendReview>;
export type OrdersResponse = ApiResponse<BackendOrder[]>;
export type OrderResponse = ApiResponse<BackendOrder>;
export type CartResponse = ApiResponse<BackendCartItem[]>;
export type BuyerResponse = ApiResponse<BackendBuyer>;
export type NotificationsResponse = ApiResponse<BackendNotification[]>;

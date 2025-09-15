/**
 * Order Service
 * Handles order-related API operations
 */

import type { ApiClient } from '@/contexts/ApiContext';
import { API_ENDPOINTS } from '@/constants/config';
import type { ApiResponse, PaginationParams } from '@/types/common';

// Order types - extend based on your backend models
export interface Order {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip?: number;
  deliveryAddress: DeliveryAddress;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  instructions?: string;
}

export interface CreateOrderRequest {
  storeId: string;
  items: {
    productId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  deliveryAddress: DeliveryAddress;
  tip?: number;
}

export const orderService = {
  /**
   * Get user's orders
   */
  async getUserOrders(
    client: ApiClient,
    pagination?: PaginationParams
  ): Promise<ApiResponse<Order[]>> {
    try {
      let endpoint = API_ENDPOINTS.orders.list;
      
      if (pagination) {
        const queryParams = new URLSearchParams();
        if (pagination.page) {
          queryParams.append('page', pagination.page.toString());
        }
        if (pagination.limit) {
          queryParams.append('limit', pagination.limit.toString());
        }
        
        if (queryParams.toString()) {
          endpoint += `?${queryParams.toString()}`;
        }
      }

      return await client.get<Order[]>(endpoint);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      };
    }
  },

  /**
   * Get order by ID
   */
  async getOrderById(
    client: ApiClient,
    orderId: string
  ): Promise<ApiResponse<Order>> {
    try {
      const endpoint = API_ENDPOINTS.orders.byId(orderId);
      return await client.get<Order>(endpoint);
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch order',
      };
    }
  },

  /**
   * Create a new order
   */
  async createOrder(
    client: ApiClient,
    orderData: CreateOrderRequest
  ): Promise<ApiResponse<Order>> {
    try {
      return await client.post<Order>(API_ENDPOINTS.orders.create, orderData);
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      };
    }
  },

  /**
   * Cancel an order
   */
  async cancelOrder(
    client: ApiClient,
    orderId: string,
    reason?: string
  ): Promise<ApiResponse<Order>> {
    try {
      const data = reason ? { reason } : undefined;
      return await client.patch<Order>(`/api/orders/${orderId}/cancel`, data);
    } catch (error) {
      console.error('Error cancelling order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel order',
      };
    }
  },

  /**
   * Rate an order (after delivery)
   */
  async rateOrder(
    client: ApiClient,
    orderId: string,
    rating: number,
    review?: string
  ): Promise<ApiResponse<void>> {
    try {
      const data = { rating, review };
      return await client.post<void>(`/api/orders/${orderId}/rate`, data);
    } catch (error) {
      console.error('Error rating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rate order',
      };
    }
  },

  /**
   * Track order status
   */
  async trackOrder(
    client: ApiClient,
    orderId: string
  ): Promise<ApiResponse<{ status: OrderStatus; estimatedDeliveryTime?: string }>> {
    try {
      return await client.get<{ status: OrderStatus; estimatedDeliveryTime?: string }>(`/api/orders/${orderId}/track`);
    } catch (error) {
      console.error('Error tracking order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track order',
      };
    }
  },
};
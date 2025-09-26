import { BackendOrder, OrderStatus } from '@/types/BackendModels';
import { API_ENDPOINTS } from '@/constants/config';
import type { ApiResponse, ApiClient } from '@/types/common';

export interface CreateOrderRequest {
  storeId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface CancelOrderRequest {
  reason?: string;
}

export interface OrderApiResponse extends BackendOrder {
  id: string;
  buyerId: string;
  storeId: string;
  storeName?: string;
  totalAmount: number;
  status: string; // Will be converted to OrderStatus enum
  notes?: string;
  deliveryAddress?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage?: string;
    productDescription?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export class OrderService {
  constructor(private apiClient: ApiClient) {}

  async createOrder(request: CreateOrderRequest): Promise<ApiResponse<OrderApiResponse>> {
    return this.apiClient.post<OrderApiResponse>(API_ENDPOINTS.orders.create, request);
  }

  async getOrders(): Promise<ApiResponse<OrderApiResponse[]>> {
    return this.apiClient.get<OrderApiResponse[]>(API_ENDPOINTS.orders.list);
  }

  async getOrderById(orderId: string): Promise<ApiResponse<OrderApiResponse>> {
    return this.apiClient.get<OrderApiResponse>(API_ENDPOINTS.orders.byId(orderId));
  }

  async updateOrderStatus(orderId: string, request: UpdateOrderStatusRequest): Promise<ApiResponse<OrderApiResponse>> {
    return this.apiClient.put<OrderApiResponse>(API_ENDPOINTS.orders.updateStatus(orderId), request);
  }

  async cancelOrder(orderId: string, request: CancelOrderRequest = {}): Promise<ApiResponse<OrderApiResponse>> {
    return this.apiClient.put<OrderApiResponse>(API_ENDPOINTS.orders.cancel(orderId), request);
  }

  async canCancelOrder(orderId: string): Promise<ApiResponse<{ canCancel: boolean; userType: string }>> {
    return this.apiClient.get<{ canCancel: boolean; userType: string }>(API_ENDPOINTS.orders.canCancel(orderId));
  }

  // Helper function to convert API response to frontend order format
  convertApiOrderToFrontend(apiOrder: OrderApiResponse): BackendOrder {
    return {
      id: apiOrder.id,
      buyerId: apiOrder.buyerId,
      storeId: apiOrder.storeId,
      storeName: apiOrder.storeName,
      productId: apiOrder.items.map(item => item.productId),
      productNames: apiOrder.items.map(item => item.productName),
      quantity: apiOrder.items.map(item => item.quantity),
      unitPrices: apiOrder.items.map(item => item.unitPrice),
      totalPrice: apiOrder.totalAmount,
      createdAt: apiOrder.createdAt,
      updatedAt: apiOrder.updatedAt || apiOrder.createdAt,
      status: this.convertStatusStringToEnum(apiOrder.status),
      paymentStatus: undefined, // Not implemented yet
      deliveryAddress: apiOrder.deliveryAddress,
      deliveryDate: undefined, // Not implemented yet
      notes: apiOrder.notes,
    };
  }

  private convertStatusStringToEnum(status: string): OrderStatus {
    switch (status.toLowerCase()) {
      case 'pending':
        return OrderStatus.Pending;
      case 'confirmed':
        return OrderStatus.Confirmed;
      case 'readyforpickup':
      case 'ready for pickup':
        return OrderStatus.ReadyForPickup;
      case 'completed':
        return OrderStatus.Completed;
      case 'cancelled':
        return OrderStatus.Cancelled;
      default:
        return OrderStatus.Pending;
    }
  }

  getStatusDisplayText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'Pending';
      case OrderStatus.Confirmed:
        return 'Confirmed';
      case OrderStatus.ReadyForPickup:
        return 'Ready for Pickup';
      case OrderStatus.Completed:
        return 'Completed';
      case OrderStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return '#FFA500'; // Orange
      case OrderStatus.Confirmed:
        return '#007BFF'; // Blue
      case OrderStatus.ReadyForPickup:
        return '#28A745'; // Green
      case OrderStatus.Completed:
        return '#6C757D'; // Gray
      case OrderStatus.Cancelled:
        return '#DC3545'; // Red
      default:
        return '#6C757D'; // Gray
    }
  }
}
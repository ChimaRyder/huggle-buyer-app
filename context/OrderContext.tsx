import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useApi } from './ApiContext';
import { API_ENDPOINTS } from '@/constants/config';
import { OrderStatus } from '@/types/BackendModels';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  hasReviewed?: boolean;
}

interface Order {
  id: string;
  buyerId: string;
  storeId: string;
  storeName?: string;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  cancelledBy?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

interface CreateOrderRequest {
  storeId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  notes?: string;
}

interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

interface CancelOrderRequest {
  reason?: string;
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isCancelling: boolean;
  error: string | null;
  
  // Order management
  fetchOrders: () => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<Order | null>;
  getOrderById: (orderId: string) => Promise<Order | null>; // Convenience method that uses cache or fetches
  createOrder: (request: CreateOrderRequest) => Promise<Order>;
  updateOrderStatus: (orderId: string, request: UpdateOrderStatusRequest) => Promise<Order>;
  cancelOrder: (orderId: string, request?: CancelOrderRequest) => Promise<Order>;
  canCancelOrder: (orderId: string) => Promise<{ canCancel: boolean; userType: string }>;
  
  // State management
  clearError: () => void;
  clearCurrentOrder: () => void;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export function OrderProvider({ children }: OrderProviderProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { client } = useApi();
  const { userId } = useAuth();

  // Helper function to convert API order to frontend format
  const convertApiOrderToFrontend = (apiOrder: any, existingOrder?: Order): Order => {
    return {
      id: apiOrder.id || existingOrder?.id || '',
      buyerId: apiOrder.buyerId || existingOrder?.buyerId || '',
      storeId: apiOrder.storeId || existingOrder?.storeId || '',
      storeName: apiOrder.storeName || existingOrder?.storeName || '',
      totalAmount: apiOrder.totalAmount ?? existingOrder?.totalAmount ?? 0,
      status: convertStatusStringToEnum(apiOrder.status),
      notes: apiOrder.notes ?? existingOrder?.notes,
      cancelledBy: apiOrder.cancelledBy ?? existingOrder?.cancelledBy,
      items: apiOrder.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        hasReviewed: item.hasReviewed || false,
      })) ?? existingOrder?.items ?? [],
      createdAt: apiOrder.createdAt || existingOrder?.createdAt || '',
      updatedAt: apiOrder.updatedAt || existingOrder?.updatedAt || apiOrder.createdAt || '',
    };
  };

  // Helper function to convert status string to enum
  const convertStatusStringToEnum = (status: string): OrderStatus => {
    switch (status?.toLowerCase()) {
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
  };

  // Helper function to handle API response structure (handles double nesting)
  const extractResponseData = (response: any): any => {
    if (response.success && response.data) {
      // Handle double-nested response: {data: {data: actualData, success: true}, success: true}
      if (response.data.data !== undefined) {
        return response.data.data;
      }
      // Handle single-nested response: {data: actualData, success: true}
      return response.data;
    }
    return null;
  };

  // Fetch all orders for the current user
  const fetchOrders = async (): Promise<void> => {
    if (!userId) {
      console.log('No user ID available, skipping orders fetch');
      return;
    }

    setIsFetching(true);
    setError(null);
    
    try {
      console.log('🔍 OrderContext: Fetching orders for user:', userId);
      const response = await client.get<Order[]>(API_ENDPOINTS.orders.list);
      console.log('🔍 OrderContext: Raw API response:', response);

      if (response.success) {
        const ordersData = extractResponseData(response);
        console.log('🔍 OrderContext: Extracted orders data:', ordersData);
        
        let ordersArray: Order[] = [];
        if (Array.isArray(ordersData)) {
          ordersArray = ordersData.map(convertApiOrderToFrontend);
        } else if (ordersData && Array.isArray(ordersData.data)) {
          console.log('🔍 OrderContext: Found nested data structure, extracting orders');
          ordersArray = ordersData.data.map(convertApiOrderToFrontend);
        }
        
        console.log('🔍 OrderContext: Processed orders array:', ordersArray.length, 'items');
        setOrders(ordersArray);
        console.log('✅ OrderContext: Set orders to:', ordersArray.length, 'items');
      } else {
        console.warn('❌ OrderContext: Failed to fetch orders - success:', response.success, 'error:', response.error);
        setError(response.error || 'Failed to fetch orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ OrderContext: Exception in fetchOrders:', error);
      setError('Failed to fetch orders. Please try again.');
      setOrders([]);
    } finally {
      setIsFetching(false);
      console.log('🔍 OrderContext: fetchOrders finished');
    }
  };

  // Fetch a specific order by ID
  const fetchOrderById = async (orderId: string): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 OrderContext: Fetching order by ID:', orderId);
      const response = await client.get<Order>(API_ENDPOINTS.orders.byId(orderId));
      console.log('🔍 OrderContext: Fetch order response:', response);

      if (response.success) {
        const orderData = extractResponseData(response);
        console.log('🔍 OrderContext: Extracted order data:', orderData);
        
        const order = convertApiOrderToFrontend(orderData);
        setCurrentOrder(order);
        console.log('✅ OrderContext: Set current order:', order);
        return order;
      } else {
        console.warn('❌ OrderContext: Failed to fetch order - error:', response.error);
        setError(response.error || 'Failed to fetch order');
        return null;
      }
    } catch (error) {
      console.error('❌ OrderContext: Exception in fetchOrderById:', error);
      setError('Failed to fetch order. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new order
  const createOrder = async (request: CreateOrderRequest): Promise<Order> => {
    setIsCreating(true);
    setError(null);
    
    try {
      console.log('🔍 OrderContext: Creating order with request:', request);
      const response = await client.post<Order>(API_ENDPOINTS.orders.create, request);
      console.log('🔍 OrderContext: Create order response:', response);

      if (response.success) {
        const orderData = extractResponseData(response);
        console.log('🔍 OrderContext: Extracted created order data:', orderData);
        
        const order = convertApiOrderToFrontend(orderData);
        
        // Add to orders list
        setOrders(prev => [order, ...prev]);
        setCurrentOrder(order);
        
        console.log('✅ OrderContext: Order created successfully:', order);
        return order;
      } else {
        console.warn('❌ OrderContext: Failed to create order - error:', response.error);
        const errorMessage = response.error || 'Failed to create order';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ OrderContext: Exception in createOrder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, request: UpdateOrderStatusRequest): Promise<Order> => {
    setIsUpdating(true);
    setError(null);
    
    try {
      console.log('🔍 OrderContext: Updating order status:', orderId, request);
      const response = await client.put<Order>(API_ENDPOINTS.orders.updateStatus(orderId), request);
      console.log('🔍 OrderContext: Update order status response:', response);

      if (response.success) {
        const orderData = extractResponseData(response);
        const updatedOrder = convertApiOrderToFrontend(orderData);
        
        // Update in orders list
        setOrders(prev => prev.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        
        // Update current order if it's the same
        if (currentOrder?.id === orderId) {
          setCurrentOrder(updatedOrder);
        }
        
        console.log('✅ OrderContext: Order status updated successfully:', updatedOrder);
        return updatedOrder;
      } else {
        console.warn('❌ OrderContext: Failed to update order status - error:', response.error);
        const errorMessage = response.error || 'Failed to update order status';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ OrderContext: Exception in updateOrderStatus:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel an order
  const cancelOrder = async (orderId: string, request: CancelOrderRequest = {}): Promise<Order> => {
    setIsCancelling(true);
    setError(null);
    
    try {
      console.log('🔍 OrderContext: Cancelling order:', orderId, request);
      const response = await client.put<Order>(API_ENDPOINTS.orders.cancel(orderId), request);
      console.log('🔍 OrderContext: Cancel order response:', response);

      if (response.success) {
        const orderData = extractResponseData(response);
        
        // Find existing order for merge
        const existingOrder = orders.find(o => o.id === orderId) || currentOrder;
        const cancelledOrder = convertApiOrderToFrontend(orderData, existingOrder || undefined);
        
        // Update in orders list
        setOrders(prev => prev.map(order => 
          order.id === orderId ? cancelledOrder : order
        ));
        
        // Update current order if it's the same
        if (currentOrder?.id === orderId) {
          setCurrentOrder(cancelledOrder);
        }
        
        console.log('✅ OrderContext: Order cancelled successfully:', cancelledOrder);
        return cancelledOrder;
      } else {
        console.warn('❌ OrderContext: Failed to cancel order - error:', response.error);
        const errorMessage = response.error || 'Failed to cancel order';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ OrderContext: Exception in cancelOrder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setIsCancelling(false);
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = async (orderId: string): Promise<{ canCancel: boolean; userType: string }> => {
    try {
      console.log('🔍 OrderContext: Checking if order can be cancelled:', orderId);
      const response = await client.get<{ canCancel: boolean; userType: string }>(
        API_ENDPOINTS.orders.canCancel(orderId)
      );
      console.log('🔍 OrderContext: Can cancel order response:', response);

      if (response.success) {
        const data = extractResponseData(response);
        console.log('✅ OrderContext: Can cancel check result:', data);
        return data;
      } else {
        console.warn('❌ OrderContext: Failed to check cancel permission - error:', response.error);
        return { canCancel: false, userType: 'unknown' };
      }
    } catch (error) {
      console.error('❌ OrderContext: Exception in canCancelOrder:', error);
      return { canCancel: false, userType: 'unknown' };
    }
  };

  // Refresh orders (alias for fetchOrders)
  const refreshOrders = async (): Promise<void> => {
    await fetchOrders();
  };

  // Get order by ID - tries cache first, then fetches if not found
  const getOrderById = async (orderId: string): Promise<Order | null> => {
    // First, try to find in local cache
    const cachedOrder = orders.find(order => order.id === orderId);
    if (cachedOrder) {
      console.log('🔍 OrderContext: Found order in cache:', orderId);
      return cachedOrder;
    }
    
    // If not in cache, fetch from API
    console.log('🔍 OrderContext: Order not in cache, fetching from API:', orderId);
    return await fetchOrderById(orderId);
  };

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  // Clear current order
  const clearCurrentOrder = (): void => {
    setCurrentOrder(null);
  };

  // Auto-fetch orders when user changes
  useEffect(() => {
    if (userId) {
      fetchOrders();
    } else {
      setOrders([]);
      setCurrentOrder(null);
    }
  }, [userId]);

  const contextValue: OrderContextType = {
    orders,
    currentOrder,
    isLoading,
    isFetching,
    isCreating,
    isUpdating,
    isCancelling,
    error,
    
    fetchOrders,
    fetchOrderById,
    getOrderById,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    canCancelOrder,
    
    clearError,
    clearCurrentOrder,
    refreshOrders,
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext(): OrderContextType {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
}

export type { Order, OrderItem, CreateOrderRequest, UpdateOrderStatusRequest, CancelOrderRequest, OrderContextType };
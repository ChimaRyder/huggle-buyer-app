/**
 * Custom hook for managing orders using mock services
 * Provides order management functionality
 */

import { useEffect, useState, useCallback } from 'react';
import { MockOrderService } from '../data/mockServices';
import type { BackendOrder, CreateOrderRequest, UpdateOrderRequest } from '../types/BackendModels';
import { OrderStatus } from '../types/BackendModels';

interface UseOrdersOptions {
  status?: OrderStatus;
  autoFetch?: boolean;
}

interface UseOrdersReturn {
  orders: BackendOrder[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createOrder: (request: CreateOrderRequest) => Promise<BackendOrder | null>;
  updateOrder: (request: UpdateOrderRequest) => Promise<BackendOrder | null>;
  getOrderById: (orderId: string) => Promise<BackendOrder | null>;
  getOrdersByStatus: (status: OrderStatus) => BackendOrder[];
  cancelOrder: (orderId: string) => Promise<void>;
}

export const useOrders = (
  userId: string = 'buyer-1', 
  options: UseOrdersOptions = {}
): UseOrdersReturn => {
  const { status, autoFetch = true } = options;
  
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedOrders: BackendOrder[];
      
      if (status !== undefined) {
        fetchedOrders = await MockOrderService.getOrdersByStatus(userId, status);
      } else {
        fetchedOrders = await MockOrderService.getOrdersByUser(userId);
      }
      
      setOrders(fetchedOrders);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const refresh = useCallback(async () => {
    await fetchOrders();
  }, [userId, status]);

  const createOrder = async (request: CreateOrderRequest): Promise<BackendOrder | null> => {
    try {
      setError(null);
      const newOrder = await MockOrderService.createOrder(userId, request);
      
      // Optimistically add to state
      setOrders(prev => [newOrder, ...prev]);
      
      return newOrder;
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      return null;
    }
  };

  const updateOrder = async (request: UpdateOrderRequest): Promise<BackendOrder | null> => {
    try {
      setError(null);
      const updatedOrder = await MockOrderService.updateOrder(request);
      
      // Optimistically update state
      setOrders(prev => 
        prev.map(order => 
          order.id === request.id ? updatedOrder : order
        )
      );
      
      return updatedOrder;
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
      return null;
    }
  };

  const getOrderById = async (orderId: string): Promise<BackendOrder | null> => {
    try {
      return await MockOrderService.getOrderById(orderId);
    } catch (err: any) {
      setError(err.message || 'Failed to get order');
      return null;
    }
  };

  const getOrdersByStatus = useCallback((filterStatus: OrderStatus): BackendOrder[] => {
    return orders.filter(order => order.status === filterStatus);
  }, [orders]);

  const cancelOrder = async (orderId: string): Promise<void> => {
    try {
      setError(null);
      
      // Update order status to cancelled
      await updateOrder({ 
        id: orderId, 
        status: OrderStatus.Cancelled 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [userId, status, autoFetch]);

  return {
    orders,
    loading,
    error,
    refresh,
    createOrder,
    updateOrder,
    getOrderById,
    getOrdersByStatus,
    cancelOrder,
  };
};

export default useOrders;
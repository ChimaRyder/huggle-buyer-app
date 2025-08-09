/**
 * Custom hook for managing cart operations using mock services
 * Provides full cart functionality with optimistic updates
 */

import { useEffect, useState, useCallback } from 'react';
import { MockCartService } from '../data/mockServices';
import type { BackendCartItem, AddToCartRequest, UpdateCartItemRequest } from '../types/BackendModels';

interface UseCartReturn {
  items: BackendCartItem[];
  loading: boolean;
  error: string | null;
  itemCount: number;
  totalAmount: number;
  refresh: () => Promise<void>;
  addItem: (request: AddToCartRequest) => Promise<BackendCartItem | null>;
  updateItem: (request: UpdateCartItemRequest) => Promise<BackendCartItem | null>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isItemInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

export const useCart = (userId: string = 'buyer-1'): UseCartReturn => {
  const [items, setItems] = useState<BackendCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => {
    const price = item.product?.discountedPrice || 0;
    return sum + (price * item.quantity);
  }, 0);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const cartItems = await MockCartService.getCartItems(userId);
      setItems(cartItems);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  const refresh = useCallback(async () => {
    await fetchCartItems();
  }, [userId]);

  const addItem = async (request: AddToCartRequest): Promise<BackendCartItem | null> => {
    try {
      setError(null);
      const newItem = await MockCartService.addToCart(userId, request);
      
      // Optimistically update state
      const existingItemIndex = items.findIndex(item => item.productId === request.productId);
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...items];
        updatedItems[existingItemIndex] = newItem;
        setItems(updatedItems);
      } else {
        // Add new item
        setItems(prev => [...prev, newItem]);
      }
      
      return newItem;
    } catch (err: any) {
      setError(err.message || 'Failed to add item to cart');
      return null;
    }
  };

  const updateItem = async (request: UpdateCartItemRequest): Promise<BackendCartItem | null> => {
    try {
      setError(null);
      const updatedItem = await MockCartService.updateCartItem(userId, request);
      
      // Optimistically update state
      setItems(prev => 
        prev.map(item => 
          item.id === request.id ? updatedItem : item
        )
      );
      
      return updatedItem;
    } catch (err: any) {
      setError(err.message || 'Failed to update cart item');
      return null;
    }
  };

  const removeItem = async (itemId: string): Promise<void> => {
    try {
      setError(null);
      
      // Optimistically update state first
      const originalItems = items;
      setItems(prev => prev.filter(item => item.id !== itemId));
      
      try {
        await MockCartService.removeCartItem(userId, itemId);
      } catch (err) {
        // Revert on error
        setItems(originalItems);
        throw err;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove cart item');
    }
  };

  const clearCart = async (): Promise<void> => {
    try {
      setError(null);
      
      // Optimistically update state first
      const originalItems = items;
      setItems([]);
      
      try {
        await MockCartService.clearCart(userId);
      } catch (err) {
        // Revert on error
        setItems(originalItems);
        throw err;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart');
    }
  };

  const isItemInCart = useCallback((productId: string): boolean => {
    return items.some(item => item.productId === productId);
  }, [items]);

  const getItemQuantity = useCallback((productId: string): number => {
    const item = items.find(item => item.productId === productId);
    return item?.quantity || 0;
  }, [items]);

  useEffect(() => {
    fetchCartItems();
  }, [userId]);

  return {
    items,
    loading,
    error,
    itemCount,
    totalAmount,
    refresh,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    isItemInCart,
    getItemQuantity,
  };
};

export default useCart;
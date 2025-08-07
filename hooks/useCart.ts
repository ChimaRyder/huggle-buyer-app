/**
 * useCart Hook
 * Custom hook for managing cart operations with optimistic updates and persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useCartState } from '@/context/AppStateContext';
import type { BackendCartItem, AddToCartRequest, UpdateCartItemRequest } from '@/types/BackendModels';
import type { LoadingState } from '@/types/common';

interface UseCartReturn extends LoadingState {
  items: BackendCartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CART_STORAGE_KEY = 'user_cart';

export const useCart = (): UseCartReturn => {
  const { getToken } = useAuth();
  const { items, loading, error, actions } = useCartState();
  
  const [localLoading, setLocalLoading] = useState(false);
  const isMountedRef = useRef(true);

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.product?.discountedPrice || item.product?.originalPrice || 0;
    return sum + (price * item.quantity);
  }, 0);

  // Persist cart to local storage
  const persistCart = useCallback(async (cartItems: BackendCartItem[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to persist cart:', error);
    }
  }, []);

  // Load cart from local storage
  const loadPersistedCart = useCallback(async (): Promise<BackendCartItem[]> => {
    try {
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load persisted cart:', error);
      return [];
    }
  }, []);

  // Sync with backend (placeholder - implement actual API calls)
  const syncWithBackend = useCallback(async (cartItems: BackendCartItem[]): Promise<void> => {
    try {
      const token = await getToken();
      if (!token) return;

      // TODO: Implement actual backend sync
      // await CartService.syncCart(token, cartItems);
      console.log('Cart sync with backend (placeholder):', cartItems.length, 'items');
    } catch (error) {
      console.error('Failed to sync cart with backend:', error);
    }
  }, [getToken]);

  // Add item to cart with optimistic updates
  const addToCart = useCallback(async (productId: string, quantity: number): Promise<void> => {
    try {
      setLocalLoading(true);
      
      // Check if item already exists
      const existingItem = items.find(item => item.productId === productId);
      
      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;
        await updateQuantity(existingItem.id, newQuantity);
        return;
      }

      // Create optimistic cart item
      const optimisticItem: BackendCartItem = {
        id: `temp_${Date.now()}`, // Temporary ID
        buyerId: 'current_user', // Will be replaced by backend
        productId,
        quantity,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // product will be populated by backend or separate fetch
      };

      // Optimistic update
      actions.addItem(optimisticItem);
      
      // Persist locally
      const updatedItems = [...items, optimisticItem];
      await persistCart(updatedItems);
      
      // Sync with backend
      await syncWithBackend(updatedItems);
      
      actions.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
      console.error('Error adding to cart:', error);
      actions.setError(errorMessage);
      
      // Revert optimistic update if needed
      // In a real implementation, you'd have a more sophisticated rollback mechanism
    } finally {
      if (isMountedRef.current) {
        setLocalLoading(false);
      }
    }
  }, [items, actions, persistCart, syncWithBackend]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<void> => {
    try {
      setLocalLoading(true);
      
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      // Optimistic update
      actions.updateItem(itemId, quantity);
      
      // Persist locally
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, quantity, updatedAt: new Date().toISOString() } : item
      );
      await persistCart(updatedItems);
      
      // Sync with backend
      await syncWithBackend(updatedItems);
      
      actions.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quantity';
      console.error('Error updating quantity:', error);
      actions.setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setLocalLoading(false);
      }
    }
  }, [items, actions, persistCart, syncWithBackend, removeFromCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string): Promise<void> => {
    try {
      setLocalLoading(true);
      
      // Optimistic update
      actions.removeItem(itemId);
      
      // Persist locally
      const updatedItems = items.filter(item => item.id !== itemId);
      await persistCart(updatedItems);
      
      // Sync with backend
      await syncWithBackend(updatedItems);
      
      actions.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
      console.error('Error removing from cart:', error);
      actions.setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setLocalLoading(false);
      }
    }
  }, [items, actions, persistCart, syncWithBackend]);

  // Clear entire cart
  const clearCart = useCallback(async (): Promise<void> => {
    try {
      setLocalLoading(true);
      
      // Clear state
      actions.setItems([]);
      
      // Clear local storage
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      
      // Sync with backend
      await syncWithBackend([]);
      
      actions.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
      console.error('Error clearing cart:', error);
      actions.setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setLocalLoading(false);
      }
    }
  }, [actions, syncWithBackend]);

  // Refresh cart from backend
  const refreshCart = useCallback(async (): Promise<void> => {
    try {
      actions.setLoading(true);
      
      const token = await getToken();
      if (!token) {
        // Load from local storage if no token
        const persistedCart = await loadPersistedCart();
        actions.setItems(persistedCart);
        return;
      }

      // TODO: Implement actual backend fetch
      // const response = await CartService.getCart(token);
      // if (response.success && response.data) {
      //   actions.setItems(response.data);
      //   await persistCart(response.data);
      // }
      
      // For now, just load from local storage
      const persistedCart = await loadPersistedCart();
      actions.setItems(persistedCart);
      
      actions.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh cart';
      console.error('Error refreshing cart:', error);
      actions.setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        actions.setLoading(false);
      }
    }
  }, [getToken, actions, loadPersistedCart, persistCart]);

  // Check if product is in cart
  const isInCart = useCallback((productId: string): boolean => {
    return items.some(item => item.productId === productId);
  }, [items]);

  // Get quantity of specific product in cart
  const getItemQuantity = useCallback((productId: string): number => {
    const item = items.find(item => item.productId === productId);
    return item?.quantity || 0;
  }, [items]);

  // Load cart on mount
  useEffect(() => {
    refreshCart();

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshCart]);

  // Update mounted ref
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    items,
    totalItems,
    totalPrice,
    isLoading: loading || localLoading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    isInCart,
    getItemQuantity,
  };
};
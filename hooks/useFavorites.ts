/**
 * useFavorites Hook
 * Custom hook for managing user's favorite products with local persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFavoritesState } from '@/context/AppStateContext';
import type { LoadingState } from '@/types/common';

interface UseFavoritesReturn extends LoadingState {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  clearFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  totalFavorites: number;
}

const FAVORITES_STORAGE_KEY = 'user_favorites';

export const useFavorites = (): UseFavoritesReturn => {
  const { getToken } = useAuth();
  const { productIds, loading, error, actions } = useFavoritesState();
  
  const [localLoading, setLocalLoading] = useState(false);
  const isMountedRef = useRef(true);

  // Persist favorites to local storage
  const persistFavorites = useCallback(async (favorites: string[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to persist favorites:', error);
    }
  }, []);

  // Load favorites from local storage
  const loadPersistedFavorites = useCallback(async (): Promise<string[]> => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load persisted favorites:', error);
      return [];
    }
  }, []);

  // Sync with backend (placeholder - implement actual API calls)
  const syncWithBackend = useCallback(async (favorites: string[]): Promise<void> => {
    try {
      const token = await getToken();
      if (!token) return;

      // TODO: Implement actual backend sync
      // await UserService.updateFavorites(token, favorites);
      console.log('Favorites sync with backend (placeholder):', favorites.length, 'items');
    } catch (error) {
      console.error('Failed to sync favorites with backend:', error);
    }
  }, [getToken]);

  // Check if product is favorite
  const isFavorite = useCallback((productId: string): boolean => {
    return productIds.includes(productId);
  }, [productIds]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (productId: string): Promise<void> => {
    if (isFavorite(productId)) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // Add product to favorites
  const addFavorite = useCallback(async (productId: string): Promise<void> => {
    try {
      setLocalLoading(true);
      
      // Check if already favorite
      if (isFavorite(productId)) {
        return;
      }

      // Optimistic update
      actions.addItem(productId);
      
      // Persist locally
      const updatedFavorites = [...productIds, productId];
      await persistFavorites(updatedFavorites);
      
      // Sync with backend
      await syncWithBackend(updatedFavorites);
      
      actions.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add favorite';
      console.error('Error adding favorite:', error);
      actions.setError(errorMessage);
      
      // Revert optimistic update
      actions.removeItem(productId);
    } finally {
      if (isMountedRef.current) {
        setLocalLoading(false);
      }
    }
  }, [productIds, isFavorite, actions, persistFavorites, syncWithBackend]);

  // Remove product from favorites
  const removeFavorite = useCallback(async (productId: string): Promise<void> => {
    try {
      setLocalLoading(true);
      
      // Check if actually favorite
      if (!isFavorite(productId)) {
        return;
      }

      // Optimistic update
      actions.removeItem(productId);
      
      // Persist locally
      const updatedFavorites = productIds.filter(id => id !== productId);
      await persistFavorites(updatedFavorites);
      
      // Sync with backend
      await syncWithBackend(updatedFavorites);
      
      actions.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove favorite';
      console.error('Error removing favorite:', error);
      actions.setError(errorMessage);
      
      // Revert optimistic update
      actions.addItem(productId);
    } finally {
      if (isMountedRef.current) {
        setLocalLoading(false);
      }
    }
  }, [productIds, isFavorite, actions, persistFavorites, syncWithBackend]);

  // Clear all favorites
  const clearFavorites = useCallback(async (): Promise<void> => {
    try {
      setLocalLoading(true);
      
      // Clear state
      actions.setItems([]);
      
      // Clear local storage
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
      
      // Sync with backend
      await syncWithBackend([]);
      
      actions.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear favorites';
      console.error('Error clearing favorites:', error);
      actions.setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setLocalLoading(false);
      }
    }
  }, [actions, syncWithBackend]);

  // Refresh favorites from backend
  const refreshFavorites = useCallback(async (): Promise<void> => {
    try {
      actions.setLoading(true);
      
      const token = await getToken();
      if (!token) {
        // Load from local storage if no token
        const persistedFavorites = await loadPersistedFavorites();
        actions.setItems(persistedFavorites);
        return;
      }

      // TODO: Implement actual backend fetch
      // const response = await UserService.getFavorites(token);
      // if (response.success && response.data) {
      //   actions.setItems(response.data);
      //   await persistFavorites(response.data);
      // }
      
      // For now, just load from local storage
      const persistedFavorites = await loadPersistedFavorites();
      actions.setItems(persistedFavorites);
      
      actions.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh favorites';
      console.error('Error refreshing favorites:', error);
      actions.setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        actions.setLoading(false);
      }
    }
  }, [getToken, actions, loadPersistedFavorites, persistFavorites]);

  // Load favorites on mount
  useEffect(() => {
    refreshFavorites();

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshFavorites]);

  // Update mounted ref
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    favoriteIds: productIds,
    totalFavorites: productIds.length,
    isLoading: loading || localLoading,
    error,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    refreshFavorites,
  };
};
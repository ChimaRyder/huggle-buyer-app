/**
 * Custom hook for managing stores using mock services
 * Provides store search, favorites, and location-based queries
 */

import { useEffect, useState, useCallback } from 'react';
import { MockStoreService } from '../data/mockServices';
import type { BackendStore } from '../types/BackendModels';

interface UseStoresOptions {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  autoFetch?: boolean;
}

interface UseStoresReturn {
  stores: BackendStore[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  searchStores: (query: string) => Promise<BackendStore[]>;
  getStoreById: (id: string) => Promise<BackendStore | null>;
  getNearbyStores: (lat: number, lng: number, radius?: number) => Promise<BackendStore[]>;
  getFavoriteStores: () => Promise<BackendStore[]>;
}

export const useStores = (options: UseStoresOptions = {}): UseStoresReturn => {
  const { latitude, longitude, radiusKm = 10, autoFetch = true } = options;
  
  const [stores, setStores] = useState<BackendStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedStores: BackendStore[];
      
      if (latitude && longitude) {
        fetchedStores = await MockStoreService.getNearbyStores(latitude, longitude, radiusKm);
      } else {
        fetchedStores = await MockStoreService.getAllStores();
      }
      
      setStores(fetchedStores);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const refresh = useCallback(async () => {
    await fetchStores();
  }, [latitude, longitude, radiusKm]);

  const searchStores = async (query: string): Promise<BackendStore[]> => {
    try {
      return await MockStoreService.searchStores(query);
    } catch (err: any) {
      setError(err.message || 'Failed to search stores');
      return [];
    }
  };

  const getStoreById = async (id: string): Promise<BackendStore | null> => {
    try {
      return await MockStoreService.getStoreById(id);
    } catch (err: any) {
      setError(err.message || 'Failed to get store');
      return null;
    }
  };

  const getNearbyStores = async (lat: number, lng: number, radius = 10): Promise<BackendStore[]> => {
    try {
      setLoading(true);
      setError(null);
      const nearby = await MockStoreService.getNearbyStores(lat, lng, radius);
      setStores(nearby);
      return nearby;
    } catch (err: any) {
      setError(err.message || 'Failed to get nearby stores');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getFavoriteStores = async (): Promise<BackendStore[]> => {
    try {
      // Using mock buyer ID - in real app would use current user
      return await MockStoreService.getFavoriteStores('buyer-1');
    } catch (err: any) {
      setError(err.message || 'Failed to get favorite stores');
      return [];
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchStores();
    }
  }, [latitude, longitude, radiusKm, autoFetch]);

  return {
    stores,
    loading,
    error,
    refresh,
    searchStores,
    getStoreById,
    getNearbyStores,
    getFavoriteStores,
  };
};

export default useStores;
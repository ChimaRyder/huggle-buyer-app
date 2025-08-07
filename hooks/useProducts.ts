/**
 * useProducts Hook
 * Custom hook for managing product-related operations with caching and state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';

import { ProductService } from '@/services/productService';
import { useProductsState } from '@/context/AppStateContext';
import type { BackendProduct } from '@/types/BackendModels';
import type { PaginationParams, LoadingState } from '@/types/common';

interface UseProductsOptions {
  productType?: string;
  pagination?: PaginationParams;
  autoFetch?: boolean;
  cacheKey?: string;
}

interface UseProductsReturn extends LoadingState {
  products: BackendProduct[];
  fetchProducts: () => Promise<void>;
  refetchProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  clearProducts: () => void;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: BackendProduct[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const {
    productType,
    pagination = { page: 1, limit: 20 },
    autoFetch = true,
    cacheKey,
  } = options;

  const { getToken } = useAuth();
  const { items: globalProducts, actions } = useProductsState();
  
  const [localState, setLocalState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });
  
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(pagination.page || 1);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Generate cache key
  const generateCacheKey = useCallback((type?: string, page = 1): string => {
    if (cacheKey) return cacheKey;
    return `products_${type || 'all'}_${page}`;
  }, [cacheKey]);

  // Check if cached data is still valid
  const getCachedData = useCallback((key: string): BackendProduct[] | null => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Set cached data
  const setCachedData = useCallback((key: string, data: BackendProduct[]): void => {
    cache.set(key, { data, timestamp: Date.now() });
  }, []);

  // Fetch products with caching
  const fetchProducts = useCallback(async (
    page = currentPage,
    append = false
  ): Promise<void> => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const key = generateCacheKey(productType, page);
      
      // Check cache first
      const cachedData = getCachedData(key);
      if (cachedData && page === 1 && !append) {
        if (isMountedRef.current) {
          actions.setItems(cachedData);
          setLocalState({ isLoading: false, error: null });
        }
        return;
      }

      // Set loading state
      setLocalState({ isLoading: true, error: null });
      if (!append) {
        actions.setLoading(true);
      }

      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await ProductService.getAllProducts(token, {
        productType,
        pagination: { ...pagination, page },
      });

      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        const newProducts = response.data;
        
        // Cache the data
        setCachedData(key, newProducts);
        
        // Update state
        if (append && page > 1) {
          // Append to existing products
          const updatedProducts = [...globalProducts, ...newProducts];
          actions.setItems(updatedProducts);
        } else {
          // Replace products
          actions.setItems(newProducts);
        }
        
        // Update pagination state
        setHasMore(newProducts.length >= (pagination.limit || 20));
        setCurrentPage(page);
        
        setLocalState({ isLoading: false, error: null });
        actions.setError(null);
      } else {
        throw new Error(response.error || 'Failed to fetch products');
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching products:', error);
      
      setLocalState({ isLoading: false, error: errorMessage });
      actions.setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        actions.setLoading(false);
      }
    }
  }, [
    currentPage,
    productType,
    pagination,
    getToken,
    generateCacheKey,
    getCachedData,
    setCachedData,
    globalProducts,
    actions,
  ]);

  // Refetch products (bypass cache)
  const refetchProducts = useCallback(async (): Promise<void> => {
    // Clear cache for this key
    const key = generateCacheKey(productType, 1);
    cache.delete(key);
    setCurrentPage(1);
    await fetchProducts(1, false);
  }, [generateCacheKey, productType, fetchProducts]);

  // Load more products (pagination)
  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || localState.isLoading) return;
    await fetchProducts(currentPage + 1, true);
  }, [hasMore, localState.isLoading, fetchProducts, currentPage]);

  // Search products
  const searchProducts = useCallback(async (query: string): Promise<void> => {
    try {
      setLocalState({ isLoading: true, error: null });
      actions.setLoading(true);

      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await ProductService.searchProducts(query, token, {
        category: productType,
        pagination,
      });

      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        actions.setItems(response.data);
        setLocalState({ isLoading: false, error: null });
        actions.setError(null);
        
        // Update search filters in global state
        actions.setFilters({ searchQuery: query });
      } else {
        throw new Error(response.error || 'Search failed');
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      console.error('Error searching products:', error);
      
      setLocalState({ isLoading: false, error: errorMessage });
      actions.setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        actions.setLoading(false);
      }
    }
  }, [getToken, productType, pagination, actions]);

  // Clear products
  const clearProducts = useCallback((): void => {
    actions.setItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setLocalState({ isLoading: false, error: null });
  }, [actions]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchProducts(1, false);
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, fetchProducts]);

  // Update mounted ref
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    products: globalProducts,
    isLoading: localState.isLoading,
    error: localState.error,
    fetchProducts: () => fetchProducts(1, false),
    refetchProducts,
    searchProducts,
    clearProducts,
    hasMore,
    loadMore,
  };
};
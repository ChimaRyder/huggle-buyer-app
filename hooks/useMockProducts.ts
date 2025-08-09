/**
 * Custom hook for managing products using mock services
 * Provides CRUD operations and state management for products
 */

import { useEffect, useState } from 'react';
import { MockProductService } from '../data/mockServices';
import type { BackendProduct } from '../types/BackendModels';

interface UseProductsOptions {
  category?: string;
  storeId?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: BackendProduct[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  searchProducts: (query: string) => Promise<BackendProduct[]>;
  getProductById: (id: string) => Promise<BackendProduct | null>;
  getFeaturedProducts: (limit?: number) => Promise<void>;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const { category, storeId, limit, autoFetch = true } = options;
  
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedProducts: BackendProduct[];
      
      if (storeId) {
        fetchedProducts = await MockProductService.getProductsByStore(storeId);
      } else if (category) {
        fetchedProducts = await MockProductService.getProductsByCategory(category);
      } else {
        fetchedProducts = await MockProductService.getFeaturedProducts(limit);
      }
      
      setProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchProducts();
  };

  const searchProducts = async (query: string): Promise<BackendProduct[]> => {
    try {
      return await MockProductService.searchProducts(query);
    } catch (err: any) {
      setError(err.message || 'Failed to search products');
      return [];
    }
  };

  const getProductById = async (id: string): Promise<BackendProduct | null> => {
    try {
      return await MockProductService.getProductById(id);
    } catch (err: any) {
      setError(err.message || 'Failed to get product');
      return null;
    }
  };

  const getFeaturedProducts = async (limit?: number) => {
    try {
      setLoading(true);
      setError(null);
      const featured = await MockProductService.getFeaturedProducts(limit || 10);
      setProducts(featured);
    } catch (err: any) {
      setError(err.message || 'Failed to get featured products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [category, storeId, limit, autoFetch]);

  return {
    products,
    loading,
    error,
    refresh,
    searchProducts,
    getProductById,
    getFeaturedProducts,
  };
};

export default useProducts;
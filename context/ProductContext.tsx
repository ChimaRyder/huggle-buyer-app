import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useApi } from './ApiContext';
import { useLocationContext } from './LocationContext';
import { API_ENDPOINTS } from '@/constants/config';
import type { BackendProduct, ProductsResponse, ProductResponse } from '@/types/BackendModels';

interface ProductContextType {
  // Trending Products
  trendingProducts: BackendProduct[];
  isFetchingTrending: boolean;
  trendingError: string | null;
  fetchTrendingProducts: (latitude?: number, longitude?: number, radiusKm?: number) => Promise<void>;
  
  // Product by ID  
  currentProduct: BackendProduct | null;
  isFetchingProduct: boolean;
  productError: string | null;
  fetchProductById: (id: string) => Promise<void>;
  clearCurrentProduct: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export function ProductProvider({ children }: ProductProviderProps) {
  // Trending Products state
  const [trendingProducts, setTrendingProducts] = useState<BackendProduct[]>([]);
  const [isFetchingTrending, setIsFetchingTrending] = useState(false);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  
  // Product by ID state
  const [currentProduct, setCurrentProduct] = useState<BackendProduct | null>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  
  const { client } = useApi();
  
  // Get location context outside the provider scope - we'll access it through hook in components
  // For now, we'll add a parameter to accept location

  const fetchTrendingProducts = useCallback(async (latitude?: number, longitude?: number, radiusKm: number = 10): Promise<void> => {
    setIsFetchingTrending(true);
    setTrendingError(null);
    
    try {
      console.log('🔍 ProductContext: Starting fetchTrendingProducts with location:', { latitude, longitude, radiusKm });
      
      // Use location-based endpoint if coordinates are provided, otherwise fallback to general endpoint
      let endpoint: string;
      if (latitude !== undefined && longitude !== undefined) {
        endpoint = API_ENDPOINTS.products.trendingByLocation(latitude, longitude, radiusKm, 20);
        console.log('🔍 ProductContext: Using location-based endpoint:', endpoint);
      } else {
        endpoint = API_ENDPOINTS.products.trending;
        console.log('🔍 ProductContext: Using general trending endpoint:', endpoint);
      }
      
      const response = await client.get<BackendProduct[]>(endpoint);
      console.log('🔍 ProductContext: Raw API response:', response);

      if (response.success && response.data) {
        console.log('✅ ProductContext: Fetch trending products response:', response.data, 'Type:', typeof response.data, 'Is Array:', Array.isArray(response.data));
        
        // Handle nested response structure for trending products API
        let productsArray: BackendProduct[] = [];
        if (Array.isArray(response.data)) {
          productsArray = response.data;
        } else if (response.data && response.data.data) {
          // Handle the new API structure: {success: true, data: {items: [...], totalCount: 11, ...}}
          if (Array.isArray(response.data.data.items)) {
            console.log('🔍 ProductContext: Found location-based API response structure with items array');
            productsArray = response.data.data.items;
          } else if (Array.isArray(response.data.data)) {
            console.log('🔍 ProductContext: Found nested data array structure');
            productsArray = response.data.data;
          }
        } else if (response.data && Array.isArray((response.data as any).items)) {
          console.log('🔍 ProductContext: Found items array directly in response.data');
          productsArray = (response.data as any).items;
        }
        
        console.log('🔍 ProductContext: Processed products array:', productsArray.length, 'items');
        setTrendingProducts(productsArray);
        console.log('✅ ProductContext: Set trendingProducts to:', productsArray.length, 'items');
      } else {
        console.warn('❌ ProductContext: Failed to fetch trending products - success:', response.success, 'error:', response.error);
        setTrendingError(response.error || 'Failed to fetch trending products');
        setTrendingProducts([]);
      }
    } catch (error) {
      console.error('❌ ProductContext: Exception in fetchTrendingProducts:', error);
      console.error('❌ ProductContext: Exception type:', typeof error);
      console.error('❌ ProductContext: Exception details:', error instanceof Error ? error.message : String(error));
      setTrendingError(error instanceof Error ? error.message : 'Unknown error occurred');
      setTrendingProducts([]);
    } finally {
      setIsFetchingTrending(false);
      console.log('🔍 ProductContext: fetchTrendingProducts finished, isFetchingTrending set to false');
    }
  }, [client]);

  const fetchProductById = useCallback(async (id: string): Promise<void> => {
    setIsFetchingProduct(true);
    setProductError(null);
    
    try {
      console.log('🔍 ProductContext: Starting fetchProductById for id:', id);
      const response = await client.get<BackendProduct>(API_ENDPOINTS.products.byId(id));
      console.log('🔍 ProductContext: Raw API response for product:', response);

      if (response.success && response.data) {
        console.log('✅ ProductContext: Fetch product by ID response:', response.data);
        
        // Handle nested response structure similar to LocationContext
        let productData: BackendProduct;
        if ((response.data as any).data && typeof (response.data as any).data === 'object') {
          console.log('🔍 ProductContext: Found nested data structure, extracting product');
          productData = (response.data as any).data;
        } else {
          productData = response.data as BackendProduct;
        }
        
        console.log('🔍 ProductContext: Processed product data:', productData);
        setCurrentProduct(productData);
        console.log('✅ ProductContext: Set currentProduct to:', productData);
      } else {
        console.warn('❌ ProductContext: Failed to fetch product by ID - success:', response.success, 'error:', response.error);
        setProductError(response.error || 'Failed to fetch product');
        setCurrentProduct(null);
      }
    } catch (error) {
      console.error('❌ ProductContext: Exception in fetchProductById:', error);
      console.error('❌ ProductContext: Exception type:', typeof error);
      console.error('❌ ProductContext: Exception details:', error instanceof Error ? error.message : String(error));
      setProductError(error instanceof Error ? error.message : 'Unknown error occurred');
      setCurrentProduct(null);
    } finally {
      setIsFetchingProduct(false);
      console.log('🔍 ProductContext: fetchProductById finished, isFetchingProduct set to false');
    }
  }, [client]);

  const clearCurrentProduct = useCallback((): void => {
    setCurrentProduct(null);
    setProductError(null);
  }, []);

  const contextValue: ProductContextType = {
    // Trending Products
    trendingProducts,
    isFetchingTrending,
    trendingError,
    fetchTrendingProducts,
    
    // Product by ID
    currentProduct,
    isFetchingProduct,
    productError,
    fetchProductById,
    clearCurrentProduct,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext(): ProductContextType {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
}

export type { ProductContextType };
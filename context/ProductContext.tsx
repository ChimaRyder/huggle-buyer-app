import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useApi } from './ApiContext';
import { useLocationContext } from './LocationContext';
import { API_ENDPOINTS } from '@/constants/config';
import type { BackendProduct, ProductsResponse, ProductResponse, BackendBundle, BundleResponse } from '@/types/BackendModels';

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
  
  // Bundle by ID
  currentBundle: BackendBundle | null;
  isFetchingBundle: boolean;
  bundleError: string | null;
  fetchBundleById: (id: string) => Promise<void>;
  clearCurrentBundle: () => void;
  
  // Helper to check if current item is a bundle
  isCurrentItemBundle: boolean;
  currentItem: BackendProduct | BackendBundle | null;
  
  // Smart fetch that tries both product and bundle endpoints
  fetchItemById: (id: string) => Promise<void>;
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
  
  // Bundle by ID state
  const [currentBundle, setCurrentBundle] = useState<BackendBundle | null>(null);
  const [isFetchingBundle, setIsFetchingBundle] = useState(false);
  const [bundleError, setBundleError] = useState<string | null>(null);
  
  const { client } = useApi();
  
  // Helper computed values
  const isCurrentItemBundle = currentBundle !== null;
  const currentItem = currentBundle || currentProduct;
  
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
    // Clear bundle when fetching product
    setCurrentBundle(null);
    setBundleError(null);
    
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

  const fetchBundleById = useCallback(async (id: string): Promise<void> => {
    setIsFetchingBundle(true);
    setBundleError(null);
    // Clear product when fetching bundle
    setCurrentProduct(null);
    setProductError(null);
    
    try {
      console.log('🔍 ProductContext: Starting fetchBundleById for id:', id);
      const response = await client.get<BackendBundle>(API_ENDPOINTS.bundles.byId(id));
      console.log('🔍 ProductContext: Raw API response for bundle:', response);

      if (response.success && response.data) {
        console.log('✅ ProductContext: Fetch bundle by ID response:', response.data);
        
        // Handle nested response structure similar to products
        let bundleData: BackendBundle;
        if ((response.data as any).data && typeof (response.data as any).data === 'object') {
          console.log('🔍 ProductContext: Found nested data structure, extracting bundle');
          bundleData = (response.data as any).data;
        } else {
          bundleData = response.data as BackendBundle;
        }
        
        console.log('🔍 ProductContext: Processed bundle data:', bundleData);
        setCurrentBundle(bundleData);
        console.log('✅ ProductContext: Set currentBundle to:', bundleData);
      } else {
        console.warn('❌ ProductContext: Failed to fetch bundle by ID - success:', response.success, 'error:', response.error);
        setBundleError(response.error || 'Failed to fetch bundle');
        setCurrentBundle(null);
      }
    } catch (error) {
      console.error('❌ ProductContext: Exception in fetchBundleById:', error);
      console.error('❌ ProductContext: Exception type:', typeof error);
      console.error('❌ ProductContext: Exception details:', error instanceof Error ? error.message : String(error));
      setBundleError(error instanceof Error ? error.message : 'Unknown error occurred');
      setCurrentBundle(null);
    } finally {
      setIsFetchingBundle(false);
      console.log('🔍 ProductContext: fetchBundleById finished, isFetchingBundle set to false');
    }
  }, [client]);

  const clearCurrentProduct = useCallback((): void => {
    setCurrentProduct(null);
    setProductError(null);
  }, []);

  const clearCurrentBundle = useCallback((): void => {
    setCurrentBundle(null);
    setBundleError(null);
  }, []);

  const fetchItemById = useCallback(async (id: string): Promise<void> => {
    console.log('🔍 ProductContext: Starting smart fetchItemById for id:', id);
    
    // Clear both states
    setCurrentProduct(null);
    setCurrentBundle(null);
    setProductError(null);
    setBundleError(null);
    
    // Start loading
    setIsFetchingProduct(true);
    setIsFetchingBundle(false);
    
    try {
      // First, try as a product
      console.log('🔍 ProductContext: Trying as product first...');
      const productResponse = await client.get<BackendProduct>(API_ENDPOINTS.products.byId(id));
      
      if (productResponse.success && productResponse.data) {
        console.log('✅ ProductContext: Found as product:', productResponse.data);
        
        // Handle nested response structure
        let productData: BackendProduct;
        if ((productResponse.data as any).data && typeof (productResponse.data as any).data === 'object') {
          productData = (productResponse.data as any).data;
        } else {
          productData = productResponse.data as BackendProduct;
        }
        
        setCurrentProduct(productData);
        setIsFetchingProduct(false);
        console.log('✅ ProductContext: Successfully set as product');
        return;
      }
    } catch (productError) {
      console.log('🔍 ProductContext: Product fetch failed, trying as bundle...', productError);
    }
    
    // If product fetch failed, try as bundle
    setIsFetchingProduct(false);
    setIsFetchingBundle(true);
    
    try {
      console.log('🔍 ProductContext: Trying as bundle...');
      const bundleResponse = await client.get<BackendBundle>(API_ENDPOINTS.bundles.byId(id));
      
      if (bundleResponse.success && bundleResponse.data) {
        console.log('✅ ProductContext: Found as bundle:', bundleResponse.data);
        
        // Handle nested response structure
        let bundleData: BackendBundle;
        if ((bundleResponse.data as any).data && typeof (bundleResponse.data as any).data === 'object') {
          bundleData = (bundleResponse.data as any).data;
        } else {
          bundleData = bundleResponse.data as BackendBundle;
        }
        
        setCurrentBundle(bundleData);
        setIsFetchingBundle(false);
        console.log('✅ ProductContext: Successfully set as bundle');
        return;
      }
    } catch (bundleError) {
      console.log('❌ ProductContext: Bundle fetch also failed:', bundleError);
    }
    
    // Both failed
    setIsFetchingBundle(false);
    setProductError('Item not found');
    setBundleError('Item not found');
    console.error('❌ ProductContext: Item not found as either product or bundle');
    
  }, [client]);

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
    
    // Bundle by ID
    currentBundle,
    isFetchingBundle,
    bundleError,
    fetchBundleById,
    clearCurrentBundle,
    
    // Helper values
    isCurrentItemBundle,
    currentItem,
    
    // Smart fetch function
    fetchItemById,
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
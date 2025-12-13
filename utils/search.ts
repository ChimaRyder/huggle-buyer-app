/**
 * Search service utilities for products and stores
 * Uses the actual backend API endpoints with built-in prioritization
 */

import { useApi } from '@/context/ApiContext';
import { API_ENDPOINTS } from '@/constants/config';
import type { BackendProduct, BackendStore } from '@/types/BackendModels';

// Search request types matching the backend
export interface ProductSearchRequest {
  searchTerm?: string;
  category?: string;
  storeId?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  productType?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'Name' | 'Price' | 'CreatedAt' | 'ExpiresOn' | 'Stock';
  sortDirection?: 'Ascending' | 'Descending';
}

export interface StoreSearchRequest {
  searchTerm?: string;
  name?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
}

export interface SearchResults {
  products: BackendProduct[];
  stores: BackendStore[];
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * Search products using the backend's product search API
 * Searches through product names, descriptions, and tags
 */
export const searchProducts = async (
  apiClient: any,
  params: ProductSearchRequest
): Promise<{ products: BackendProduct[]; pagination?: any }> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.category) queryParams.append('category', params.category);
    if (params.storeId) queryParams.append('storeId', params.storeId);
    if (params.latitude !== undefined) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude !== undefined) queryParams.append('longitude', params.longitude.toString());
    if (params.radiusKm !== undefined) queryParams.append('radiusKm', params.radiusKm.toString());
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.productType) queryParams.append('productType', params.productType);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    // Add tags as separate parameters - only if backend supports it
    // For now, we'll include searchTerm in tags but won't send separate tag params
    // to avoid backend 500 errors until the API is updated
    // if (params.tags && params.tags.length > 0) {
    //   params.tags.forEach(tag => queryParams.append('tags', tag));
    // }

    // Search only in product fields - let stores be searched separately
    // No additional search parameters needed for basic product search

    const endpoint = `${API_ENDPOINTS.search.products}?${queryParams.toString()}`;
    console.log('🔍 Product Search - Full URL:', endpoint);
    console.log('🔍 Product Search - Parameters:', params);

    const response = await apiClient.get(endpoint);
    console.log('📥 Product Search - Raw Response:', response);
    console.log('📥 Product Search - Response Success:', response.success);
    console.log('📥 Product Search - Response Data:', response.data);

    if (response.success) {
      // Handle nested response structure: response.data.data.items
      const responseData = response.data?.data || response.data || {};
      const products = responseData.items || responseData || [];
      console.log('✅ Product Search - Response Data Structure:', responseData);
      console.log('✅ Product Search - Extracted Products:', products.length, 'items');
      console.log('✅ Product Search - First product:', products[0]);

      return {
        products,
        pagination: responseData.pagination || {
          page: responseData.pageNumber || params.page || 1,
          pageSize: responseData.pageSize || params.pageSize || 20,
          totalCount: responseData.totalCount || 0,
          totalPages: responseData.totalPages || 1
        }
      };
    } else {
      console.error('❌ Product Search - Error:', response.error);
      throw new Error(response.error || 'Failed to search products');
    }
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

/**
 * Search stores with location-based filtering
 */
export const searchStores = async (
  apiClient: any,
  params: StoreSearchRequest
): Promise<{ stores: BackendStore[]; pagination?: any }> => {
  try {
    // Always use POST endpoint for better search support (including tags)
    // The POST endpoint supports all parameters including location
    console.log('🔍 Store Search - Using POST endpoint for comprehensive search');
    console.log('🔍 Store Search - Parameters:', params);

    const response = await apiClient.post(API_ENDPOINTS.search.stores, params);
    console.log('📥 Store Search - Raw Response:', response);
    console.log('📥 Store Search - Response Success:', response.success);
    console.log('📥 Store Search - Response Data:', response.data);

    if (response.success) {
      // Handle nested response structure: response.data.data.stores
      const responseData = response.data?.data || response.data || {};
      const stores = responseData.stores || responseData || [];
      console.log('✅ Store Search - Response Data Structure:', responseData);
      console.log('✅ Store Search - Extracted Stores:', stores.length, 'items');
      console.log('✅ Store Search - First store:', stores[0]);

      return {
        stores,
        pagination: responseData.pagination
      };
    } else {
      console.error('❌ Store Search - Error:', response.error);
      throw new Error(response.error || 'Failed to search stores');
    }
  } catch (error) {
    console.error('Error searching stores:', error);
    throw error;
  }
};

/**
 * Fetch products from a specific store
 */
export const getProductsFromStore = async (
  apiClient: any,
  storeId: string,
  pageSize: number = 20
): Promise<BackendProduct[]> => {
  try {
    const endpoint = API_ENDPOINTS.products.byStore(storeId);
    console.log('🏪 Store Products - Fetching products from store:', storeId);

    const response = await apiClient.get(endpoint);
    console.log('🏪 Store Products - Raw response:', response);

    if (response.success) {
      // Extract products from nested response structure
      const responseData = response.data?.data || response.data || {};
      const products = responseData.items || responseData || [];
      console.log('✅ Store Products - Found', products.length, 'products from store');
      return products;
    } else {
      console.error('❌ Store Products - Error:', response.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Store Products - Exception:', error);
    return [];
  }
};

/**
 * Combined search for both products and stores
 * Searches products and stores in parallel, returns whatever results we get
 */
export const searchAll = async (
  apiClient: any,
  searchTerm: string,
  options: {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<SearchResults> => {
  if (!searchTerm?.trim()) {
    return { products: [], stores: [] };
  }

  console.log('🔍 Search - Starting search for:', searchTerm);
  console.log('🔍 Search - Options:', options);

  // Build search params - only include defined values to satisfy exactOptionalPropertyTypes
  const productParams: ProductSearchRequest = { searchTerm };
  const storeParams: StoreSearchRequest = { searchTerm };

  if (options.latitude !== undefined) {
    productParams.latitude = options.latitude;
    storeParams.latitude = options.latitude;
  }
  if (options.longitude !== undefined) {
    productParams.longitude = options.longitude;
    storeParams.longitude = options.longitude;
  }
  if (options.radiusKm !== undefined) {
    productParams.radiusKm = options.radiusKm;
    storeParams.radiusKm = options.radiusKm;
  }
  if (options.page !== undefined) {
    productParams.page = options.page;
    storeParams.page = options.page;
  }
  if (options.pageSize !== undefined) {
    productParams.pageSize = options.pageSize;
    storeParams.pageSize = options.pageSize;
  }

  // Search products and stores in parallel
  const [productResults, storeResults] = await Promise.allSettled([
    searchProducts(apiClient, productParams),
    searchStores(apiClient, storeParams)
  ]);

  // Get results from successful searches
  let products = productResults.status === 'fulfilled' ? productResults.value.products : [];
  let stores = storeResults.status === 'fulfilled' ? storeResults.value.stores : [];

  // Client-side filter stores to ensure they match search term
  // This handles cases where the backend returns all stores instead of filtered ones
  if (stores.length > 0 && searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    const filteredStores = stores.filter(store =>
      store.name?.toLowerCase().includes(searchLower) ||
      store.description?.toLowerCase().includes(searchLower) ||
      store.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
    );

    if (filteredStores.length !== stores.length) {
      console.log(`🔍 Search - Filtered stores from ${stores.length} to ${filteredStores.length}`);
      stores = filteredStores;
    }
  }

  // Log any failures for debugging
  if (productResults.status === 'rejected') {
    console.warn('⚠️ Product search failed:', productResults.reason);
  }
  if (storeResults.status === 'rejected') {
    console.warn('⚠️ Store search failed:', storeResults.reason);
  }

  console.log('✅ Search - Results:', { products: products.length, stores: stores.length });

  return {
    products,
    stores,
    pagination: productResults.status === 'fulfilled' ? productResults.value.pagination : undefined
  };
};

/**
 * Get popular stores near a location
 */
export const getPopularStores = async (
  apiClient: any,
  latitude: number,
  longitude: number,
  radius: number = 5.0,
  pageSize: number = 10
): Promise<BackendStore[]> => {
  try {
    const endpoint = API_ENDPOINTS.search.storesPopular +
      `?latitude=${latitude}&longitude=${longitude}&radius=${radius}&pageSize=${pageSize}`;

    const response = await apiClient.get(endpoint);

    if (response.success) {
      return response.data.stores || response.data || [];
    } else {
      throw new Error(response.error || 'Failed to get popular stores');
    }
  } catch (error) {
    console.error('Error getting popular stores:', error);
    throw error;
  }
};

/**
 * Test search without location constraints
 */
export const testSearchWithoutLocation = async (
  apiClient: any,
  searchTerm: string
): Promise<SearchResults> => {
  try {
    console.log('🧪 Test Search - Searching without location constraints for:', searchTerm);

    const [productResults, storeResults] = await Promise.allSettled([
      // Search products without location
      searchProducts(apiClient, {
        searchTerm,
        pageSize: 20,
      }),
      // Search stores using POST endpoint (no location required)
      apiClient.post(API_ENDPOINTS.search.stores, {
        searchTerm: searchTerm,
        pageSize: 20,
      })
    ]);

    const products = productResults.status === 'fulfilled' ? productResults.value.products : [];
    const stores = storeResults.status === 'fulfilled'
      ? (storeResults.value.data?.stores || storeResults.value.data || [])
      : [];

    console.log('✅ Test Search - Products found:', products.length);
    console.log('✅ Test Search - Stores found:', stores.length);

    if (productResults.status === 'rejected') {
      console.error('❌ Test Search - Product search failed:', productResults.reason);
    }

    if (storeResults.status === 'rejected') {
      console.error('❌ Test Search - Store search failed:', storeResults.reason);
    }

    return {
      products,
      stores,
    };
  } catch (error) {
    console.error('❌ Test Search - Error:', error);
    throw error;
  }
};

/**
 * Debug function to test individual API endpoints
 */
export const debugApiEndpoints = async (apiClient: any, searchTerm: string) => {
  console.log('📊 Debug - Testing individual API endpoints for:', searchTerm);

  // Test product search API without location
  try {
    const productUrl = `${API_ENDPOINTS.search.products}?searchTerm=${encodeURIComponent(searchTerm)}&pageSize=50`;
    console.log('📊 Debug - Product API URL (no location):', productUrl);
    const productResponse = await apiClient.get(productUrl);
    console.log('📊 Debug - Product API Response:', productResponse);
    if (productResponse.success && productResponse.data?.data?.items) {
      console.log('📊 Debug - Found products:', productResponse.data.data.items.length);
      productResponse.data.data.items.forEach((product, index) => {
        console.log(`📦 Product ${index + 1}:`, product.name, 'Tags:', product.tags);
      });
    }
  } catch (error) {
    console.error('❌ Debug - Product API Error:', error);
  }

  // Test store search API using POST (no location required)
  try {
    const storeResponse = await apiClient.post(API_ENDPOINTS.search.stores, {
      searchTerm: searchTerm,
      pageSize: 50
    });
    console.log('📊 Debug - Store API Response (POST):', storeResponse);
    if (storeResponse.success && storeResponse.data?.stores) {
      console.log('📊 Debug - Found stores:', storeResponse.data.stores.length);
      storeResponse.data.stores.forEach((store, index) => {
        console.log(`🏪 Store ${index + 1}:`, store.name, 'Tags:', store.tags);
      });
    }
  } catch (error) {
    console.error('❌ Debug - Store API Error:', error);
  }

  // Also try a general search to see what stores exist
  try {
    console.log('📊 Debug - Trying general store search...');
    const generalStoreResponse = await apiClient.post(API_ENDPOINTS.search.stores, {
      searchTerm: '', // Empty to get all stores
      pageSize: 20
    });
    console.log('📊 Debug - General Store Response:', generalStoreResponse);
    if (generalStoreResponse.success && generalStoreResponse.data?.stores) {
      console.log('📊 Debug - Total stores found:', generalStoreResponse.data.stores.length);
      generalStoreResponse.data.stores.forEach((store, index) => {
        console.log(`🏪 Store ${index + 1}:`, store.name, 'Tags:', store.tags?.join(', ') || 'No tags');
      });
    }
  } catch (error) {
    console.error('❌ Debug - General Store Search Error:', error);
  }
};

// Hook for using search functionality
export const useSearch = () => {
  const { client } = useApi();

  return {
    searchProducts: (params: ProductSearchRequest) => searchProducts(client, params),
    searchStores: (params: StoreSearchRequest) => searchStores(client, params),
    searchAll: (searchTerm: string, options?: any) => searchAll(client, searchTerm, options),
    getPopularStores: (latitude: number, longitude: number, radius?: number, pageSize?: number) =>
      getPopularStores(client, latitude, longitude, radius, pageSize),
    getProductsFromStore: (storeId: string, pageSize?: number) => getProductsFromStore(client, storeId, pageSize),
    testSearchWithoutLocation: (searchTerm: string) => testSearchWithoutLocation(client, searchTerm),
    debugApiEndpoints: (searchTerm: string) => debugApiEndpoints(client, searchTerm),
  };
};

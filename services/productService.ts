/**
 * Product Service
 * Handles all product-related API operations
 */

import type { ApiClient } from '@/contexts/ApiContext';
import { API_ENDPOINTS } from '@/constants/config';
import type { 
  BackendProduct,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/BackendModels';
import type { ApiResponse, PaginationParams } from '@/types/common';

export const productService = {
  /**
   * Fetch all products with optional filtering
   */
  async getAllProducts(
    client: ApiClient,
    options: {
      productType?: string;
      pagination?: PaginationParams;
    } = {}
  ): Promise<ApiResponse<BackendProduct[]>> {
    try {
      const { productType, pagination } = options;
      let endpoint = API_ENDPOINTS.products.display;
      
      const queryParams = new URLSearchParams();
      if (productType) {
        queryParams.append('productCategory', productType);
      }
      if (pagination?.page) {
        queryParams.append('page', pagination.page.toString());
      }
      if (pagination?.limit) {
        queryParams.append('limit', pagination.limit.toString());
      }
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }

      return await client.get<BackendProduct[]>(endpoint);
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      };
    }
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(
    client: ApiClient,
    productId: string
  ): Promise<ApiResponse<BackendProduct>> {
    try {
      const endpoint = API_ENDPOINTS.products.byId(productId);
      return await client.get<BackendProduct>(endpoint);
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
      };
    }
  },

  /**
   * Fetch products by store ID
   */
  async getProductsByStoreId(
    client: ApiClient,
    storeId: string
  ): Promise<ApiResponse<BackendProduct[]>> {
    try {
      const endpoint = API_ENDPOINTS.products.byStore(storeId);
      const response = await client.get<BackendProduct[]>(endpoint);
      
      // Handle different response formats from the backend
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return response;
        } else if (typeof response.data === 'object' && 'products' in response.data) {
          return {
            success: true,
            data: (response.data as any).products || [],
          };
        } else {
          console.warn('Unexpected response format from API:', response.data);
          return {
            success: true,
            data: [],
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching products for store ${storeId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch store products',
      };
    }
  },

  /**
   * Create a new product (for seller/admin use)
   */
  async createProduct(
    client: ApiClient,
    productData: CreateProductRequest
  ): Promise<ApiResponse<BackendProduct>> {
    try {
      return await client.post<BackendProduct>('/api/products', productData);
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product',
      };
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(
    client: ApiClient,
    productData: UpdateProductRequest
  ): Promise<ApiResponse<BackendProduct>> {
    try {
      return await client.put<BackendProduct>(
        `/api/products/${productData.id}`,
        productData
      );
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product',
      };
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(
    client: ApiClient,
    productId: string
  ): Promise<ApiResponse<void>> {
    try {
      return await client.delete<void>(`/api/products/${productId}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product',
      };
    }
  },

  /**
   * Search products by query
   */
  async searchProducts(
    client: ApiClient,
    query: string,
    options: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      pagination?: PaginationParams;
    } = {}
  ): Promise<ApiResponse<BackendProduct[]>> {
    try {
      const { category, minPrice, maxPrice, pagination } = options;
      const queryParams = new URLSearchParams();
      
      queryParams.append('q', query);
      if (category) queryParams.append('category', category);
      if (minPrice !== undefined) queryParams.append('minPrice', minPrice.toString());
      if (maxPrice !== undefined) queryParams.append('maxPrice', maxPrice.toString());
      if (pagination?.page) queryParams.append('page', pagination.page.toString());
      if (pagination?.limit) queryParams.append('limit', pagination.limit.toString());

      const endpoint = `/api/products/search?${queryParams.toString()}`;
      return await client.get<BackendProduct[]>(endpoint);
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search products',
      };
    }
  },
};
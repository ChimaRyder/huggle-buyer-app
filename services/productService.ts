/**
 * Product Service
 * Handles all product-related API operations
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/constants/config';
import type { 
  BackendProduct,
  ProductsResponse,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/BackendModels';
import type { ApiResponse, PaginationParams } from '@/types/common';

export class ProductService {
  /**
   * Fetch all products with optional filtering
   */
  static async getAllProducts(
    token: string,
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

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await apiClient.get<BackendProduct[]>(endpoint, headers);
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      };
    }
  }

  /**
   * Fetch a single product by ID
   */
  static async getProductById(
    productId: string,
    token: string | null = null
  ): Promise<ApiResponse<BackendProduct>> {
    try {
      const endpoint = API_ENDPOINTS.products.byId(productId);
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const response = await apiClient.get<BackendProduct>(endpoint, headers);
      return response;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
      };
    }
  }

  /**
   * Fetch products by store ID
   */
  static async getProductsByStoreId(
    storeId: string,
    token: string | null = null
  ): Promise<ApiResponse<BackendProduct[]>> {
    try {
      const endpoint = API_ENDPOINTS.products.byStore(storeId);
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const response = await apiClient.get<BackendProduct[]>(endpoint, headers);
      
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
  }

  /**
   * Create a new product (for seller/admin use)
   */
  static async createProduct(
    productData: CreateProductRequest,
    token: string
  ): Promise<ApiResponse<BackendProduct>> {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await apiClient.post<BackendProduct>(
        '/api/products',
        productData,
        headers
      );
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product',
      };
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(
    productData: UpdateProductRequest,
    token: string
  ): Promise<ApiResponse<BackendProduct>> {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await apiClient.put<BackendProduct>(
        `/api/products/${productData.id}`,
        productData,
        headers
      );
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product',
      };
    }
  }

  /**
   * Delete a product
   */
  static async deleteProduct(
    productId: string,
    token: string
  ): Promise<ApiResponse<void>> {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await apiClient.delete<void>(
        `/api/products/${productId}`,
        headers
      );
      return response;
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product',
      };
    }
  }

  /**
   * Search products by query
   */
  static async searchProducts(
    query: string,
    token: string,
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
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await apiClient.get<BackendProduct[]>(endpoint, headers);
      return response;
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search products',
      };
    }
  }
}

export default ProductService;
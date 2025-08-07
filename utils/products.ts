/**
 * Product Utilities
 * @deprecated Use ProductService instead for new code
 * Maintained for backwards compatibility
 */

import { ProductService } from '@/services/productService';
import type { BackendProduct } from '@/types/BackendModels';

/**
 * @deprecated Use ProductService.getAllProducts instead
 */
export const fetchAllProducts = async (
  token: string,
  productType?: string
): Promise<BackendProduct[]> => {
  console.warn('fetchAllProducts is deprecated. Use ProductService.getAllProducts instead');
  
  const options = productType ? { productType } : {};
  const response = await ProductService.getAllProducts(token, options);
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error || 'Failed to fetch products');
};

/**
 * @deprecated Use ProductService.getProductById instead
 */
export const fetchProductById = async (
  productId: string,
  token: string | null = null
): Promise<BackendProduct> => {
  console.warn('fetchProductById is deprecated. Use ProductService.getProductById instead');
  
  const response = await ProductService.getProductById(productId, token);
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error || 'Failed to fetch product');
};

/**
 * @deprecated Use ProductService.getProductsByStoreId instead
 */
export const fetchProductsByStoreId = async (
  storeId: string,
  token: string | null = null
): Promise<BackendProduct[]> => {
  console.warn('fetchProductsByStoreId is deprecated. Use ProductService.getProductsByStoreId instead');
  
  const response = await ProductService.getProductsByStoreId(storeId, token);
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error || 'Failed to fetch store products');
};

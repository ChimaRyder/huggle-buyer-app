import { CartItem, Product } from '@/data/food/models';

/**
 * Convert a Product to a CartItem for adding to cart
 */
export function productToCartItem(
  product: Product,
  quantity: number = 1
): CartItem {
  return {
    id: `${product.id}_${Date.now()}`, // Unique ID for each cart addition
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    quantity: quantity,
    storeId: product.storeId,
    storeName: product.storeName || 'Unknown Store',
    category: product.category,
    isActive: product.isActive,
    expiresAt: product.expiresAt,
    selected: true // Default to selected for new items
  };
}

/**
 * Convert a generic product object to CartItem (for legacy compatibility)
 */
export function genericProductToCartItem(
  product: any,
  quantity: number = 1
): CartItem {
  // Handle image array or single image
  const image = Array.isArray(product.image) 
    ? product.image[0] || '' 
    : product.image || '';

  console.log('🔄 cartHelpers: Converting product to cart item', {
    originalProductId: product.id,
    productName: product.name,
    price: product.price,
    quantity,
    storeId: product.storeId,
    storeName: product.storeName
  });

  const cartItem = {
    id: product.id, // Use the actual product ID, not a generated one
    name: product.name,
    description: product.description || '',
    price: product.price,
    image: image,
    quantity: quantity,
    storeId: product.storeId || '',
    storeName: product.storeName || 'Unknown Store',
    category: product.category || product.tags?.[0] || 'Other',
    isActive: product.isActive !== false, // Default to true if not specified
    expiresAt: product.expiresAt,
    selected: true
  };
  
  console.log('✅ cartHelpers: Created cart item', cartItem);
  return cartItem;
}

/**
 * Check if a product is available for purchase
 */
export function isProductAvailable(product: Product | CartItem): boolean {
  const now = new Date();
  
  // Check if explicitly inactive
  if (product.isActive === false) {
    return false;
  }
  
  // Check if expired
  if (product.expiresAt && new Date(product.expiresAt) <= now) {
    return false;
  }
  
  return true;
}

/**
 * Get availability status text for a product
 */
export function getAvailabilityStatus(product: Product | CartItem): {
  isAvailable: boolean;
  statusText: string;
  statusColor: string;
} {
  const isAvailable = isProductAvailable(product);
  
  if (!isAvailable) {
    if (product.isActive === false) {
      return {
        isAvailable: false,
        statusText: 'Unavailable',
        statusColor: '#FF6B6B'
      };
    }
    
    if (product.expiresAt && new Date(product.expiresAt) <= new Date()) {
      return {
        isAvailable: false,
        statusText: 'Expired',
        statusColor: '#FF6B6B'
      };
    }
  }
  
  return {
    isAvailable: true,
    statusText: 'Available',
    statusColor: '#4CAF50'
  };
}

/**
 * Calculate total price for cart items
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Calculate total quantity for cart items
 */
export function calculateCartQuantity(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Group cart items by store
 */
export function groupCartItemsByStore(items: CartItem[]): Record<string, CartItem[]> {
  return items.reduce((groups, item) => {
    const storeId = item.storeId || 'unknown';
    if (!groups[storeId]) {
      groups[storeId] = [];
    }
    groups[storeId].push(item);
    return groups;
  }, {} as Record<string, CartItem[]>);
}
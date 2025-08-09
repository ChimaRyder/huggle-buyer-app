/**
 * Hooks Index
 * Centralized exports for all custom hooks
 */

// Mock API hooks
export { useProducts } from './useMockProducts';
export { useCart } from './useMockCart';
export { useOrders } from './useMockOrders';
export { useStores } from './useMockStores';

// Legacy API hooks (for compatibility)
export { useProducts as useProductsLegacy } from './useProducts';
export { useCart as useCartLegacy } from './useCart';
export { useFavorites } from './useFavorites';

// Re-export existing hooks for convenience
export { useAuth } from './useAuth';
export { useColorScheme } from './useColorScheme';
export { useLocation } from './useLocation';
export { useOnboarding } from './useOnboarding';
export { useThemeColor } from './useThemeColor';
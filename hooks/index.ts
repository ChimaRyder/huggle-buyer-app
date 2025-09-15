/**
 * Hooks Index
 * Centralized exports for all custom hooks
 */

// API hooks (use these for actual API integration)
export { useProducts } from './useProducts';
export { useCart } from './useCart';
export { useFavorites } from './useFavorites';

// Re-export existing hooks for convenience
export { useAuth } from './useAuth';
export { useColorScheme } from './useColorScheme';
export { useLocation } from './useLocation';
export { useOnboarding } from './useOnboarding';
export { useThemeColor } from './useThemeColor';
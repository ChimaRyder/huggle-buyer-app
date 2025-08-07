/**
 * API utilities and re-exports
 * @deprecated API_BASE_URL - Use config.apiBaseUrl from @/constants/config instead
 */

// Re-export API_BASE_URL for backwards compatibility
export { API_BASE_URL } from "./constants";

// Re-exports for convenience
export * from "./products";
export * from "./stores";
export * from "./orders";
export * from "./cart";
export * from "./posts";
export * from "./user";
export * from "./reviews";

/**
 * Shared constants for API utilities
 * This file breaks circular dependencies by providing common constants
 */

import { config } from "@/constants/config";

// Export API_BASE_URL for backwards compatibility
export const API_BASE_URL = config.apiBaseUrl;
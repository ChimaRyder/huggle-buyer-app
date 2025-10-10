/**
 * Search related types and interfaces
 */

import type { ApiResponse } from './common';
import type { BackendProduct, BackendStore } from './BackendModels';

// Search filter options
export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isOpen?: boolean;
  distance?: number; // in kilometers
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'distance' | 'rating' | 'newest';
  latitude?: number;
  longitude?: number;
}

// Search request parameters
export interface SearchRequest {
  query: string;
  searchType?: 'all' | 'products' | 'stores';
  filters?: SearchFilters;
  page?: number;
  pageSize?: number;
}

// Individual search result with relevance scoring
export interface ProductSearchResult extends BackendProduct {
  relevanceScore: number;
  matchType: 'exact' | 'partial' | 'tag';
  matchedTags?: string[];
}

export interface StoreSearchResult extends BackendStore {
  relevanceScore: number;
  matchType: 'exact' | 'partial' | 'tag';
  matchedTags?: string[];
}

// Search results structure
export interface SearchResults {
  products: ProductSearchResult[];
  stores: StoreSearchResult[];
  totalProductResults: number;
  totalStoreResults: number;
  query: string;
  searchTime: number; // in milliseconds
  suggestions?: string[];
}

// Search suggestion types
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'store' | 'category';
  category?: string;
  popularity?: number;
}

// Popular searches response
export interface PopularSearches {
  suggestions: SearchSuggestion[];
  categories: string[];
  recentSearches?: string[];
}

// API response types
export type SearchResponse = ApiResponse<SearchResults>;
export type SearchSuggestionsResponse = ApiResponse<PopularSearches>;

// Search history item
export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
}

// Export all types
export type {
  SearchFilters,
  SearchRequest,
  ProductSearchResult,
  StoreSearchResult,
  SearchResults,
  SearchSuggestion,
  PopularSearches,
  SearchResponse,
  SearchSuggestionsResponse,
  SearchHistoryItem,
};
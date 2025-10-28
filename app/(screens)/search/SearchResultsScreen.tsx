import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import FoodItemCard from "@/components/food/FoodItemCard";
import SearchResults from "@/components/search/SearchResults";
import SearchFilters from "@/components/search/SearchFilters";
import SearchFilterIndicator from "@/components/search/SearchFilterIndicator";
import { BackendProduct, BackendStore } from "@/types/BackendModels";
import type { SearchFilters as SearchFiltersType } from "@/types/Search";
import { colors } from "@/constants/theme";
import { useSearch } from '@/utils/search';
import { useLocationContext } from '@/context/LocationContext';

const SearchResultsScreen = () => {
  const route = useRoute();
  const router = useRouter();
  const { query } = route.params as { query: string; };
  const [stores, setStores] = useState<BackendStore[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState(query);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering state
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({
    sortBy: 'relevance',
  });

  const { searchAll, testSearchWithoutLocation, debugApiEndpoints } = useSearch();
  const { currentLocation } = useLocationContext();
  
  // Test function for debugging
  const handleTestSearch = async () => {
    try {
      const testResults = await testSearchWithoutLocation(searchQuery);
    } catch (error) {
      console.error('🧪 Test search failed:', error);
    }
  };

  // Perform search when query or filters change
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setStores([]);
        setProducts([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Use the original searchAll function that worked before
        const searchOptions = currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          radiusKm: filters.distance || 10, // Use filter distance or default
          pageSize: 20,
        } : {
          pageSize: 20,
        };

        const results = await searchAll(searchQuery, searchOptions);
        let { products: allProducts, stores } = results;

        // Apply client-side filtering to products
        let filteredProducts = allProducts;

        // Category filter
        if (filters.category) {
          filteredProducts = filteredProducts.filter(product => {
            const categoryLower = filters.category!.toLowerCase();
            
            // Check product type
            if (product.productType && product.productType.toLowerCase().includes(categoryLower)) {
              return true;
            }
            
            // Check tags
            if (product.tags && Array.isArray(product.tags)) {
              return product.tags.some(tag => tag.toLowerCase().includes(categoryLower));
            }
            
            return false;
          });
        }

        // Price filter
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
          filteredProducts = filteredProducts.filter(product => {
            const price = product.price;
            if (filters.minPrice !== undefined && price < filters.minPrice) {
              return false;
            }
            if (filters.maxPrice !== undefined && price > filters.maxPrice) {
              return false;
            }
            return true;
          });
        }

        // Sort products
        if (filters.sortBy && filters.sortBy !== 'relevance') {
          filteredProducts = [...filteredProducts].sort((a, b) => {
            switch (filters.sortBy) {
              case 'price_asc':
                return a.price - b.price;
              case 'price_desc':
                return b.price - a.price;
              case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              default:
                return 0;
            }
          });
        }

        setProducts(filteredProducts);
        setStores(stores);
        
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search. Please try again.');
        setStores([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchQuery, filters, currentLocation]);

  const handleStorePress = (id: string) => {
    router.push({
      pathname: "/(screens)/store/StoreHomepageScreen",
      params: { id },
    });
  };

  const handleProductPress = (id: string) => {
    router.push({
      pathname: "/(screens)/store/ProductScreen",
      params: { id },
    });
  };

  // Filter handlers
  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Filters are automatically applied via useEffect
  };

  const handleResetFilters = () => {
    const resetFilters: SearchFiltersType = {
      sortBy: 'relevance',
    };
    setFilters(resetFilters);
  };

  const handleRemoveFilter = (key: keyof SearchFiltersType) => {
    const newFilters = { ...filters };
    
    if (key === 'minPrice') {
      delete newFilters.minPrice;
      delete newFilters.maxPrice; // Remove both when removing price filter
    } else {
      delete newFilters[key];
    }
    
    // Reset to relevance if removing sort filter
    if (key === 'sortBy') {
      newFilters.sortBy = 'relevance';
    }
    
    setFilters(newFilters);
  };

  const hasActiveFilters = () => {
    return filters.category ||
           filters.minPrice !== undefined ||
           filters.maxPrice !== undefined ||
           filters.distance ||
           (filters.sortBy && filters.sortBy !== 'relevance');
  };

  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchBarContainer}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.iconButton}
      >
        <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
      </TouchableOpacity>
      <View style={styles.searchInputWrapper}>
        <MaterialIcons
          name="search"
          size={20}
          color={colors.text.tertiary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          placeholder="Search for anything..."
          placeholderTextColor={colors.text.tertiary}
          onFocus={() => {
            // Navigate back to the search screen
            router.back();
            router.replace({pathname: '/(screens)/search/SearchScreen', params: {initialQuery: searchQuery}});
          }}
        />
      </View>
      <TouchableOpacity
        onPress={() => setFiltersVisible(true)}
        style={[styles.filterButton, hasActiveFilters() && styles.filterButtonActive]}
      >
        <Ionicons 
          name="options-outline" 
          size={20} 
          color={hasActiveFilters() ? colors.primary.main : colors.text.tertiary}
        />
        {hasActiveFilters() && <View style={styles.filterIndicator} />}
      </TouchableOpacity>
    </View>
  );

  // Render products section with 2-column grid (like home screen)
  const renderProductsSection = () => {
    if (products.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.foodItemsContainer}>
          {products.map((item) => (
            <View key={item.id} style={styles.foodItemWrapper}>
              <FoodItemCard 
                item={item} 
                onPress={() => handleProductPress(item.id)} 
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render stores section
  const renderStoresSection = () => {
    if (stores.length === 0) return null;
    
    return (
      <View style={styles.section}>
        {stores.map((store) => (
          <RestaurantCard
            key={store.id}
            restaurant={store}
            onPress={() => handleStorePress(store.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderSearchBar()}
      
      <View style={styles.divider} />
      
      {/* Filter Indicator */}
      {hasActiveFilters() && (
        <SearchFilterIndicator
          filters={filters}
          onFilterPress={() => setFiltersVisible(true)}
          onRemoveFilter={handleRemoveFilter}
        />
      )}
      
      <ScrollView style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={styles.errorTitle}>Search Error</Text>
            <Text style={styles.errorDescription}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                // Re-trigger search by updating search query
                setSearchQuery(searchQuery + ' ');
                setSearchQuery(searchQuery.trim());
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.info, marginTop: 8 }]}
              onPress={handleTestSearch}
            >
              <Text style={styles.retryButtonText}>Debug Search</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: '#9C27B0', marginTop: 8 }]}
              onPress={() => debugApiEndpoints(searchQuery)}
            >
              <Text style={styles.retryButtonText}>Debug APIs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Show results count if we have results */}
            {(stores.length > 0 || products.length > 0) && (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                  Found {stores.length + products.length} results for "{searchQuery}"
                </Text>
              </View>
            )}
            
            {/* Use SearchResults component to show both stores and products with tag highlighting */}
            {(stores.length > 0 || products.length > 0) && (
              <SearchResults
                restaurants={stores}
                foodItems={products}
                searchTerm={searchQuery}
                onRestaurantPress={handleStorePress}
                onToggleFavorite={handleToggleFavorite}
                onFoodItemPress={(item) => handleProductPress(item.id)}
              />
            )}
            
            {/* Show empty state only when not loading and no results */}
            {stores.length === 0 && products.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={colors.text.tertiary} />
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptyDescription}>
                  Try different keywords, check your spelling, or try searching by tags like "gadgets" or "organic"
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      {/* Search Filters Modal */}
      <SearchFilters
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 18,
    backgroundColor: colors.background.primary,
  },
  iconButton: {
    padding: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 40,
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary.light + '20',
    borderRadius: 6,
  },
  filterIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  foodItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodItemWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.primary.contrastText,
    fontSize: 16,
    fontWeight: "600",
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
});

export default SearchResultsScreen;
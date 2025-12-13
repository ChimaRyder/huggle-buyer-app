import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { colors, spacing, typography } from '@/constants/theme';
import { useStoreContext } from '@/context/StoreContext';
import { useLocationContext } from '@/context/LocationContext';

type FilterMode = 'all' | 'nearby';

interface PopularStoresSectionProps {
  onRestaurantPress: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSeeAllPress: () => void;
}

const PopularStoresSection: React.FC<PopularStoresSectionProps> = ({ 
  onRestaurantPress, 
  onToggleFavorite,
  onSeeAllPress
}) => {
  const { 
    popularStores, 
    isFetchingPopular, 
    popularError, 
    fetchPopularStores,
    fetchFollowedStores,
    isStoreFollowed 
  } = useStoreContext();
  const { currentLocation } = useLocationContext();
  
  // Filter mode state
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  
  // Track if we've done initial fetch and with what location state
  const hasFetchedRef = useRef(false);
  const lastFilterModeRef = useRef<FilterMode>('all');
  const hadLocationOnLastFetchRef = useRef(false);

  // Check if we have a valid location
  const hasLocation = useMemo(() => {
    return currentLocation !== null && 
      currentLocation.latitude !== 0 && 
      currentLocation.longitude !== 0;
  }, [currentLocation]);

  // Fetch followed stores on mount
  useEffect(() => {
    fetchFollowedStores();
  }, [fetchFollowedStores]);

  // Fetch stores based on filter mode
  // Always pass user location when available for accurate distance calculation
  useEffect(() => {
    const fetchStores = async () => {
      // Re-fetch if:
      // 1. Haven't fetched yet
      // 2. Filter mode changed
      // 3. Location became available for the first time (distances were calculated from fallback)
      const locationJustBecameAvailable = hasLocation && !hadLocationOnLastFetchRef.current;
      const shouldFetch = !hasFetchedRef.current || 
                          lastFilterModeRef.current !== filterMode ||
                          locationJustBecameAvailable;
      
      if (shouldFetch) {
        hasFetchedRef.current = true;
        lastFilterModeRef.current = filterMode;
        hadLocationOnLastFetchRef.current = hasLocation;
        
        if (filterMode === 'nearby' && hasLocation && currentLocation) {
          console.log('🔍 PopularStoresSection: Fetching nearby stores');
          await fetchPopularStores(currentLocation.latitude, currentLocation.longitude, 5);
        } else {
          // Always pass user location if available for accurate distance calculation
          // Even in "All areas" mode, we want distances from user's actual location
          console.log('🔍 PopularStoresSection: Fetching all popular stores', hasLocation ? 'with location' : 'without location');
          if (hasLocation && currentLocation) {
            await fetchPopularStores(currentLocation.latitude, currentLocation.longitude);
          } else {
            await fetchPopularStores();
          }
        }
      }
    };

    fetchStores();
  }, [fetchPopularStores, filterMode, hasLocation, currentLocation]);

  // Show only first 3 stores for home screen
  const displayStores = popularStores.slice(0, 3);

  const handleFilterChange = (mode: FilterMode) => {
    if (mode === 'nearby' && !hasLocation) return;
    setFilterMode(mode);
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Popular Stores</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[
                styles.filterBadge, 
                filterMode === 'all' && styles.filterBadgeActive
              ]}
              onPress={() => handleFilterChange('all')}
            >
              <Text style={[
                styles.filterText,
                filterMode === 'all' && styles.filterTextActive
              ]}>All areas</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.filterBadge, 
                filterMode === 'nearby' && styles.filterBadgeActive,
                !hasLocation && styles.filterBadgeDisabled
              ]}
              onPress={() => handleFilterChange('nearby')}
              disabled={!hasLocation}
            >
              <Ionicons 
                name="location" 
                size={12} 
                color={filterMode === 'nearby' ? colors.text.inverse : (!hasLocation ? colors.text.quaternary : colors.text.secondary)} 
              />
              <Text style={[
                styles.filterText,
                filterMode === 'nearby' && styles.filterTextActive,
                !hasLocation && styles.filterTextDisabled
              ]}>Nearby</Text>
            </TouchableOpacity>
          </View>
        </View>
        {displayStores.length > 0 && (
          <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.restaurantsContainer}>
        {isFetchingPopular && popularStores.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary.main} />
            <Text style={styles.loadingText}>Loading stores...</Text>
          </View>
        ) : popularError && popularStores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
            <Text style={styles.emptyText}>Couldn't load stores</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        ) : displayStores.length === 0 ? (
          // Improved empty state
          <View style={styles.noStoresContainer}>
            <View style={styles.noStoresIconWrapper}>
              <Ionicons name="storefront-outline" size={48} color={colors.primary.main} />
            </View>
            <Text style={styles.noStoresTitle}>
              {filterMode === 'nearby' ? 'No stores nearby' : 'No stores available'}
            </Text>
            <Text style={styles.noStoresSubtitle}>
              {filterMode === 'nearby' 
                ? 'There are no stores within 5km of your location yet. Try switching to "All areas" to browse stores from other locations.'
                : 'Stores will appear here as they join Huggle. Check back soon!'
              }
            </Text>
            {filterMode === 'nearby' && (
              <TouchableOpacity 
                style={styles.switchFilterButton}
                onPress={() => handleFilterChange('all')}
              >
                <Text style={styles.switchFilterText}>Show all stores</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary.main} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          displayStores.map((store) => (
            <RestaurantCard
              key={store.id}
              restaurant={{
                id: store.id,
                name: store.name,
                description: store.description,
                image: store.profileImageUrl,
                rating: 4.5,
                deliveryTime: '15-30 min',
                distance: store.distance ? `${store.distance.toFixed(1)}km` : 'N/A',
                categories: store.tags || [],
                isFavorite: isStoreFollowed(store.id),
                ...(store.isVerified && { promotion: 'Verified' }),
                address: store.address,
                city: store.city,
                province: store.province,
                isOpen: store.isOpen,
                isVerified: store.isVerified
              }}
              onPress={() => onRestaurantPress(store.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleRow: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  filterBadgeActive: {
    backgroundColor: colors.primary.main,
  },
  filterBadgeDisabled: {
    backgroundColor: colors.background.tertiary,
    opacity: 0.6,
  },
  filterText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  filterTextDisabled: {
    color: colors.text.quaternary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary.main,
    marginRight: 4,
  },
  restaurantsContainer: {
    paddingHorizontal: 0,
  },
  // Improved empty state
  noStoresContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
  },
  noStoresIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary.main + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  noStoresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  noStoresSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '100%',
  },
  switchFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
    backgroundColor: colors.primary.main + '15',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  switchFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  // General empty state
  emptyContainer: {
    paddingVertical: 48,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '85%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default PopularStoresSection;

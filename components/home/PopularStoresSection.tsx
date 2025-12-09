import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
  
  // Local state to track if stores are from expanded search
  const [showingExpandedResults, setShowingExpandedResults] = useState(false);
  
  // Refs to track fetch state without causing re-renders
  const hasFetchedInitially = useRef(false);
  const lastFetchedLocation = useRef<{lat: number, lng: number} | null>(null);
  const isExpandedSearchInProgress = useRef(false);

  // Create stable location coordinates
  const locationCoords = useMemo(() => {
    if (!currentLocation) return null;
    return {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    };
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  // Fetch followed stores on mount to determine favorite status
  useEffect(() => {
    fetchFollowedStores();
  }, [fetchFollowedStores]);

  // Main fetch function that handles both initial load and refresh
  const fetchStoresForLocation = useCallback(async (lat: number, lng: number, isInitialFetch: boolean) => {
    // First, try nearby stores (5km radius)
    await fetchPopularStores(lat, lng, 5);
    
    // Store the location we fetched for
    lastFetchedLocation.current = { lat, lng };
    
    // If this is the initial fetch and we got no results, expand search
    // We check popularStores AFTER the fetch completes
  }, [fetchPopularStores]);

  // Effect to handle initial fetch and location changes
  useEffect(() => {
    if (!locationCoords) {
      // No location - fetch with wide radius
      if (!hasFetchedInitially.current) {
        hasFetchedInitially.current = true;
        setShowingExpandedResults(true);
        fetchPopularStores(0, 0, 1000);
      }
      return;
    }

    // Check if location has changed significantly
    const locationChanged = !lastFetchedLocation.current || 
      Math.abs(lastFetchedLocation.current.lat - locationCoords.latitude) > 0.001 ||
      Math.abs(lastFetchedLocation.current.lng - locationCoords.longitude) > 0.001;

    if (locationChanged) {
      // Reset state for new location
      setShowingExpandedResults(false);
      isExpandedSearchInProgress.current = false;
      hasFetchedInitially.current = true;
      fetchStoresForLocation(locationCoords.latitude, locationCoords.longitude, true);
    }
  }, [locationCoords, fetchStoresForLocation, fetchPopularStores]);

  // Effect to handle expanded search after initial fetch returns empty
  useEffect(() => {
    // Only expand if:
    // 1. We have a location
    // 2. We're not currently fetching
    // 3. We got no results
    // 4. We haven't already tried expanding
    // 5. The initial fetch has completed
    if (
      locationCoords && 
      !isFetchingPopular && 
      popularStores.length === 0 && 
      !isExpandedSearchInProgress.current &&
      hasFetchedInitially.current &&
      lastFetchedLocation.current
    ) {
      console.log('⚠️ PopularStoresSection: No stores found nearby, expanding search');
      isExpandedSearchInProgress.current = true;
      setShowingExpandedResults(true);
      fetchPopularStores(locationCoords.latitude, locationCoords.longitude, 50);
    }
  }, [locationCoords, isFetchingPopular, popularStores.length, fetchPopularStores]);

  // Reset expanded search flag when we get results
  useEffect(() => {
    if (popularStores.length > 0 && !isFetchingPopular) {
      // If we got results with the normal radius, we're not showing expanded
      if (!isExpandedSearchInProgress.current) {
        setShowingExpandedResults(false);
      }
    }
  }, [popularStores.length, isFetchingPopular]);

  // Show only first 3 stores for home screen
  const displayStores = popularStores.slice(0, 3);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Popular Stores</Text>
        <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary.main} />
        </TouchableOpacity>
      </View>
      
      {/* No Nearby Stores Banner */}
      {showingExpandedResults && !isFetchingPopular && displayStores.length > 0 && (
        <View style={styles.noNearbyBanner}>
          <Ionicons name="location-outline" size={24} color={colors.warning} />
          <View style={styles.noNearbyTextContainer}>
            <Text style={styles.noNearbyTitle}>No stores nearby</Text>
            <Text style={styles.noNearbySubtitle}>
              Showing stores from a wider area. Distance may vary.
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.restaurantsContainer}>
        {isFetchingPopular ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary.main} />
            <Text style={styles.loadingText}>Loading popular stores...</Text>
          </View>
        ) : popularError ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
            <Text style={styles.emptyText}>Failed to load stores</Text>
            <Text style={styles.errorText}>{popularError}</Text>
          </View>
        ) : displayStores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No stores available</Text>
            <Text style={styles.emptySubtext}>
              {!locationCoords 
                ? 'Please enable location to discover stores near you' 
                : 'Check back later for stores in your area'
              }
            </Text>
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
                rating: 4.5, // Default rating since not provided by API
                deliveryTime: '15-30 min', // Default delivery time
                distance: store.distance ? `${store.distance.toFixed(1)}km` : '0.0km',
                categories: store.tags || [],
                isFavorite: isStoreFollowed(store.id),
                promotion: store.isVerified ? 'Verified' : undefined,
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
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary.main,
    marginRight: 4,
  },
  noNearbyBanner: {
    backgroundColor: colors.warning + '15', // 15% opacity
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  noNearbyTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  noNearbyTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  noNearbySubtitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.regular,
    color: colors.text.secondary,
    lineHeight: typography.fontSizes.sm * 1.4,
  },
  restaurantsContainer: {
    paddingHorizontal: 0,
  },
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
    fontWeight: typography.fontWeights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSizes.md * 1.5,
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
  errorText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.regular,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: '90%',
  },
});

export default PopularStoresSection;

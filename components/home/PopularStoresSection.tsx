import React, { useEffect, useRef } from 'react';
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
  
  // Track if we've done initial fetch
  const hasFetchedRef = useRef(false);

  // Fetch followed stores on mount
  useEffect(() => {
    fetchFollowedStores();
  }, [fetchFollowedStores]);

  // Fetch all popular stores (using user location for distance calculation, but massive radius for all stores)
  useEffect(() => {
    const fetchStores = async () => {
      if (!hasFetchedRef.current) {
        hasFetchedRef.current = true;
        console.log('🔍 PopularStoresSection: Fetching all popular stores');
        // Pass user location if available for better distance calculations
        await fetchPopularStores(currentLocation?.latitude, currentLocation?.longitude);
      }
    };

    fetchStores();
  }, [fetchPopularStores, currentLocation]);

  // Log current state for debugging
  useEffect(() => {
    console.log('🔍 PopularStoresSection: State update', {
      storesCount: popularStores.length,
      isFetching: isFetchingPopular,
      error: popularError,
      firstStore: popularStores[0]?.name
    });
  }, [popularStores, isFetchingPopular, popularError]);

  // Show only first 3 stores for home screen
  const displayStores = popularStores.slice(0, 3);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Popular Stores</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>All areas</Text>
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
            <Text style={styles.loadingText}>Loading popular stores...</Text>
          </View>
        ) : popularError && popularStores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
            <Text style={styles.emptyText}>Couldn't load stores</Text>
            <Text style={styles.errorText}>Pull down to refresh</Text>
          </View>
        ) : displayStores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="storefront-outline" size={36} color={colors.text.tertiary} />
            </View>
            <Text style={styles.emptyTitle}>No stores available</Text>
            <Text style={styles.emptySubtext}>
              Stores will appear here as they join Huggle
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
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 24,
  },
  badgeContainer: {
    backgroundColor: colors.info + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    fontSize: 12,
    color: colors.info,
    fontWeight: '600',
    lineHeight: 16,
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
  restaurantsContainer: {
    paddingHorizontal: 0,
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
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
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default PopularStoresSection;

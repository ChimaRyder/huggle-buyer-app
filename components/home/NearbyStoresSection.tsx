import React, { useEffect, useMemo, useRef } from 'react';
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

interface NearbyStoresSectionProps {
  onRestaurantPress: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSeeAllPress: () => void;
}

const NearbyStoresSection: React.FC<NearbyStoresSectionProps> = ({ 
  onRestaurantPress, 
  onToggleFavorite,
  onSeeAllPress
}) => {
  const { 
    nearbyStores, 
    isFetchingNearby, 
    nearbyError, 
    fetchNearbyStores,
    isStoreFollowed 
  } = useStoreContext();
  const { currentLocation } = useLocationContext();
  
  // Track if we have location
  const hasLocation = useMemo(() => {
    return currentLocation !== null && 
      currentLocation.latitude !== 0 && 
      currentLocation.longitude !== 0;
  }, [currentLocation]);
  
  // Track if we've done initial fetch
  const hasFetchedRef = useRef(false);

  // Main fetch logic - only fetch if we have location
  useEffect(() => {
    const fetchStores = async () => {
      if (hasLocation && currentLocation && !hasFetchedRef.current) {
        hasFetchedRef.current = true;
        console.log('🔍 NearbyStoresSection: Fetching nearby stores:', currentLocation.latitude, currentLocation.longitude);
        await fetchNearbyStores(currentLocation.latitude, currentLocation.longitude, 5);
      }
    };

    fetchStores();
  }, [hasLocation, currentLocation, fetchNearbyStores]);

  // Don't render this section if no location is set
  if (!hasLocation) {
    return null;
  }

  // Show only first 3 stores for home screen
  const displayStores = nearbyStores.slice(0, 3);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Nearby Stores</Text>
          <View style={styles.badgeContainer}>
            <Ionicons name="location" size={10} color={colors.success} style={styles.badgeIcon} />
            <Text style={styles.badgeText}>5km</Text>
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
        {isFetchingNearby && nearbyStores.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary.main} />
            <Text style={styles.loadingText}>Finding nearby stores...</Text>
          </View>
        ) : nearbyError && nearbyStores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
            <Text style={styles.emptyTitle}>Couldn't load stores</Text>
            <Text style={styles.errorText}>Pull down to refresh</Text>
          </View>
        ) : displayStores.length === 0 ? (
          // No stores found within 5km - Improved empty state
          <View style={styles.noNearbyContainer}>
            <View style={styles.noNearbyIconContainer}>
              <Ionicons name="location-outline" size={32} color={colors.warning} />
            </View>
            <Text style={styles.noNearbyTitle}>No stores nearby yet</Text>
            <Text style={styles.noNearbySubtitle}>
              There are no stores within 5km of your location
            </Text>
            <View style={styles.noNearbyHint}>
              <Ionicons name="storefront-outline" size={18} color={colors.primary.main} />
              <Text style={styles.noNearbyHintText}>
                Stores will appear here as they join Huggle in your area
              </Text>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    color: colors.success,
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
  // No nearby stores - improved centered empty state
  noNearbyContainer: {
    paddingVertical: 32,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.warning + '08',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.warning + '25',
    borderStyle: 'dashed',
  },
  noNearbyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.warning + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  noNearbyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  noNearbySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  noNearbyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main + '10',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    width: '100%',
  },
  noNearbyHintText: {
    fontSize: 13,
    color: colors.primary.main,
    fontWeight: '500',
    marginLeft: spacing.sm,
    flex: 1,
    textAlign: 'center',
  },
  // General empty state
  emptyContainer: {
    paddingVertical: 48,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
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

export default NearbyStoresSection;

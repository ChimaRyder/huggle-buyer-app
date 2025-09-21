import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { colors } from '@/constants/theme';
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
  const { popularStores, isFetchingPopular, popularError, fetchPopularStores } = useStoreContext();
  const { currentLocation } = useLocationContext();

  // Create stable location coordinates
  const locationCoords = useMemo(() => {
    if (!currentLocation) return null;
    return {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    };
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  // Fetch popular stores when component mounts or location changes
  useEffect(() => {
    if (locationCoords) {
      fetchPopularStores(locationCoords.latitude, locationCoords.longitude, 5);
    }
  }, [locationCoords, fetchPopularStores]);

  // Show only first 3 stores for home screen
  const displayStores = popularStores.slice(0, 3);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Popular Stores</Text>
        <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.restaurantsContainer}>
        {isFetchingPopular ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Loading popular stores...</Text>
          </View>
        ) : popularError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Failed to load popular stores</Text>
            <Text style={styles.errorText}>{popularError}</Text>
          </View>
        ) : !locationCoords ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={32} color={colors.text.secondary} />
            <Text style={styles.emptyText}>Location required</Text>
            <Text style={styles.emptySubtext}>Please set your location to see popular stores nearby</Text>
          </View>
        ) : displayStores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No popular stores available</Text>
            <Text style={styles.emptySubtext}>Check back later for popular stores in your area</Text>
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
                isFavorite: false, // Default favorite status
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
    color: colors.primary,
    marginRight: 4,
  },
  restaurantsContainer: {
    paddingHorizontal: 0,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
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
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default PopularStoresSection;
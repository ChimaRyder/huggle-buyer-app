import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FoodItemCard from '@/components/food/FoodItemCard';
import { colors } from '@/constants/theme';
import { useProductContext } from '@/context/ProductContext';
import { useLocationContext } from '@/context/LocationContext';

interface TrendingItemsSectionProps {
  onFoodItemPress: (itemId: string) => void;
  onSeeAllPress: () => void;
}

const TrendingItemsSection: React.FC<TrendingItemsSectionProps> = ({ onFoodItemPress, onSeeAllPress }) => {
  const { trendingProducts, isFetchingTrending, trendingError, fetchTrendingProducts } = useProductContext();
  const { currentLocation } = useLocationContext();

  // Create stable location coordinates
  const locationCoords = useMemo(() => {
    if (!currentLocation) return null;
    return {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    };
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  // Fetch trending products when component mounts or location changes
  useEffect(() => {
    if (locationCoords) {
      fetchTrendingProducts(locationCoords.latitude, locationCoords.longitude, 10);
    }
  }, [locationCoords, fetchTrendingProducts]);

  // Show only first 4 items for home screen
  const displayItems = trendingProducts.slice(0, 4);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Trending Items</Text>
        <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.foodItemsContainer}>
        {isFetchingTrending ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Loading trending items...</Text>
          </View>
        ) : trendingError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Failed to load trending items</Text>
            <Text style={styles.errorText}>{trendingError}</Text>
          </View>
        ) : !locationCoords ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={32} color={colors.text.secondary} />
            <Text style={styles.emptyText}>Location required</Text>
            <Text style={styles.emptySubtext}>Please set your location to see trending items nearby</Text>
          </View>
        ) : displayItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No trending items available</Text>
            <Text style={styles.emptySubtext}>Check back later for new trending products</Text>
          </View>
        ) : (
          displayItems.map((item) => (
            <View key={item.id} style={styles.foodItemWrapper}>
              <FoodItemCard 
                item={item} 
                onPress={() => onFoodItemPress(item.id)} 
              />
            </View>
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
    paddingVertical: 32,
    alignItems: 'center',
    width: '100%',
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
    width: '100%',
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

export default TrendingItemsSection;
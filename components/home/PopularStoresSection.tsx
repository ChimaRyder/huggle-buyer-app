import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// TODO: Replace with API call to fetch popular restaurants
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { colors } from '@/constants/theme';

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
  // TODO: Replace with API call to fetch popular restaurants
  const restaurants: any[] = [];

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
        {restaurants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No popular stores available</Text>
          </View>
        ) : (
          restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => onRestaurantPress(restaurant.id)}
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
  },
});

export default PopularStoresSection;
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { restaurants } from '@/data/food/mockData';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { colors } from '@/constants/theme';

interface PopularStoresSectionProps {
  onRestaurantPress: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const PopularStoresSection: React.FC<PopularStoresSectionProps> = ({ 
  onRestaurantPress, 
  onToggleFavorite 
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Popular Stores</Text>
      <View style={styles.restaurantsContainer}>
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onPress={() => onRestaurantPress(restaurant.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  restaurantsContainer: {
    paddingHorizontal: 0,
  },
});

export default PopularStoresSection;
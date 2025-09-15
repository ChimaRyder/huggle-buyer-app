import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// TODO: Replace with API call to fetch trending food items
import FoodItemCard from '@/components/food/FoodItemCard';
import { colors } from '@/constants/theme';

interface TrendingItemsSectionProps {
  onFoodItemPress: (itemId: string) => void;
  onSeeAllPress: () => void;
}

const TrendingItemsSection: React.FC<TrendingItemsSectionProps> = ({ onFoodItemPress, onSeeAllPress }) => {
  // TODO: Replace with API call to fetch trending food items
  const trendingItems: any[] = [];

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
        {trendingItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No trending items available</Text>
          </View>
        ) : (
          trendingItems.map((item) => (
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
  },
});

export default TrendingItemsSection;
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { foodItems } from '@/data/food/mockData';
import FoodItemCard from '@/components/food/FoodItemCard';
import { colors } from '@/constants/theme';

interface TrendingItemsSectionProps {
  onFoodItemPress: (itemId: string) => void;
}

const TrendingItemsSection: React.FC<TrendingItemsSectionProps> = ({ onFoodItemPress }) => {
  // Get trending items (popular items for now)
  const trendingItems = foodItems.filter(item => item.isPopular);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Trending Items</Text>
      <View style={styles.foodItemsContainer}>
        {trendingItems.map((item) => (
          <View key={item.id} style={styles.foodItemWrapper}>
            <FoodItemCard 
              item={item} 
              onPress={() => onFoodItemPress(item.id)} 
            />
          </View>
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
  foodItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodItemWrapper: {
    width: '48%',
    marginBottom: 16,
  },
});

export default TrendingItemsSection;
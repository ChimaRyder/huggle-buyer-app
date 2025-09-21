import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import FoodItemCard from '@/components/food/FoodItemCard';
import { BackendProduct, BackendStore } from '@/types/BackendModels';

interface SearchResultsProps {
  restaurants: BackendStore[];
  foodItems: BackendProduct[];
  onRestaurantPress: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onFoodItemPress: (item: BackendProduct) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  restaurants, 
  foodItems, 
  onRestaurantPress, 
  onToggleFavorite, 
  onFoodItemPress 
}) => {
  if (restaurants.length === 0 && foodItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color="#C7C7CC" />
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptyDescription}>
          Try different keywords or check your spelling
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {restaurants.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurants</Text>
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => onRestaurantPress(restaurant.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </View>
      )}
      
      {foodItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Items</Text>
          <View style={styles.foodItemsContainer}>
            {foodItems.map((item) => (
              <View key={item.id} style={styles.foodItemWrapper}>
                <FoodItemCard 
                  item={item} 
                  onPress={() => onFoodItemPress(item)} 
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  foodItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodItemWrapper: {
    width: '48%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default SearchResults;
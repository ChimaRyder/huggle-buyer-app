import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

import { restaurants, foodItems } from '@/data/food/mockData';
import {
  SearchHeader,
  SearchInput,
  SearchResults,
  SearchEmptyState
} from '@/components/search';

const SearchScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter restaurants based on search query
  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.categories.some(category => 
      category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  // Filter food items based on search query
  const filteredFoodItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleRestaurantPress = (id: string) => {
    router.push(`/screens/food/RestaurantDetailScreen?id=${id}`);
  };
  
  const handleToggleFavorite = (id: string) => {
    // In a real app, this would update the backend
    console.log(`Toggled favorite for restaurant ${id}`);
  };
  
  const handleFoodItemPress = (item: any) => {
    // Find which restaurant has this item
    const restaurant = restaurants.find(r => 
      r.categories.includes(item.category)
    );
    
    if (restaurant) {
      router.push(`/screens/food/RestaurantDetailScreen?id=${restaurant.id}`);
    }
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <SearchHeader onBack={() => router.back()} />
      
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleClearSearch}
        autoFocus
      />
      
      {searchQuery.length > 0 ? (
        <SearchResults
          restaurants={filteredRestaurants}
          foodItems={filteredFoodItems}
          onRestaurantPress={handleRestaurantPress}
          onToggleFavorite={handleToggleFavorite}
          onFoodItemPress={handleFoodItemPress}
        />
      ) : (
        <SearchEmptyState />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default SearchScreen;
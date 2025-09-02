import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { restaurants, foodItems, foodCategories } from '@/data/food/mockData';
import { colors } from '@/constants/theme';
import {
  SearchHeader,
  SearchInput,
  SearchEmptyState
} from '@/components/search';

// Generate search suggestions from mock data
const generateSuggestions = () => {
  const suggestions = [];
  
  // Add popular food items
  const popularItems = foodItems.filter(item => item.isPopular);
  suggestions.push(...popularItems.map(item => ({
    id: `item_${item.id}`,
    type: 'food',
    text: item.name,
    category: item.category,
  })));
  
  // Add restaurant names
  suggestions.push(...restaurants.map(restaurant => ({
    id: `restaurant_${restaurant.id}`,
    type: 'restaurant',
    text: restaurant.name,
    category: 'Restaurant',
  })));
  
  // Add food categories
  suggestions.push(...foodCategories.map(category => ({
    id: `category_${category.id}`,
    type: 'category',
    text: category.name,
    category: 'Category',
  })));
  
  return suggestions.slice(0, 20); // Limit to 20 suggestions
};

const SearchScreen = () => {
  const router = useRouter();
  const { initialQuery } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery?.toString() || '');
  const [suggestions, setSuggestions] = useState(generateSuggestions());
  
  // Filter suggestions based on search query
  const filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(screens)/SearchResultsScreen',
        params: { query: searchQuery }
      });
    }
  };
  
  const handleSuggestionPress = (suggestion: any) => {
    // For categories and restaurants, we can search directly
    if (suggestion.type === 'category') {
      router.push({
        pathname: '/(screens)/SearchResultsScreen',
        params: { query: suggestion.text }
      });
    } else if (suggestion.type === 'restaurant') {
      router.push({
        pathname: '/(screens)/SearchResultsScreen',
        params: { query: suggestion.text }
      });
    } else if (suggestion.type === 'food') {
      router.push({
        pathname: '/(screens)/SearchResultsScreen',
        params: { query: suggestion.text }
      });
    }
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Render a suggestion item
  const renderSuggestionItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Ionicons 
        name={
          item.type === 'food' ? 'nutrition-outline' : 
          item.type === 'restaurant' ? 'storefront-outline' : 
          'pricetags-outline'
        } 
        size={20} 
        color="#8E8E93" 
      />
      <View style={styles.suggestionTextContainer}>
        <Text style={styles.suggestionText}>{item.text}</Text>
        <Text style={styles.suggestionCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <SearchHeader onBack={() => router.back()} />
      
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleClearSearch}
        onSubmitEditing={handleSearchSubmit}
        placeholder="Search for products or stores"
        autoFocus
      />
      
      {searchQuery.length > 0 ? (
        <FlatList
          data={filteredSuggestions}
          renderItem={renderSuggestionItem}
          keyExtractor={(item) => item.id}
          style={styles.suggestionsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Popular Searches</Text>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  suggestionsContainer: {
    flex: 1,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  suggestionTextContainer: {
    marginLeft: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  suggestionCategory: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});

export default SearchScreen;
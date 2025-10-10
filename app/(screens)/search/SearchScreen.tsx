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

import { colors } from '@/constants/theme';
import {
  SearchHeader,
  SearchInput,
  SearchEmptyState
} from '@/components/search';
import { useSearch } from '@/utils/search';
import { useLocationContext } from '@/context/LocationContext';

// Popular search suggestions - in a real app, these could come from the backend
const POPULAR_SEARCHES = [
  { id: '1', text: 'Pizza', type: 'food', category: 'Fast Food' },
  { id: '2', text: 'Coffee', type: 'food', category: 'Beverages' },
  { id: '3', text: 'Sushi', type: 'food', category: 'Japanese' },
  { id: '4', text: 'Burger', type: 'food', category: 'Fast Food' },
  { id: '5', text: 'Thai Restaurant', type: 'restaurant', category: 'Asian' },
  { id: '6', text: 'Bakery', type: 'restaurant', category: 'Bakery' },
  { id: '7', text: 'Indian Food', type: 'food', category: 'Indian' },
  { id: '8', text: 'Bubble Tea', type: 'food', category: 'Beverages' },
  { id: '9', text: 'Grocery Store', type: 'restaurant', category: 'Grocery' },
  { id: '10', text: 'Mexican Food', type: 'food', category: 'Mexican' },
];

// Popular tags for tag-based search
const POPULAR_TAGS = [
  { id: 't1', text: 'gadgets', icon: 'hardware-chip-outline' },
  { id: 't2', text: 'electronics', icon: 'laptop-outline' },
  { id: 't3', text: 'organic', icon: 'leaf-outline' },
  { id: 't4', text: 'fresh', icon: 'water-outline' },
  { id: 't5', text: 'discount', icon: 'pricetag-outline' },
  { id: 't6', text: 'healthy', icon: 'fitness-outline' },
  { id: 't7', text: 'spicy', icon: 'flame-outline' },
  { id: 't8', text: 'vegan', icon: 'leaf-outline' },
];

const FOOD_CATEGORIES = [
  { id: 'c1', name: 'Fast Food', icon: 'fast-food-outline' },
  { id: 'c2', name: 'Asian', icon: 'restaurant-outline' },
  { id: 'c3', name: 'Italian', icon: 'pizza-outline' },
  { id: 'c4', name: 'Mexican', icon: 'nutrition-outline' },
  { id: 'c5', name: 'Desserts', icon: 'ice-cream-outline' },
  { id: 'c6', name: 'Beverages', icon: 'cafe-outline' },
];

const SearchScreen = () => {
  const router = useRouter();
  const { initialQuery } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery?.toString() || '');
  const { getPopularStores } = useSearch();
  const { currentLocation } = useLocationContext();
  
  // Filter popular searches based on search query
  const filteredSuggestions = POPULAR_SEARCHES.filter(suggestion => 
    suggestion.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(screens)/search/SearchResultsScreen',
        params: { query: searchQuery }
      });
    }
  };
  
  const handleSuggestionPress = (suggestion: any) => {
    // For categories and restaurants, we can search directly
    if (suggestion.type === 'category') {
      router.push({
        pathname: '/(screens)/search/SearchResultsScreen',
        params: { query: suggestion.text }
      });
    } else if (suggestion.type === 'restaurant') {
      router.push({
        pathname: '/(screens)/search/SearchResultsScreen',
        params: { query: suggestion.text }
      });
    } else if (suggestion.type === 'food') {
      router.push({
        pathname: '/(screens)/search/SearchResultsScreen',
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
            data={POPULAR_SEARCHES}
            renderItem={renderSuggestionItem}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Popular Tags Section */}
          <Text style={styles.categoriesTitle}>Popular Tags</Text>
          <View style={styles.tagsContainer}>
            {POPULAR_TAGS.map((tag) => (
              <TouchableOpacity 
                key={tag.id}
                style={styles.tagItem}
                onPress={() => router.push({
                  pathname: '/(screens)/search/SearchResultsScreen',
                  params: { query: tag.text }
                })}
              >
                <Ionicons 
                  name={tag.icon as any}
                  size={16} 
                  color={colors.primary.main}
                  style={styles.tagIcon}
                />
                <Text style={styles.tagText}>{tag.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Categories Section */}
          <Text style={styles.categoriesTitle}>Browse Categories</Text>
          <View style={styles.categoriesContainer}>
            {FOOD_CATEGORIES.map((category) => (
              <TouchableOpacity 
                key={category.id}
                style={styles.categoryItem}
                onPress={() => router.push({
                  pathname: '/(screens)/search/SearchResultsScreen',
                  params: { query: category.name }
                })}
              >
                <Ionicons 
                  name={category.icon as any}
                  size={24} 
                  color={colors.primary.main}
                  style={styles.categoryIcon}
                />
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    color: colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    marginTop: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  categoryItem: {
    width: '33.333%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  tagIcon: {
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '500',
  },
});

export default SearchScreen;
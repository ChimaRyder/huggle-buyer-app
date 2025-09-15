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

// TODO: Replace with API call to fetch search suggestions
import { colors } from '@/constants/theme';
import {
  SearchHeader,
  SearchInput,
  SearchEmptyState
} from '@/components/search';

// TODO: Replace with API call to fetch search suggestions
const generateSuggestions = () => {
  return [];
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
          {suggestions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No suggestions available</Text>
              <Text style={styles.emptySubtitle}>Start typing to search for products or stores</Text>
            </View>
          ) : (
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item) => item.id}
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
            />
          )}
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
});

export default SearchScreen;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import FoodItemCard from "@/components/food/FoodItemCard";
import { colors } from "@/constants/theme";

const SearchResultsScreen = () => {
  const route = useRoute();
  const router = useRouter();
  const { query } = route.params as { query: string; };
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(query);

  // TODO: Implement API search functionality
  useEffect(() => {
    if (!searchQuery) {
      setStores([]);
      setProducts([]);
      return;
    }

    // TODO: Implement API call to search restaurants and products
    setStores([]);
    setProducts([]);
  }, [searchQuery]);

  const handleStorePress = (id: string) => {
    router.push({
      pathname: "/(screens)/store/StoreHomepageScreen",
      params: { id },
    });
  };

  const handleProductPress = (id: string) => {
    router.push({
      pathname: "/(screens)/store/ProductScreen",
      params: { id },
    });
  };

  const handleToggleFavorite = (id: string) => {
    // In a real app, this would update the backend
    console.log(`Toggled favorite for restaurant ${id}`);
  };

  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchBarContainer}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.iconButton}
      >
        <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
      </TouchableOpacity>
      <View style={styles.searchInputWrapper}>
        <MaterialIcons
          name="search"
          size={20}
          color={colors.text.tertiary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          placeholder="Search for anything..."
          placeholderTextColor={colors.text.tertiary}
          onFocus={() => {
            // Navigate back to the search screen
            router.back();
            router.replace({pathname: '/(screens)/search/SearchScreen', params: {initialQuery: searchQuery}});
          }}
        />
      </View>
    </View>
  );

  // Render products section with 2-column grid (like home screen)
  const renderProductsSection = () => {
    if (products.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.foodItemsContainer}>
          {products.map((item) => (
            <View key={item.id} style={styles.foodItemWrapper}>
              <FoodItemCard 
                item={item} 
                onPress={() => handleProductPress(item.id)} 
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render stores section
  const renderStoresSection = () => {
    if (stores.length === 0) return null;
    
    return (
      <View style={styles.section}>
        {stores.map((store) => (
          <RestaurantCard
            key={store.id}
            restaurant={store}
            onPress={() => handleStorePress(store.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderSearchBar()}
      
      <View style={styles.divider} />
      
      <ScrollView style={styles.contentContainer}>
        {stores.length > 0 && renderStoresSection()}
        {products.length > 0 && renderProductsSection()}
        
        {stores.length === 0 && products.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyDescription}>
              Try different keywords or check your spelling
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 18,
    backgroundColor: colors.background.primary,
  },
  iconButton: {
    padding: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 40,
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: "center",
  },
});

export default SearchResultsScreen;
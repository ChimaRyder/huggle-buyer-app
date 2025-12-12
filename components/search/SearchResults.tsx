import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import FoodItemCard from '@/components/food/FoodItemCard';
import { BackendProduct, BackendStore } from '@/types/BackendModels';
import { useStoreContext } from '@/context/StoreContext';

// Transform backend store data to RestaurantCard format
const transformStoreData = (store: BackendStore, followedStoreIds: string[]) => {
  return {
    id: store.id,
    name: store.name,
    description: store.description || '',
    image: store.profileImageUrl || store.coverImageUrl || 'https://via.placeholder.com/400x200?text=Store+Image',
    rating: 4.5, // Default rating since backend doesn't provide it
    deliveryTime: '30-45 min', // Default delivery time
    distance: store.Location ? '0.5 km' : 'Unknown', // You could calculate actual distance here
    categories: store.tags?.slice(0, 2) || ['Store'], // Use first 2 tags as categories
    isFavorite: followedStoreIds.includes(store.id), // Check if store is followed
    address: store.address,
    city: store.city,
    province: store.province,
    isOpen: store.isOpen,
    isVerified: store.isVerified,
  };
};

interface SearchResultsProps {
  restaurants: BackendStore[];
  foodItems: BackendProduct[];
  searchTerm?: string; // Add search term to highlight matching tags
  onRestaurantPress: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onFoodItemPress: (item: BackendProduct) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  restaurants,
  foodItems,
  searchTerm,
  onRestaurantPress,
  onToggleFavorite,
  onFoodItemPress
}) => {
  const { followedStores, followStore, unfollowStore, fetchFollowedStores } = useStoreContext();
  const [followedStoreIds, setFollowedStoreIds] = useState<string[]>([]);

  // Extract store IDs from followed stores
  useEffect(() => {
    const ids = followedStores.map((followedStore: any) =>
      followedStore.storeId || followedStore.store?.id || followedStore.id
    ).filter(Boolean);
    setFollowedStoreIds(ids);
  }, [followedStores]);

  // Fetch followed stores on component mount
  useEffect(() => {
    fetchFollowedStores();
  }, [fetchFollowedStores]);

  const handleToggleFavorite = async (storeId: string) => {
    try {
      if (followedStoreIds.includes(storeId)) {
        await unfollowStore(storeId);
        console.log('✅ Unfollowed store:', storeId);
      } else {
        await followStore(storeId);
        console.log('✅ Followed store:', storeId);
      }
      // Refresh followed stores list
      await fetchFollowedStores();
      // Also call the original onToggleFavorite if provided
      onToggleFavorite(storeId);
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
    }
  };
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
          <Text style={styles.sectionTitle}>Stores</Text>
          {restaurants.map((restaurant) => (
            <View key={restaurant.id} style={styles.resultItem}>
              <RestaurantCard
                restaurant={transformStoreData(restaurant, followedStoreIds)}
                onPress={() => onRestaurantPress(restaurant.id)}
                onToggleFavorite={handleToggleFavorite}
              />
              {/* Show matching tags */}
              {searchTerm && restaurant.tags && restaurant.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Text style={styles.tagsLabel}>Tags: </Text>
                  {restaurant.tags.slice(0, 3).map((tag, index) => {
                    const isMatch = tag.toLowerCase().includes(searchTerm.toLowerCase());
                    return (
                      <Text
                        key={index}
                        style={[styles.tag, isMatch && styles.matchingTag]}
                      >
                        {tag}{index < Math.min(restaurant.tags.length, 3) - 1 && ', '}
                      </Text>
                    );
                  })}
                  {restaurant.tags.length > 3 && (
                    <Text style={styles.tag}>+{restaurant.tags.length - 3} more</Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {foodItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products</Text>
          <View style={styles.foodItemsContainer}>
            {foodItems.map((item, index) => {
              const isLeftColumn = index % 2 === 0;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.foodItemWrapper,
                    isLeftColumn ? styles.foodItemLeft : styles.foodItemRight
                  ]}
                >
                  <FoodItemCard
                    item={item}
                    onPress={() => onFoodItemPress(item)}
                  />
                  {/* Show matching tags */}
                  {searchTerm && item.tags && item.tags.length > 0 && (
                    <View style={styles.productTagsContainer}>
                      {item.tags.slice(0, 2).map((tag, tagIndex) => {
                        const isMatch = tag.toLowerCase().includes(searchTerm.toLowerCase());
                        return (
                          <Text
                            key={tagIndex}
                            style={[styles.productTag, isMatch && styles.matchingProductTag]}
                          >
                            {tag}
                          </Text>
                        );
                      })}
                      {item.tags.length > 2 && (
                        <Text style={styles.productTag}>+{item.tags.length - 2}</Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
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
  resultItem: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  tagsLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginRight: 4,
  },
  tag: {
    fontSize: 12,
    color: '#666',
  },
  matchingTag: {
    color: '#548C2F',
    fontWeight: '600',
  },
  productTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  productTag: {
    fontSize: 10,
    color: '#999',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  matchingProductTag: {
    backgroundColor: '#E8F5E8',
    color: '#548C2F',
    fontWeight: '600',
  },
  foodItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  foodItemWrapper: {
    width: (Dimensions.get('window').width - 32 - 12) / 2, // (screenWidth - padding - gap) / 2
    marginBottom: 12,
  },
  foodItemLeft: {
    marginRight: 12,
  },
  foodItemRight: {
    marginRight: 0,
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
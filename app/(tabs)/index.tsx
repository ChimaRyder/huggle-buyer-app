/** 
 * Home Screen
 * Main landing screen for food e-commerce app showing categories and restaurants
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { useProductContext } from '@/context/ProductContext';
import { useStoreContext } from '@/context/StoreContext';
import { useLocationContext } from '@/context/LocationContext';
import { registerForPushNotificationsAsync } from '@/utils/Notifications';
import { addPushToken } from '@/utils/pushToken';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useApi } from '@/context/ApiContext';

import { GreeterSection } from '@/components/layout';
import { colors } from '@/constants/theme';
import {
  CategorySection,
  TrendingItemsSection,
  PopularStoresSection
} from '@/components/home';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { itemCount, items, isLoading, error } = useCart();
  const { user } = useUser();
  const { client: apiClient } = useApi();
  
  // Context hooks
  const { fetchTrendingProducts } = useProductContext();
  const { 
    fetchPopularStores, 
    followStore, 
    unfollowStore, 
    isStoreFollowed,
    fetchFollowedStores 
  } = useStoreContext();
  const { currentLocation, initializeLocationInBackground } = useLocationContext();

  // Initialize location on home screen mount to ensure products can load
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        await initializeLocationInBackground();
      } catch (error) {
      }
    };

    initializeLocation();
  }, [initializeLocationInBackground]);

  // Periodic push token refresh (every 3 hours)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const refreshPushToken = async () => {
      try {
        const pToken = await registerForPushNotificationsAsync();
        if (user && pToken) {
          await addPushToken(apiClient, { token: pToken });
        }
      } catch (error) {
        console.error('❌ HomeScreen: Error refreshing push token:', error);
      }
    };
    // Initial refresh on mount
    refreshPushToken();
    // Set interval for periodic refresh
    intervalId = setInterval(refreshPushToken, 3 * 60 * 60 * 1000); // 3 hours
    return () => clearInterval(intervalId);
  }, [user, apiClient]);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      // Refresh all data if location is available
      if (currentLocation) {
        const refreshPromises = [
          fetchTrendingProducts(currentLocation.latitude, currentLocation.longitude, 10),
          fetchPopularStores(currentLocation.latitude, currentLocation.longitude, 5)
        ];
        
        await Promise.all(refreshPromises);
      } else {
      }
    } catch (error) {
      console.error('❌ HomeScreen: Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRestaurantPress = (id: string) => {
    router.push(`/(screens)/store/StoreHomepageScreen?id=${id}`);
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      if (isStoreFollowed(id)) {
        await unfollowStore(id);
      } else {
        await followStore(id);
      }
      // Refresh followed stores to update the UI
      await fetchFollowedStores();
    } catch (error) {
      console.error('❌ HomeScreen: Error toggling favorite:', error);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push({ pathname: '/(screens)/home/CategoryScreen', params: { categoryId: categoryId } });
  };

  const handleCartPress = () => {
    router.push('/(screens)/cart/CartScreen');
  };

  const handleSearchFocus = () => {
    router.push('/(screens)/search/SearchScreen');
  };

  const handleFoodItemPress = (itemId: string) => {
    router.push(`/(screens)/store/ProductScreen?id=${itemId}`);
  };

  const handleSeeAllTrendingItems = () => {
    router.push('/(screens)/home/TrendingProductsScreen');
  };

  const handleSeeAllPopularStores = () => {
    // For now, we'll navigate to a search screen with a filter for popular stores
    // You might want to create a dedicated screen for this later
    router.push('/(screens)/search/SearchScreen');
  };

  const handleLocationPress = () => {
    router.push('/(screens)/home/MapsScreen');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary.main]}
              tintColor={colors.primary.main}
            />
          }
        >
          <GreeterSection 
            onSearchFocus={handleSearchFocus} 
            onLocationPress={handleLocationPress}
          />
          
          <CategorySection onCategoryPress={handleCategoryPress} />
          
          <TrendingItemsSection 
            onFoodItemPress={handleFoodItemPress} 
            onSeeAllPress={handleSeeAllTrendingItems}
          />
          
          <PopularStoresSection 
            onRestaurantPress={handleRestaurantPress} 
            onToggleFavorite={handleToggleFavorite} 
            onSeeAllPress={handleSeeAllPopularStores}
          />
        </ScrollView>
        
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary, // Very light gray background
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default HomeScreen;
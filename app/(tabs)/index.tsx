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
  
  // Debug logging for cart state
  console.log('🏠 HomeScreen: Cart debug info:', {
    itemCount,
    totalItems: items.length,
    isLoading,
    error,
    cartItems: items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity }))
  });
  
  // Context hooks
  const { fetchTrendingProducts } = useProductContext();
  const { fetchPopularStores } = useStoreContext();
  const { currentLocation, initializeLocationInBackground } = useLocationContext();

  // Initialize location on home screen mount to ensure products can load
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        console.log('🏠 HomeScreen: Initializing location on mount');
        await initializeLocationInBackground();
        console.log('✅ HomeScreen: Location initialization completed');
      } catch (error) {
        console.warn('⚠️ HomeScreen: Location initialization failed:', error);
      }
    };

    initializeLocation();
  }, [initializeLocationInBackground]);

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
        console.log('✅ HomeScreen: Successfully refreshed all data');
      } else {
        console.log('📍 HomeScreen: No location available for refresh');
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

  const handleToggleFavorite = (id: string) => {
    // In a real app, this would update the backend
    console.log(`Toggled favorite for restaurant ${id}`);
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
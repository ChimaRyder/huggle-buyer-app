/** 
 * Home Screen
 * Main landing screen for food e-commerce app showing categories and restaurants
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';

import { GreeterSection } from '@/components/layout';
import { colors } from '@/constants/theme';
import {
  CategorySection,
  TrendingItemsSection,
  PopularStoresSection,
  FloatingCartButton
} from '@/components/home';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { itemCount } = useCart();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleRestaurantPress = (id: string) => {
    router.push(`/(screens)/StoreHomepageScreen?id=${id}`);
  };

  const handleToggleFavorite = (id: string) => {
    // In a real app, this would update the backend
    console.log(`Toggled favorite for restaurant ${id}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push({ pathname: '/(screens)/TrendingProductsScreen', params: { productType: categoryId } });
  };

  const handleCartPress = () => {
    router.push('/(screens)/food/CartScreen');
  };

  const handleSearchFocus = () => {
    router.push('/(screens)/SearchScreen');
  };

  const handleFoodItemPress = (itemId: string) => {
    router.push(`/(screens)/ProductScreen?id=${itemId}`);
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
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <GreeterSection onSearchFocus={handleSearchFocus} />
          
          <CategorySection onCategoryPress={handleCategoryPress} />
          
          <TrendingItemsSection onFoodItemPress={handleFoodItemPress} />
          
          <PopularStoresSection 
            onRestaurantPress={handleRestaurantPress} 
            onToggleFavorite={handleToggleFavorite} 
          />
        </ScrollView>
        
        <FloatingCartButton 
          onPress={handleCartPress} 
          itemCount={itemCount} 
        />
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
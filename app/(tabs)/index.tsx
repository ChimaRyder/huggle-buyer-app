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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';

import { GreeterSection } from '@/components/layout';
import { colors, gradients } from '@/constants/theme';
import {
  SearchBar,
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
    router.push(`/screens/food/RestaurantDetailScreen?id=${id}`);
  };

  const handleToggleFavorite = (id: string) => {
    // In a real app, this would update the backend
    console.log(`Toggled favorite for restaurant ${id}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/screens/food/CategoryScreen?id=${categoryId}`);
  };

  const handleCartPress = () => {
    router.push('/screens/food/CartScreen');
  };

  const handleSearchFocus = () => {
    router.push('/(screens)/SearchScreen');
  };

  const handleFoodItemPress = (itemId: string) => {
    // Find which restaurant has this item
    // In a real app, this would be handled by the backend
    router.push(`/screens/food/RestaurantDetailScreen?id=1`);
  };

  return (
    <LinearGradient
      colors={gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
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
          <GreeterSection />
          
          <SearchBar onFocus={handleSearchFocus} />
          
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 16, // Keep only top padding
  },
  container: {
    flex: 1,
    paddingTop: 16, // Add padding at the top
  },
});

export default HomeScreen;
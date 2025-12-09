/** 
 * Home Screen
 * Main landing screen for food e-commerce app showing categories and restaurants
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  View,
  Modal,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import {
  CategorySection,
  TrendingItemsSection,
  PopularStoresSection,
  NearbyStoresSection
} from '@/components/home';

const PRICING_DRAWER_KEY = '@huggle_pricing_drawer_shown';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showPricingDrawer, setShowPricingDrawer] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();
  const { itemCount, items, isLoading, error } = useCart();
  const { user } = useUser();
  const { client: apiClient } = useApi();
  
  // Context hooks
  const { fetchTrendingProducts } = useProductContext();
  const { 
    fetchPopularStores,
    fetchNearbyStores,
    followStore, 
    unfollowStore, 
    isStoreFollowed,
    fetchFollowedStores 
  } = useStoreContext();
  const { currentLocation, initializeLocationInBackground } = useLocationContext();

  // Check if user has seen the pricing drawer
  useEffect(() => {
    const checkPricingDrawerStatus = async () => {
      try {
        const hasSeenDrawer = await AsyncStorage.getItem(PRICING_DRAWER_KEY);
        if (!hasSeenDrawer && user) {
          // Show drawer after a short delay for better UX
          setTimeout(() => {
            setShowPricingDrawer(true);
            Animated.spring(slideAnim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 8,
            }).start();
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking pricing drawer status:', error);
      }
    };

    checkPricingDrawerStatus();
  }, [user, slideAnim]);

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
      console.log('🔄 HomeScreen: Refreshing data');
      
      // Build refresh promises
      const refreshPromises: Promise<void>[] = [
        // Always fetch trending products
        fetchTrendingProducts(),
        // Fetch popular stores - pass user location if available for better distance calculations
        fetchPopularStores(currentLocation?.latitude, currentLocation?.longitude)
      ];
      
      // If we have location, also refresh nearby stores
      if (currentLocation) {
        refreshPromises.push(
          fetchNearbyStores(currentLocation.latitude, currentLocation.longitude, 5)
        );
      }
      
      await Promise.all(refreshPromises);
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

  const handleClosePricingDrawer = async () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowPricingDrawer(false);
    });
    
    // Mark drawer as shown
    try {
      await AsyncStorage.setItem(PRICING_DRAWER_KEY, 'true');
    } catch (error) {
      console.error('Error saving pricing drawer status:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
        
        <NearbyStoresSection 
          onRestaurantPress={handleRestaurantPress} 
          onToggleFavorite={handleToggleFavorite} 
          onSeeAllPress={handleSeeAllPopularStores}
        />
        
        <PopularStoresSection 
          onRestaurantPress={handleRestaurantPress} 
          onToggleFavorite={handleToggleFavorite} 
          onSeeAllPress={handleSeeAllPopularStores}
        />
      </ScrollView>
      
      {/* Dynamic Pricing Info Drawer */}
      <Modal
        visible={showPricingDrawer}
        transparent
        animationType="none"
        onRequestClose={handleClosePricingDrawer}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={handleClosePricingDrawer}
          />
          <Animated.View 
            style={[
              styles.pricingDrawer,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [500, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              },
            ]}
          >
            {/* Drawer handle */}
            <View style={styles.drawerHandle} />
            
            {/* Icon and Title */}
            <View style={styles.pricingDrawerHeader}>
              <View style={styles.pricingIconContainer}>
                <Ionicons name="pricetags" size={48} color={colors.primary.main} />
              </View>
              <Text style={styles.pricingDrawerTitle}>Heads up!</Text>
              <Text style={styles.pricingDrawerSubtitle}>Prices change depending on demand.</Text>
            </View>
            
            {/* Description */}
            <View style={styles.pricingDrawerContent}>
              <View style={styles.pricingInfoItem}>
                <Ionicons name="trending-up" size={24} color={colors.success} />
                <View style={styles.pricingInfoText}>
                  <Text style={styles.pricingInfoTitle}>Fresh deals, fresh prices</Text>
                  <Text style={styles.pricingInfoDescription}>
                    Prices adjust based on real-time demand to bring you the best value
                  </Text>
                </View>
              </View>
              
              <View style={styles.pricingInfoItem}>
                <Ionicons name="flash" size={24} color={colors.warning} />
                <View style={styles.pricingInfoText}>
                  <Text style={styles.pricingInfoTitle}>Catch the best deals</Text>
                  <Text style={styles.pricingInfoDescription}>
                    Shop at the right time and save more on your favorite products
                  </Text>
                </View>
              </View>
            </View>
            
            {/* CTA Button */}
            <TouchableOpacity 
              style={styles.startHugglingButton}
              onPress={handleClosePricingDrawer}
            >
              <Text style={styles.startHugglingButtonText}>Start Huggling</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
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
  scrollContent: {
    paddingBottom: 100, // Account for tab bar height
  },
  // Pricing drawer styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  pricingDrawer: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.background.secondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  pricingDrawerHeader: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  pricingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  pricingDrawerTitle: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  pricingDrawerSubtitle: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pricingDrawerContent: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  pricingInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 12,
  },
  pricingInfoText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  pricingInfoTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  pricingInfoDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  startHugglingButton: {
    backgroundColor: colors.primary.main,
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  startHugglingButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
});

export default HomeScreen;
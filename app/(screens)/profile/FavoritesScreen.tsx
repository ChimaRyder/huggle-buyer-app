import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { useStoreContext } from '@/context/StoreContext';
import { colors, spacing, typography } from '@/constants/theme';

// Adapter function to convert followed store data to Restaurant format
const adaptStoreToRestaurant = (followedStore: any) => {
  return {
    id: followedStore.storeId || followedStore.id,
    name: followedStore.storeName || followedStore.name || 'Unknown Store',
    description: followedStore.storeDescription || followedStore.description || '',
    image: followedStore.storeImageUrl || followedStore.profileImageUrl || followedStore.coverImageUrl || '',
    rating: 4.5, // Default rating since followed stores don't have ratings
    deliveryTime: '20-30 min', // Default delivery time
    distance: '2.5 km', // Default distance 
    categories: followedStore.tags || ['Store'],
    isFavorite: true, // Always true since these are followed stores
    address: followedStore.address || '',
    city: followedStore.city || '',
    province: followedStore.province || '',
    isOpen: followedStore.isOpen ?? true,
    isVerified: followedStore.isVerified ?? false,
    followedAt: followedStore.followedAt,
  };
};

const FavoritesScreen = () => {
  const router = useRouter();
  
  // Store context
  const {
    followedStores,
    isFetchingFollowedStores,
    followedStoresError,
    fetchFollowedStores,
    clearFollowedStores,
    unfollowStore
  } = useStoreContext();
  
  // Local state for refresh control
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch followed stores on component mount
  useEffect(() => {
    fetchFollowedStores();
    
    // Cleanup on unmount
    return () => {
      clearFollowedStores();
    };
  }, [fetchFollowedStores, clearFollowedStores]);
  
  // Pull to refresh handler
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchFollowedStores();
    } catch (error) {
      console.error('🔍 FavoritesScreen: Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleRestaurantPress = (id: string) => {
    router.push(`/(screens)/store/StoreHomepageScreen?id=${id}`);
  };

  const handleBackPress = () => {
    router.back();
  };
  
  const handleToggleFavorite = async (id: string) => {
    try {
      await unfollowStore(id);
      // Refresh the list to remove the unfollowed store
      await fetchFollowedStores();
    } catch (error) {
      console.error('🔍 FavoritesScreen: Error unfollowing store:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorite Stores</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      >
        {isFetchingFollowedStores && followedStores.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Loading your favorite stores...</Text>
          </View>
        ) : followedStoresError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={80} color={colors.error} />
            <Text style={styles.errorTitle}>Unable to load favorites</Text>
            <Text style={styles.errorDescription}>{followedStoresError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchFollowedStores}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : followedStores.length > 0 ? (
          <View style={styles.restaurantsContainer}>
            {followedStores.map((followedStore) => {
              const adaptedRestaurant = adaptStoreToRestaurant(followedStore);
              return (
                <RestaurantCard
                  key={adaptedRestaurant.id}
                  restaurant={adaptedRestaurant}
                  onPress={() => handleRestaurantPress(adaptedRestaurant.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No favorite stores yet</Text>
            <Text style={styles.emptyDescription}>
              Tap the heart icon on stores to save them here
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 24, // Same width as icons for centering
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  restaurantsContainer: {
    padding: spacing.lg,
    paddingBottom: 120, // Extra bottom padding for better scrolling experience
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  loadingText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  errorTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
});

export default FavoritesScreen;
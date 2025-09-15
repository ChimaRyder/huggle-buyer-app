import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import RestaurantCard from '@/components/restaurant/RestaurantCard';
// TODO: Replace with API call to fetch favorite restaurants
import { colors, spacing, typography } from '@/constants/theme';

const FavoritesScreen = () => {
  const router = useRouter();
  
  // TODO: Replace with API call to fetch favorite restaurants
  const favoriteRestaurants: any[] = [];
  
  const handleRestaurantPress = (id: string) => {
    router.push(`/(screens)/store/StoreHomepageScreen?id=${id}`);
  };

  const handleBackPress = () => {
    router.back();
  };
  
  const handleToggleFavorite = (id: string) => {
    // In a real app, this would update the backend
    console.log(`Toggled favorite for restaurant ${id}`);
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
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {favoriteRestaurants.length > 0 ? (
          <View style={styles.restaurantsContainer}>
            {favoriteRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => handleRestaurantPress(restaurant.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyDescription}>
              Tap the heart icon on restaurants to save them here
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
});

export default FavoritesScreen;
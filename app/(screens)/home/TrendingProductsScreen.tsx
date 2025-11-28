import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/constants/theme";
import { ProductGrid } from "@/components/product";
import { useProductContext } from "@/context/ProductContext";
import { useLocationContext } from "@/context/LocationContext";

export default function TrendingProductsScreen() {
  const { productType } = useLocalSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  
  const {
    trendingProducts,
    isFetchingTrending,
    trendingError,
    fetchTrendingProducts
  } = useProductContext();
  
  const { currentLocation } = useLocationContext();

  // Create stable location coordinates to prevent infinite re-renders
  const locationCoords = useMemo(() => {
    if (!currentLocation) return null;
    return {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      address: currentLocation.address
    };
  }, [currentLocation?.latitude, currentLocation?.longitude, currentLocation?.address]);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchProducts = useCallback(() => {
    if (locationCoords) {
      fetchTrendingProducts(locationCoords.latitude, locationCoords.longitude, 10);
    } else {
      fetchTrendingProducts();
    }
  }, [locationCoords, fetchTrendingProducts]);

  useEffect(() => {
    let screenTitle = "";

    if (productType && typeof productType === "string") {
      screenTitle = `${productType}`;
    } else {
      screenTitle = "Trending Products";
    }

    setTitle(screenTitle);
    
    // Fetch trending products if we don't have productType (meaning this is the general trending screen)
    if (!productType) {
      fetchProducts();
    }
  }, [productType, fetchProducts]);

  const handleProductPress = (productId: string) => {
    router.push(`/(screens)/store/ProductScreen?id=${productId}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {isFetchingTrending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.main} />
              <Text style={styles.loadingText}>
                {locationCoords 
                  ? `Loading trending products near ${locationCoords.address || 'you'}...`
                  : 'Loading trending products...'
                }
              </Text>
            </View>
          ) : trendingError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={48} color={colors.error} />
              <Text style={styles.errorText}>Failed to load products</Text>
              <Text style={styles.errorSubtext}>{trendingError}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={fetchProducts}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : !locationCoords ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyText}>Location Required</Text>
              <Text style={styles.emptySubtext}>Please set your location to see trending products near you</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => router.push('/(screens)/location/LocationScreen')}
              >
                <Text style={styles.retryButtonText}>Set Location</Text>
              </TouchableOpacity>
            </View>
          ) : trendingProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyText}>No trending products available</Text>
              <Text style={styles.emptySubtext}>Check back later for new products in your area</Text>
            </View>
          ) : (
            <ProductGrid
              products={trendingProducts}
              onProductPress={handleProductPress}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120, // Extra bottom padding for better scrolling experience
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl * 3,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl * 3,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: spacing.xs,
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl * 3,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: spacing.xs,
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

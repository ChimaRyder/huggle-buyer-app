import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/constants/theme";
import { ProductGrid } from "@/components/product";
import { useProductContext } from "@/context/ProductContext";
import type { BackendProduct } from "@/types/BackendModels";

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams();
  const router = useRouter();
  const { trendingProducts } = useProductContext();
  
  // Filter products based on category
  const { filteredProducts, categoryDisplayName } = useMemo(() => {
    if (!categoryId || typeof categoryId !== "string" || !trendingProducts) {
      return { filteredProducts: [], categoryDisplayName: "Category" };
    }
    
    const normalizedCategoryId = categoryId.toLowerCase().trim();
    
    // Filter products that match the category
    const filtered = trendingProducts.filter((product: BackendProduct) => {
      // Check if product type matches (exact match)
      if (product.productType && product.productType.toLowerCase().trim() === normalizedCategoryId) {
        return true;
      }
      
      // Check if any tags match (exact match)
      if (product.tags && Array.isArray(product.tags)) {
        const hasExactMatch = product.tags.some(tag => 
          tag.toLowerCase().trim() === normalizedCategoryId
        );
        if (hasExactMatch) {
          return true;
        }
        
        // Check for partial matches (tag contains category or vice versa)
        const hasPartialMatch = product.tags.some(tag => {
          const normalizedTag = tag.toLowerCase().trim();
          return normalizedTag.includes(normalizedCategoryId) || normalizedCategoryId.includes(normalizedTag);
        });
        if (hasPartialMatch) {
          return true;
        }
      }
      
      // Check if product type contains the category (partial match)
      if (product.productType) {
        const normalizedProductType = product.productType.toLowerCase().trim();
        if (normalizedProductType.includes(normalizedCategoryId) || normalizedCategoryId.includes(normalizedProductType)) {
          return true;
        }
      }
      
      return false;
    });
    
    console.log(`🔍 CategoryScreen: Filtering products for category "${normalizedCategoryId}"`);
    console.log(`🔍 CategoryScreen: Total products available: ${trendingProducts.length}`);
    console.log(`🔍 CategoryScreen: Filtered products found: ${filtered.length}`);
    
    // Debug: Log some product details for troubleshooting
    if (filtered.length === 0 && trendingProducts.length > 0) {
      console.log('🔍 CategoryScreen: No matches found. Sample product data:');
      trendingProducts.slice(0, 3).forEach((product, index) => {
        console.log(`  Product ${index + 1}:`, {
          name: product.name,
          productType: product.productType,
          tags: product.tags
        });
      });
    }
    
    // Generate display name (capitalize first letter)
    const displayName = normalizedCategoryId.charAt(0).toUpperCase() + normalizedCategoryId.slice(1);
    
    return { 
      filteredProducts: filtered, 
      categoryDisplayName: displayName 
    };
  }, [categoryId, trendingProducts]);

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
        <Text style={styles.headerTitle}>{categoryDisplayName}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {filteredProducts.length > 0 ? (
            <ProductGrid
              products={filteredProducts}
              onProductPress={handleProductPress}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyDescription}>
                We couldn't find any products in the "{categoryDisplayName}" category at the moment.
              </Text>
            </View>
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
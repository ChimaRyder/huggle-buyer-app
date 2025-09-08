import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/constants/theme";
import { ProductGrid } from "../../../components/product";
import { foodItems, foodCategories } from "../../../data/food/mockData";
import { FoodItem } from "../../../data/food/models";

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<FoodItem[]>([]);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (categoryId && typeof categoryId === "string") {
      // Find the category name
      const category = foodCategories.find(cat => cat.id === categoryId);
      const categoryTitle = category ? category.name : "Category";
      
      // Filter products by category name
      const filteredProducts = foodItems.filter(item => 
        item.category === categoryTitle
      );

      setProducts(filteredProducts);
      setCategoryName(categoryTitle);
    }
  }, [categoryId]);

  const handleProductPress = (productId: string) => {
    router.push(`/(screens)/ProductScreen?id=${productId}`);
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
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {products.length > 0 ? (
            <ProductGrid
              products={products}
              onProductPress={handleProductPress}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyDescription}>
                We couldn't find any products in this category at the moment.
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
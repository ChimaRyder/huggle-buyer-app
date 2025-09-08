import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/constants/theme";
import { ProductGrid } from "../../components/product";
import { foodItems } from "../../data/food/mockData";
import { FoodItem } from "../../data/food/models";

export default function TrendingProductsScreen() {
  const { productType } = useLocalSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<FoodItem[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    let filteredProducts: FoodItem[] = [];
    let screenTitle = "";

    if (productType && typeof productType === "string") {
      // Filter products by category
      filteredProducts = foodItems.filter(item => 
        item.category === productType
      );
      screenTitle = `${productType}`;
    } else {
      // Show trending products (popular items)
      filteredProducts = foodItems.filter(item => item.isPopular);
      screenTitle = "Trending Products";
    }

    setProducts(filteredProducts);
    setTitle(screenTitle);
  }, [productType]);

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
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ProductGrid
            products={products}
            onProductPress={handleProductPress}
          />
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
});

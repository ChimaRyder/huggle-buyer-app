/**
 * ProductGrid Component
 * Displays a grid of products with filtering and refresh capabilities
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MockProductService } from "../../data/mockServices";
import type { BackendProduct } from "../../types/BackendModels";
import { colors, spacing, typography } from "@/constants/theme";

interface Product {
  id: string;
  name: string;
  image: { uri: string };
  rating: number;
  discount: number;
  distance: string;
  time: string;
  availableItems: number;
  price: number;
  storeId: string;
  expirationDate: string;
}

interface ProductGridProps {
  productType?: string;
  limit?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ productType, limit }) => {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTimeUntilExpiration = (expirationDate: string) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - now.getTime();

    if (diffTime <= 0) return "Expired";

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} left`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} left`;
    } else {
      return `${diffMinutes} ${diffMinutes === 1 ? "min" : "mins"} left`;
    }
  };

  const loadProducts = async () => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      
      let backendProducts: BackendProduct[];
      
      if (productType) {
        backendProducts = await MockProductService.getProductsByCategory(productType);
      } else {
        backendProducts = await MockProductService.getFeaturedProducts(limit || 10);
      }

      const transformedProducts: Product[] = backendProducts.map((product) => {
        const discountPercentage =
          product.originalPrice > 0
            ? Math.round(
                ((product.originalPrice - product.discountedPrice) /
                  product.originalPrice) *
                  100
              )
            : 0;

        return {
          id: product.id,
          name: product.name,
          image: { uri: product.coverImage },
          rating: product.rating || 4.5,
          discount: discountPercentage,
          distance: "2-5km", // Mock distance
          time: "15-30mins", // Mock time
          availableItems: product.stock,
          price: product.discountedPrice,
          storeId: product.storeId,
          expirationDate: product.expirationDate,
        };
      });

      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
  };

  useEffect(() => {
    loadProducts();
  }, [productType, limit]);

  const renderProduct = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.card}
      onPress={() => router.push(`/(screens)/ProductScreen?id=${product.id}`)}
    >
      <Image source={product.image} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.badgeRow}>
          {product.discount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.discount}% OFF</Text>
            </View>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.availableItems} left</Text>
          </View>
        </View>
        
        <View style={styles.metaRow}>
          <MaterialIcons name="star" size={14} color={colors.warning} />
          <Text style={styles.metaText}>{product.rating}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>
            {calculateTimeUntilExpiration(product.expirationDate)}
          </Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>${product.price.toFixed(2)}</Text>
          <TouchableOpacity
            onPress={() =>
              router.push(`/(screens)/StoreHomepageScreen?id=${product.storeId}`)
            }
          >
            <Text style={styles.storeButton}>View Store</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!productType && (
        <View style={styles.header}>
          <Text style={styles.title}>Trending Near You</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : products.length === 0 ? (
            <Text style={styles.emptyText}>No products available</Text>
          ) : (
            products.map(renderProduct)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    ...typography.body2,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 120,
    height: 120,
    backgroundColor: colors.background.secondary,
  },
  infoContainer: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  productName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  storeButton: {
    ...typography.caption,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body1,
    color: colors.error,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default ProductGrid;
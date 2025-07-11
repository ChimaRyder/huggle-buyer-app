import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { images, ImageSource } from "../assets";
import { fetchProductsByStoreId } from "../utils/api";
import { BackendProduct } from "../types/BackendModels";

// Frontend product interface
interface Product {
  id: string;
  name: string;
  image: ImageSource | { uri: string };
  rating: number;
  discount: number;
  distance: string;
  time: string;
  availableItems: number;
  price: number;
  storeId: string;
}

// Fallback mock products
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Chocolate Cake",
    image: images.products.product1,
    rating: 4.8,
    discount: 25,
    distance: "5km",
    time: "45mins",
    availableItems: 5,
    price: 100,
    storeId: "1",
  },
  {
    id: "2",
    name: "Fresh Salad",
    image: images.products.product2,
    rating: 4.6,
    discount: 15,
    distance: "3km",
    time: "30mins",
    availableItems: 8,
    price: 150,
    storeId: "1",
  },
];

interface StoreProductGridProps {
  storeId: string;
  title?: string;
}

const getStyles = (cardWidth: number) =>
  StyleSheet.create({
    container: {
      paddingTop: 16,
      paddingBottom: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 23,
      fontFamily: "Poppins-SemiBold",
      color: "#333",
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    viewAllText: {
      fontSize: 15,
      color: "#548C2F",
      marginRight: 4,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      height: 200,
    },
    loadingText: {
      marginTop: 10,
      color: "#666",
      fontSize: 16,
    },
    errorContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      height: 200,
    },
    errorText: {
      color: "#FF6B6B",
      fontSize: 16,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      height: 200,
    },
    emptyText: {
      color: "#666",
      fontSize: 16,
    },
    card: {
      width: cardWidth,
      marginBottom: 16,
      backgroundColor: "#fff",
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    imageContainer: {
      position: "relative",
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      overflow: "hidden",
    },
    image: {
      width: cardWidth,
      height: cardWidth,
      resizeMode: "cover",
    },
    discountBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(217, 217, 217, 0.5)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 5,
    },
    discountText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
    },
    distanceContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderTopRightRadius: 10,
    },
    distanceText: {
      color: "#fff",
      fontSize: 12,
    },
    infoContainer: {
      padding: 12,
    },
    productName: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
      marginBottom: 4,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    ratingText: {
      marginLeft: 4,
      fontSize: 14,
      color: "#666",
    },
    availableText: {
      fontSize: 12,
      color: "#999",
    },
  });

const StoreProductGrid: React.FC<StoreProductGridProps> = ({
  storeId,
  title = "Store Products",
}) => {
  const router = useRouter();
  const { getToken } = useAuth();
  const screenWidth = Dimensions.get("window").width;
  const paddingHorizontal = 16;
  const cardGap = 12;
  const cardWidth = (screenWidth - paddingHorizontal * 2 - cardGap) / 2; // 2 cards + margin in between + outer padding
  const styles = getStyles(cardWidth);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!storeId) {
      setError("Store ID not provided");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (!refreshing) {
        setLoading(true);
      }
      // Get auth token with the seller_app template
      const token = await getToken({ template: "seller_app" });
      // Use our API utility function with the token
      const backendProducts: BackendProduct[] = await fetchProductsByStoreId(
        storeId,
        token
      );

      // Transform backend products to match our frontend Product interface
      const transformedProducts: Product[] = backendProducts.map((product) => {
        // Calculate discount percentage
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
          // Use cover image from backend if available, otherwise use placeholder
          image: product.coverImage
            ? { uri: product.coverImage }
            : images.products.product1,
          rating: product.rating || 4.5,
          discount: discountPercentage,
          // These fields don't exist in backend, use placeholders
          distance: "3km",
          time: "30mins",
          availableItems: product.stock,
          price: product.discountedPrice,
          storeId: product.storeId,
        };
      });

      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      console.error(`Error fetching products for store ${storeId}:`, err);
      setError("Failed to load store products");
      // Fallback to mock products if the store ID matches
      setProducts(mockProducts.filter((p) => p.storeId === storeId));
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
  }, [storeId]);

  const renderProduct = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.card}
      onPress={() => router.push(`/(screens)/ProductScreen?id=${product.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image source={product.image} style={styles.image} />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{product.discount}% OFF</Text>
        </View>
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>
            {product.distance} - {product.time}
          </Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>
        <Text style={styles.availableText}>
          {product.availableItems} items available
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#548C2F"]}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#548C2F" />
            <Text style={styles.loadingText}>Loading store products...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No products available for this store
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>{products.map(renderProduct)}</View>
        )}
      </ScrollView>
    </View>
  );
};

export default StoreProductGrid;

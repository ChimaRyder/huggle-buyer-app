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
import { fetchAllProducts } from "../utils/api";

// Backend product interface
interface BackendProduct {
  id: string;
  name: string;
  description: string;
  productType: string;
  coverImage: string;
  additionalImages: string[];
  originalPrice: number;
  discountedPrice: number;
  expirationDate: string;
  storeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stock: number;
  rating: number;
  ratingCount: number;
  category: string[];
}

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
  storeId: string; // Add storeId to allow store navigation
  expirationDate: string;
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
    expirationDate: "2024-03-20T14:30:00.000Z",
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
    expirationDate: "2024-03-22T14:30:00.000Z",
  },
  {
    id: "3",
    name: "Fruit Smoothie",
    image: images.products.product3,
    rating: 4.9,
    discount: 20,
    distance: "4km",
    time: "35mins",
    availableItems: 3,
    price: 120,
    storeId: "2",
    expirationDate: "2024-03-25T14:30:00.000Z",
  },
  {
    id: "4",
    name: "Veggie Pizza",
    image: images.products.product4,
    rating: 4.7,
    discount: 10,
    distance: "6km",
    time: "40mins",
    availableItems: 6,
    price: 180,
    storeId: "2",
    expirationDate: "2024-03-28T14:30:00.000Z",
  },
];

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
      flexDirection: "column",
      alignItems: "center",
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
      height: cardWidth * 0.65, // Adjusted height to be 75% of width
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
      color: "#333",
      fontSize: 12,
      fontFamily: "Poppins-SemiBold",
    },
    timerBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      backgroundColor: "rgba(84, 140, 47, 0.8)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 5,
    },
    timerText: {
      color: "#fff",
      fontSize: 12,
      fontFamily: "Poppins-SemiBold",
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
      padding: 16,
    },
    productName: {
      fontSize: 18,
      fontWeight: "600",
      fontFamily: "Poppins-Bold",
      color: "#333",
      marginBottom: 8,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    ratingText: {
      marginLeft: 4,
      fontSize: 14,
      color: "#666",
    },
    storeName: {
      fontSize: 14,
      color: "#548C2F",
      marginBottom: 8,
    },
    availableText: {
      fontSize: 13,
      color: "#999",
    },
  });

const ProductGrid = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const screenWidth = Dimensions.get("window").width;
  const paddingHorizontal = 16;
  const cardGap = 12;
  const cardWidth = screenWidth - paddingHorizontal * 2; // Full width minus padding
  const styles = getStyles(cardWidth);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      // Get auth token with the seller_app template
      const token = await getToken({ template: "seller_app" });
      // Use our API utility function with the token
      const backendProducts: BackendProduct[] = await fetchAllProducts(token);

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
          expirationDate: product.expirationDate,
        };
      });

      setProducts(transformedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      // Fallback to mock products
      setProducts(mockProducts);
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
  }, []);

  const calculateTimeUntilExpiration = (expirationDate: string) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - now.getTime();

    // Calculate days, hours, and minutes
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'}`;
    }
  };

  const renderProduct = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.card}
      onPress={() => router.push(`/(screens)/ProductScreen?id=${product.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image source={product.image} style={styles.image} />
        {product.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {product.discount}% off
            </Text>
          </View>
        )}
        {product.expirationDate && (
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>
              {calculateTimeUntilExpiration(product.expirationDate)}
            </Text>
          </View>
        )}
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
        <TouchableOpacity
          onPress={() =>
            router.push(`/(screens)/StoreHomepageScreen?id=${product.storeId}`)
          }
        >
          <Text style={styles.storeName}>View Store</Text>
        </TouchableOpacity>
        <Text style={styles.availableText}>
          {product.availableItems} items available
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trending</Text>
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
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        ) : (
          <View style={styles.grid}>{products.map(renderProduct)}</View>
        )}
      </ScrollView>
    </View>
  );
};

export default ProductGrid;

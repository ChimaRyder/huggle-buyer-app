import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
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
import { useAuth } from "@clerk/clerk-expo";
import { images, ImageSource } from "../assets";
import { ProductService } from "../services/productService";

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
  expirationDate: string;
}

const getStyles = (width: number) =>
  StyleSheet.create({
    container: {
      paddingBottom: 16,
      margin: 16,
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 24,
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
    card: {
      // width: width - 32, // full width minus 16px padding on each side
      alignSelf: "center",
      flexDirection: "row",
      backgroundColor: "#fff",
      borderRadius: 12,
      marginBottom: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    image: {
      width: 144,
      height: 144,
      resizeMode: "cover",
    },
    infoContainer: {
      flex: 1,
      padding: 12,
      justifyContent: "flex-start",
    },
    productName: {
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      marginBottom: 4,
      color: "#333",
    },
    badgeRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 8,
      flexWrap: "wrap",
    },
    badge: {
      backgroundColor: "#E6F4EA",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 5,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: "Poppins-SemiBold",
      color: "#104911",
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    metaText: {
      fontSize: 13,
      color: "#777",
    },
    priceText: {
      fontSize: 15,
      fontFamily: "Poppins-SemiBold",
      color: "#548C2F",
    },
  });

interface ProductGridProps {
  productType?: string;
}

function ProductGrid({ productType }: ProductGridProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const screenWidth = Dimensions.get("window").width;
  const styles = getStyles(screenWidth);

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
      const tokenRaw = await getToken({ template: "seller_app" });
      const token = tokenRaw || "";
      const response = await ProductService.getAllProducts(token, {
        productType: productType || undefined
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch products');
      }
      const backendProducts: BackendProduct[] = response.data;

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
          image: product.coverImage
            ? { uri: product.coverImage }
            : images.products.product1,
          rating: product.rating || 4.5,
          discount: discountPercentage,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType]);

  const renderProduct = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.card}
      onPress={() => router.push(`/(screens)/ProductScreen?id=${product.id}`)}
    >
      <Image source={product.image} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.name}</Text>
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
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.metaText}>{product.rating}</Text>
          <Text style={styles.metaText}>
            {calculateTimeUntilExpiration(product.expirationDate)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            router.push(`/(screens)/StoreHomepageScreen?id=${product.storeId}`)
          }
        >
          <Text style={styles.priceText}>₱{product.price} • View Store</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {!productType && <Text style={styles.title}>Trending Near You</Text>}
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
        <View style={styles.grid}>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#548C2F" />
          ) : error ? (
            <Text style={{ color: "#FF6B6B" }}>{error}</Text>
          ) : products.length === 0 ? (
            <Text style={{ color: "#999" }}>No products available</Text>
          ) : (
            products.map(renderProduct)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default ProductGrid;

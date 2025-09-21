import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import SafeImage from "@/components/common/SafeImage";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { BackendProduct } from "@/types/BackendModels";

interface ProductGridProps {
  products: BackendProduct[];
  onProductPress: (productId: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductPress }) => {
  const renderProduct = ({ item }: { item: BackendProduct }) => {
    // Calculate discounted price display from BuyerProductDto
    const hasDiscount = item.hasDiscount || (item.price < item.originalPrice);
    const displayPrice = item.price; // Current price from DTO
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => onProductPress(item.id)}
      >
        <View style={styles.imageContainer}>
          <SafeImage 
            source={{ uri: item.image && item.image.length > 0 ? item.image[0] : '' }} 
            style={styles.productImage} 
          />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {item.discountPercentage ? `${Math.round(item.discountPercentage)}% OFF` : `${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF`}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${displayPrice.toFixed(2)}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
              )}
            </View>
            {item.rating && item.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color={colors.warning} />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                {item.ratingCount && (
                  <Text style={styles.ratingCount}>({item.ratingCount})</Text>
                )}
              </View>
            )}
          </View>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {item.tags.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  productCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginBottom: 16,
    width: "48%",
  },
  imageContainer: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: "600",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.text.secondary,
    textDecorationLine: "line-through",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 2,
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: "500",
  },
  ratingCount: {
    marginLeft: 2,
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: "400",
  },
  categoryContainer: {
    marginTop: 4,
  },
  categoryText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "500",
    textTransform: "uppercase",
  },
});

export default ProductGrid;
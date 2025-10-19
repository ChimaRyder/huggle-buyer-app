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

// Function to generate different colors for tags
const getTagColor = (tag: string, index: number): string => {
  const tagColors = [
    colors.primary.main,
    colors.success,
    colors.warning,
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
  ];
  
  // Use tag content to generate a consistent color
  const tagHash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tagColors[tagHash % tagColors.length];
};

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductPress }) => {
  const renderProduct = ({ item }: { item: BackendProduct }) => {
    // Debug bundle image data
    if (item.isBundle) {
      console.log('🔍 ProductGrid: Bundle item data:', {
        id: item.id,
        name: item.name,
        isBundle: item.isBundle,
        coverImage: item.coverImage,
        image: item.image,
        imageLength: item.image?.length
      });
    }
    
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
            source={{ 
              uri: item.coverImage || (item.image && item.image.length > 0 ? item.image[0] : '') 
            }} 
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
              <Text style={styles.price}>₱{displayPrice.toFixed(2)}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>₱{item.originalPrice.toFixed(2)}</Text>
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
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={[styles.tagBadge, { backgroundColor: getTagColor(tag, index) }]}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <View style={[styles.tagBadge, { backgroundColor: colors.background.secondary }]}>
                  <Text style={[styles.tagText, { color: colors.text.primary }]}>
                    +{item.tags.length - 3}
                  </Text>
                </View>
              )}
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  tagBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 8,
    color: colors.text.inverse,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});

export default ProductGrid;
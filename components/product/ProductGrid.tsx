import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { FoodItem } from "@/data/food/models";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface ProductGridProps {
  products: FoodItem[];
  onProductPress: (productId: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductPress }) => {
  const renderProduct = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onProductPress(item.id)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Popular</Text>
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
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
        </View>
        <View style={styles.dietaryContainer}>
          {item.isVegetarian && (
            <View style={[styles.dietaryBadge, styles.vegetarianBadge]}>
              <Text style={styles.dietaryText}>V</Text>
            </View>
          )}
          {item.isVegan && (
            <View style={[styles.dietaryBadge, styles.veganBadge]}>
              <Text style={styles.dietaryText}>VG</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
  popularBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
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
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
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
  dietaryContainer: {
    flexDirection: "row",
  },
  dietaryBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  vegetarianBadge: {
    backgroundColor: colors.success,
  },
  veganBadge: {
    backgroundColor: colors.successDark,
  },
  dietaryText: {
    color: colors.text.inverse,
    fontSize: 8,
    fontWeight: "600",
  },
});

export default ProductGrid;
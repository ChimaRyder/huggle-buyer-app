import React from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface ProductListCardProps {
  id: string;
  name: string;
  image: any;
  discount: number;
  availableItems: number;
  rating: number;
  expirationDate: string;
  price: number;
  storeId: string;
  onPress: () => void;
  onStorePress: () => void;
}

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

const ProductListCard: React.FC<ProductListCardProps> = ({
  name,
  image,
  discount,
  availableItems,
  rating,
  expirationDate,
  price,
  onPress,
  onStorePress,
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={image} style={styles.image} />
    <View style={styles.infoContainer}>
      <Text style={styles.productName}>{name}</Text>
      <View style={styles.badgeRow}>
        {discount > 0 && (
          <View style={styles.badgeDiscount}>
            <Text style={styles.badgeDiscountText}>{discount}% OFF</Text>
          </View>
        )}
        <View style={styles.badgeStock}>
          <Text style={styles.badgeStockText}>{availableItems} left</Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        <MaterialIcons name="star" size={16} color="#FFD700" />
        <Text style={styles.metaText}>{rating}</Text>
        <Text style={styles.metaText}>
          {calculateTimeUntilExpiration(expirationDate)}
        </Text>
      </View>
      <TouchableOpacity onPress={onStorePress}>
        <Text style={styles.priceText}>₱{price}</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignSelf: "center",
    minHeight: 120,
    height: 120,
  },
  image: {
    width: 120,
    height: "100%",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    resizeMode: "cover",
    backgroundColor: "#eaeaea",
  },
  infoContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  productName: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#222",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  badgeDiscount: {
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  badgeDiscountText: {
    fontSize: 12,
    color: "#104911",
    fontWeight: "bold",
  },
  badgeStock: {
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  badgeStockText: {
    fontSize: 12,
    color: "#104911",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#777",
  },
  priceText: {
    fontSize: 16,
    color: "#548C2F",
    fontWeight: "bold",
    marginTop: 2,
  },
});

export default ProductListCard;

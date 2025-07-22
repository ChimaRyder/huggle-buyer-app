import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import { fontSizes, spacing, radii } from "../constants/theme";

interface CartItemProps {
  item: {
    name: string;
    image: any;
    price: number;
    quantity: number;
    [key: string]: any;
  };
  onIncrease?: () => void;
  onDecrease?: () => void;
  onRemove?: () => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) => (
  <View style={styles.container}>
    <Image
      source={item.image}
      style={styles.image}
      accessibilityLabel={item.name}
    />
    <View style={styles.info}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>${item.price}</Text>
      <View style={styles.quantityRow}>
        <TouchableOpacity
          onPress={onDecrease}
          accessibilityLabel="Decrease quantity"
          style={styles.qtyButton}
        >
          <Text style={styles.qtyButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={onIncrease}
          accessibilityLabel="Increase quantity"
          style={styles.qtyButton}
        >
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
    <TouchableOpacity
      onPress={onRemove}
      accessibilityLabel="Remove from cart"
      style={styles.removeButton}
    >
      <Text style={styles.removeButtonText}>×</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  name: { fontSize: fontSizes.md, fontWeight: "bold", color: "#222" },
  price: { fontSize: fontSizes.sm, color: "#548C2F", marginTop: 4 },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyButtonText: { fontSize: fontSizes.md, fontWeight: "bold" },
  quantity: { marginHorizontal: spacing.md, fontSize: fontSizes.md },
  removeButton: { padding: spacing.sm },
  removeButtonText: { fontSize: fontSizes.lg, color: "#dc3545" },
});

export default CartItem;

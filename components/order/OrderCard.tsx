import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text, Button } from "@ui-kitten/components";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { fontSizes, spacing, radii, shadows } from "../../constants/theme";

interface OrderCardProps {
  order: {
    id: string;
    date: string;
    productName: string;
    price: string;
    description: string;
    storeName: string;
    location: string;
    status:
      | "Pending"
      | "Confirmed"
      | "Ready for Pickup"
      | "Completed"
      | "Cancelled";
    image: any;
    // Add for multi-item support
    items?: Array<{
      image: any;
      name: string;
      price: string;
      quantity: number;
    }>;
    totalPrice?: string;
  };
  onCancel?: () => void;
  showCancelButton?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onCancel,
  showCancelButton = false,
}) => {
  const canCancel =
    (order.status === "Pending" || order.status === "Confirmed") &&
    showCancelButton;

  // If items array exists, render multi-item layout
  if (order.items && order.items.length > 0) {
    return (
      <View style={styles.card}>
        <Text appearance="hint" style={styles.dateText}>
          {order.date}
        </Text>
        {order.items.map((item, idx) => (
          <View key={idx} style={styles.multiItemRow}>
            <Image source={item.image} style={styles.multiItemImage} />
            <View style={styles.multiItemInfo}>
              <View style={styles.multiItemTopRow}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
              </View>
              <Text style={styles.quantityText}>Quantity: {item.quantity}</Text>
            </View>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPriceText}>{order.totalPrice}</Text>
        </View>
        <View style={styles.bottomRowMulti}>
          <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
          {canCancel && onCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={(e) => {
                e.stopPropagation();
                onCancel && onCancel();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text appearance="hint" style={styles.dateText}>
        {order.date}
      </Text>

      <View style={styles.contentRow}>
        <Image source={order.image} style={styles.image} />

        <View style={styles.infoColumn}>
          <View style={styles.titleRow}>
            <Text category="s1" style={styles.productName}>
              {order.productName}
            </Text>
            <Text status="primary" style={styles.price}>
              {order.price}
            </Text>
          </View>
          {/* New row for extra details */}
          <View style={styles.extraDetailsRow}>
            <Text style={styles.extraDetailsText} numberOfLines={2}>
              {order.description}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <FontAwesome5 name="store" size={14} color="#104911" />
            <Text style={styles.metaText}> {order.storeName} | </Text>
            <Ionicons name="location-sharp" size={14} color="#104911" />
            <Text style={styles.metaText}> {order.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>

        {canCancel && onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default OrderCard;

const getStatusStyle = (status: string) => ({
  backgroundColor:
    status === "Completed"
      ? "#D4EDDA"
      : status === "Cancelled"
      ? "#F8D7DA"
      : status === "Confirmed"
      ? "#D1ECF1"
      : "#FFF3CD", // Pending
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: radii.lg,
    marginHorizontal: spacing.lg + spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  dateText: {
    marginBottom: spacing.xs,
    fontSize: fontSizes.sm,
    fontFamily: "Poppins-SemiBold",
    color: "#F9A620",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: radii.full,
    marginRight: spacing.md,
  },
  infoColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productName: {
    fontFamily: "Poppins-SemiBold",
    color: "#104911",
  },
  price: {
    fontWeight: "bold",
    color: "#000000",
  },
  description: {
    marginTop: spacing.xs,
    fontSize: fontSizes.xs,
    fontFamily: "Poppins-Regular",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: fontSizes.xs,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: "bold",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md - spacing.xs,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  cancelButtonText: {
    color: "white",
    fontSize: fontSizes.xs,
    fontWeight: "bold",
  },
  extraDetailsRow: {
    marginTop: 2,
    marginBottom: 2,
  },
  extraDetailsText: {
    fontSize: fontSizes.sm,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  // New styles for multi-item support
  multiItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  multiItemImage: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    marginRight: spacing.md,
  },
  multiItemInfo: {
    flex: 1,
  },
  multiItemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityText: {
    fontSize: fontSizes.xs,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: fontSizes.sm,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
  },
  totalPriceText: {
    fontWeight: "bold",
    color: "#104911",
    fontSize: fontSizes.md,
    marginLeft: "auto",
  },
  bottomRowMulti: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
});

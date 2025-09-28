import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text } from "@ui-kitten/components";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { colors, spacing, radii, typography } from "../../constants/theme";

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
        {/* Store info and status row - moved to top for multi-item */}
        <View style={styles.topRow}>
          <View style={styles.storeHeader}>
            <View style={styles.storeIconBadge}>
              <FontAwesome5 name="store" size={12} color={colors.primary} />
            </View>
            <Text style={styles.prominentStoreName}>{order.storeName}</Text>
          </View>
          <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>
        
        {order.items.map((item, idx) => (
          <View key={idx} style={styles.multiItemRow}>
            <View style={styles.productSection}>
              <Image source={item.image} style={styles.multiItemImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.quantityText}>x{item.quantity}</Text>
              </View>
            </View>
            
            <View style={styles.priceSection}>
              <Text style={styles.price}>{item.price}</Text>
            </View>
          </View>
        ))}
        
        <View style={styles.bottomRowMulti}>
          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalLabel}>Total: </Text>
            <Text style={styles.totalPriceText}>{order.totalPrice}</Text>
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
      {/* Store info and status row - moved to top */}
      <View style={styles.topRow}>
        <View style={styles.storeHeader}>
          <View style={styles.storeIconBadge}>
            <FontAwesome5 name="store" size={12} color={colors.primary} />
          </View>
          <View style={styles.storeDetails}>
            <Text style={styles.prominentStoreName}>{order.storeName}</Text>
            <View style={styles.locationInfo}>
              <Ionicons name="location-sharp" size={12} color={colors.text.secondary} />
              <Text style={styles.locationText}> {order.location}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.productSection}>
          <Image source={order.image} style={styles.image} />
          <Text category="s1" style={styles.productName}>
            {order.productName}
          </Text>
        </View>

        <View style={styles.priceSection}>
          <Text status="primary" style={styles.price}>
            {order.price}
          </Text>
        </View>
      </View>

      {/* Extra details row */}
      <View style={styles.extraDetailsRow}>
        <Text style={styles.extraDetailsText} numberOfLines={2}>
          {order.description}
        </Text>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalLabel}>Total: </Text>
          <Text style={styles.totalPrice}>{order.price}</Text>
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
      ? colors.background.successSubtle
      : status === "Cancelled"
      ? colors.background.dangerSubtle
      : status === "Confirmed"
      ? colors.background.infoSubtle
      : status === "Ready for Pickup"
      ? colors.background.warningSubtle
      : colors.background.warningSubtle, // Pending
});


const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: spacing.md,
    gap: spacing.sm,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: radii.lg,
  },
  productInfo: {
    flex: 1,
  },
  productNameSection: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  priceSection: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 60,
  },
  productName: {
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  price: {
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    fontSize: typography.fontSizes.md,
  },
  description: {
    marginTop: spacing.xs,
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    paddingLeft: 70 + spacing.sm, // Align with product name (image width + gap)
    paddingRight: spacing.sm + 60, // Account for price section width
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  storeDetails: {
    flex: 1,
  },
  storeIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  prominentStoreName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
  },
  metaText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    alignSelf: "flex-start",
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  cancelButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  extraDetailsRow: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    paddingLeft: 70 + spacing.sm, // Align with product name (image width + gap)
    paddingRight: spacing.sm + 60, // Account for price section width
  },
  extraDetailsText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  // New styles for multi-item support
  multiItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  multiItemImage: {
    width: 60,
    height: 60,
    borderRadius: radii.lg,
  },
  quantityText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  totalPriceText: {
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    fontSize: typography.fontSizes.md,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  totalPrice: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  bottomRowMulti: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
});

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
  onReviewItems?: () => void;
  showReviewButton?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onCancel,
  showCancelButton = false,
  onReviewItems,
  showReviewButton = false,
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
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPriceText}>{order.totalPrice}</Text>
        </View>
          <View style={styles.bottomRowMulti}>
            {showReviewButton && onReviewItems && (
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onReviewItems && onReviewItems();
                }}
              >
                <Text style={styles.reviewButtonText}>Review Items</Text>
              </TouchableOpacity>
            )}
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

      {/* Location row */}
      <View style={styles.locationRow}>
        <FontAwesome5 name="store" size={14} color={colors.primary} />
        <Text style={styles.metaText}> {order.storeName} | </Text>
        <Ionicons name="location-sharp" size={14} color={colors.primary.light} />
        <Text style={styles.metaText}> {order.location}</Text>
      </View>

      {canCancel && onCancel && (
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default OrderCard;

/* const getStatusStyle = (status: string) => ({
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
}); */


const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    marginHorizontal: 0, // Remove horizontal margin since we handle it in the parent
    marginBottom: spacing.md,
    padding: spacing.lg,
    // Remove shadows completely
  },
  dateText: {
    marginBottom: spacing.md,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary.main,
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
    width: 50,
    height: 50,
    borderRadius: radii.full,
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
    paddingLeft: 50 + spacing.md, // Align with product name (image width + margin)
    paddingRight: spacing.sm + 60, // Account for price section width
  },
  metaText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: spacing.md,
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
  reviewButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  reviewButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  extraDetailsRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    paddingLeft: 50 + spacing.md, // Align with product name (image width + margin)
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
    marginBottom: spacing.md,
  },
  multiItemImage: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
  },
  quantityText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  totalLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
  },
  totalPriceText: {
    fontWeight: typography.fontWeights.bold,
    color: colors.primary.main,
    fontSize: typography.fontSizes.md,
  },
  bottomRowMulti: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: spacing.md,
  },
});

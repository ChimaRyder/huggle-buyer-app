import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text } from "@ui-kitten/components";
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
    items?: Array<{
      image: any;
      name: string;
      price: string;
      quantity: number;
      subtotal?: string;
    }>;
    totalPrice?: string;
  };
  storeImage?: any;
  onCancel?: () => void;
  showCancelButton?: boolean;
  onReviewItems?: () => void;
  showReviewButton?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  storeImage,
  onCancel,
  showCancelButton = false,
  onReviewItems,
  showReviewButton = false,
}) => {
  const canCancel =
    (order.status === "Pending" || order.status === "Confirmed") &&
    showCancelButton;

  // Use store image or fallback
  const displayStoreImage = storeImage || require("@/assets/images/sample-store.jpg");

  const renderItem = (item: any, index: number) => (
    <View key={index} style={styles.itemRow}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemQuantityLine}>
          {item.quantity} x {item.price} = <Text style={styles.itemSubtotal}>{item.subtotal}</Text>
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      {/* --- Header Row: Store Info & Date --- */}
      <View style={styles.headerRow}>
        <View style={styles.storeInfoContainer}>
          <Image source={displayStoreImage} style={styles.storeImage} />
          <View>
            <Text style={styles.storeName}>{order.storeName}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{order.date}</Text>
      </View>

      <View style={styles.divider} />

      {/* --- Body Row: Items List --- */}
      <View style={styles.bodyContainer}>
        {/* Left: Items List */}
        {order.items && order.items.length > 0 ? (
          order.items.map(renderItem)
        ) : (
          // Fallback for single item structure if items array missing
          <View style={styles.itemRow}>
            <Image source={order.image} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={1}>{order.productName}</Text>
              <Text style={styles.itemQuantityLine}>
                {order.description}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* --- Footer: Total & Actions --- */}
      <View style={styles.totalContainer}>
        <View style={styles.totalWrapper}>
          <Text style={styles.totalLabel}>Total: </Text>
          <Text style={styles.totalPrice}>{order.totalPrice || order.price}</Text>
        </View>

        <View style={styles.buttonWrapper}>
          {showReviewButton && onReviewItems && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onReviewItems && onReviewItems();
              }}
            >
              <Text style={styles.actionButtonText}>Review</Text>
            </TouchableOpacity>
          )}

          {canCancel && onCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={(e) => {
                e.stopPropagation();
                onCancel && onCancel();
              }}
            >
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    marginHorizontal: 0,
    padding: spacing.md,

    // Shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,

    // Border
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  // Header Styles
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  storeInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  storeImage: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
  },
  storeName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  dateText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: spacing.sm,
  },

  // Body Layout
  bodyContainer: {
    marginBottom: spacing.xs,
  },

  // Item Row Styles
  itemRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: radii.md,
    marginRight: spacing.sm,
    backgroundColor: colors.background.secondary,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  itemQuantityLine: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
  },
  itemSubtotal: {
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },

  // Footer / Total Section
  totalContainer: {
    flexDirection: 'row', // Row for Total | Buttons
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  totalWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  totalPrice: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary.main,
    marginLeft: spacing.xs,
  },

  buttonWrapper: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Action Buttons
  actionButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full, // Rounded full buttons
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  cancelButtonText: {
    color: colors.danger,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
});

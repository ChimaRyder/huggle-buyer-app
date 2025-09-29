import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Layout, Text } from "@ui-kitten/components";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radii } from "@/constants/theme";
import { getReviewByOrderItemId, checkOrderItemReviewStatus } from "@/utils/reviews";
import { useOrderContext } from "@/context/OrderContext";

interface OrderItemWithReviewStatus {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  hasReviewed: boolean;
  reviewId?: string;
}

export default function OrderItemsReviewScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const { getToken } = useAuth();
  const { getOrderById } = useOrderContext();
  
  const [orderItems, setOrderItems] = useState<OrderItemWithReviewStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    loadOrderAndReviewStatus();
  }, [orderId]);

  const loadOrderAndReviewStatus = async () => {
    try {
      setLoading(true);
      
      // Get order details
      const orderData = await getOrderById(orderId as string);
      if (!orderData) {
        Alert.alert("Error", "Order not found");
        router.back();
        return;
      }
      
      setOrder(orderData);
      
      // Get review status for each item
      const token = await getToken();
      const itemsWithReviewStatus = await Promise.all(
        orderData.items?.map(async (item: any) => {
          try {
            // Check if this item has been reviewed
            const reviewStatus = await checkOrderItemReviewStatus(token, item.id);
            const existingReview = await getReviewByOrderItemId(token, item.id);
            
            return {
              id: item.id,
              productId: item.productId,
              productName: item.productName || "Unknown Product",
              productImage: item.productImage,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              hasReviewed: reviewStatus?.data?.HasReviewed || false,
              reviewId: existingReview?.data?.Id,
            };
          } catch (error) {
            console.error("Error checking review status for item:", item.id, error);
            return {
              id: item.id,
              productId: item.productId,
              productName: item.productName || "Unknown Product",
              productImage: item.productImage,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              hasReviewed: false,
            };
          }
        }) || []
      );
      
      setOrderItems(itemsWithReviewStatus);
    } catch (error) {
      console.error("Error loading order and review status:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewItem = (item: OrderItemWithReviewStatus) => {
    router.push({
      pathname: "/(screens)/order/ReviewProductScreen" as any,
      params: {
        productId: item.productId,
        orderId: orderId as string,
        orderItemId: item.id,
        productName: item.productName,
        isEdit: item.hasReviewed ? "true" : "false",
        existingReviewId: item.reviewId || "",
      },
    });
  };

  const handleViewReview = (item: OrderItemWithReviewStatus) => {
    if (item.reviewId) {
      // Navigate to view review screen or show review details
      // For now, we'll navigate to edit review
      handleReviewItem(item);
    }
  };

  const renderOrderItem = (item: OrderItemWithReviewStatus) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemContent}>
        <Image 
          source={
            item.productImage 
              ? { uri: item.productImage }
              : require("@/assets/images/sample-store.jpg")
          }
          style={styles.productImage}
        />
        
        <View style={styles.itemDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.productName}
          </Text>
          <Text style={styles.itemMeta}>
            Quantity: {item.quantity}
          </Text>
          <Text style={styles.itemPrice}>
            ₱{item.totalPrice.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.reviewActions}>
          {item.hasReviewed ? (
            <View style={styles.reviewedContainer}>
              <View style={styles.reviewedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.reviewedText}>Reviewed</Text>
              </View>
              <TouchableOpacity
                style={styles.viewReviewButton}
                onPress={() => handleViewReview(item)}
              >
                <Text style={styles.viewReviewText}>View Review</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => handleReviewItem(item)}
            >
              <Ionicons name="star-outline" size={20} color={colors.text.inverse} />
              <Text style={styles.reviewButtonText}>Write Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Items</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading order items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Review Items</Text>
          <Text style={styles.headerSubtitle}>
            Order from {order?.storeName || "Unknown Store"}
          </Text>
        </View>
      </View>

      {/* Order Items List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionCard}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.instructionText}>
            Rate and review each item to help other customers make informed decisions.
          </Text>
        </View>

        {orderItems.map(renderOrderItem)}
        
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Review Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>{orderItems.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Reviewed:</Text>
            <Text style={[
              styles.summaryValue,
              { color: colors.success }
            ]}>
              {orderItems.filter(item => item.hasReviewed).length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pending:</Text>
            <Text style={[
              styles.summaryValue,
              { color: colors.warning }
            ]}>
              {orderItems.filter(item => !item.hasReviewed).length}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  instructionText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  itemCard: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: "row",
    padding: spacing.lg,
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.background.secondary,
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  productName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemMeta: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  reviewActions: {
    alignItems: "center",
  },
  reviewedContainer: {
    alignItems: "center",
  },
  reviewedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.successSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  reviewedText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.success,
  },
  viewReviewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewReviewText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  reviewButtonText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
  summaryCard: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
});
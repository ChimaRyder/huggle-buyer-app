/**
 * Order Details Screen
 * Real order details view integrated with OrderContext and backend API
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useOrderContext, type Order } from "@/context/OrderContext";
import { useStoreContext, type Store } from "@/context/StoreContext";
import { OrderStatus } from "@/types/BackendModels";
import { OrderMap } from "@/components/order";
import { colors, spacing, typography, shadows, radii } from "@/constants/theme";
import { getReviewByOrderItemId, checkOrderItemReviewStatus } from "@/utils/reviews";

interface OrderDetailsProps {
  orderId?: string;
  isReadOnly?: boolean;
}

const OrderDetails: React.FC<OrderDetailsProps> = () => {

  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;


  const {
    currentOrder,
    isLoading,
    isCancelling,
    error,
    fetchOrderById,
    cancelOrder,
    canCancelOrder: contextCanCancelOrder,
    clearError,
    clearCurrentOrder
  } = useOrderContext();

  const {
    currentStore,
    fetchStoreById,
    isFetchingStore
  } = useStoreContext();

  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  const getStatusInfo = (status: OrderStatus) => {
    const statusMap = {
      0: { label: 'Pending', color: colors.warning, bgColor: colors.warning + '20' },
      1: { label: 'Confirmed', color: colors.info, bgColor: colors.info + '20' },
      2: { label: 'Ready for Pickup', color: colors.success, bgColor: colors.success + '20' },
      3: { label: 'Completed', color: colors.success, bgColor: colors.success + '20' },
      4: { label: 'Cancelled', color: colors.error, bgColor: colors.error + '20' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap[0];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onRefresh = async () => {
    if (!orderId) return;

    setRefreshing(true);
    try {
      await fetchOrderById(orderId);
      await fetchStoreById(currentOrder?.storeId as string)
    } catch (error) {
      console.error('Error refreshing order:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleReviewItem = (item: any) => {
    // Navigate to review screen to write new review
    router.push({
      pathname: "/(screens)/order/ReviewProductScreen" as any,
      params: {
        productId: item.productId,
        orderId: currentOrder!.id,
        orderItemId: item.id,
        productName: item.productName,
        isEdit: "false",
        existingReviewId: "",
      },
    });
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;

    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        {
          text: "Keep Order",
          style: "cancel"
        },
        {
          text: "Cancel Order",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelOrder(currentOrder.id, { reason: 'Cancelled by buyer' });
              Alert.alert(
                "Order Cancelled",
                "Your order has been successfully cancelled.",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to cancel order. Please try again.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }

    return () => {
      clearError();
    };
  }, [orderId]);

  // Note: Removed automatic refresh on focus to prevent infinite rerenders
  // Users can use pull-to-refresh to update data after creating reviews

  useEffect(() => {
    return () => {
      clearCurrentOrder();
    };
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentOrder) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error || "Order not found"}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(currentOrder.status);

  // Calculate savings and original total to match OrderReviewScreen logic
  const calculateSavedAmount = () => {
    if (!currentOrder?.items) return 0;
    // Mock saved amount calculation: 10% of unit price * quantity
    return currentOrder.items.reduce((sum, item) => sum + ((item.unitPrice || 0) * 0.1 * (item.quantity || 0)), 0);
  };

  const calculateOriginalTotal = () => {
    if (!currentOrder) return 0;
    return currentOrder.totalAmount + calculateSavedAmount();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Store Information (Moved to Top) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          <View style={styles.storeCard}>
            <Image
              source={{ uri: currentStore?.profileImageUrl }}
              style={styles.storeImage}
              resizeMode="cover"
            />
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{currentOrder.storeName}</Text>
              <Text style={styles.storeAddress}>
                {currentOrder.storeAddress}
              </Text>
              <TouchableOpacity
                style={styles.storeButton}
                onPress={() => {
                  router.push({
                    pathname: "/(screens)/store/StoreHomepageScreen",
                    params: { id: currentOrder.storeId }
                  });
                }}
              >
                <Text style={styles.storeButtonText}>Visit Store</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Order Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusInfo.bgColor }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
            <Text style={styles.orderIdText}>#{currentOrder.id.slice(-8).toUpperCase()}</Text>
          </View>
          <Text style={styles.orderDateText}>
            <Text style={styles.orderDateLabel}>Placed: </Text>
            {formatDate(currentOrder.createdAt)}
          </Text>
          {currentOrder.updatedAt !== currentOrder.createdAt && (
            <Text style={styles.orderUpdateText}>
              <Text style={styles.orderUpdateLabel}>Updated: </Text>
              {formatDate(currentOrder.updatedAt as string)}
            </Text>
          )}
        </View>

        {/* Items Ordered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {currentOrder.items.map((product, index) => (
            <View key={product.id} style={styles.productContainer}>
              <View style={styles.productCard}>
                <Image
                  source={{ uri: product.productImage }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.productName}
                  </Text>
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {product.productDescription}
                  </Text>
                  <Text style={styles.productQuantity}>
                    x{product.quantity}
                  </Text>
                  <View style={styles.productPriceContainer}>
                    <Text style={styles.productPrice}>
                      ₱{(product.totalPrice).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Write Review Button */}
              {(!product.hasReviewed && statusInfo.label === "Completed") && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => handleReviewItem(product)}
                >
                  <Ionicons name="star-outline" size={16} color={colors.text.inverse} />
                  <Text style={styles.reviewButtonText}>Write Review</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Order Summary (New) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Original Price Total</Text>
              <Text style={styles.summaryValue}>₱{calculateOriginalTotal().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.savedLabel]}>You Saved</Text>
              <Text style={[styles.summaryValue, styles.savedValue]}>-₱{calculateSavedAmount().toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₱{currentOrder.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Map Section */}
        {(currentStore?.location) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            <View style={styles.mapContainer}>
              <OrderMap
                latitude={currentStore.location.latitude}
                longitude={currentStore.location.longitude}
                label={currentStore.name}
              />
            </View>
          </View>
        )}

        {/* Notes Section */}
        {currentOrder.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{currentOrder.notes}</Text>
            </View>
          </View>
        )}

        {/* Cancel Button (Moved to Bottom) */}
        {(currentOrder.status !== OrderStatus.Completed && currentOrder.status !== OrderStatus.Cancelled) && (
          <TouchableOpacity
            style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
            onPress={handleCancelOrder}
            disabled={isCancelling}
          >
            <Text style={styles.cancelButtonText}>
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  statusCard: {
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
  orderIdText: {
    // ...typography.body2,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
  orderDateText: {
    // ...typography.body2,
    color: colors.text.secondary,
  },
  orderDateLabel: {
    fontWeight: typography.fontWeights.bold,
  },
  orderUpdateText: {
    // ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  orderUpdateLabel: {
    fontWeight: typography.fontWeights.bold,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    // ...typography.h4,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  productContainer: {
    marginBottom: spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
    position: 'relative',
  },
  productName: {
    // ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  productDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  productQuantity: {
    // ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  productPriceContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  productPrice: {
    // ...typography.body2,
    color: colors.primary.main,
    fontWeight: '600',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
  },
  reviewButtonText: {
    // ...typography.body2,
    color: colors.text.inverse,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.lg,
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.secondary,
  },
  storeInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  storeName: {
    // ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  storeAddress: {
    // ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  storeButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  storeButtonText: {
    // ...typography.caption,
    color: colors.primary.main,
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    // ...typography.body1,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    // ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    // ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  backButtonText: {
    // ...typography.body2,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  notesText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
  },
  // New Summary Styles
  summaryCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  savedLabel: {
    color: colors.success,
    fontWeight: typography.fontWeights.medium,
  },
  savedValue: {
    color: colors.success,
    fontWeight: typography.fontWeights.semibold,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary.main,
  },
});

export default OrderDetails;
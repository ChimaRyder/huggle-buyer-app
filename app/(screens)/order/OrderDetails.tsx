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
import { OrderStatus } from "@/types/BackendModels";
import { OrderMap } from "@/components/order";
import { colors, spacing, typography, shadows } from "@/constants/theme";
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
        {/* Order Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusInfo.bgColor }]}>
          <View style={styles.statusRow}>
            <View style={styles.statusBadgeContainer}>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
              </View>
              <Text style={styles.orderIdText}>Order #{currentOrder.id.slice(-8).toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.orderTimeline}>
            <View style={styles.timelineItem}>
              <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.timelineText}>
                Placed {formatDate(currentOrder.createdAt)}
              </Text>
            </View>
            {currentOrder.updatedAt && currentOrder.updatedAt !== currentOrder.createdAt && (
              <View style={styles.timelineItem}>
                <Ionicons name="refresh-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.timelineText}>
                  Updated {formatDate(currentOrder.updatedAt)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Store and Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <Text style={styles.itemCount}>{currentOrder.items.length} item{currentOrder.items.length !== 1 ? 's' : ''}</Text>
          </View>
          
          {/* Store Header */}
          <TouchableOpacity 
            style={styles.storeHeaderCard}
            onPress={() => {
              router.push({
                pathname: "/(screens)/store/StoreHomepageScreen",
                params: { id: currentOrder.storeId }
              });
            }}
            activeOpacity={0.7}
          >
            <View style={styles.storeIconContainer}>
              <Ionicons name="storefront" size={20} color={colors.primary.main} />
            </View>
            <View style={styles.storeHeaderInfo}>
              <Text style={styles.storeHeaderName}>{currentOrder.storeName || 'Unknown Store'}</Text>
              <View style={styles.visitStoreButton}>
                <Text style={styles.visitStoreText}>Visit Store</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary.main} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Items List */}
          <View style={styles.itemsList}>
            {currentOrder.items.map((item, index) => {
              const showReviewButton = currentOrder.status === OrderStatus.Completed;
              const hasReviewed = item.hasReviewed || false; // Use the field from API response
              
              return (
                <View key={item.id} style={[styles.itemCard, index === currentOrder.items.length - 1 && styles.lastItemCard]}>
                  <Image
                    source={item.productImage ? { uri: item.productImage } : require("@/assets/images/sample-store.jpg")}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.productName}
                    </Text>
                    <View style={styles.itemMetaRow}>
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>×{item.quantity}</Text>
                      </View>
                      <Text style={styles.itemPrice}>₱{item.unitPrice.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      Total: ₱{(item.unitPrice * item.quantity).toFixed(2)}
                    </Text>
                    
                    {/* Review Button for Completed Orders */}
                    {showReviewButton && (
                      <View style={styles.reviewButtonContainer}>
                        {hasReviewed ? (
                          // Non-clickable reviewed indicator
                          <View style={styles.reviewedButton}>
                            <Ionicons 
                              name="star" 
                              size={16} 
                              color={colors.success} 
                            />
                            <Text style={styles.reviewedButtonText}>
                              Reviewed
                            </Text>
                          </View>
                        ) : (
                          // Clickable write review button
                          <TouchableOpacity
                            style={styles.reviewButton}
                            onPress={() => handleReviewItem(item)}
                          >
                            <Ionicons 
                              name="star-outline" 
                              size={16} 
                              color={colors.primary.main} 
                            />
                            <Text style={styles.reviewButtonText}>
                              Write Review
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({currentOrder.items.length})</Text>
              <Text style={styles.summaryValue}>
                ₱{currentOrder.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total Amount</Text>
              <Text style={styles.summaryTotalValue}>₱{currentOrder.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        {currentOrder.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.notesCard}>
              <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.notesText}>{currentOrder.notes}</Text>
            </View>
          </View>
        )}


        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      {(currentOrder.status !== OrderStatus.Completed && currentOrder.status !== OrderStatus.Cancelled) && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.fullCancelButton, isCancelling && styles.cancelButtonDisabled]}
            onPress={handleCancelOrder}
            disabled={isCancelling}
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.text.inverse} />
            <Text style={styles.fullCancelButtonText}>
              {isCancelling ? "Cancelling Order..." : "Cancel Order"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  statusBadgeContainer: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  statusBadgeText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  orderIdText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  orderTimeline: {
    gap: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timelineText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemCount: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  storeHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storeHeaderInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  storeHeaderName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  visitStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  visitStoreText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary.main,
    fontWeight: typography.fontWeights.medium,
    marginRight: spacing.xs,
  },
  itemsList: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  lastItemCard: {
    borderBottomWidth: 0,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quantityBadge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  quantityText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  itemPrice: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary.main,
  },
  itemTotal: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  reviewButtonContainer: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  reviewButtonText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary.main,
    fontWeight: typography.fontWeights.medium,
    marginLeft: spacing.xs,
  },
  reviewedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.successSubtle || colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
  },
  reviewedButtonText: {
    fontSize: typography.fontSizes.xs,
    color: colors.success,
    fontWeight: typography.fontWeights.medium,
    marginLeft: spacing.xs,
  },
  summarySection: {
    marginBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  summaryTotalValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary.main,
  },
  notesCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notesText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  storeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  fullCancelButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 12,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButtonDisabled: {
    opacity: 0.5,
  },
  fullCancelButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.bold,
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body1,
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
    ...typography.body1,
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
    ...typography.body2,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});

export default OrderDetails;
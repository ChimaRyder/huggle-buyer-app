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
        {/* <View style={[styles.statusCard, { backgroundColor: statusInfo.bgColor }]}>
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
        </View> */}

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

        {/* Products Section */}
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
              
              {/* Write Review Button for completed orders */}
              {(!product.hasReviewed && statusInfo.label === "Completed") && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => handleReviewItem(product.id)}
                >
                  <Ionicons name="star-outline" size={16} color={colors.text.inverse} />
                  <Text style={styles.reviewButtonText}>Write Review</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Store Section */}
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

        {/* Store and Items Section */}
        {/*<View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <Text style={styles.itemCount}>{currentOrder.items.length} item{currentOrder.items.length !== 1 ? 's' : ''}</Text>
          </View>
          
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
        </View> */}

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

        {/*<View style={styles.summarySection}>
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
        </View>*/}

        {/* Notes Section */}
        {currentOrder.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{currentOrder.notes}</Text>
            </View>
          </View>
        )}


        <View style={{ height: 120 }} />
      </ScrollView>

      {/*
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
      )}*/}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₱{currentOrder.totalAmount.toFixed(2)}</Text>
        </View>
        
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
      </View>
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
    marginTop: spacing.lg,
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
    marginBottom: spacing.xl,
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
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    // ...typography.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
  },
  totalAmount: {
    fontSize: typography.fontSizes.xl,
    color: colors.primary.main,
    fontWeight: '700',
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
});

export default OrderDetails;
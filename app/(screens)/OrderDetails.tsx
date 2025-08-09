/**
 * Order Details Screen
 * Enhanced order details view with mock data integration
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MockOrderService, MockProductService, MockStoreService } from "../../data/mockServices";
import type { BackendOrder, BackendProduct, BackendStore, OrderStatus } from "../../types/BackendModels";
import { ProductListCard } from "../../components/product";
import { OrderMap } from "../../components/order";
import { colors, spacing, typography, shadows } from "@/constants/theme";

interface OrderDetailsProps {
  orderId?: string;
  isReadOnly?: boolean;
}

const OrderDetails: React.FC<OrderDetailsProps> = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const isReadOnly = params.isReadOnly === 'true';

  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [store, setStore] = useState<BackendStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCancelOrder = (orderStatus: OrderStatus): boolean => {
    return orderStatus === 0 || orderStatus === 1; // Pending or Confirmed
  };

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

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch order details
      const orderData = await MockOrderService.getOrderById(orderId);
      if (!orderData) {
        throw new Error('Order not found');
      }
      setOrder(orderData);

      // Fetch all products
      const productsData = await Promise.all(
        orderData.productId.map(id => MockProductService.getProductById(id))
      );
      setProducts(productsData.filter(Boolean) as BackendProduct[]);

      // Fetch store details
      const storeData = await MockStoreService.getStoreById(orderData.storeId);
      setStore(storeData);

    } catch (error: any) {
      console.error("Error loading order details:", error);
      setError(error.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !canCancelOrder(order.status)) return;

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
              setCancelling(true);
              await MockOrderService.updateOrder({
                id: order.id,
                status: 4 // Cancelled
              });
              setOrder({ ...order, status: 4 });
              Alert.alert(
                "Order Cancelled",
                "Your order has been successfully cancelled.",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } catch (error: any) {
              Alert.alert("Error", "Failed to cancel order. Please try again.");
            } finally {
              setCancelling(false);
            }
          }
        }
      ]
    );
  };

  const handleWriteReview = (productId: string) => {
    router.push({
      pathname: "/(screens)/ReviewProductScreen",
      params: { productId, storeId: order?.storeId }
    });
  };

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
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

  const statusInfo = getStatusInfo(order.status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusInfo.bgColor }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
            <Text style={styles.orderIdText}>#{order.id.slice(-8).toUpperCase()}</Text>
          </View>
          <Text style={styles.orderDateText}>
            Placed on {formatDate(order.createdAt)}
          </Text>
          {order.updatedAt !== order.createdAt && (
            <Text style={styles.orderUpdateText}>
              Updated {formatDate(order.updatedAt)}
            </Text>
          )}
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {products.map((product, index) => (
            <View key={product.id} style={styles.productContainer}>
              <View style={styles.productCard}>
                <Image
                  source={{ uri: product.coverImage }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={styles.productDetails}>
                    <Text style={styles.productPrice}>
                      ${(order.unitPrices?.[index] || product.discountedPrice).toFixed(2)}
                    </Text>
                    <Text style={styles.productQuantity}>
                      Qty: {order.quantity[index]}
                    </Text>
                  </View>
                  <Text style={styles.productSubtotal}>
                    Subtotal: ${((order.unitPrices?.[index] || product.discountedPrice) * order.quantity[index]).toFixed(2)}
                  </Text>
                </View>
              </View>
              
              {/* Write Review Button for completed orders */}
              {order.status === 3 && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => handleWriteReview(product.id)}
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
              source={{ uri: store?.storeImageUrl }}
              style={styles.storeImage}
              resizeMode="cover"
            />
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{store?.name}</Text>
              <Text style={styles.storeAddress}>
                {store?.address}, {store?.city}, {store?.province}
              </Text>
              <TouchableOpacity
                style={styles.storeButton}
                onPress={() => router.push({
                  pathname: "/(screens)/StoreHomepageScreen",
                  params: { id: store?.id }
                })}
              >
                <Text style={styles.storeButtonText}>Visit Store</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Map Section */}
        {store?.latitude && store?.longitude && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            <View style={styles.mapContainer}>
              <OrderMap
                latitude={store.latitude}
                longitude={store.longitude}
                label={store.name}
              />
            </View>
          </View>
        )}

        {/* Order Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>${order.totalPrice.toFixed(2)}</Text>
        </View>
        
        {!isReadOnly && canCancelOrder(order.status) && (
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.cancelButtonDisabled]}
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            <Text style={styles.cancelButtonText}>
              {cancelling ? "Cancelling..." : "Cancel Order"}
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
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h2,
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
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusText: {
    ...typography.h3,
    fontWeight: '600',
  },
  orderIdText: {
    ...typography.body2,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  orderDateText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  orderUpdateText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
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
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
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
  },
  productName: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  productQuantity: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  productSubtotal: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  reviewButtonText: {
    ...typography.body2,
    color: colors.text.inverse,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
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
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  storeAddress: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  storeButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  storeButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  notesCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.md,
  },
  notesText: {
    ...typography.body2,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
    ...shadows.lg,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text.primary,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
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
    ...typography.body1,
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
    backgroundColor: colors.primary,
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
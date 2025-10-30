import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { OrderCard } from "@/components/order";
import { ConfirmationModal, PageTitle } from "@/components/common";
import { colors, spacing, typography } from "@/constants/theme";
import {
  BackendOrder,
  OrderStatus,
} from "@/types/BackendModels";
import { useOrderContext } from "@/context/OrderContext";
import { SafeAreaView } from "react-native-safe-area-context";

interface EnrichedOrder extends Omit<BackendOrder, 'totalPrice'> {
  productName?: string;
  productImage?: string;
  storeName?: string;
  storeLocation?: string;
  formattedDate?: string;
  description?: string;
  items?: Array<{
    image: any;
    name: string;
    price: string;
    quantity: number;
  }>;
  totalPrice?: string;
}

const Orders = () => {
  const router = useRouter();
  const { 
    orders: contextOrders, 
    isFetching, 
    error: contextError, 
    refreshOrders,
    cancelOrder: contextCancelOrder,
    canCancelOrder: contextCanCancelOrder,
  } = useOrderContext();

  const handleBackPress = () => {
    router.back();
  };

  const [selectedTab, setSelectedTab] = useState<
    "Pending" | "Confirmed" | "Ready for Pickup" | "Completed" | "Cancelled"
  >("Pending");
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshOrders();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const formatOrderDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 2) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  };

  const getStatusFromEnum = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.Pending:
        return "Pending";
      case OrderStatus.Confirmed:
        return "Confirmed";
      case OrderStatus.ReadyForPickup:
        return "Ready for Pickup";
      case OrderStatus.Completed:
        return "Completed";
      case OrderStatus.Cancelled:
        return "Cancelled";
      default:
        return "Pending";
    }
  };

  // Transform context orders to enriched format
  const enrichedOrders = contextOrders.map((order) => {
    // Support multiple products per order from API items
    const items = order.items?.map((item) => ({
      image: item.productImage ? { uri: item.productImage } : require("@/assets/images/sample-store.jpg"),
      name: item.productName || "Unknown Product",
      price: `₱${Number(item.unitPrice).toFixed(2)}`,
      quantity: item.quantity,
    })) || [];

    // Compose total price
    const totalPrice = `₱${(order.totalAmount || 0).toFixed(2)}`;

    // Compose product name for single/multi
    let productName = "Unknown Product";
    if (order.items?.length === 1) {
      productName = order.items[0]?.productName || "Unknown Product";
    } else if (order.items && order.items.length > 1) {
      const firstName = order.items[0]?.productName || "Unknown Product";
      productName = `${firstName} + ${order.items.length - 1} more`;
    }

    // Compose description for single/multi
    let description = "";
    if (order.items?.length === 1) {
      description = `Quantity: ${order.items[0]?.quantity}`;
    } else if (order.items) {
      description = `${order.items.length} items`;
    }

    return {
      ...order,
      productName,
      productImage: items[0]?.image || (order.items?.[0]?.productImage ? { uri: order.items[0].productImage } : require("@/assets/images/sample-store.jpg")),
      storeName: order.storeName || "Unknown Store",
      storeLocation: "Unknown Location",
      formattedDate: formatOrderDate(order.createdAt),
      description,
      items,
      totalPrice,
      storeId: order.storeId, // Ensure store ID is preserved for grouping
    };
  });

  const filtered = enrichedOrders.filter(
    (order) => getStatusFromEnum(order.status) === selectedTab
  );


  const handleOrderPress = (order: EnrichedOrder) => {
    router.push({
      pathname: "/(screens)/order/OrderDetails" as any,
      params: {
        orderId: order.id,
        isReadOnly: "true",
      },
    });
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setCancelling(true);
      
      // Cancel order via OrderContext
      await contextCancelOrder(orderToCancel.id, {
        reason: 'Cancelled by buyer'
      });

      setShowCancelModal(false);
      setOrderToCancel(null);

      Alert.alert(
        "Order Cancelled",
        "Your order has been successfully cancelled.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to cancel order. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setCancelling(false);
    }
  };

  const canCancelOrder = (orderStatus: OrderStatus): boolean => {
    // For buyer, can cancel anytime except completed/cancelled
    return (
      orderStatus === OrderStatus.Pending ||
      orderStatus === OrderStatus.Confirmed ||
      orderStatus === OrderStatus.ReadyForPickup
    );
  };

  const handleCancelPress = (order: EnrichedOrder) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleReviewItems = (order: EnrichedOrder) => {
    router.push({
      pathname: "/(screens)/order/OrderItemsReviewScreen" as any,
      params: {
        orderId: order.id,
      },
    });
  };


  if (isFetching && contextOrders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orders</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.light} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (contextError && contextOrders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orders</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{contextError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
            {["Pending", "Confirmed", "Ready for Pickup", "Completed", "Cancelled"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  selectedTab === tab && styles.activeTab,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No {selectedTab.toLowerCase()} orders found
              </Text>
              <Text style={styles.emptySubtext}>
                {selectedTab === "Pending"
                  ? "Orders you place will appear here"
                  : `You don't have any ${selectedTab.toLowerCase()} orders yet`}
              </Text>
            </View>
          ) : (
            filtered.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => handleOrderPress(order)}
                style={styles.orderCardContainer}
                activeOpacity={0.8}
              >
                <OrderCard
                  order={{
                    id: order.id,
                    date: order.formattedDate || "Unknown date",
                    productName: order.productName || "Unknown Product",
                    price: `₱${order.totalPrice?.toString() ?? "0.00"}`,
                    description:
                      order.description ||
                      (Array.isArray(order.quantity)
                        ? `${order.quantity.length} items`
                        : `Quantity: ${order.quantity}`),
                    storeName: order.storeName || "Unknown Store",
                    location: order.storeLocation || "Unknown Location",
                    status: getStatusFromEnum(order.status) as
                      | "Pending"
                      | "Confirmed"
                      | "Ready for Pickup"
                      | "Completed"
                      | "Cancelled",
                    image: order.productImage
                      ? order.productImage
                      : require("@/assets/images/sample-store.jpg"),
                    items: order.items || [],
                    totalPrice: order.totalPrice || "₱0.00",
                  }}
                  showCancelButton={canCancelOrder(order.status)}
                  onCancel={() => handleCancelPress(order)}
                  showReviewButton={order.status === OrderStatus.Completed}
                  onReviewItems={() => handleReviewItems(order)}
                />
              </TouchableOpacity>
            ))
          )}
      </ScrollView>

      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Order"
        message={`Are you sure you want to cancel your order for "${orderToCancel?.productName}"? This action cannot be undone.`}
        confirmText="Cancel"
        cancelText="Keep Order"
        confirmButtonColor={colors.danger}
        onConfirm={handleCancelOrder}
        onCancel={() => {
          setShowCancelModal(false);
          setOrderToCancel(null);
        }}
        loading={cancelling}
      />
    </SafeAreaView>
  );
};

export default Orders;

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
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 24, // Same width as icons for centering
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  tabContainer: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  tabsScrollContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    minWidth: 80,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary.light,
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  activeTabText: {
    color: colors.primary.light,
    fontWeight: typography.fontWeights.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSizes.lg,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.danger,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.bold,
  },
  scrollContainer: {
    paddingTop: spacing.lg,
    paddingBottom: 120,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.tertiary,
  },
  orderCardContainer: {
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    textAlign: "center",
  },
});

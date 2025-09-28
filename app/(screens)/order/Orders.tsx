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
    const totalPrice = `₱${order.totalAmount.toFixed(2)}`;

    // Compose product name for single/multi
    let productName = "Unknown Product";
    if (order.items?.length === 1) {
      productName = order.items[0].productName || "Unknown Product";
    } else if (order.items && order.items.length > 1) {
      const firstName = order.items[0].productName || "Unknown Product";
      productName = `${firstName} + ${order.items.length - 1} more`;
    }

    // Compose description for single/multi
    let description = "";
    if (order.items?.length === 1) {
      description = `Quantity: ${order.items[0].quantity}`;
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


  if (isFetching && contextOrders.length === 0) {
    return (
      <Layout style={styles.container}>
        <PageTitle title="Orders" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </Layout>
    );
  }

  if (contextError && contextOrders.length === 0) {
    return (
      <Layout style={styles.container}>
        <PageTitle title="Orders" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{contextError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <PageTitle title="Orders" />

      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
          style={styles.tabsScroll}
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
          style={styles.contentScrollView}
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
    </Layout>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  tabsContainer: {
    backgroundColor: colors.background.primary,
  },
  contentScrollView: {
    flex: 1,
  },
  tabsScrollContainer: {
    paddingHorizontal: 12,
    alignItems: "center",
  },
  tabsScroll: {
    marginBottom: 27,
    minHeight: 56,
  },
  tab: {
    borderBottomWidth: 2,
    borderBottomColor: "#104911",
    paddingBottom: 8,
    marginHorizontal: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTab: {
    borderBottomColor: "#F9A620",
  },
  tabText: {
    color: "#104911",
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#F9A620",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#548C2F",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  orderCardContainer: {
    marginBottom: 0,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

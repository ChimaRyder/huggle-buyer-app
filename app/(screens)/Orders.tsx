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
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import PageTitle from "../../components/PageTitle";
import OrderCard from "../../components/OrderCard";
import ConfirmationModal from "../../components/ConfirmationModal";
import {
  getOrders,
  fetchProductById,
  fetchStoreById,
  cancelOrder,
} from "../../utils/api";
import {
  BackendOrder,
  BackendProduct,
  BackendStore,
  OrderStatus,
} from "../../types/BackendModels";

const tabs = [
  "Pending",
  "Confirmed",
  "Ready for Pickup",
  "Completed",
  "Cancelled",
] as const;

type TabType = (typeof tabs)[number];

interface EnrichedOrder extends BackendOrder {
  productName?: string;
  productImage?: string;
  storeName?: string;
  storeLocation?: string;
  formattedDate?: string;
  description?: string; // Added to support multi-item orders
  items?: Array<{
    image: any;
    name: string;
    price: string;
    quantity: number;
  }>;
  totalPrice?: string; // Accept string for display
}

const Orders = () => {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const [selectedTab, setSelectedTab] = useState<
    "Pending" | "Confirmed" | "Ready for Pickup" | "Completed" | "Cancelled"
  >("Pending");
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<EnrichedOrder | null>(
    null
  );
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadOrders();
      }
    }, [loading])
  );

  const loadOrders = async () => {
    if (!userId) {
      setError("Please log in to view orders");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const token = await getToken({ template: "seller_app" });
      const ordersData: BackendOrder[] = await getOrders(token);

      const enrichedOrders = await Promise.all(
        ordersData.map(async (order) => {
          try {
            // Support multiple products per order
            const productIds = Array.isArray(order.productId)
              ? order.productId
              : [order.productId];
            const quantities = Array.isArray(order.quantity)
              ? order.quantity
              : [order.quantity];

            const productDataArr = await Promise.all(
              productIds.map((pid) => fetchProductById(pid, token))
            );
            const storeData = await fetchStoreById(order.storeId, token);

            // Compose items array for multi-item support
            const items = productDataArr.map((product, idx) => ({
              image: product?.coverImage
                ? { uri: product.coverImage }
                : require("../../assets/images/sample-store.jpg"),
              name: product?.name || "Unknown Product",
              price: product?.price
                ? `₱${Number(product.price).toFixed(2)}`
                : "",
              quantity: quantities[idx] || 1,
            }));

            // Compose total price
            const totalPrice = `₱${order.totalPrice.toFixed(2)}`;

            // Compose product name for single/multi
            let productName = "Unknown Product";
            if (productDataArr.length === 1) {
              productName = productDataArr[0]?.name || "Unknown Product";
            } else if (productDataArr.length > 1) {
              const firstName = productDataArr[0]?.name || "Unknown Product";
              productName = `${firstName} + ${productDataArr.length - 1} more`;
            }

            // Compose description for single/multi
            let description = "";
            if (productDataArr.length === 1) {
              description = `Quantity: ${quantities[0]}`;
            } else {
              description = `${productDataArr.length} items`;
            }

            return {
              ...order,
              productName,
              productImage: items[0]?.image,
              storeName: storeData?.name || "Unknown Store",
              storeLocation: storeData
                ? `${storeData.city}, ${storeData.province}`
                : "Unknown Location",
              formattedDate: formatOrderDate(order.createdAt),
              description,
              items,
              totalPrice,
            };
          } catch (error) {
            console.error(`Error enriching order ${order.id}:`, error);
            return {
              ...order,
              productName: "Unknown Product",
              storeName: "Unknown Store",
              storeLocation: "Unknown Location",
              formattedDate: formatOrderDate(order.createdAt),
              description: "",
              items: [],
              totalPrice: `₱${order.totalPrice.toFixed(2)}`,
            };
          }
        })
      );

      setOrders(enrichedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
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

  const filtered = orders.filter(
    (order) => getStatusFromEnum(order.status) === selectedTab
  );

  const handleOrderPress = (order: EnrichedOrder) => {
    router.push({
      pathname: "/(screens)/OrderDetails" as any,
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
      const token = await getToken({ template: "seller_app" });

      await cancelOrder(orderToCancel.id, token);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderToCancel.id
            ? { ...order, status: OrderStatus.Cancelled }
            : order
        )
      );

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

  if (loading) {
    return (
      <Layout style={styles.container}>
        <PageTitle title="Orders" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#548C2F" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={styles.container}>
        <PageTitle title="Orders" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <PageTitle title="Orders" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContainer}
        style={styles.tabsScroll}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            activeOpacity={0.7}
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
            >
              <OrderCard
                order={{
                  id: order.id,
                  date: order.formattedDate || "Unknown date",
                  productName: order.productName || "Unknown Product",
                  price: `₱${order.totalPrice?.toString() ?? '0.00'}`,
                  description: order.description ||
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
                    : require("../../assets/images/sample-store.jpg"),
                  items: order.items,
                  totalPrice: order.totalPrice,
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
        confirmText="Cancel Order"
        cancelText="Keep Order"
        confirmButtonColor="#dc3545"
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
    backgroundColor: "#f8f8f8",
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
  tabsScrollContainer: {
    paddingHorizontal: 12,
    alignItems: "center",
  },
  tabsScroll: {
    marginBottom: 27,
    maxHeight: 52,
  },
  tab: {
    borderBottomWidth: 2,
    borderBottomColor: "#104911",
    paddingBottom: 6,
    marginHorizontal: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
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
  scrollContainer: {
    paddingBottom: 120,
  },
  orderCardContainer: {
    marginBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
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

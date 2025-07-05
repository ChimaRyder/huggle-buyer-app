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

const tabs = ["Pending", "Confirmed", "Completed", "Cancelled"] as const;

interface EnrichedOrder extends BackendOrder {
  productName?: string;
  productImage?: string;
  storeName?: string;
  storeLocation?: string;
  formattedDate?: string;
}

const Orders = () => {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const [selectedTab, setSelectedTab] = useState<
    "Pending" | "Confirmed" | "Completed" | "Cancelled"
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

  // Refresh orders when screen comes into focus
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

      // Enrich orders with product and store information
      const enrichedOrders = await Promise.all(
        ordersData.map(async (order) => {
          try {
            const [productData, storeData] = await Promise.all([
              fetchProductById(order.productId, token),
              fetchStoreById(order.storeId, token),
            ]);

            return {
              ...order,
              productName: productData?.name || "Unknown Product",
              productImage: productData?.coverImage,
              storeName: storeData?.name || "Unknown Store",
              storeLocation: storeData
                ? `${storeData.city}, ${storeData.province}`
                : "Unknown Location",
              formattedDate: formatOrderDate(order.createdAt),
            };
          } catch (error) {
            console.error(`Error enriching order ${order.id}:`, error);
            return {
              ...order,
              productName: "Unknown Product",
              storeName: "Unknown Store",
              storeLocation: "Unknown Location",
              formattedDate: formatOrderDate(order.createdAt),
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
      pathname: "/(screens)/OrderDetailsView" as any,
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

      // Update the local orders state
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
      orderStatus === OrderStatus.Confirmed
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

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
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
            >
              <OrderCard
                order={{
                  id: order.id,
                  date: order.formattedDate || "Unknown date",
                  productName: order.productName || "Unknown Product",
                  price: `₱${order.totalPrice.toFixed(2)}`,
                  description: `Quantity: ${order.quantity}`,
                  storeName: order.storeName || "Unknown Store",
                  location: order.storeLocation || "Unknown Location",
                  status: getStatusFromEnum(order.status) as
                    | "Pending"
                    | "Confirmed"
                    | "Completed"
                    | "Cancelled",
                  image: order.productImage
                    ? { uri: order.productImage }
                    : require("../../assets/images/sample-store.jpg"),
                }}
                showCancelButton={canCancelOrder(order.status)}
                onCancel={() => handleCancelPress(order)}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Confirmation Modal */}
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
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 27,
  },
  tab: {
    borderBottomWidth: 2,
    borderBottomColor: "#104911",
    paddingBottom: 6,
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

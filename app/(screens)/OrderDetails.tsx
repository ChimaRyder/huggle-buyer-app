import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text, Button } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import PageTitle from "../../components/PageTitle";
import {
  getOrderById,
  fetchProductById,
  fetchStoreById,
} from "../../utils/api";
import {
  BackendOrder,
  BackendProduct,
  BackendStore,
  OrderStatus,
} from "../../types/BackendModels";

interface OrderDetailsViewProps {
  orderId?: string;
  isReadOnly?: string;
}

const OrderDetailsView: React.FC<OrderDetailsViewProps> = (props) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getToken } = useAuth();

  // Use props if provided, otherwise use params
  const orderId = props.orderId || params.orderId;
  const isReadOnly = props.isReadOnly || params.isReadOnly;

  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [store, setStore] = useState<BackendStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const readOnlyMode = isReadOnly === "true";

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken({ template: "seller_app" });

      // Fetch order details
      const orderData: BackendOrder = await getOrderById(
        orderId as string,
        token
      );
      setOrder(orderData);

      // Fetch all products and store details
      const productsData = await Promise.all(
        orderData.productId.map((id) => fetchProductById(id, token))
      );
      const storeData = await fetchStoreById(orderData.storeId, token);

      setProducts(productsData);
      setStore(storeData);
    } catch (error) {
      console.error("Error loading order details:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.Completed:
        return "#28a745";
      case OrderStatus.Cancelled:
        return "#dc3545";
      case OrderStatus.Confirmed:
        return "#17a2b8";
      case OrderStatus.Pending:
      default:
        return "#ffc107";
    }
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

  if (loading) {
    return (
      <>
        <PageTitle title="Order Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#548C2F" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <PageTitle title="Order Details" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Order not found"}</Text>
          <Button style={styles.backButton} onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Order Details" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Order Status Badge */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: getStatusColor(order.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(order.status) }]}
          >
            Order Status: {getStatusFromEnum(order.status)}
          </Text>
          <Text style={styles.orderIdText}>Order ID: {order.id}</Text>
          <Text style={styles.orderDateText}>
            Placed: {formatDate(order.createdAt)}
          </Text>
        </View>

        {/* Order Items */}
        {/* List all products in the order */}
        {products.map((product, idx) => (
          <View style={styles.card} key={product.id}>
            <View style={styles.itemContainer}>
              <Image
                source={{ uri: product.coverImage }}
                resizeMode="cover"
                style={styles.image}
              />
              <View style={styles.details}>
                <Text style={styles.itemName}>
                  {product.name || "Unknown Product"}
                </Text>
                <Text category="c1">
                  Quantity: {Array.isArray(order.quantity) ? order.quantity[idx] : order.quantity}
                </Text>
                <Text style={styles.price}>
                  ₱{product.discountedPrice.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Total */}
        <Text style={styles.total}>TOTAL: ₱{order.totalPrice.toFixed(2)}</Text>

        {/* Store Info */}
        <View style={styles.storeSection}>
          <Text style={styles.label}>STORE INFORMATION</Text>
          <View style={styles.pickupBox}>
            <Ionicons
              name="storefront"
              size={18}
              color="#051D24"
              style={{ marginRight: 6 }}
            />
            <Text>{store?.name || "Unknown Store"}</Text>
          </View>
        </View>

        {/* Store Address */}
        <View style={styles.addressCard}>
          <Ionicons
            name="location"
            size={24}
            color="#548C2F"
            style={{ marginRight: 12 }}
          />
          <View>
            <Text category="s1" style={styles.addressText}>
              {store?.name || "Unknown Store"}
            </Text>
            <Text category="c1" style={styles.addressText}>
              {store
                ? `${store.address}, ${store.city}, ${store.province}`
                : "Address not available"}
            </Text>
          </View>
        </View>

        {/* Back Button for read-only mode */}
        {readOnlyMode && store && (
          <Button
            style={styles.backButtonStyle}
            onPress={() => router.push({ pathname: '/(screens)/StoreHomepageScreen', params: { id: store.id } })}
          >
            Back to Store
          </Button>
        )}
      </ScrollView>
    </>
  );
};

export default OrderDetailsView;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  backButton: {
    marginTop: 20,
  },
  statusCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  orderDateText: {
    fontSize: 14,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#548C2F",
    marginTop: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  storeSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  pickupBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  addressText: {
    color: "#333",
  },
  backButtonStyle: {
    backgroundColor: "#6c757d",
    borderColor: "#6c757d",
    marginBottom: 16,
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Text, Button, Input } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import PageTitle from "../../components/PageTitle";
import ConfirmationModal from "../../components/ConfirmationModal";
import {
  getOrderById,
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

const OrderDetailsView = () => {
  const router = useRouter();
  const { orderId, isReadOnly } = useLocalSearchParams();
  const { getToken } = useAuth();

  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [store, setStore] = useState<BackendStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Review modal and form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewImageUrl, setReviewImageUrl] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

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

      // Fetch product and store details
      const [productData, storeData] = await Promise.all([
        fetchProductById(orderData.productId[0], token),
        fetchStoreById(orderData.storeId, token),
      ]);

      setProduct(productData);
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

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      setCancelling(true);
      const token = await getToken({ template: "seller_app" });

      await cancelOrder(order.id, token);

      // Update the local order state
      setOrder({ ...order, status: OrderStatus.Cancelled });
      setShowCancelModal(false);

      Alert.alert(
        "Order Cancelled",
        "Your order has been successfully cancelled.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to orders list so user can see the updated status
              router.back();
            },
          },
        ]
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
        <View style={styles.card}>
          <View style={styles.itemContainer}>
            <Image
              source={
                product?.coverImage
                  ? { uri: product.coverImage }
                  : require("../../assets/images/sample-store.jpg")
              }
              style={styles.image}
            />
            <View style={styles.details}>
              <Text style={styles.itemName}>
                {product?.name || "Unknown Product"}
              </Text>
              <Text category="c1">Quantity: {order.quantity}</Text>
              <Text style={styles.price}>₱{order.totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

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
        {readOnlyMode && (
          <Button style={styles.backButtonStyle} onPress={() => router.back()}>
            Back to Orders
          </Button>
        )}

        {/* Cancel Order Button */}
        {!readOnlyMode && order && canCancelOrder(order.status) && (
          <Button
            style={styles.cancelOrderButton}
            status="danger"
            onPress={() => setShowCancelModal(true)}
          >
            Cancel Order
          </Button>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel Order"
        cancelText="Keep Order"
        confirmButtonColor="#dc3545"
        onConfirm={handleCancelOrder}
        onCancel={() => setShowCancelModal(false)}
        loading={cancelling}
      />

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '90%' }}>
            <Text category="h6" style={{ marginBottom: 16 }}>Write a Review</Text>
            <Input
              placeholder="Share your experience..."
              multiline
              value={reviewContent}
              onChangeText={setReviewContent}
              style={{ marginBottom: 12 }}
            />
            <Input
              placeholder="Image URL (optional)"
              value={reviewImageUrl}
              onChangeText={setReviewImageUrl}
              style={{ marginBottom: 12 }}
            />
            <Text style={{ marginBottom: 4 }}>Rating:</Text>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              {[1,2,3,4,5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= reviewRating ? '#FFD700' : '#ccc'}
                    style={{ marginHorizontal: 2 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button
                appearance="ghost"
                status="basic"
                onPress={() => setShowReviewModal(false)}
                style={{ marginRight: 12 }}
                disabled={submittingReview}
              >
                Cancel
              </Button>
              <Button
                status="success"
                onPress={async () => {
                  if (!product || !order) return;
                  setSubmittingReview(true);
                  try {
                    const token = await getToken({ template: "seller_app" });
                    const body = {
                      productId: product.id,
                      buyerId: order.buyerId,
                      content: reviewContent,
                      imageUrls: reviewImageUrl ? [reviewImageUrl] : [],
                      rating: reviewRating,
                    };
                    await fetch("/api/reviews", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(body),
                    });
                    setShowReviewModal(false);
                    setReviewContent("");
                    setReviewImageUrl("");
                    setReviewRating(5);
                    Alert.alert("Review Submitted", "Thank you for your feedback!");
                  } catch (err) {
                    Alert.alert("Error", "Failed to submit review. Please try again.");
                  } finally {
                    setSubmittingReview(false);
                  }
                }}
                disabled={submittingReview || !reviewContent.trim() || !reviewRating}
              >
                {submittingReview ? "Submitting..." : "Submit"}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  cancelOrderButton: {
    backgroundColor: "#dc3545",
    borderColor: "#dc3545",
    marginBottom: 16,
  },
});

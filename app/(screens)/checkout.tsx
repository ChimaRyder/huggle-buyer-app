import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import {
  Input,
  Select,
  SelectItem,
  IndexPath,
  Button,
} from "@ui-kitten/components";
import PageTitle from "../../components/PageTitle";
import {
  fetchProductById,
  fetchStoreById,
  createOrder,
  clearCart,
} from "../../utils/api";
import { BackendProduct, BackendStore } from "../../types/BackendModels";
import { fontSizes, spacing, radii, shadows } from "../../constants/theme";
import OrderMap from "../../components/OrderMap";

export default function CheckoutScreen() {
  const router = useRouter();
  const {
    productId,
    quantity,
    price,
    productName,
    storeId,
    cartItems,
    isCartCheckout,
  } = useLocalSearchParams();
  const { getToken, userId } = useAuth();

  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [store, setStore] = useState<BackendStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderNotes, setOrderNotes] = useState("");
  const [selectedPickupTime, setSelectedPickupTime] = useState<IndexPath>(
    new IndexPath(0)
  );
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Parse cart items if coming from cart
  const parsedCartItems =
    isCartCheckout === "true" && cartItems
      ? JSON.parse(cartItems as string)
      : [];

  // Calculate totals
  const getTotalPrice = () => {
    if (isCartCheckout === "true") {
      return parsedCartItems.reduce(
        (total: number, item: any) => total + item.price * item.quantity,
        0
      );
    } else {
      const orderQuantity = parseInt(quantity as string) || 1;
      return parseFloat(price as string) * orderQuantity;
    }
  };

  const getTotalItems = () => {
    if (isCartCheckout === "true") {
      return parsedCartItems.reduce(
        (total: number, item: any) => total + item.quantity,
        0
      );
    } else {
      return parseInt(quantity as string) || 1;
    }
  };

  useEffect(() => {
    loadOrderData();
  }, []);

  // For cart checkout, fetch all products and store info from the first item
  useEffect(() => {
    if (isCartCheckout === "true" && parsedCartItems.length > 0) {
      const fetchCartProductsAndStore = async () => {
        try {
          setLoading(true);
          const token = await getToken({ template: "seller_app" });
          // Fetch all products
          const productsData = await Promise.all(
            parsedCartItems.map((item: any) =>
              fetchProductById(item.productId, token)
            )
          );
          setCartProducts(productsData);
          // Fetch store info from the first product
          if (productsData[0]?.storeId) {
            const storeData = await fetchStoreById(
              productsData[0].storeId,
              token
            );
            setStore(storeData);
          }
        } catch (error) {
          console.error("Error loading cart products/store:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCartProductsAndStore();
    }
  }, [isCartCheckout, cartItems]);

  const [cartProducts, setCartProducts] = useState<BackendProduct[]>([]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const token = await getToken({ template: "seller_app" });

      if (productId) {
        const productData = await fetchProductById(productId as string, token);
        setProduct(productData);

        if (productData.storeId) {
          const storeData = await fetchStoreById(productData.storeId, token);
          setStore(storeData);
        }
      } else if (storeId) {
        const storeData = await fetchStoreById(storeId as string, token);
        setStore(storeData);
      }
    } catch (error) {
      console.error("Error loading order data:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!userId) {
      Alert.alert("Error", "Please log in to place an order");
      return;
    }

    try {
      setPlacingOrder(true);
      const token = await getToken({ template: "seller_app" });

      if (isCartCheckout === "true") {
        const productId = parsedCartItems.map((item: any) => item.productId);
        const quantity = parsedCartItems.map((item: any) => item.quantity);

        const orderData = {
          buyerId: userId,
          storeId: cartProducts[0]?.storeId || storeId,
          productId,
          quantity,
          totalPrice: getTotalPrice(),
          // status: 0, // Remove if not needed by backend
        };
        await createOrder(orderData, token);
        await clearCart(token);
        setOrderSuccess(true);
        setShowOrderModal(true);
        return;
      } else {
        // Handle single product order
        const orderData = {
          buyerId: userId,
          storeId: product?.storeId || storeId,
          productId: productId,
          quantity: getTotalItems(),
          totalPrice: getTotalPrice(),
          status: 0, // Pending status
        };

        await createOrder(orderData, token);
        setOrderSuccess(true);
        setShowOrderModal(true);
        return;
      }
    } catch (error) {
      console.error("Error placing order:", error);
      let errorMessage = (error as Error)?.message || "Failed to place order";
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed && parsed.message) {
          errorMessage = parsed.message;
        }
      } catch {}
      Alert.alert("Error", errorMessage);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#548C2F" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  return (
    <>
      <PageTitle title="Order Details" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Product Cards */}
        <View style={{ marginBottom: 16 }}>
          {isCartCheckout === "true" ? (
            cartProducts.map((product, idx) => (
              <View key={product.id} style={styles.card}>
                <View style={styles.itemContainer}>
                  <Image
                    source={
                      product.coverImage
                        ? { uri: product.coverImage }
                        : require("../../assets/products/product1.png")
                    }
                    style={styles.image}
                  />
                  <View style={styles.details}>
                    <Text style={styles.itemName}>{product.name}</Text>
                    <Text style={styles.itemDetails}>
                      Qty: {parsedCartItems[idx]?.quantity} • ₱
                      {product.discountedPrice.toFixed(2)} each
                    </Text>
                    <Text style={styles.price}>
                      ₱
                      {(
                        product.discountedPrice * parsedCartItems[idx]?.quantity
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.card}>
              <View style={styles.itemContainer}>
                <Image
                  source={
                    product?.coverImage
                      ? { uri: product.coverImage }
                      : require("../../assets/products/product1.png")
                  }
                  style={styles.image}
                />
                <View style={styles.details}>
                  <Text style={styles.itemName}>
                    {product?.name || productName}
                  </Text>
                  <Text style={styles.itemDetails}>
                    Qty: {getTotalItems()} • ₱
                    {parseFloat(price as string).toFixed(2)} each
                  </Text>
                  <Text style={styles.price}>
                    ₱{getTotalPrice().toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Total Price */}
        <Text style={styles.total}>Total: ₱{getTotalPrice().toFixed(2)}</Text>

        {/* Pick-up Section */}
        <Text style={[styles.label, { marginTop: 16 }]}>Pick-up at</Text>
        <View style={styles.storeCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={
                store?.storeImageUrl ? { uri: store.storeImageUrl } : undefined
              }
              style={styles.storeImage}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {store?.name || "Unknown Store"}
              </Text>
              <Text style={{ color: "#666", fontSize: 13 }}>
                {store?.address}, {store?.city}, {store?.province}
              </Text>
              {/* Business Hours for Current Day Only */}
              {Array.isArray((store as any)?.businessHours) &&
                (store as any).businessHours.length > 0 &&
                (() => {
                  const todayIdx = new Date().getDay(); // 0=Sunday, 6=Saturday
                  const bh = (store as any).businessHours[todayIdx];
                  return (
                    <View style={{ marginTop: 4 }}>
                      <Text style={{ fontWeight: "bold", fontSize: 13 }}>
                        Today's Hours:
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: bh.isOpen ? "#548C2F" : "#d32f2f",
                        }}
                      >
                        {bh.isOpen
                          ? `${bh.openTime || ""} - ${bh.closeTime || ""}`
                          : "Closed"}
                      </Text>
                    </View>
                  );
                })()}
            </View>
          </View>
        </View>

        {/* Store Location Map */}
        {store?.latitude && store?.longitude && (
          <View style={styles.mapContainer}>
            <OrderMap
              latitude={store.latitude}
              longitude={store.longitude}
              label={store?.name}
            />
          </View>
        )}

        {/* Confirm Order Button */}
        <View style={{ marginTop: 32, marginBottom: 64 }}>
          <Button
            style={styles.confirmButton}
            onPress={handleConfirmOrder}
            disabled={placingOrder}
          >
            {placingOrder ? "Placing Order..." : "Confirm Order"}
          </Button>
        </View>
      </ScrollView>

      {/* Order Success Modal */}
      <Modal
        visible={showOrderModal}
        transparent
        animationType="fade"
        // Remove onRequestClose to prevent closing by tapping outside or back button
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 28,
              alignItems: "center",
              width: 320,
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={64}
              color="#548C2F"
              style={{ marginBottom: 12 }}
            />
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                marginBottom: 8,
                color: "#222",
              }}
            >
              Order Placed!
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#444",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Your order has been successfully placed. You will receive
              confirmation shortly.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#548C2F",
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  marginRight: 8,
                }}
                onPress={() => {
                  setShowOrderModal(false);
                  router.replace("/(screens)/Orders");
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  View Orders
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#eee",
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                }}
                onPress={() => {
                  setShowOrderModal(false);
                  router.push("/" as any);
                }}
              >
                <Text
                  style={{ color: "#548C2F", fontWeight: "bold", fontSize: 16 }}
                >
                  Back to Home
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSizes.md,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: "#333",
    marginBottom: spacing.xs,
  },
  itemDetails: {
    fontSize: fontSizes.sm,
    color: "#666",
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fontSizes.lg,
    fontWeight: "bold",
    color: "#548C2F",
    marginTop: spacing.xs,
  },
  total: {
    fontSize: fontSizes.lg,
    fontWeight: "bold",
    color: "#548C2F",
    textAlign: "right",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  column: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: "#666",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  pickupBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: spacing.md,
    borderRadius: radii.md,
  },
  input: {
    backgroundColor: "#f5f5f5",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
  },
  locationIcon: {
    marginRight: spacing.md,
  },
  addressText: {
    color: "#333",
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
  addressSubtext: {
    color: "#666",
    fontSize: fontSizes.sm,
  },
  notesSection: {
    marginBottom: spacing.lg,
  },
  notesInput: {
    backgroundColor: "#f5f5f5",
    minHeight: 80,
  },
  confirmButton: {
    backgroundColor: "#548C2F",
    borderColor: "#548C2F",
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
  },
  storeCard: {
    backgroundColor: "#fff",
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  storeImage: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
  },
  mapContainer: {
    height: 200,
    borderRadius: radii.md,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  sideTotal: {
    fontSize: fontSizes.lg,
    fontWeight: "bold",
    color: "#333",
    marginBottom: spacing.xs,
    textAlign: "right",
  },
  sideConfirmButton: {
    backgroundColor: "#548C2F",
    borderColor: "#548C2F",
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    marginLeft: spacing.md,
  },
});

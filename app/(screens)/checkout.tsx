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
  createMultipleOrders,
  clearCart,
} from "../../utils/api";
import { BackendProduct, BackendStore } from "../../types/BackendModels";

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

  const availablePickupTimes = [
    "ASAP (30-45 mins)",
    "1:00 PM - 1:30 PM",
    "2:00 PM - 2:30 PM",
    "3:00 PM - 3:30 PM",
    "4:00 PM - 4:30 PM",
    "5:00 PM - 5:30 PM",
  ];

  useEffect(() => {
    loadOrderData();
  }, []);

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
        // Handle multiple orders from cart
        await createMultipleOrders(parsedCartItems, Array.isArray(storeId) ? storeId[0] : storeId as string, getTotalPrice(), token);

        // Clear cart after successful orders
        await clearCart(token);

        Alert.alert(
          "Orders Placed!",
          "Your orders have been successfully placed. You will receive confirmation shortly.",
          [
            {
              text: "OK",
              onPress: () => router.push("/(tabs)/HomeScreen" as any),
            },
          ]
        );
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

        Alert.alert(
          "Order Placed!",
          "Your order has been successfully placed. You will receive confirmation shortly.",
          [
            {
              text: "OK",
              onPress: () => router.push("/(tabs)/HomeScreen" as any),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
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
        {/* Cart Summary for Multi-Product Orders */}
        {isCartCheckout === "true" && parsedCartItems.length > 0 && (
          <View style={styles.card}>
            <Text style={{fontWeight: 'bold', fontSize: 16, marginBottom: 8}}>Cart Summary</Text>
            {parsedCartItems.map((item: any, idx: number) => (
              <View key={idx} style={{marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6}}>
                <Text style={{fontSize: 15}}>{item.productName || item.name}</Text>
                <Text style={{color: '#666'}}>Quantity: {item.quantity}</Text>
                <Text style={{color: '#666'}}>Price: ₱{item.price}</Text>
                <Text style={{color: '#548C2F'}}>Subtotal: ₱{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <Text style={{fontWeight: 'bold', fontSize: 16, marginTop: 8}}>
              Total: ₱{getTotalPrice().toFixed(2)}
            </Text>
          </View>
        )}
        {/* Order Items */}
        <View style={styles.card}>
          {isCartCheckout === "true" ? (
            // Multiple items from cart
            parsedCartItems.map((item: any, index: number) => (
              <View key={index}>
                <View style={styles.itemContainer}>
                  <Image
                    source={require("../../assets/products/product1.png")}
                    style={styles.image}
                  />
                  <View style={styles.details}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.itemDetails}>
                      Qty: {item.quantity} • ₱{item.price.toFixed(2)} each
                    </Text>
                    <Text style={styles.price}>
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
                {index < parsedCartItems.length - 1 && (
                  <View
                    style={{
                      borderBottomColor: "#ccc",
                      borderBottomWidth: 1,
                      marginVertical: 12,
                    }}
                  />
                )}
              </View>
            ))
          ) : (
            // Single item
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
                <Text style={styles.price}>₱{getTotalPrice().toFixed(2)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Total */}
        <Text style={styles.total}>TOTAL: ₱{getTotalPrice().toFixed(2)}</Text>

        {/* Pickup Info */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>PICK-UP AT</Text>
            <View style={styles.pickupBox}>
              <Ionicons
                name="storefront"
                size={18}
                color="#051D24"
                style={{ marginRight: 6 }}
              />
              <Text>{store?.name || "Store"}</Text>
            </View>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>CHOOSE TIME</Text>
            <Select
              selectedIndex={selectedPickupTime}
              onSelect={(index) => setSelectedPickupTime(index as IndexPath)}
              value={
                availablePickupTimes[selectedPickupTime.row] || "Choose time"
              }
              style={styles.input}
            >
              {availablePickupTimes.map((time) => (
                <SelectItem key={time} title={time} />
              ))}
            </Select>
          </View>
        </View>

        {/* Store Address */}
        <View style={styles.addressCard}>
          <Ionicons
            name="location"
            size={24}
            color="#548C2F"
            style={styles.locationIcon}
          />
          <View>
            <Text style={styles.addressText}>
              {store?.name || "Store Location"}
            </Text>
            <Text style={styles.addressSubtext}>
              {store
                ? `${store.address}, ${store.city}, ${store.province}`
                : "Store Address"}
            </Text>
          </View>
        </View>

        {/* Order Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.label}>ORDER NOTES (Optional)</Text>
          <Input
            multiline
            numberOfLines={3}
            placeholder="Add any special instructions..."
            value={orderNotes}
            onChangeText={setOrderNotes}
            style={styles.notesInput}
          />
        </View>

        {/* Confirm Button */}
        <Button
          style={styles.confirmButton}
          onPress={handleConfirmOrder}
          disabled={placingOrder}
        >
          {placingOrder ? "Placing Order..." : "Confirm Order"}
        </Button>
      </ScrollView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  itemDetails: {
    fontSize: 14,
    color: "#666",
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  column: {
    flex: 1,
    marginHorizontal: 4,
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
  input: {
    backgroundColor: "#f5f5f5",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  locationIcon: {
    marginRight: 12,
  },
  addressText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  addressSubtext: {
    color: "#666",
    fontSize: 14,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: "#f5f5f5",
    minHeight: 80,
  },
  confirmButton: {
    backgroundColor: "#548C2F",
    borderColor: "#548C2F",
    paddingVertical: 16,
    borderRadius: 12,
  },
});

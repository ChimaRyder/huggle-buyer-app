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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Button, CheckBox } from "@ui-kitten/components";
import PageTitle from "../../components/PageTitle";
import {
  fetchProductById,
  getCart,
  updateCartItem,
  removeFromCart,
} from "../../utils/api";
import { BackendProduct } from "../../types/BackendModels";

interface CartItem {
  itemId: string;
  amount: number;
  product?: BackendProduct;
  selected: boolean;
}

interface CartData {
  cartId: string;
  buyerId: string;
  cartItems: { itemId: string; amount: number }[];
  createdAt: string;
  updatedAt: string;
}

export default function CartScreen() {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await getToken({ template: "seller_app" });

      if (!token) {
        console.error("No token available");
        setLoading(false);
        return;
      }

      // Fetch cart data using utility function
      const cartData: CartData = await getCart(token);

      // Fetch product details for each cart item
      const itemsWithProducts = await Promise.all(
        cartData.cartItems.map(async (item) => {
          try {
            const product = await fetchProductById(item.itemId, token);
            return {
              itemId: item.itemId,
              amount: item.amount,
              product,
              selected: true, // Default to selected
            };
          } catch (error) {
            console.error(`Error fetching product ${item.itemId}:`, error);
            return {
              itemId: item.itemId,
              amount: item.amount,
              selected: true,
            };
          }
        })
      );

      setCartItems(itemsWithProducts);
      setSelectAll(true);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, change: number) => {
    const item = cartItems.find((item) => item.itemId === itemId);
    if (!item) return;

    const newAmount = item.amount + change;
    if (newAmount <= 0) {
      removeItem(itemId);
      return;
    }

    try {
      const token = await getToken({ template: "seller_app" });
      if (!token) return;

      await updateCartItem(itemId, newAmount, token);

      setCartItems((items) =>
        items.map((item) =>
          item.itemId === itemId ? { ...item, amount: newAmount } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "Failed to update quantity");
    }
  };

  const removeItem = async (itemId: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken({ template: "seller_app" });
              if (!token) return;

              await removeFromCart(itemId, token);
              setCartItems((items) =>
                items.filter((item) => item.itemId !== itemId)
              );
            } catch (error) {
              console.error("Error removing item:", error);
              Alert.alert("Error", "Failed to remove item");
            }
          },
        },
      ]
    );
  };

  const toggleSelectItem = (itemId: string) => {
    setCartItems((items) =>
      items.map((item) =>
        item.itemId === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems((items) =>
      items.map((item) => ({ ...item, selected: newSelectAll }))
    );
  };

  const getSelectedItems = () => cartItems.filter((item) => item.selected);

  const getTotalPrice = () => {
    return getSelectedItems().reduce((total, item) => {
      const price = item.product?.discountedPrice || 0;
      return total + price * item.amount;
    }, 0);
  };

  const handleCheckout = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      Alert.alert("No Items Selected", "Please select items to checkout");
      return;
    }

    // Navigate to checkout with selected items
    router.push({
      pathname: "/(screens)/checkout" as any,
      params: {
        cartItems: JSON.stringify(
          selectedItems.map((item) => ({
            productId: item.itemId,
            quantity: item.amount,
            price: item.product?.discountedPrice || 0,
            productName: item.product?.name || "Unknown Product",
            storeId: item.product?.storeId || "",
          }))
        ),
        isCartCheckout: "true",
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageTitle title="Shopping Cart" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#548C2F" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <PageTitle title="Shopping Cart" />
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some items to get started
          </Text>
          <Button
            style={styles.shopButton}
            onPress={() => router.push("/(tabs)/HomeScreen" as any)}
          >
            Start Shopping
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageTitle title="Shopping Cart" />

      {/* Select All */}
      <View style={styles.selectAllContainer}>
        <CheckBox checked={selectAll} onChange={toggleSelectAll} />
        <Text style={styles.selectAllText}>
          Select All ({cartItems.length} items)
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {cartItems.map((item) => (
          <View key={item.itemId} style={styles.cartItem}>
            <CheckBox
              checked={item.selected}
              onChange={() => toggleSelectItem(item.itemId)}
              style={styles.checkbox}
            />

            <Image
              source={
                item.product?.coverImage
                  ? { uri: item.product.coverImage }
                  : require("../../assets/products/product1.png")
              }
              style={styles.productImage}
            />

            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {item.product?.name || "Loading..."}
              </Text>
              <Text style={styles.productPrice}>
                ₱{item.product?.discountedPrice?.toFixed(2) || "0.00"}
              </Text>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.itemId, -1)}
                >
                  <Ionicons name="remove" size={16} color="#666" />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.amount}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.itemId, 1)}
                >
                  <Ionicons name="add" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.itemId)}
            >
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Summary */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>
            Total ({getSelectedItems().length} items):
          </Text>
          <Text style={styles.totalPrice}>₱{getTotalPrice().toFixed(2)}</Text>
        </View>

        <Button
          style={styles.checkoutButton}
          onPress={handleCheckout}
          disabled={getSelectedItems().length === 0}
        >
          Checkout
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: "#548C2F",
    borderColor: "#548C2F",
    paddingHorizontal: 32,
  },
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectAllText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  checkbox: {
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: "#548C2F",
    fontWeight: "500",
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  removeButton: {
    padding: 8,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  checkoutButton: {
    backgroundColor: "#548C2F",
    borderColor: "#548C2F",
    paddingVertical: 16,
  },
});

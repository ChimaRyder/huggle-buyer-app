import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  Modal,
  TextInput,
} from "react-native";
import AddToCartModal from "../../components/AddToCartModal";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import ReviewCard from "../../components/ReviewCard";
import { MaterialIcons } from "@expo/vector-icons";
import { submitProductReport } from "../../utils/reports";

import { fetchStoreById } from "../../utils/stores";
import { fetchProductById } from "@/utils/products";
import { addToCart } from "@/utils/cart";
import { getOrders } from "@/utils/orders";
import { fetchBuyerById } from "@/utils/user";

import { tokenCache } from "../../utils/cache";
import {
  BackendProduct,
  BackendStore,
  BackendReview,
} from "../../types/BackendModels";
import {
  calculateDiscountPercentage,
  formatPrice,
  formatDate,
} from "../../utils/productHelper";

const AnimatedPressable =
  Platform.OS === "web"
    ? Pressable
    : Animated.createAnimatedComponent(Pressable);

function WriteReviewButton({ productId }: { productId?: string }) {
  const router = useRouter();
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!productId) return;
      setLoading(true);
      const token = await tokenCache.getToken("accessToken");
      let buyerId = null;
      try {
        const user = await fetchBuyerById("me", token);
        buyerId = user.id;
      } catch {
        setLoading(false);
        return;
      }
      const orders = await getOrders(token ?? null);
      const completedOrder = orders.find(
        (order: any) =>
          order.status === "Completed" &&
          order.productId &&
          (Array.isArray(order.productId)
            ? order.productId.includes(productId)
            : order.productId === productId)
      );
      const res = await fetch(
        `https://huggle-backend-jh2l.onrender.com/api/reviews?productId=${productId}`
      );
      const reviews = await res.json();
      const hasReviewed = reviews.some((rev: any) => rev.buyerId === buyerId);
      setEligible(!!completedOrder && !hasReviewed);
      setLoading(false);
    };
    checkEligibility();
  }, [productId]);

  if (loading || !productId) return null;
  if (!eligible) return null;
  return (
    <Pressable
      style={{
        backgroundColor: "#548C2F",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 12,
      }}
      onPress={() =>
        router.push({
          pathname: "/(screens)/ReviewProductScreen",
          params: { productId },
        })
      }
    >
      <Text style={{ color: "#fff", fontWeight: "bold" }}>Write a Review</Text>
    </Pressable>
  );
}

export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getToken, userId } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [store, setStore] = useState<BackendStore | null>(null);

  // Expiration check
  const isExpired = (() => {
    if (!product?.expirationDate) return false;
    const now = new Date(); // Use local time
    const exp = new Date(product.expirationDate);
    return exp < now;
  })();

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) {
        setError("Product ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await getToken({ template: "seller_app" });
        const productData = await fetchProductById(id.toString(), token);
        setProduct(productData);

        // Once we have the product, fetch the store data
        if (productData.storeId) {
          const storeData = await fetchStoreById(productData.storeId, token);
          setStore(storeData);
        }
      } catch (err) {
        console.error("Error loading product data:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  const handleQuantityChange = (increment: boolean) => {
    setQuantity((prev) => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.min(Math.max(newValue, 1), product?.stock || 5);
    });
  };

  const navigateToStore = () => {
    if (store) {
      // Navigate to StoreHomepageScreen with store ID
      router.push(`/(screens)/StoreHomepageScreen?id=${store.id}`);
    }
  };

  const [cartModalVisible, setCartModalVisible] = useState(false);

  const handleAddToCart = async () => {
    if (!userId) {
      // Still use Alert for login error
      Alert.alert("Error", "Please log in to add items to cart");
      return;
    }

    try {
      const token = await getToken({ template: "seller_app" });
      if (!product) {
        Alert.alert("Error", "Product information not available");
        return;
      }

      await addToCart(product.id, quantity, token);
      setCartModalVisible(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    }
  };

  const handleContinueShopping = () => {
    setCartModalVisible(false);
  };

  const handleViewCart = () => {
    setCartModalVisible(false);
    router.push("/(screens)/cart" as any);
  };

  const handleOrderNow = () => {
    // Navigate to checkout/order details screen with product info
    if (product) {
      router.push({
        pathname: "/(screens)/checkout" as any,
        params: {
          productId: product.id,
          quantity: quantity.toString(),
          price: product.discountedPrice.toString(),
          productName: product.name,
          storeId: product.storeId,
        },
      });
    }
  };

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const handleReportProduct = async () => {
    if (!userId || !product) {
      Alert.alert("Error", "You must be logged in to report a product.");
      return;
    }
    if (!reportReason) {
      Alert.alert("Error", "Please select a reason for reporting.");
      return;
    }
    setReportLoading(true);
    try {
      const token = await getToken({ template: "seller_app" });
      await submitProductReport(
        userId,
        product.id,
        reportReason,
        reportDescription,
        token
      );
      setReportModalVisible(false);
      setReportReason("");
      setReportDescription("");
      Alert.alert(
        "Report Submitted",
        "Thank you for helping keep Huggle safe."
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit report.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Report Product Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              width: "85%",
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}
            >
              Report Product
            </Text>
            <Text style={{ marginBottom: 8 }}>Reason</Text>
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              {["Inappropriate", "Fraud", "Spam", "Other"].map((reason) => (
                <Pressable
                  key={reason}
                  style={{
                    backgroundColor:
                      reportReason === reason ? "#F9A620" : "#eee",
                    padding: 8,
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                  onPress={() => setReportReason(reason)}
                >
                  <Text
                    style={{ color: reportReason === reason ? "#fff" : "#333" }}
                  >
                    {reason}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ marginBottom: 8 }}>Description (optional)</Text>
            <TextInput
              style={{
                minHeight: 60,
                padding: 8,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                marginBottom: 16,
              }}
              multiline
              numberOfLines={3}
              value={reportDescription}
              onChangeText={setReportDescription}
              placeholder="Describe the issue..."
            />
            <Pressable
              style={{
                backgroundColor: reportLoading ? "#ccc" : "#F9A620",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={handleReportProduct}
              disabled={reportLoading}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {reportLoading ? "Submitting..." : "Submit Report"}
              </Text>
            </Pressable>
            <Pressable
              style={{ marginTop: 12, alignItems: "center" }}
              onPress={() => setReportModalVisible(false)}
            >
              <Text style={{ color: "#F9A620" }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* Add to Cart Success Modal */}
      <AddToCartModal
        visible={cartModalVisible}
        productName={product?.name || ""}
        quantity={quantity}
        onContinue={handleContinueShopping}
        onViewCart={handleViewCart}
        onClose={handleContinueShopping}
      />
      {loading ? (
        // Minimal wireframe loading screen
        <View style={styles.loadingWireframeContainer}>
          <View style={styles.wfImage} />
          <View style={styles.wfContent}>
            <View style={styles.wfTitle} />
            <View style={styles.wfPriceRow}>
              <View style={styles.wfPrice} />
              <View style={styles.wfOrigPrice} />
              <View style={styles.wfDiscount} />
            </View>
            <View style={styles.wfSection} />
            <View style={styles.wfSection} />
          </View>
          <View style={styles.wfBottomRow}>
            <View style={styles.wfBottomBtn} />
            <View style={styles.wfBottomBtn} />
          </View>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={[styles.scrollView, { flex: 1 }]}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.imageContainer}>
              <Image
                source={
                  product?.coverImage
                    ? { uri: product.coverImage }
                    : require("../../assets/products/product1.png")
                }
                style={styles.productImage}
                resizeMode="cover"
              />
              {/* Report Product Button */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  zIndex: 2,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 20,
                  padding: 8,
                }}
                onPress={() => setReportModalVisible(true)}
              >
                <MaterialIcons name="flag" size={24} color="#fff" />
              </TouchableOpacity>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.back()}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
              {/* Product Name & Quantity Selector */}
              <View style={styles.nameQuantityRow}>
                <Text style={styles.productName}>
                  {product?.name || "Product Name"}
                </Text>
                <View style={styles.quantitySelector}>
                  <Pressable
                    onPress={() => handleQuantityChange(false)}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <Pressable
                    onPress={() => handleQuantityChange(true)}
                    style={[
                      styles.quantityButton,
                      quantity >= (product?.stock || 5) && { opacity: 0.5 },
                    ]}
                    disabled={quantity >= (product?.stock || 5)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              {/* Pricing Row */}
              <View style={styles.pricingRow}>
                <Text style={styles.discountedPrice}>
                  {formatPrice(product?.discountedPrice || 100)}
                </Text>
                <Text style={styles.originalPrice}>
                  {formatPrice(product?.originalPrice || 150)}
                </Text>
                {/* Discount Percentage beside price */}
                {product && product.originalPrice > product.discountedPrice && (
                  <View style={styles.discountBadgeInline}>
                    <Text style={styles.discountText}>
                      {calculateDiscountPercentage(
                        product.originalPrice,
                        product.discountedPrice
                      )}
                      % OFF
                    </Text>
                  </View>
                )}
              </View>

              {/* Description Section */}
              <View style={styles.section}>
                <View style={styles.horizontalRule} />
                <Text style={styles.description}>
                  {product?.description ||
                    "This is a sample product description that might be longer than 50 characters..."}
                </Text>
              </View>

              {/* Store Info Row */}
              <TouchableOpacity
                style={styles.storeInfoRow}
                onPress={navigateToStore}
                disabled={!store}
              >
                <View style={styles.storeSection}>
                  <FontAwesome name="shopping-bag" size={20} color="#548C2F" />
                  <Text style={styles.storeName}>
                    {store?.name || "Store Name"}
                  </Text>
                </View>
                <View style={styles.locationSection}>
                  <FontAwesome name="map-marker" size={20} color="#548C2F" />
                  <Text style={styles.location}>
                    {store
                      ? `${store.city}, ${store.province}`
                      : "Store Location"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Stock and Expiry Info */}
              <View style={styles.additionalInfoSection}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Available:</Text>
                  <Text style={styles.infoValue}>
                    {product?.stock || 0} items
                  </Text>
                </View>
                {product?.expirationDate && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Expires:</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(product.expirationDate)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Reviews Section */}
              <View style={styles.reviewsSection}>
                <View style={styles.reviewsHeader}>
                  <Text style={styles.sectionTitle}>Reviews</Text>
                  <Pressable>
                    <Text style={styles.seeAllButton}>See all</Text>
                  </Pressable>
                </View>
                <ReviewCard
                  reviewerName="John Doe"
                  message="Great product! Highly recommended."
                  rating={product?.rating || 4}
                />
                {/* Write a Review Button (conditional) */}
                <WriteReviewButton productId={product?.id} />
              </View>
            </View>
          </ScrollView>
          {/* Bottom Action Buttons - keep outside ScrollView for proper overlay */}
          <View style={styles.bottomButtons}>
            {isExpired ? (
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#eee",
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  height: 60,
                }}
              >
                <Text
                  style={{ color: "#d32f2f", fontWeight: "bold", fontSize: 18 }}
                >
                  Product Expired
                </Text>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <AnimatedPressable
                  style={({ pressed }) => [
                    styles.addToCartButton,
                    pressed && { transform: [{ scale: 0.96 }], opacity: 0.85 },
                  ]}
                  onPress={handleAddToCart}
                  disabled={isExpired}
                >
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </AnimatedPressable>
                <AnimatedPressable
                  style={({ pressed }) => [
                    styles.orderNowButton,
                    pressed && { transform: [{ scale: 0.96 }], opacity: 0.85 },
                  ]}
                  onPress={handleOrderNow}
                  disabled={isExpired}
                >
                  <Text style={styles.orderNowText}>Order Now</Text>
                </AnimatedPressable>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 20,
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
    color: "#FF6B6B",
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#F9A620",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 300,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  discountBadgeInline: {
    marginLeft: 10,
    backgroundColor: "#FF6B6B",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "center",
  },
  discountText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  contentContainer: {
    padding: 16,
  },
  nameQuantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  productName: {
    fontSize: 25,
    fontFamily: "Poppins-Bold",
    flex: 1,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  quantityButtonText: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
  },
  quantityText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  pricingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  discountedPrice: {
    fontFamily: "Poppins-Regular",
    fontSize: 20,
    color: "#F9A620",
    marginRight: 8,
  },
  originalPrice: {
    fontFamily: "Poppins-Regular",
    fontSize: 20,
    color: "#979797",
    textDecorationLine: "line-through",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#454B60",
    fontSize: 18,
    fontFamily: "Poppins-Regular",
    marginBottom: 8,
  },
  horizontalRule: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  storeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  storeSection: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeName: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    marginLeft: 8,
    color: "#868889",
  },
  location: {
    fontSize: 16,
    color: "#868889",
    marginLeft: 8,
    fontFamily: "Poppins-Regular",
  },
  additionalInfoSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
  },
  reviewsSection: {
    marginBottom: 100, // Extra space for bottom buttons
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    color: "#454B60",
  },
  seeAllButton: {
    color: "#104911",
    fontSize: 16,
  },
  bottomButtons: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    height: 60,
    backgroundColor: "#F9A620",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  orderNowButton: {
    flex: 1,
    height: 60,
    backgroundColor: "#548C2F",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  orderNowText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  // Wireframe styles
  loadingWireframeContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 0,
    marginTop: 20,
    alignItems: "center",
  },
  wfImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
  },
  wfContent: {
    width: "92%",
    alignSelf: "center",
  },
  wfTitle: {
    flex: 1,
    height: 28,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    marginBottom: 12,
  },
  wfPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  wfPrice: {
    width: 80,
    height: 22,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    marginRight: 10,
  },
  wfOrigPrice: {
    width: 60,
    height: 18,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    marginRight: 10,
  },
  wfDiscount: {
    width: 60,
    height: 18,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
  },
  wfSection: {
    width: "100%",
    height: 18,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    marginBottom: 10,
  },
  wfBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "92%",
    alignSelf: "center",
    marginTop: 20,
    gap: 12,
  },
  wfBottomBtn: {
    flex: 1,
    height: 50,
    backgroundColor: "#e0e0e0",
    borderRadius: 25,
  },
});

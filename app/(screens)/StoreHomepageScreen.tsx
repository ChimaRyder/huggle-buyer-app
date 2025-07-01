import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { ReviewCard } from "../../components/ReviewCard";
import StoreProductGrid from "../../components/StoreProductGrid";
import {
  fetchStoreById,
  fetchBuyerById,
  updateFavoriteStore,
} from "../../utils/api";
import { BackendStore, BackendBuyer } from "../../types/BackendModels";

const { width, height } = Dimensions.get("window");
const BANNER_HEIGHT = height * 0.25;

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  date: string;
}

interface Store {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  image: any;
  profileImage: any;
  bannerImage: any;
}

const MOCK_STORES: Store[] = [
  {
    id: "1",
    name: "Baked Bliss",
    category: "Pastries",
    rating: 4.7,
    reviews: 120,
    distance: "1.2km",
    image: require("../../assets/images/sample-store.jpg"),
    profileImage: require("../../assets/images/sample-store.jpg"),
    bannerImage: require("../../assets/images/sample-store.jpg"),
  },
  {
    id: "2",
    name: "Snack Shack",
    category: "Burgers",
    rating: 4.5,
    reviews: 98,
    distance: "0.8km",
    image: require("../../assets/images/sample-store.jpg"),
    profileImage: require("../../assets/images/sample-store.jpg"),
    bannerImage: require("../../assets/images/sample-store.jpg"),
  },
];

const DUMMY_REVIEWS: Review[] = [
  {
    id: "1",
    rating: 5,
    comment: "Great products and fast delivery!",
    userName: "John D.",
    date: "2025-05-10",
  },
  {
    id: "2",
    rating: 4,
    comment: "Good service and value for money.",
    userName: "Anna B.",
    date: "2025-05-09",
  },
];

export default function StoreHomepageScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getToken, userId } = useAuth();
  const [store, setStore] = useState<BackendStore | null>(null);
  const [buyer, setBuyer] = useState<BackendBuyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Fallback to mock store if needed
  const mockStore = MOCK_STORES.find((s) => s.id === id?.toString());

  const [isFavorited, setIsFavorited] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const loadStoreData = async () => {
    if (!id) {
      setError("Store ID not provided");
      setLoading(false);
      return;
    }

    try {
      if (!refreshing) {
        setLoading(true);
      }
      // Get auth token with the seller_app template
      const token = await getToken({ template: "seller_app" });
      const storeData = await fetchStoreById(id.toString(), token);
      setStore(storeData);
      setError(null); // Clear any previous errors if successful
    } catch (err) {
      console.error("Error loading store data:", err);
      setError("Failed to load store details");
      // We don't clear store here to allow fallback to previous data if available
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadBuyerData = async () => {
    if (!userId) {
      console.log("User ID not available");
      return;
    }

    try {
      const token = await getToken({ template: "seller_app" });
      const buyerData = await fetchBuyerById(userId, token);
      setBuyer(buyerData);

      // Check if the current store is in favorite stores
      if (buyerData.favoriteStores && id) {
        setIsFavorited(buyerData.favoriteStores.includes(id.toString()));
      }
    } catch (err) {
      console.error("Error loading buyer data:", err);
    }
  };

  const toggleFavorite = async () => {
    if (!userId || !id) {
      console.log("User ID or Store ID not available");
      return;
    }

    try {
      setFavoriteLoading(true);
      const token = await getToken({ template: "seller_app" });

      // Toggle favorite status
      const newFavoriteStatus = !isFavorited;

      // Call the API to update favorite status
      await updateFavoriteStore(
        userId,
        id.toString(),
        newFavoriteStatus,
        token
      );

      // Update local state
      setIsFavorited(newFavoriteStatus);
    } catch (err) {
      console.error("Error updating favorite store:", err);
      // Show error message to user
      alert("Failed to update favorite status. Please try again.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
    loadBuyerData();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeReviewIndex + 1) % DUMMY_REVIEWS.length;
      setActiveReviewIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeReviewIndex]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStoreData();
  };

  // If store is not loaded yet, show loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#548C2F" />
          <Text style={styles.loadingText}>Loading store information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If there's an error and no store data, show error state
  if (error && !store && !mockStore) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>{error}</Text>
      </SafeAreaView>
    );
  }

  // Use either real store data or fall back to mock data
  const displayStore = store || mockStore;

  if (!displayStore) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Store not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#548C2F"]}
          />
        }
      >
        {/* Banner */}
        <ImageBackground
          source={
            store?.storeCoverUrl
              ? { uri: store.storeCoverUrl }
              : "bannerImage" in displayStore && displayStore.bannerImage
              ? displayStore.bannerImage
              : require("../../assets/images/sample-store.jpg")
          }
          style={styles.banner}
        >
          <View style={styles.bannerOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.bannerBottom}>
              <View style={styles.storeInfo}>
                <Image
                  source={
                    "storeImageUrl" in displayStore &&
                    displayStore.storeImageUrl
                      ? { uri: displayStore.storeImageUrl }
                      : "profileImage" in displayStore &&
                        displayStore.profileImage
                      ? displayStore.profileImage
                      : require("../../assets/images/sample-store.jpg")
                  }
                  style={styles.storeProfileImage}
                />
                <View style={styles.storeTextInfo}>
                  <Text style={styles.storeName}>{displayStore.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {"rating" in displayStore && displayStore.rating
                        ? displayStore.rating.toFixed(1)
                        : "4.5"}
                      ({"reviews" in displayStore ? displayStore.reviews : "0"})
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.circleButton}
                  onPress={toggleFavorite}
                  disabled={favoriteLoading}
                >
                  <Ionicons
                    name={isFavorited ? "heart" : "heart-outline"}
                    size={24}
                    color={isFavorited ? "tomato" : "black"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.circleButton, { marginTop: 8 }]}
                  onPress={() => router.push("/(screens)/chat" as any)}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity
              onPress={() => router.push("/(screens)/reviews" as any)}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsContainer}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveReviewIndex(newIndex);
            }}
          >
            {DUMMY_REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewWrapper}>
                <ReviewCard
                  reviewerName={review.userName}
                  message={review.comment}
                  rating={review.rating}
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.paginationDots}>
            {DUMMY_REVIEWS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeReviewIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search in shop"
            placeholderTextColor="gray"
          />
        </View>

        {/* Popular Products */}
        <View style={styles.section}>
          <StoreProductGrid storeId={displayStore.id} title="Store Products" />
        </View>
      </ScrollView>

      {/* Floating Cart */}
      <TouchableOpacity
        style={styles.floatingCart}
        onPress={() => router.push("/(screens)/cart" as any)}
      >
        <Ionicons name="bag" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 25,
  },
  scrollView: { flex: 1 },
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
  banner: { height: BANNER_HEIGHT },
  bannerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "space-between",
    padding: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  storeInfo: { flexDirection: "row", alignItems: "center" },
  storeProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  storeTextInfo: { justifyContent: "center" },
  storeName: { color: "white", fontSize: 16, fontWeight: "bold" },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { color: "white", marginLeft: 4 },
  actionButtons: { alignItems: "center" },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  searchInput: { flex: 1, marginLeft: 8 },
  section: { padding: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  popularHeader: { flexDirection: "row", alignItems: "center" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  seeAll: {
    color: "#1E90FF",
  },
  reviewsContainer: {
    paddingHorizontal: 16,
  },
  reviewWrapper: {
    width: width - 32,
    marginRight: 16,
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#1E90FF",
    transform: [{ scale: 1.2 }],
  },
  floatingCart: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1E90FF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

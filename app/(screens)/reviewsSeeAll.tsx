import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { fetchProductsByStoreId } from "../../utils/products";
import { fetchReviews } from "../../utils/reviews";
import { BackendReview, BackendProduct } from "../../types/BackendModels";
import { Ionicons } from "@expo/vector-icons";

// Star rating component
const StarRating = ({ rating }: { rating: number }) => (
  <View style={{ flexDirection: "row" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={i <= rating ? "star" : "star-outline"}
        size={18}
        color="#F9A620"
      />
    ))}
  </View>
);

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest Rated", value: "highest" },
  { label: "Lowest Rated", value: "lowest" },
];

const ReviewsSeeAllScreen = () => {
  const router = useRouter();
  const { id: storeId } = useLocalSearchParams();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  // Fetch all reviews for all products in the store
  const fetchAllReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken({ template: "seller_app" });
      // 1. Get all products for the store
      const products: BackendProduct[] = await fetchProductsByStoreId(storeId as string, token);
      const allReviews: BackendReview[] = [];
      // 2. For each product, fetch reviews
      for (const product of products) {
        try {
          const productReviews: BackendReview[] = await fetchReviews(token, { productId: product.id });
          allReviews.push(...productReviews);
        } catch (e) {
          // If a product has no reviews or errors, skip
          continue;
        }
      }
      setReviews(allReviews);
    } catch (e: any) {
      setError(e.message || "Failed to load reviews");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeId, getToken]);

  useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  // Sorting
  const getSortedReviews = () => {
    let sorted = [...reviews];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "highest":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
    }
    return sorted;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllReviews();
  };

  const renderReview = ({ item }: { item: BackendReview }) => (
    <View style={styles.reviewCard}>
      <StarRating rating={item.rating} />
      <Text style={styles.reviewContent}>{item.content}</Text>
      {item.imageUrls && item.imageUrls.length > 0 && (
        <View style={styles.imagesRow}>
          {item.imageUrls.map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={styles.reviewImage}
              resizeMode="cover"
            />
          ))}
        </View>
      )}
      <Text style={styles.reviewDate}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>All Reviews</Text>
      </View>
      <View style={styles.sortRow}>
        {sortOptions.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.sortButton, sortBy === opt.value && styles.sortButtonActive]}
            onPress={() => setSortBy(opt.value)}
          >
            <Text style={[styles.sortButtonText, sortBy === opt.value && styles.sortButtonTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#548C2F" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={getSortedReviews()}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No reviews yet.</Text>}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
    color: "#222",
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f7f7f7",
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#eee",
    marginHorizontal: 4,
  },
  sortButtonActive: {
    backgroundColor: "#548C2F",
  },
  sortButtonText: {
    color: "#888",
    fontWeight: "600",
  },
  sortButtonTextActive: {
    color: "#fff",
  },
  reviewCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewContent: {
    fontSize: 16,
    marginVertical: 8,
    color: "#333",
  },
  imagesRow: {
    flexDirection: "row",
    marginVertical: 8,
  },
  reviewImage: {
    width: 64,
    height: 64,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  reviewDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    textAlign: "right",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 16,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 40,
  },
});

export default ReviewsSeeAllScreen;

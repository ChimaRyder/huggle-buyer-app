import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ReviewCard } from "@/components/review";
import { colors } from "@/constants/theme";
import { getMockReviewsByProductId, getMockReviewsByStoreId } from "@/data/mockData";
import { BackendReview } from "@/types/BackendModels";
import { foodItems } from "@/data/food/mockData";


export default function ReviewsScreen() {
  const router = useRouter();
  const { id: storeId, productId } = useLocalSearchParams();
  
  const [refreshing, setRefreshing] = useState(false);
  
  // Get reviews based on whether we're showing product-specific or store-wide reviews
  const reviews: BackendReview[] = productId 
    ? getMockReviewsByProductId(productId as string)
    : getMockReviewsByStoreId(storeId as string);
  
  // Debug logging
  console.log('ReviewsScreen - storeId:', storeId, 'productId:', productId, 'reviews found:', reviews.length);

  // Helper function to get product name by productId
  const getProductName = (productId: string): string | undefined => {
    const product = foodItems.find(item => item.id === productId);
    return product?.name;
  };

  // Simulate refresh with mock data
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };




  // Calculate rating statistics
  const ratingStats = {
    total: reviews.length,
    average: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
    distribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    },
    withPhotos: reviews.filter(r => r.imageUrls && r.imageUrls.length > 0).length,
  };



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{productId ? 'Product Reviews' : 'Store Reviews'}</Text>
          <Text style={styles.headerSubtitle}>{ratingStats.total} Reviews</Text>
        </View>
      </View>


      {/* Star Rating Graph */}
      {reviews.length > 0 && (
        <View style={styles.ratingGraphContainer}>
          <View style={styles.ratingOverviewGraph}>
            <Text style={styles.averageRatingGraph}>{ratingStats.average.toFixed(1)}</Text>
            <View style={styles.starsContainerGraph}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                  key={star}
                  name="star"
                  size={16}
                  color={star <= Math.round(ratingStats.average) ? colors.warning : colors.border.primary}
                />
              ))}
            </View>
            <Text style={styles.totalReviewsGraph}>{ratingStats.total} reviews</Text>
          </View>
          
          <View style={styles.ratingBarsGraph}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <View key={rating} style={styles.ratingBarRowGraph}>
                <View style={styles.ratingLabelContainer}>
                  <Text style={styles.ratingLabelGraph}>{rating}</Text>
                  <FontAwesome name="star" size={12} color={colors.warning} />
                  <Text style={styles.ratingCountGraph}>
                    ({ratingStats.distribution[rating as keyof typeof ratingStats.distribution]})
                  </Text>
                </View>
                <View style={styles.ratingBarGraph}>
                  <View 
                    style={[
                      styles.ratingBarFillGraph, 
                      { width: `${ratingStats.total > 0 ? (ratingStats.distribution[rating as keyof typeof ratingStats.distribution] / ratingStats.total) * 100 : 0}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}


      {/* Reviews List */}
      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>
            No reviews yet
          </Text>
          <Text style={styles.emptySubtext}>
            Be the first to review a product from this store!
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.reviewsList}
          contentContainerStyle={styles.reviewsListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              buyerId={review.buyerId}
              reviewerName={review.buyerName}
              message={review.content}
              rating={review.rating}
              imageUrls={review.imageUrls || []}
              createdAt={review.createdAt}
              showExpandButton={true}
              productName={!productId ? getProductName(review.productId) : undefined}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary, // Light gray background like Home screen
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  // Star Rating Graph styles
  ratingGraphContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  ratingOverviewGraph: {
    alignItems: "center",
    marginRight: 24,
  },
  averageRatingGraph: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  starsContainerGraph: {
    flexDirection: "row",
    marginVertical: 4,
  },
  totalReviewsGraph: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  ratingBarsGraph: {
    flex: 1,
  },
  ratingBarRowGraph: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  ratingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 50,
  },
  ratingLabelGraph: {
    fontSize: 14,
    color: colors.text.primary,
    marginRight: 2,
  },
  ratingBarGraph: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border.primary,
    borderRadius: 5,
    marginLeft: 8,
  },
  ratingBarFillGraph: {
    height: "100%",
    backgroundColor: colors.warning,
    borderRadius: 5,
  },
  ratingCountGraph: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.secondary,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
    textAlign: "center",
  },
  reviewsList: {
    flex: 1,
  },
  reviewsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});

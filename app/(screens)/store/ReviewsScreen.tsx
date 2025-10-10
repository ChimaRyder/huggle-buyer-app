import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from '@clerk/clerk-expo';
import { ReviewCard, FilterBar } from "@/components/review";
import { colors } from "@/constants/theme";
import { BackendReview } from "@/types/BackendModels";
import { fetchReviews, fetchReviewsByStore, ReviewsFilter, getFilterDescription } from "@/utils/reviews";


export default function ReviewsScreen() {
  const router = useRouter();
  const { id: storeId, productId } = useLocalSearchParams();
  const { getToken } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for reviews data
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [filters, setFilters] = useState<ReviewsFilter>({
    sortBy: 'newest', // Default sorting
  });
  
  // Debug logging
  console.log('ReviewsScreen - storeId:', storeId, 'productId:', productId, 'filters:', filters);

  // Function to fetch reviews
  const fetchReviewsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken({template: "seller_app"});
      
      let response;
      if (productId && typeof productId === 'string') {
        console.log('🔍 ReviewsScreen: Fetching product reviews for:', productId);
        response = await fetchReviews(token, { productId, filters });
      } else if (storeId && typeof storeId === 'string') {
        console.log('🔍 ReviewsScreen: Fetching store reviews for:', storeId);
        response = await fetchReviewsByStore(token, { storeId, filters });
      } else {
        throw new Error('No valid productId or storeId provided');
      }
      
      if (response && response.data) {
        const reviewsData = Array.isArray(response.data) ? response.data : [];
        setReviews(reviewsData);
        console.log('✅ ReviewsScreen: Successfully fetched', reviewsData.length, 'reviews');
      } else {
        setReviews([]);
        console.log('📭 ReviewsScreen: No reviews found');
      }
    } catch (error) {
      console.error('❌ ReviewsScreen: Error fetching reviews:', error);
      setError(error instanceof Error ? error.message : 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Effect to fetch reviews when component mounts or filters change
  useEffect(() => {
    fetchReviewsData();
  }, [productId, storeId, filters]);

  // TODO: Get product name from API
  const getProductName = (productId: string): string | undefined => {
    return undefined;
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchReviewsData();
    } catch (error) {
      console.error('❌ ReviewsScreen: Error refreshing reviews:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle filter changes
  const handleFiltersChange = (newFilters: ReviewsFilter) => {
    console.log('🔧 ReviewsScreen: Updating filters:', newFilters);
    setFilters(newFilters);
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
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading...' : `${ratingStats.total} Reviews`}
            {!loading && filters && Object.keys(filters).length > 1 && (
              <Text style={styles.filterIndicator}> • {getFilterDescription(filters)}</Text>
            )}
          </Text>
        </View>
      </View>

      {/* Filter Bar */}
      {!loading && !error && (
        <FilterBar
          activeFilters={filters}
          onFiltersChange={handleFiltersChange}
          totalReviews={ratingStats.total}
          reviewsWithMedia={ratingStats.withPhotos}
          ratingDistribution={ratingStats.distribution}
          isLoading={refreshing}
        />
      )}

      {/* Star Rating Graph */}
      {!loading && !error && reviews.length > 0 && (
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchReviewsData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>
            {filters.rating || filters.hasMedia ? 'No reviews match your filters' : 'No reviews yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {filters.rating || filters.hasMedia 
              ? 'Try adjusting your filter criteria'
              : (productId ? 'Be the first to review this product!' : 'Be the first to review a product from this store!')
            }
          </Text>
          {(filters.rating || filters.hasMedia) && (
            <TouchableOpacity 
              style={styles.clearFiltersButton} 
              onPress={() => handleFiltersChange({ sortBy: 'newest' })}
            >
              <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
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
              highlightMedia={filters.hasMedia || false}
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
  // Loading/Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  // Filter indicator
  filterIndicator: {
    color: colors.primary.main,
    fontSize: 12,
    fontWeight: '500',
  },
  // Clear filters button
  clearFiltersButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  clearFiltersButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
});

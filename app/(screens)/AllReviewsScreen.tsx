import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { Text } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ReviewCard } from "../../components/review";
import { fetchReviews } from "../../utils/reviews";
import { BackendReview } from "../../types/BackendModels";

type FilterType = 'all' | '5' | '4' | '3' | '2' | '1' | 'photos';
type SortType = 'newest' | 'oldest' | 'highest' | 'lowest';

const FILTER_OPTIONS = [
  { key: 'all' as FilterType, label: 'All Reviews', icon: 'list' },
  { key: '5' as FilterType, label: '5 Stars', icon: 'star' },
  { key: '4' as FilterType, label: '4 Stars', icon: 'star' },
  { key: '3' as FilterType, label: '3 Stars', icon: 'star' },
  { key: '2' as FilterType, label: '2 Stars', icon: 'star' },
  { key: '1' as FilterType, label: '1 Star', icon: 'star' },
  { key: 'photos' as FilterType, label: 'With Photos', icon: 'camera' },
];

const SORT_OPTIONS = [
  { key: 'newest' as SortType, label: 'Newest First' },
  { key: 'oldest' as SortType, label: 'Oldest First' },
  { key: 'highest' as SortType, label: 'Highest Rating' },
  { key: 'lowest' as SortType, label: 'Lowest Rating' },
];

export default function AllReviewsScreen() {
  const router = useRouter();
  const { productId, productName } = useLocalSearchParams();
  const { getToken } = useAuth();
  
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<BackendReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort states
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedSort, setSelectedSort] = useState<SortType>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Load reviews
  const loadReviews = async (isRefresh = false) => {
    if (!productId) return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const token = await getToken({ template: "seller_app" });
      const reviewsData = await fetchReviews(token, { productId: productId.toString() });
      setReviews(reviewsData || []);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError("Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and sort reviews
  const applyFiltersAndSort = () => {
    let filtered = [...reviews];
    
    // Apply filter
    switch (selectedFilter) {
      case '5':
      case '4':
      case '3':
      case '2':
      case '1':
        filtered = filtered.filter(review => review.rating === parseInt(selectedFilter));
        break;
      case 'photos':
        filtered = filtered.filter(review => review.imageUrls && review.imageUrls.length > 0);
        break;
      case 'all':
      default:
        // No filtering
        break;
    }
    
    // Apply sort
    switch (selectedSort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }
    
    setFilteredReviews(filtered);
  };

  // Initial load
  useEffect(() => {
    loadReviews();
  }, [productId]);

  // Apply filters when reviews or filter/sort changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [reviews, selectedFilter, selectedSort]);

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

  const onRefresh = () => {
    loadReviews(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#548C2F" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Reviews</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {productName || 'Product'}
          </Text>
        </View>
      </View>

      {/* Review Summary */}
      {reviews.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.ratingOverview}>
            <Text style={styles.averageRating}>{ratingStats.average.toFixed(1)}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                  key={star}
                  name="star"
                  size={16}
                  color={star <= Math.round(ratingStats.average) ? "#FFD700" : "#E0E0E0"}
                />
              ))}
            </View>
            <Text style={styles.totalReviews}>{ratingStats.total} reviews</Text>
          </View>
          
          <View style={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <View key={rating} style={styles.ratingBarRow}>
                <Text style={styles.ratingLabel}>{rating}</Text>
                <FontAwesome name="star" size={12} color="#FFD700" />
                <View style={styles.ratingBar}>
                  <View 
                    style={[
                      styles.ratingBarFill, 
                      { width: `${(ratingStats.distribution[rating as keyof typeof ratingStats.distribution] / ratingStats.total) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.ratingCount}>
                  {ratingStats.distribution[rating as keyof typeof ratingStats.distribution]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Filters and Sort */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color="#548C2F" />
          <Text style={styles.filterToggleText}>Filters & Sort</Text>
          <Ionicons 
            name={showFilters ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#548C2F" 
          />
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.filtersPanel}>
            {/* Filter Options */}
            <Text style={styles.filterSectionTitle}>Filter by</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptions}
            >
              {FILTER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterChip,
                    selectedFilter === option.key && styles.filterChipSelected
                  ]}
                  onPress={() => setSelectedFilter(option.key)}
                >
                  <FontAwesome 
                    name={option.icon as any} 
                    size={14} 
                    color={selectedFilter === option.key ? "#fff" : "#666"} 
                  />
                  <Text style={[
                    styles.filterChipText,
                    selectedFilter === option.key && styles.filterChipTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {option.key !== 'all' && option.key !== 'photos' && (
                    <Text style={[
                      styles.filterChipCount,
                      selectedFilter === option.key && styles.filterChipCountSelected
                    ]}>
                      {ratingStats.distribution[parseInt(option.key) as keyof typeof ratingStats.distribution]}
                    </Text>
                  )}
                  {option.key === 'photos' && (
                    <Text style={[
                      styles.filterChipCount,
                      selectedFilter === option.key && styles.filterChipCountSelected
                    ]}>
                      {ratingStats.withPhotos}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sort Options */}
            <Text style={[styles.filterSectionTitle, { marginTop: 16 }]}>Sort by</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptions}
            >
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortChip,
                    selectedSort === option.key && styles.sortChipSelected
                  ]}
                  onPress={() => setSelectedSort(option.key)}
                >
                  <Text style={[
                    styles.sortChipText,
                    selectedSort === option.key && styles.sortChipTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          Showing {filteredReviews.length} of {reviews.length} reviews
        </Text>
      </View>

      {/* Reviews List */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadReviews()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredReviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            {selectedFilter === 'all' ? 'No reviews yet' : 'No reviews match your filter'}
          </Text>
          <Text style={styles.emptySubtext}>
            {selectedFilter === 'all' 
              ? 'Be the first to review this product!' 
              : 'Try adjusting your filter options'
            }
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.reviewsList}
          contentContainerStyle={styles.reviewsListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              buyerId={review.buyerId}
              message={review.content}
              rating={review.rating}
              imageUrls={review.imageUrls || []}
              createdAt={review.createdAt}
              showExpandButton={true}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
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
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  summaryContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  ratingOverview: {
    alignItems: "center",
    marginRight: 24,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  starsContainer: {
    flexDirection: "row",
    marginVertical: 4,
  },
  totalReviews: {
    fontSize: 14,
    color: "#666",
  },
  ratingBars: {
    flex: 1,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  ratingLabel: {
    fontSize: 12,
    color: "#333",
    width: 12,
    textAlign: "right",
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: "#666",
    width: 24,
    textAlign: "right",
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterToggleText: {
    fontSize: 16,
    color: "#548C2F",
    marginLeft: 8,
    marginRight: 4,
    fontWeight: "600",
  },
  filtersPanel: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fafafa",
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  filterOptions: {
    paddingBottom: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: "#548C2F",
    borderColor: "#548C2F",
  },
  filterChipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  filterChipTextSelected: {
    color: "#fff",
  },
  filterChipCount: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterChipCountSelected: {
    color: "#548C2F",
    backgroundColor: "#fff",
  },
  sortChip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sortChipSelected: {
    backgroundColor: "#548C2F",
    borderColor: "#548C2F",
  },
  sortChipText: {
    fontSize: 14,
    color: "#666",
  },
  sortChipTextSelected: {
    color: "#fff",
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#548C2F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  reviewsList: {
    flex: 1,
  },
  reviewsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  }
});
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { ReviewCard } from "@/components/review";
import { useProductContext } from "@/context/ProductContext";

// Get screen width for carousel
const { width: SCREEN_WIDTH } = Dimensions.get("window");


export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const scrollViewRef = useRef(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  
  const {
    currentProduct,
    isFetchingProduct,
    productError,
    fetchProductById,
    clearCurrentProduct
  } = useProductContext();
  
  useEffect(() => {
    if (id && typeof id === 'string') {
      console.log('🔍 ProductScreen: Fetching product with ID:', id);
      fetchProductById(id);
    }
    
    // Cleanup when component unmounts or ID changes
    return () => {
      clearCurrentProduct();
    };
  }, [id, fetchProductById, clearCurrentProduct]);

  // TODO: Fetch store details from API
  const store = null;

  // TODO: Fetch reviews from API  
  const mockReviews: any[] = [];

  // Loading and error states
  if (isFetchingProduct) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (productError || !currentProduct) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{productError || 'Product not found'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate average rating
  const averageRating = mockReviews.length > 0 
    ? (mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length).toFixed(1)
    : "0.0";

  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? quantity + 1 : quantity - 1;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // In a real app, this would add to cart
    alert(`Added ${quantity} ${currentProduct.name} to cart!`);
  };

  const navigateToStore = () => {
    router.push(`/(screens)/store/StoreHomepageScreen?id=${store.id}`);
  };

  const handleViewAllReviews = () => {
    router.push(`/(screens)/store/ReviewsScreen?id=${store?.id}&productId=${currentProduct.id}`);
  };

  const handleReviewScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    // Calculate index based on the ORIGINAL slide width (SCREEN_WIDTH - 45) plus the marginRight (6)
    const slideWidthWithMargin = (SCREEN_WIDTH - 45) + 6;
    const calculatedIndex = contentOffset / slideWidthWithMargin;
    // Use Math.round for more accurate positioning
    const newIndex = Math.round(calculatedIndex);
    // Ensure index is within bounds
    const clampedIndex = Math.min(Math.max(newIndex, 0), mockReviews.length - 1);
    setCurrentReviewIndex(clampedIndex);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentProduct.coverImage }} style={styles.image} />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Product name and quantity row */}
          <View style={styles.nameRow}>
            <Text style={styles.title}>{currentProduct.name}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(false)}
              >
                <Ionicons name="remove" size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(true)}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Store info - temporarily disabled until store integration */}
          {store && (
            <TouchableOpacity style={styles.minimalStoreInfo} onPress={navigateToStore}>
              <Text style={styles.storeNameMinimal}>{store.name}</Text>
              <Text style={styles.storeDistanceMinimal}> • {store.distance}</Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description without header */}
          <View style={styles.section}>
            <Text style={styles.description}>{currentProduct.description}</Text>
            
            {/* Categories display */}
            {currentProduct.category && currentProduct.category.length > 0 && (
              <View style={styles.categoriesContainer}>
                {currentProduct.category.map((cat, index) => (
                  <View key={index} style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{cat}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Reviews section with updated header */}
          <View style={styles.reviewsHeader}>
            <View style={styles.reviewsTitleContainer}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={styles.ratingText}>{averageRating}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleViewAllReviews}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Reviews carousel */}
          <View style={styles.reviewsCarouselContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleReviewScroll}
              ref={scrollViewRef}
              scrollEventThrottle={16}
            >
              {mockReviews.map((review) => (
                <View key={review.id} style={styles.reviewSlide}>
                  <ReviewCard 
                    buyerId={review.buyerId}
                    reviewerName={review.buyerName}
                    message={review.content}
                    rating={review.rating}
                    imageUrls={review.imageUrls || []}
                    createdAt={review.createdAt}
                    showExpandButton={true}
                  />
                </View>
              ))}
            </ScrollView>
            
            {/* Carousel indicators */}
            <View style={styles.indicatorsContainer}>
              {mockReviews.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentReviewIndex && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar with price and Add to Cart button - expanded to screen edges with breathing room */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <Text style={styles.price}>
            ${(currentProduct.discountedPrice && currentProduct.discountedPrice < currentProduct.originalPrice 
              ? currentProduct.discountedPrice 
              : currentProduct.originalPrice).toFixed(2)}
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  scrollContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
    color: colors.text.primary,
  },
  imageContainer: {
    height: 300,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 10,
  },
  content: {
    padding: 20,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    flex: 1,
    marginRight: 10,
  },
  minimalStoreInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  storeNameMinimal: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  storeDistanceMinimal: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: 20,
  },
  section: {
    marginBottom: 10, // Reduced bottom margin
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 10, // Reduced bottom margin
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  categoryBadge: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  categoryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary, // Green background
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginHorizontal: 10,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  reviewsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  reviewsCarouselContainer: {
    marginBottom: 20,
  },
  reviewSlide: {
    width: SCREEN_WIDTH - 45, // Original width
    marginRight: 6, // Original marginRight
    alignItems: "center", // Original alignItems
    justifyContent: "center", // Original justifyContent
  },
  indicatorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.tertiary,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: colors.primary,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: "center",
    marginTop: 20,
  },
  bottomBarContainer: {
    backgroundColor: colors.background.primary, // White background to expand to screen edges
    paddingVertical: 20, // Vertical breathing room
    paddingHorizontal: 20, // Horizontal breathing room
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // Removed background color since container provides it
    // Removed border since we're expanding to edges
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  addButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: "600",
  },
});

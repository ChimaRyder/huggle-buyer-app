import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  Animated,
  RefreshControl,
} from "react-native";
import SafeImage from "@/components/common/SafeImage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { ReviewCard } from "@/components/review";
import { useProductContext } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/data/food/models";
import { genericProductToCartItem } from "@/utils/cartHelpers";

// Get screen width for carousel
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Skeleton Loading Component
const ProductSkeleton = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Image skeleton */}
        <View style={[styles.imageContainer, styles.skeletonBox]} />
        
        <View style={styles.content}>
          {/* Title skeleton */}
          <View style={styles.nameRow}>
            <View style={[styles.skeletonBox, { height: 28, flex: 1 }]} />
          </View>
          
          {/* Store section skeleton */}
          <View style={styles.storeSection}>
            <View style={styles.storeContent}>
              <View style={[styles.skeletonBox, { width: 50, height: 50, borderRadius: 25, marginRight: 12 }]} />
              <View style={styles.storeInfo}>
                <View style={[styles.skeletonBox, { height: 16, width: 120, marginBottom: 4 }]} />
                <View style={[styles.skeletonBox, { height: 14, width: '100%', marginBottom: 4 }]} />
                <View style={[styles.skeletonBox, { height: 14, width: '70%', marginBottom: 8 }]} />
                <View style={[styles.skeletonBox, { height: 14, width: 80 }]} />
              </View>
            </View>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Description skeleton */}
          <View style={styles.section}>
            <View style={[styles.skeletonBox, { height: 16, marginBottom: 8 }]} />
            <View style={[styles.skeletonBox, { height: 16, width: '80%', marginBottom: 8 }]} />
            <View style={[styles.skeletonBox, { height: 16, width: '60%', marginBottom: 16 }]} />
            
            {/* Category badges skeleton */}
            <View style={styles.categoriesContainer}>
              <View style={[styles.skeletonBox, { width: 80, height: 24, borderRadius: 8, marginRight: 8 }]} />
              <View style={[styles.skeletonBox, { width: 60, height: 24, borderRadius: 8, marginRight: 8 }]} />
            </View>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Reviews section skeleton */}
          <View style={styles.reviewsHeader}>
            <View style={[styles.skeletonBox, { height: 20, width: 120 }]} />
            <View style={[styles.skeletonBox, { height: 16, width: 60 }]} />
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom bar skeleton */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <View style={styles.priceSection}>
            <View style={[styles.skeletonBox, { height: 28, width: 80, marginBottom: 4 }]} />
            <View style={[styles.skeletonBox, { height: 16, width: 60 }]} />
          </View>
          <View style={styles.buttonsContainer}>
            <View style={[styles.skeletonBox, { height: 40, width: 90, borderRadius: 10 }]} />
            <View style={[styles.skeletonBox, { height: 40, width: 90, borderRadius: 10 }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [drawerAction, setDrawerAction] = useState<'cart' | 'order' | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const imageScrollViewRef = useRef(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  
  const {
    currentProduct,
    isFetchingProduct,
    productError,
    fetchProductById,
    clearCurrentProduct
  } = useProductContext();
  
  const { addItem } = useCart();
  
  useEffect(() => {
    if (id && typeof id === 'string') {
      console.log('🔍 ProductScreen: Fetching product with ID:', id);
      fetchProductById(id);
      setCurrentImageIndex(0); // Reset image carousel
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
    return <ProductSkeleton />;
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

  // Debug logging for pricing and tags
  console.log('💰 ProductScreen: Product pricing info:', {
    price: currentProduct.price,
    originalPrice: currentProduct.originalPrice,
    hasDiscount: currentProduct.hasDiscount,
    discountPercentage: currentProduct.discountPercentage,
    shouldShowOriginal: currentProduct.hasDiscount || currentProduct.price < currentProduct.originalPrice
  });
  
  console.log('🏷️ ProductScreen: Product tags info:', {
    tags: currentProduct.tags,
    tagsLength: currentProduct.tags?.length,
    tagsType: typeof currentProduct.tags,
    hasTagsAndLength: currentProduct.tags && currentProduct.tags.length > 0
  });

  // Calculate average rating
  const averageRating = mockReviews.length > 0 
    ? (mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length).toFixed(1)
    : "0.0";

  const handleRefresh = async () => {
    if (!id || typeof id !== 'string') return;
    
    setRefreshing(true);
    try {
      await fetchProductById(id);
      console.log('✅ ProductScreen: Successfully refreshed product data');
    } catch (error) {
      console.error('❌ ProductScreen: Error refreshing product:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? quantity + 1 : quantity - 1;
    if (newQuantity >= 1 && newQuantity <= currentProduct.stock) {
      setQuantity(newQuantity);
    }
  };

  const openDrawer = (action: 'cart' | 'order') => {
    setDrawerAction(action);
    setIsDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsDrawerVisible(false);
      setDrawerAction(null);
      setQuantity(1); // Reset quantity when closing
    });
  };

  const handleAddToCart = () => {
    openDrawer('cart');
  };

  const handleOrderNow = () => {
    openDrawer('order');
  };

  const confirmAction = () => {
    if (drawerAction === 'cart') {
      // Create cart item from current product using helper
      const cartItem = genericProductToCartItem(currentProduct, quantity);
      addItem(cartItem);
      alert(`Added ${quantity} ${currentProduct.name} to cart!`);
    } else if (drawerAction === 'order') {
      // Order now logic - add to cart then navigate to checkout
      const cartItem = genericProductToCartItem(currentProduct, quantity);
      addItem(cartItem);
      // Navigate directly to cart for checkout
      router.push('/(screens)/cart/CartScreen');
    }
    closeDrawer();
  };

  const navigateToStore = () => {
    if (currentProduct?.storeId) {
      router.push(`/(screens)/store/StoreHomepageScreen?id=${currentProduct.storeId}`);
    }
  };

  const handleViewAllReviews = () => {
    router.push(`/(screens)/store/ReviewsScreen?id=${store?.id}&productId=${currentProduct.id}`);
  };

  const handleImageScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const imageWidth = SCREEN_WIDTH;
    const newIndex = Math.round(contentOffset / imageWidth);
    const clampedIndex = Math.min(Math.max(newIndex, 0), (currentProduct.image?.length || 1) - 1);
    setCurrentImageIndex(clampedIndex);
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
      <ScrollView 
        style={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary.main]}
              tintColor={colors.primary.main}
            />
          }
      >
        <View style={styles.imageContainer}>
          {/* Image carousel */}
          <ScrollView
            ref={imageScrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
            style={styles.imageScrollView}
          >
            {currentProduct.image && currentProduct.image.length > 0 ? (
              currentProduct.image.map((imageUri, index) => (
                <SafeImage 
                  key={index}
                  source={{ uri: imageUri }} 
                  style={styles.image} 
                />
              ))
            ) : (
              <SafeImage 
                source={{ uri: '' }} 
                style={styles.image} 
              />
            )}
          </ScrollView>
          
          {/* Image indicators */}
          {currentProduct.image && currentProduct.image.length > 1 && (
            <View style={styles.imageIndicatorsContainer}>
              {currentProduct.image.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageIndicator,
                    index === currentImageIndex && styles.activeImageIndicator,
                  ]}
                />
              ))}
            </View>
          )}
          
          {/* Back button overlay */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Product name */}
          <View style={styles.nameRow}>
            <Text style={styles.title}>{currentProduct.name}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description without header */}
          <View style={styles.section}>
            <Text style={styles.description}>{currentProduct.description}</Text>
            
            {/* Categories display */}
            {currentProduct.tags && currentProduct.tags.length > 0 && (
              <View style={styles.categoriesContainer}>
                {currentProduct.tags.map((tag, index) => (
                  <View key={index} style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          

          {/* Store info section */}
          {currentProduct.storeName && (
            <TouchableOpacity style={styles.storeSection} onPress={() => navigateToStore()}>
              <View style={styles.storeContent}>
                {currentProduct.storeImageUrl && (
                  <SafeImage
                    source={{ uri: currentProduct.storeImageUrl }}
                    style={styles.storeImage}
                  />
                )}
                <View style={styles.storeInfo}>
                  <View style={styles.storeHeader}>
                    <Text style={styles.storeName}>{currentProduct.storeName}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                  </View>
                  {currentProduct.storeDescription && (
                    <Text style={styles.storeDescription} numberOfLines={2}>
                      {currentProduct.storeDescription}
                    </Text>
                  )}
                  <Text style={styles.visitStoreText}>Visit Store</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}


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

      {/* Bottom bar with improved pricing and dual buttons */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <View style={styles.priceSection}>
            <Text style={styles.price}>
              ${currentProduct.price.toFixed(2)}
            </Text>
            {currentProduct.originalPrice !== currentProduct.price && (
              <Text style={styles.originalPriceFooter}>
                Was ${currentProduct.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orderNowButton} onPress={handleOrderNow}>
              <Text style={styles.orderNowButtonText}>Order Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Quantity Selection Drawer */}
      <Modal
        visible={isDrawerVisible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={closeDrawer}
          />
          <Animated.View 
            style={[
              styles.drawer,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Drawer handle */}
            <View style={styles.drawerHandle} />
            
            {/* Drawer content */}
            <View style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>
                  {drawerAction === 'cart' ? 'Add to Cart' : 'Order Now'}
                </Text>
                <Text style={styles.productNameDrawer}>{currentProduct.name}</Text>
              </View>
              
              {/* Stock info */}
              <View style={styles.stockInfo}>
                <Text style={styles.stockText}>
                  {currentProduct.stock > 0 
                    ? `${currentProduct.stock} items available`
                    : 'Out of stock'
                  }
                </Text>
              </View>
              
              {/* Quantity selector */}
              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityChange(false)}
                    disabled={quantity <= 1}
                  >
                    <Ionicons name="remove" size={16} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity 
                    style={[styles.quantityButton, quantity >= currentProduct.stock && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityChange(true)}
                    disabled={quantity >= currentProduct.stock}
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Total price */}
              <View style={styles.totalSection}>
                <View style={styles.totalLabelSection}>
                  <Text style={styles.totalLabel}>Total</Text>
                  {currentProduct.originalPrice !== currentProduct.price && (
                    <View style={styles.savingsInfo}>
                      <Text style={styles.savingsText}>
                        You save ${((currentProduct.originalPrice - currentProduct.price) * quantity).toFixed(2)}
                      </Text>
                      {currentProduct.discountPercentage > 0 && (
                        <Text style={styles.discountBadgeText}>
                          {Math.round(currentProduct.discountPercentage)}% OFF
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.totalPriceContainer}>
                  <Text style={styles.totalPrice}>
                    ${(currentProduct.price * quantity).toFixed(2)}
                  </Text>
                  {currentProduct.originalPrice !== currentProduct.price && (
                    <Text style={styles.totalOriginalPrice}>
                      ${(currentProduct.originalPrice * quantity).toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Confirm button */}
              <TouchableOpacity 
                style={[styles.confirmButton, currentProduct.stock === 0 && styles.confirmButtonDisabled]}
                onPress={confirmAction}
                disabled={currentProduct.stock === 0}
              >
                <Text style={styles.confirmButtonText}>
                  {drawerAction === 'cart' ? 'Add to Cart' : 'Order Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  imageScrollView: {
    flex: 1,
  },
  image: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  imageIndicatorsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeImageIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  storeSection: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  storeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  storeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  storeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  visitStoreText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '500',
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
    backgroundColor: colors.primary.main + '15',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  categoryText: {
    color: colors.primary.main,
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
    backgroundColor: colors.primary.main, // Green background
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
    color: colors.primary.main,
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
    backgroundColor: colors.primary.main,
  },
  skeletonBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary.main,
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
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  priceSection: {
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 2,
  },
  originalPriceFooter: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addToCartButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 90,
    alignItems: "center",
  },
  addToCartButtonText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: "600",
  },
  orderNowButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 90,
    alignItems: "center",
  },
  orderNowButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "600",
  },
  // Drawer styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  drawer: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.background.secondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  drawerContent: {
    paddingHorizontal: 20,
  },
  drawerHeader: {
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  productNameDrawer: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  stockInfo: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 20,
  },
  stockText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  quantityButtonDisabled: {
    backgroundColor: colors.background.secondary,
    opacity: 0.5,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    marginBottom: 20,
  },
  totalLabelSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  savingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  savingsText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
    marginRight: 8,
  },
  discountBadgeText: {
    fontSize: 10,
    color: colors.text.inverse,
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalPriceContainer: {
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  totalOriginalPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  confirmButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.background.secondary,
    opacity: 0.5,
  },
});

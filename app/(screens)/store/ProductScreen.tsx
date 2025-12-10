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
  TextInput,
} from "react-native";
import SafeImage from "@/components/common/SafeImage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/constants/theme";
import { ReviewCard } from "@/components/review";
import ProductGrid from "@/components/product/ProductGrid";
import { useProductContext } from "@/context/ProductContext";
import { useStoreContext } from "@/context/StoreContext";
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/data/food/models';
import { genericProductToCartItem, bundleToCartItem } from '@/utils/cartHelpers';
import AddToCartModal from '@/components/cart/AddToCartModal';
import { fetchReviews } from '@/utils/reviews';
import { submitProductReport } from '@/utils/reports';
import { BackendReview } from '@/types/BackendModels';
import BundleProductCard from '@/components/bundle/BundleProductCard';
import type { DynamicPricingInfo } from '@/types/DynamicPricing';
import { fetchDynamicPricingInfo } from '@/services/pricingService';
import { PriceCountdown } from '@/components/product/PriceCountdown';

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
  const { id } = useLocalSearchParams(); // Removed type parameter - we'll auto-detect
  const { getToken, userId } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [drawerAction, setDrawerAction] = useState<'cart' | 'order' | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // Dynamic pricing state
  const [pricingInfo, setPricingInfo] = useState<DynamicPricingInfo | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const {
    currentProduct,
    isFetchingProduct,
    productError,
    fetchProductById,
    clearCurrentProduct,
    currentBundle,
    isFetchingBundle,
    bundleError,
    fetchBundleById,
    clearCurrentBundle,
    isCurrentItemBundle,
    currentItem,
    fetchItemById
  } = useProductContext();

  const { addItem } = useCart();

  // Store context for fetching more products
  const {
    storeProducts,
    isFetchingProducts,
    fetchStoreProducts,
    clearStoreProducts
  } = useStoreContext();

  // Function to fetch reviews
  const fetchProductReviews = async (productId: string) => {
    try {
      setReviewsLoading(true);
      setReviewsError(null);
      const token = await getToken({ template: "seller_app" });

      const response = await fetchReviews(token, { productId });

      if (response && response.data) {
        const reviewsData = Array.isArray(response.data) ? response.data : [];
        setReviews(reviewsData);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('❌ ProductScreen: Error fetching reviews:', error);
      setReviewsError(error instanceof Error ? error.message : 'Failed to load reviews');
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Function to fetch dynamic pricing info
  const fetchProductPricingInfo = async (productId: string) => {
    try {
      setPricingLoading(true);
      console.log('📡 ProductScreen: Fetching pricing info for', productId);
      const token = await getToken({ template: "seller_app" });

      const response = await fetchDynamicPricingInfo(productId, token);
      console.log('✅ ProductScreen: Pricing response:', {
        success: response?.success,
        hasData: !!response?.data,
        isDynamicEnabled: response?.data?.isDynamicPricingEnabled,
        trajectoryLength: response?.data?.priceTrajectory?.length,
        firstTimestamp: response?.data?.priceTrajectory?.[0]?.timestamp
      });

      if (response && response.success && response.data) {
        console.log("AAAAAAAAAAAAAAA")
        console.log(response.data);
        setPricingInfo(response.data);
      } else {
        setPricingInfo(null);
      }
    } catch (error) {
      console.error('❌ ProductScreen: Error fetching pricing info:', error);
      setPricingInfo(null);
    } finally {
      setPricingLoading(false);
    }
  };

  useEffect(() => {
    if (id && typeof id === 'string') {

      // Use smart fetch that tries both product and bundle endpoints
      fetchItemById(id);
      fetchProductReviews(id); // Fetch reviews for both products and bundles
      fetchProductPricingInfo(id); // Fetch dynamic pricing info
    }

    // Cleanup only LOCAL state when component unmounts or ID changes
    // DO NOT clear context state (currentProduct, currentBundle) as this causes
    // "Product Not Found" errors when navigating back through the stack
    // The context state will be overwritten by the next fetchItemById call anyway
    return () => {
      setReviews([]);
      setReviewsError(null);
      setPricingInfo(null);
      clearStoreProducts();
    };
  }, [id, fetchItemById, clearStoreProducts]);

  // Fetch store products when currentItem is available
  useEffect(() => {
    if (currentItem?.storeId) {
      fetchStoreProducts(currentItem.storeId);
    }
  }, [currentItem?.storeId, fetchStoreProducts]);

  // TODO: Fetch store details from API
  const store = null;

  // Loading and error states
  const isLoading = isFetchingProduct || isFetchingBundle;
  const error = productError || bundleError;
  const hasCurrentItem = currentProduct || currentBundle;

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (error || !hasCurrentItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || `${isCurrentItemBundle ? 'Bundle' : 'Product'} not found`}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const handleRefresh = async () => {
    if (!id || typeof id !== 'string') return;

    setRefreshing(true);
    try {
      const refreshPromises = [
        fetchItemById(id),
        fetchProductReviews(id),
        fetchProductPricingInfo(id)
      ];

      // Also refresh store products if we have a storeId
      if (currentItem?.storeId) {
        refreshPromises.push(fetchStoreProducts(currentItem.storeId));
      }

      await Promise.all(refreshPromises);
    } catch (error) {
      console.error('❌ ProductScreen: Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? quantity + 1 : quantity - 1;
    const maxStock = currentItem?.stock || 0;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
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

  const confirmAction = async () => {
    if (!currentItem) return;

    try {
      if (drawerAction === 'cart') {
        // Create cart item from current item using appropriate helper
        const cartItem = isCurrentItemBundle && currentBundle
          ? bundleToCartItem(currentBundle, quantity)
          : genericProductToCartItem(currentItem, quantity);

        await addItem(cartItem);

        setShowAddToCartModal(true);
      } else if (drawerAction === 'order') {
        closeDrawer();

        // Get the first image URL for display
        const imageUrl = Array.isArray(currentItem.image)
          ? currentItem.image[0]
          : currentItem.image || '';

        // Navigate directly to OrderReviewScreen for immediate checkout
        router.push({
          pathname: '/(screens)/cart/OrderReviewScreen',
          params: {
            storeId: currentItem.storeId,
            productId: currentItem.id,
            productName: currentItem.name,
            productPrice: currentItem.price.toString(),
            productImage: imageUrl,
            quantity: quantity.toString(),
            isBundle: isCurrentItemBundle.toString()
          },
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message :
        drawerAction === 'cart' ? 'Failed to add item to cart' : 'Failed to process order';
      console.error('❌ ProductScreen: confirmAction failed', {
        error: errorMessage,
        errorStack: error instanceof Error ? error.stack : undefined,
        drawerAction,
        itemId: currentItem?.id,
        quantity,
        isBundle: isCurrentItemBundle
      });
      alert(`Error: ${errorMessage}`);
    } finally {
      if (drawerAction === 'cart') {
        closeDrawer();
      }
    }
  };

  const navigateToStore = () => {
    if (currentItem?.storeId) {
      router.push(`/(screens)/store/StoreHomepageScreen?id=${currentItem.storeId}`);
    }
  };

  const handleViewAllReviews = () => {
    router.push(`/(screens)/store/ReviewsScreen?id=${store?.id}&productId=${currentItem?.id}`);
  };

  const handleMoreProductPress = (productId: string) => {
    // Use replace instead of push to avoid stacking multiple product screens
    // This prevents "Product Not Found" error when navigating back through the stack
    router.replace(`/(screens)/store/ProductScreen?id=${productId}`);
  };

  // Filter out the current product from store products
  const otherStoreProducts = storeProducts.filter(product => product.id !== currentItem?.id);


  const handleReviewScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    // Calculate index based on the ORIGINAL slide width (SCREEN_WIDTH - 45) plus the marginRight (6)
    const slideWidthWithMargin = (SCREEN_WIDTH - 45) + 6;
    const calculatedIndex = contentOffset / slideWidthWithMargin;
    // Use Math.round for more accurate positioning
    const newIndex = Math.round(calculatedIndex);
    // Ensure index is within bounds
    const clampedIndex = Math.min(Math.max(newIndex, 0), reviews.length - 1);
    setCurrentReviewIndex(clampedIndex);
  };

  const handleReport = async () => {
    if (!reportReason) {
      alert("Please select a reason for reporting.");
      return;
    }

    if (!currentItem || !userId) {
      alert("Unable to submit report. Please try again.");
      return;
    }

    setReportLoading(true);
    try {
      const token = await getToken({ template: "seller_app" });

      await submitProductReport(
        userId,
        currentItem.id,
        reportReason,
        reportDescription,
        token
      );

      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
      alert("Report submitted. Thank you for helping keep Huggle safe.");
    } catch (err: any) {
      alert(err.message || "Failed to submit report.");
    } finally {
      setReportLoading(false);
    }
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
          {/* Image carousel for bundles with multiple images */}
          {isCurrentItemBundle && currentBundle ? (
            (() => {
              // Collect all images: bundle images + product images
              const allImages: string[] = [];

              // Add bundle main images (use coverImage first - provided by backend)
              if (currentBundle.coverImage) allImages.push(currentBundle.coverImage);
              if (currentBundle.imageUrl) allImages.push(currentBundle.imageUrl);
              if (currentBundle.images && currentBundle.images.length > 0) {
                allImages.push(...currentBundle.images);
              }

              // Add product images
              currentBundle.products.forEach(product => {
                if (product.image && product.image.length > 0) {
                  allImages.push(...product.image);
                }
              });

              // Remove duplicates
              const uniqueImages = [...new Set(allImages)].filter(img => img && img.trim() !== '');

              if (uniqueImages.length <= 1) {
                // Single image - no carousel needed
                return (
                  <SafeImage
                    source={{ uri: uniqueImages[0] || '' }}
                    style={styles.image}
                  />
                );
              }

              // Multiple images - show carousel
              return (
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageCarousel}
                >
                  {uniqueImages.map((imageUri, index) => (
                    <View key={index} style={styles.imageSlide}>
                      <SafeImage
                        source={{ uri: imageUri }}
                        style={styles.image}
                      />
                    </View>
                  ))}
                </ScrollView>
              );
            })()
          ) : (
            // Regular product images
            currentProduct && currentProduct.image && currentProduct.image.length > 1 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.imageCarousel}
              >
                {currentProduct.image.map((imageUri, index) => (
                  <View key={index} style={styles.imageSlide}>
                    <SafeImage
                      source={{ uri: imageUri }}
                      style={styles.image}
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <SafeImage
                source={{
                  uri: currentProduct?.image && currentProduct.image.length > 0
                    ? currentProduct.image[0]
                    : ''
                }}
                style={styles.image}
              />
            )
          )}

          {/* Back button overlay */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Report button overlay */}
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => setShowReportModal(true)}
          >
            <Ionicons name="flag-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Item name */}
          <View style={styles.nameRow}>
            <Text style={styles.title}>{currentItem?.name}</Text>
          </View>

          {/* Dynamic Pricing Countdown */}
          {pricingInfo && pricingInfo.isDynamicPricingEnabled && pricingInfo.priceTrajectory.length > 0 && pricingInfo.priceTrajectory[0]?.timestamp && (
            <PriceCountdown targetTimestamp={pricingInfo.priceTrajectory[1].timestamp} />
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description without header */}
          <View style={styles.section}>
            <Text style={styles.description}>{currentItem?.description}</Text>

            {/* Bundle products list or categories display */}
            {isCurrentItemBundle && currentBundle ? (
              <View style={styles.bundleProductsContainer}>
                <View style={styles.bundleHeaderContainer}>
                  <Text style={styles.bundleProductsTitle}>
                    Products in this bundle ({currentBundle.products.length})
                  </Text>
                </View>

                <View style={styles.bundleProductsList}>
                  {currentBundle.products.map((product, index) => (
                    <BundleProductCard
                      key={index}
                      product={product}
                      compact={true}
                      onPress={() => {
                        // Optional: Navigate to individual product if needed
                      }}
                    />
                  ))}
                </View>

                {/* Bundle Summary */}
                <View style={styles.bundleSummaryContainer}>
                  <View style={styles.bundleSummaryRow}>
                    <Text style={styles.bundleSummaryLabel}>Total Individual Price:</Text>
                    <Text style={styles.bundleSummaryValue}>
                      ${currentBundle.totalProductPrice?.toFixed(2) || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.bundleSummaryRow}>
                    <Text style={styles.bundleSummaryLabel}>Bundle Price:</Text>
                    <Text style={styles.bundlePriceValue}>
                      ${currentBundle.price?.toFixed(2) || 'N/A'}
                    </Text>
                  </View>
                  {currentBundle.hasDiscount && (
                    <View style={styles.bundleSummaryRow}>
                      <Text style={styles.bundleSavingsLabel}>Your Savings:</Text>
                      <Text style={styles.bundleSavingsValue}>
                        ${((currentBundle.totalProductPrice || 0) - (currentBundle.price || 0)).toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              /* Categories display for regular products */
              (currentProduct?.tags && currentProduct.tags.length > 0) && (
                <View style={styles.categoriesContainer}>
                  {currentProduct.tags.map((tag, index) => (
                    <View key={index} style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )
            )}
          </View>


          {/* Store info section */}
          {currentItem?.storeName && (
            <TouchableOpacity style={styles.storeSection} onPress={() => navigateToStore()}>
              <View style={styles.storeContent}>
                {currentItem.storeImageUrl && (
                  <SafeImage
                    source={{ uri: currentItem.storeImageUrl }}
                    style={styles.storeImage}
                  />
                )}
                <View style={styles.storeInfo}>
                  <View style={styles.storeHeader}>
                    <Text style={styles.storeName}>{currentItem.storeName}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                  </View>
                  {currentItem.storeDescription && (
                    <Text style={styles.storeDescription} numberOfLines={2}>
                      {currentItem.storeDescription}
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
            {reviewsLoading ? (
              <View style={styles.reviewsLoadingContainer}>
                <ActivityIndicator size="small" color={colors.primary.main} />
                <Text style={styles.reviewsLoadingText}>Loading reviews...</Text>
              </View>
            ) : reviewsError ? (
              <View style={styles.reviewsErrorContainer}>
                <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
                <Text style={styles.reviewsErrorText}>{reviewsError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => id && fetchProductReviews(id as string)}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : reviews.length === 0 ? (
              <View style={styles.noReviewsContainer}>
                <Ionicons name="chatbubble-outline" size={32} color={colors.text.tertiary} />
                <Text style={styles.noReviewsText}>No reviews yet</Text>
                <Text style={styles.noReviewsSubtext}>Be the first to review this product!</Text>
              </View>
            ) : (
              <>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleReviewScroll}
                  ref={scrollViewRef}
                  scrollEventThrottle={16}
                >
                  {reviews.map((review) => (
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
                {reviews.length > 1 && (
                  <View style={styles.indicatorsContainer}>
                    {reviews.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.indicator,
                          index === currentReviewIndex && styles.activeIndicator,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </View>

          {/* More Products Section */}
          <View style={styles.divider} />

          <View style={styles.moreProductsSection}>
            <View style={styles.moreProductsHeader}>
              <Text style={styles.sectionTitle}>More from this store</Text>
              {currentItem?.storeName && (
                <TouchableOpacity onPress={() => navigateToStore()}>
                  <Text style={styles.viewAllText}>View Store</Text>
                </TouchableOpacity>
              )}
            </View>

            {isFetchingProducts ? (
              <View style={styles.moreProductsLoadingContainer}>
                <ActivityIndicator size="small" color={colors.primary.main} />
                <Text style={styles.moreProductsLoadingText}>Loading products...</Text>
              </View>
            ) : otherStoreProducts.length === 0 ? (
              <View style={styles.noMoreProductsContainer}>
                <Ionicons name="cube-outline" size={32} color={colors.text.tertiary} />
                <Text style={styles.noMoreProductsText}>No other products</Text>
                <Text style={styles.noMoreProductsSubtext}>This store doesn't have other products available</Text>
              </View>
            ) : (
              <View style={styles.moreProductsGrid}>
                <ProductGrid
                  products={otherStoreProducts.slice(0, 4)}
                  onProductPress={handleMoreProductPress}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar with improved pricing and dual buttons */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <View style={styles.priceSection}>
            <Text style={styles.price}>
              ${currentItem?.price?.toFixed(2)}
            </Text>
            {currentItem?.originalPrice !== currentItem?.price && (
              <Text style={styles.originalPriceFooter}>
                Was ${currentItem?.originalPrice?.toFixed(2)}
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
                <Text style={styles.productNameDrawer}>{currentItem?.name}</Text>
              </View>

              {/* Stock info */}
              <View style={styles.stockInfo}>
                <Text style={styles.stockText}>
                  {(currentItem?.stock || 0) > 0
                    ? `${currentItem?.stock} items available`
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
                    style={[styles.quantityButton, quantity >= (currentItem?.stock || 0) && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityChange(true)}
                    disabled={quantity >= (currentItem?.stock || 0)}
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Total price */}
              <View style={styles.totalSection}>
                <View style={styles.totalLabelSection}>
                  <Text style={styles.totalLabel}>Total</Text>
                  {currentItem?.originalPrice !== currentItem?.price && (
                    <View style={styles.savingsInfo}>
                      <Text style={styles.savingsText}>
                        You save ${(((currentItem?.originalPrice || 0) - (currentItem?.price || 0)) * quantity).toFixed(2)}
                      </Text>
                      {(currentItem?.discountPercentage || 0) > 0 && (
                        <Text style={styles.discountBadgeText}>
                          {Math.round(currentItem?.discountPercentage || 0)}% OFF
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.totalPriceContainer}>
                  <Text style={styles.totalPrice}>
                    ${((currentItem?.price || 0) * quantity).toFixed(2)}
                  </Text>
                  {currentItem?.originalPrice !== currentItem?.price && (
                    <Text style={styles.totalOriginalPrice}>
                      ${((currentItem?.originalPrice || 0) * quantity).toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Confirm button */}
              <TouchableOpacity
                style={[styles.confirmButton, (currentItem?.stock || 0) === 0 && styles.confirmButtonDisabled]}
                onPress={confirmAction}
                disabled={(currentItem?.stock || 0) === 0}
              >
                <Text style={styles.confirmButtonText}>
                  {drawerAction === 'cart' ? 'Add to Cart' : 'Order Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Add To Cart Modal */}
      <AddToCartModal
        visible={showAddToCartModal}
        productName={currentItem?.name || ''}
        quantity={quantity}
        onContinue={() => {
          setShowAddToCartModal(false);
        }}
        onViewCart={() => {
          setShowAddToCartModal(false);
          router.push('/(screens)/cart/CartScreen');
        }}
        onClose={() => setShowAddToCartModal(false)}
      />

      {/* Report Modal - Improved UI/UX */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <TouchableOpacity
          style={styles.reportModalOverlay}
          activeOpacity={1}
          onPress={() => setShowReportModal(false)}
        >
          <TouchableOpacity
            style={styles.reportModalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header with icon */}
            <View style={styles.reportModalHeader}>
              <View style={styles.reportModalIconContainer}>
                <Ionicons name="flag" size={24} color={colors.error} />
              </View>
              <Text style={styles.reportModalTitle}>Report Product</Text>
              <Text style={styles.reportModalSubtitle}>Help us keep Huggle safe</Text>
            </View>

            {/* Close button */}
            <TouchableOpacity
              style={styles.reportCloseButton}
              onPress={() => setShowReportModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>

            <Text style={styles.reportModalLabel}>What's the issue?</Text>
            <View style={styles.reportReasonContainer}>
              {[
                { key: "Inappropriate", icon: "warning-outline" },
                { key: "Fraud", icon: "alert-circle-outline" },
                { key: "Spam", icon: "mail-outline" },
                { key: "Other", icon: "ellipsis-horizontal-outline" }
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.reportReasonButton,
                    reportReason === item.key && styles.reportReasonButtonActive,
                  ]}
                  onPress={() => setReportReason(item.key)}
                >
                  <Ionicons
                    name={reportReason === item.key ? "checkmark-circle" : item.icon as any}
                    size={18}
                    color={reportReason === item.key ? colors.text.inverse : colors.text.secondary}
                    style={styles.reportReasonIcon}
                  />
                  <Text
                    style={[
                      styles.reportReasonText,
                      reportReason === item.key && styles.reportReasonTextActive,
                    ]}
                  >
                    {item.key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.reportModalLabel}>Additional details (optional)</Text>
            <TextInput
              style={styles.reportTextInput}
              multiline
              numberOfLines={3}
              value={reportDescription}
              onChangeText={setReportDescription}
              placeholder="Tell us more about the issue..."
              placeholderTextColor={colors.text.tertiary}
            />

            <TouchableOpacity
              style={[
                styles.reportSubmitButton,
                !reportReason && styles.reportSubmitButtonDisabled,
              ]}
              onPress={handleReport}
              disabled={reportLoading || !reportReason}
            >
              {reportLoading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <>
                  <Ionicons name="send" size={18} color={colors.text.inverse} style={{ marginRight: 8 }} />
                  <Text style={styles.reportSubmitButtonText}>Submit Report</Text>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
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
  image: {
    width: '100%',
    height: 300,
  },
  imageCarousel: {
    width: '100%',
    height: '100%',
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 10,
  },
  reportButton: {
    position: "absolute",
    top: 50,
    right: 20,
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
  // Reviews loading/error states
  reviewsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  reviewsLoadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  reviewsErrorContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  reviewsErrorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 12,
    textAlign: 'center',
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 4,
    textAlign: 'center',
  },
  // Report Modal styles - Improved
  reportModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  reportModalContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reportModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  reportModalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  reportModalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  reportCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportModalLabel: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  reportReasonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  reportReasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.primary,
  },
  reportReasonButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  reportReasonIcon: {
    marginRight: 6,
  },
  reportReasonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  reportReasonTextActive: {
    color: colors.text.inverse,
  },
  reportTextInput: {
    minHeight: 100,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border.primary,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 15,
    color: colors.text.primary,
    textAlignVertical: 'top',
    backgroundColor: colors.background.secondary,
  },
  reportSubmitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
  },
  reportSubmitButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  reportSubmitButtonText: {
    fontSize: 16,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  // Enhanced Bundle Styles
  bundleProductsContainer: {
    marginTop: 20,
  },
  bundleHeaderContainer: {
    marginBottom: 16,
  },
  bundleProductsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  bundleSavingsContainer: {
    backgroundColor: colors.primary.main + '10',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  bundleSavingsText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  bundleSavingsHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  bundleProductsList: {
    marginBottom: 16,
  },
  bundleSummaryContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  bundleSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bundleSummaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  bundleSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  bundlePriceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.main,
  },
  bundleSavingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  bundleSavingsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  // More Products Section styles
  moreProductsSection: {
    marginTop: spacing.md,
  },
  moreProductsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moreProductsGrid: {
    marginTop: spacing.sm,
  },
  moreProductsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  moreProductsLoadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  noMoreProductsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  noMoreProductsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  noMoreProductsSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  pricingInfoContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pricingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
});

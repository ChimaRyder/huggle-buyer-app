import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/constants/theme";
import ProductGrid from "@/components/product/ProductGrid";
import FeaturedPostCard from "@/components/posts/FeaturedPostCard";
import SafeImage from "@/components/common/SafeImage";
import { useStoreContext } from "@/context/StoreContext";
// Get screen width for layout
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Store Homepage Skeleton Loading Component
const StoreHomepageSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Banner skeleton */}
      <View style={[styles.bannerContainer, styles.skeletonBox]} />
      
      {/* Store info skeleton */}
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <View style={[styles.skeletonBox, { height: 28, flex: 1, marginRight: 20 }]} />
          <View style={[styles.skeletonBox, { width: 30, height: 30, borderRadius: 15 }]} />
        </View>
        <View style={styles.storeDetails}>
          <View style={[styles.skeletonBox, { height: 16, width: 120, marginRight: 10 }]} />
          <View style={[styles.skeletonBox, { height: 16, width: 100 }]} />
        </View>
        <View style={styles.categoriesContainer}>
          <View style={[styles.skeletonBox, { width: 80, height: 28, borderRadius: 14, marginRight: 10 }]} />
          <View style={[styles.skeletonBox, { width: 100, height: 28, borderRadius: 14, marginRight: 10 }]} />
        </View>
      </View>
      
      {/* Tab navigation skeleton */}
      <View style={styles.tabContainer}>
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.tab}>
            <View style={[styles.skeletonBox, { height: 16, width: 60 }]} />
          </View>
        ))}
      </View>
      
      {/* Content skeleton */}
      <ScrollView style={styles.contentContainer}>
        <View style={styles.tabContent}>
          {/* Product grid skeleton */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={[styles.skeletonBox, { width: '48%', height: 200, borderRadius: 12 }]} />
            <View style={[styles.skeletonBox, { width: '48%', height: 200, borderRadius: 12 }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={[styles.skeletonBox, { width: '48%', height: 200, borderRadius: 12 }]} />
            <View style={[styles.skeletonBox, { width: '48%', height: 200, borderRadius: 12 }]} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default function StoreHomepageScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("Featured");
  
  // Store context
  const {
    currentStore,
    isFetchingStore,
    storeError,
    fetchStoreById,
    clearCurrentStore,
    storeProducts,
    isFetchingProducts,
    productsError,
    fetchStoreProducts,
    clearStoreProducts
  } = useStoreContext();
  
  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch store data when component mounts
  useEffect(() => {
    if (id && typeof id === 'string') {
      console.log('🔍 StoreHomepageScreen: Fetching store with ID:', id);
      fetchStoreById(id);
      fetchStoreProducts(id);
    }
    
    // Cleanup when component unmounts or ID changes
    return () => {
      clearCurrentStore();
      clearStoreProducts();
    };
  }, [id, fetchStoreById, clearCurrentStore, fetchStoreProducts, clearStoreProducts]);

  // Pull to refresh handler
  const onRefresh = async () => {
    if (!id || typeof id !== 'string') return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStoreById(id),
        fetchStoreProducts(id)
      ]);
    } catch (error) {
      console.error('🔍 StoreHomepageScreen: Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // TODO: Replace with API call to fetch featured products for this store
  const featuredProducts: any[] = []; // Will be fetched from API

  // TODO: Replace with API call to fetch store posts
  const storePosts: any[] = []; // Will be fetched from API

  // TODO: Replace with API call to fetch store categories
  const storeCategories: any[] = []; // Will be fetched from API

  // Loading state
  if (isFetchingStore) {
    return <StoreHomepageSkeleton />;
  }
  
  // Error state
  if (storeError || !currentStore) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Store not found</Text>
          <Text style={styles.errorText}>{storeError || 'The store you\'re looking for could not be found.'}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/(screens)/store/ProductScreen?id=${productId}`);
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => console.log("Category pressed:", item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render featured tab content
  const renderFeaturedTab = () => (
    <View style={styles.featuredTabContent}>
      {/* Posts Section */}
      {storePosts.length > 0 ? (
        <View style={styles.postsSection}>
          {storePosts.map((post) => (
            <FeaturedPostCard 
              key={post.id}
              post={post}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>No featured posts available</Text>
          <Text style={styles.emptyContentSubtext}>Posts will appear here when available</Text>
        </View>
      )}

      {/* Products Section */}
      {featuredProducts.length > 0 ? (
        <View style={styles.productsSection}>
          <ProductGrid 
            products={featuredProducts}
            onProductPress={handleProductPress}
          />
        </View>
      ) : (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>No featured products available</Text>
          <Text style={styles.emptyContentSubtext}>Featured products will appear here when available</Text>
        </View>
      )}
    </View>
  );

  // Render products tab content
  const renderProductsTab = () => {
    if (isFetchingProducts) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        </View>
      );
    }
    
    if (productsError) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load products</Text>
            <Text style={styles.errorSubtext}>{productsError}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => id && typeof id === 'string' && fetchStoreProducts(id)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.tabContent}>
        {storeProducts.length > 0 ? (
          <ProductGrid 
            products={storeProducts}
            onProductPress={handleProductPress}
          />
        ) : (
          <View style={styles.emptyContentContainer}>
            <Text style={styles.emptyContentText}>No products available</Text>
            <Text style={styles.emptyContentSubtext}>This store hasn't added any products yet</Text>
          </View>
        )}
      </View>
    );
  };

  // Render posts tab content
  const renderPostsTab = () => (
    <View style={styles.postsTabFullContent}>
      {storePosts.length > 0 ? (
        <View style={styles.postsTabContent}>
          {storePosts.map((post) => (
            <FeaturedPostCard 
              key={post.id}
              post={post}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyPostsContainer}>
          <Text style={styles.emptyPostsText}>No posts available</Text>
          <Text style={styles.emptyContentSubtext}>Posts will appear here when available</Text>
        </View>
      )}
    </View>
  );

  // Render categories tab content
  const renderCategoriesTab = () => (
    <View style={styles.tabContent}>
      {storeCategories.length > 0 ? (
        <FlatList
          data={storeCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.categoryRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        />
      ) : (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>No categories available</Text>
          <Text style={styles.emptyContentSubtext}>Categories will appear here when available</Text>
        </View>
      )}
    </View>
  );


  // Tab configuration
  const tabs = [
    { key: "Featured", label: "Featured" },
    { key: "Products", label: "Products" },
    { key: "Posts", label: "Posts" },
    { key: "Categories", label: "Categories" },
  ];

  return (
    <View style={styles.container}>
      {/* Store Banner */}
      <View style={styles.bannerContainer}>
        {currentStore.coverImageUrl ? (
          <SafeImage 
            source={{ uri: currentStore.coverImageUrl }} 
            style={styles.bannerImage} 
          />
        ) : (
          <View style={styles.placeholderBanner}>
            <Text style={styles.placeholderText}>Store Image</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Store Info with Favorite Button */}
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>{currentStore.name}</Text>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? colors.danger : colors.text.primary} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.storeDetails}>
          <Text style={styles.locationText}>
            {currentStore.city}, {currentStore.province}
            {currentStore.distance && ` • ${currentStore.distance.toFixed(1)}km`}
          </Text>
          <Text style={styles.dotSeparator}> • </Text>
          <View style={styles.storeStatusContainer}>
            <View style={[styles.statusDot, { backgroundColor: currentStore.isOpen ? colors.success : colors.error }]} />
            <Text style={[styles.statusText, { color: currentStore.isOpen ? colors.success : colors.error }]}>
              {currentStore.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
          {currentStore.isVerified && (
            <>
              <Text style={styles.dotSeparator}> • </Text>
              <View style={styles.verifiedContainer}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </>
          )}
        </View>
        {/* Store Type and Phone Number */}
        {(currentStore.storeType || currentStore.phoneNumber) && (
          <View style={styles.storeMetaInfo}>
            {currentStore.storeType && (
              <View style={styles.storeTypeContainer}>
                <Ionicons name="storefront-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.storeTypeText}>{currentStore.storeType}</Text>
              </View>
            )}
            {currentStore.phoneNumber && (
              <View style={styles.phoneContainer}>
                <Ionicons name="call-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.phoneText}>{currentStore.phoneNumber}</Text>
              </View>
            )}
          </View>
        )}
        {currentStore.description && (
          <Text style={styles.storeDescription} numberOfLines={2}>
            {currentStore.description}
          </Text>
        )}
        {currentStore.tags && currentStore.tags.length > 0 && (
          <View style={styles.categoriesContainer}>
            {currentStore.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.categoryText}>{tag}</Text>
              </View>
            ))}
            {currentStore.tags.length > 3 && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.background.secondary }]}>
                <Text style={[styles.categoryText, { color: colors.text.primary }]}>
                  +{currentStore.tags.length - 3} more
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {activeTab === "Featured" && renderFeaturedTab()}
        {activeTab === "Products" && renderProductsTab()}
        {activeTab === "Posts" && renderPostsTab()}
        {activeTab === "Categories" && renderCategoriesTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary, // Very light gray background
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
    color: colors.text.primary,
  },
  bannerContainer: {
    height: 200,
    position: "relative",
  },
  bannerImage: {
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
  storeInfo: {
    padding: 20,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  storeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  favoriteButton: {
    padding: 5,
  },
  storeDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  locationText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  dotSeparator: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  ratingText: {
    fontSize: 16,
    color: colors.text.primary,
    marginRight: 3,
  },
  reviewsText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  reviewsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  promotionBanner: {
    backgroundColor: colors.dangerLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  promotionText: {
    color: colors.danger,
    fontWeight: "600",
    textAlign: "center",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    color: colors.text.inverse,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  tabContent: {
    padding: 20,
  },
  categoryContainer: {
    paddingBottom: 20,
  },
  categoryRow: {
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    height: 100,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: colors.text.inverse,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.inverse,
    textAlign: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: "center",
    marginTop: 20,
  },
  featuredTabContent: {
    flex: 1,
  },
  postsSection: {
    backgroundColor: 'transparent',
    paddingTop: spacing.lg,
  },
  productsSection: {
    padding: 20,
    backgroundColor: colors.background.tertiary,
  },
  postsTabFullContent: {
    flex: 1,
  },
  postsTabContent: {
    backgroundColor: 'transparent',
    paddingTop: spacing.lg,
  },
  emptyPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPostsText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 20,
  },
  placeholderBanner: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyContentText: {
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyContentSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // New styles
  skeletonBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  storeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  storeStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
    marginLeft: 4,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
});
